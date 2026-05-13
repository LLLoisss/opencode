<script setup lang="ts">
/**
 * SessionView.vue
 *
 * 对应 session.tsx 中会话消息列表区域的 Vue + TypeScript 实现。
 * 涵盖以下核心逻辑：
 *   - userMessages / visibleUserMessages / lastUserMessage
 *   - renderedUserMessages（带 turnStart 分页截断）
 *   - activeMessage（历史导航用）
 *   - expanded 折叠状态 store
 *   - 历史记录加载（loadMore / historyMore / historyLoading）
 *   - navigateMessageByOffset（键盘上下切换消息）
 *   - anchor（滚动锚点 id 生成）
 */

import { computed, reactive, ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue"
import SessionTurn from "./SessionTurn.vue"

// ─────────────────────────────────────────────
// 类型定义（对应 SDK 中 UserMessage / Message）
// ─────────────────────────────────────────────
interface MessageTime {
  created: number
  completed?: number
}

interface UserMessage {
  id: string
  role: "user"
  time: MessageTime
  agent?: string
  model?: string
}

interface AnyMessage {
  id: string
  role: "user" | "assistant"
  time: MessageTime
}

interface SessionInfo {
  title?: string
  parentID?: string
  revert?: { messageID: string }
  summary?: { files: number }
}

interface SessionHistoryAPI {
  more: (id: string) => boolean
  loading: (id: string) => boolean
  loadMore: (id: string) => void
}

interface SyncStore {
  message: Record<string, AnyMessage[]>
  session_status: Record<string, unknown>
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** 当前会话 ID（对应 params.id） */
    sessionID: string | undefined
    /** 会话元信息（标题、父会话等） */
    info?: SessionInfo
    /** 原始消息列表（来自 sync.data.message[sessionID]） */
    rawMessages?: AnyMessage[]
    /** 历史记录 API（more / loading / loadMore） */
    history?: SessionHistoryAPI
    /** 是否居中布局 */
    centered?: boolean
  }>(),
  {
    rawMessages: () => [],
    centered: false,
  }
)

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** 当 lastUserMessage 变化时通知父组件同步 agent/model */
  (e: "last-user-message-change", message: UserMessage | undefined): void
}>()

// ─────────────────────────────────────────────
// 内部响应式状态（对应 createStore(...)）
// ─────────────────────────────────────────────
const store = reactive({
  /** 展开状态映射：messageId -> Boolean */
  expanded: {} as Record<string, boolean>,

  /**
   * 消息渲染起始下标。
   * 0 = 渲染全部；> 0 = 只渲染 slice(turnStart) 之后的消息，
   * 用于"隐藏早期消息"的性能优化。
   */
  turnStart: 0,

  /** 当前"聚焦"的消息 ID（用于历史回溯导航） */
  messageId: undefined as string | undefined,
})

// ─────────────────────────────────────────────
// 计算属性
// ─────────────────────────────────────────────

/**
 * 所有 role=user 的消息。
 * 对应：messages().filter((m) => m.role === "user")
 */
const userMessages = computed<UserMessage[]>(() => {
  return (props.rawMessages ?? []).filter((m): m is UserMessage => m.role === "user")
})

/**
 * 过滤掉 revert 消息之后的用户消息，形成"可见"列表。
 * 对应：
 *   const revert = revertMessageID()
 *   if (!revert) return userMessages()
 *   return userMessages().filter((m) => m.id < revert)
 *
 * 注意：SolidJS 的 createMemo 带 equals 选项做浅比较，
 * Vue computed 默认也是惰性求值，行为一致。
 */
const visibleUserMessages = computed<UserMessage[]>(() => {
  const revert = props.info?.revert?.messageID
  if (!revert) return userMessages.value
  return userMessages.value.filter((m) => m.id < revert)
})

/**
 * 最后一条用户消息。
 * 对应：createMemo(() => visibleUserMessages().at(-1))
 */
const lastUserMessage = computed<UserMessage | undefined>(() => {
  return visibleUserMessages.value.at(-1)
})

/**
 * 实际渲染到视图的消息列表（带 turnStart 截断）。
 * 对应：
 *   const msgs = visibleUserMessages()
 *   const start = store.turnStart
 *   if (start <= 0) return msgs
 *   if (start >= msgs.length) return []
 *   return msgs.slice(start)
 */
const renderedUserMessages = computed<UserMessage[]>(() => {
  const msgs = visibleUserMessages.value
  const start = store.turnStart
  if (start <= 0) return msgs
  if (start >= msgs.length) return []
  return msgs.slice(start)
})

/**
 * 当前"活跃"消息（用于滚动定位、上下文高亮等）。
 * 对应：
 *   if (!store.messageId) return lastUserMessage()
 *   const found = visibleUserMessages().find(m => m.id === store.messageId)
 *   return found ?? lastUserMessage()
 */
const activeMessage = computed<UserMessage | undefined>(() => {
  if (!store.messageId) return lastUserMessage.value
  const found = visibleUserMessages.value.find((m) => m.id === store.messageId)
  return found ?? lastUserMessage.value
})

/**
 * 是否存在更多历史记录可以加载。
 * 对应：sync.session.history.more(id)
 */
const historyMore = computed<boolean>(() => {
  const id = props.sessionID
  if (!id || !props.history) return false
  return props.history.more(id)
})

/**
 * 历史记录是否正在加载中。
 * 对应：sync.session.history.loading(id)
 */
const historyLoading = computed<boolean>(() => {
  const id = props.sessionID
  if (!id || !props.history) return false
  return props.history.loading(id)
})

// ─────────────────────────────────────────────
// 方法
// ─────────────────────────────────────────────

/**
 * 设置当前活跃消息（历史回溯导航）。
 * 对应：setStore("messageId", message?.id)
 */
function setActiveMessage(message: UserMessage | undefined): void {
  store.messageId = message?.id
}

/**
 * 按偏移量导航消息（键盘 ↑↓ 翻历史）。
 * 对应：
 *   function navigateMessageByOffset(offset: number) {
 *     const msgs = visibleUserMessages()
 *     const current = activeMessage()
 *     const currentIndex = current ? msgs.findIndex(m => m.id === current.id) : -1
 *     const targetIndex = currentIndex === -1
 *       ? (offset > 0 ? 0 : msgs.length - 1)
 *       : currentIndex + offset
 *     if (targetIndex < 0 || targetIndex >= msgs.length) return
 *     setActiveMessage(msgs[targetIndex])
 *   }
 */
function navigateMessageByOffset(offset: number): void {
  const msgs = visibleUserMessages.value
  if (msgs.length === 0) return

  const current = activeMessage.value
  const currentIndex = current ? msgs.findIndex((m) => m.id === current.id) : -1

  const targetIndex = currentIndex === -1 ? (offset > 0 ? 0 : msgs.length - 1) : currentIndex + offset

  if (targetIndex < 0 || targetIndex >= msgs.length) return
  setActiveMessage(msgs[targetIndex])
}

/**
 * 切换某条消息 steps 的展开/折叠状态。
 * 对应：
 *   setStore("expanded", message.id, (open) => !open)
 */
function toggleExpanded(messageId: string): void {
  store.expanded[messageId] = !store.expanded[messageId]
}

/**
 * 加载更多历史消息。
 * 对应：
 *   setStore("turnStart", 0)
 *   sync.session.history.loadMore(id)
 */
function loadMoreHistory(): void {
  const id = props.sessionID
  if (!id || !props.history) return
  store.turnStart = 0
  props.history.loadMore(id)
}

/**
 * 将 turnStart 重置为 0，显示全部消息。
 * 对应："渲染早期消息"按钮的回调
 */
function showAllMessages(): void {
  store.turnStart = 0
}

/**
 * 生成消息的 DOM 锚点 id（用于 scrollIntoView）。
 * 对应：function anchor(id: string) { return `message-${id}` }
 */
function anchor(id: string): string {
  return `message-${id}`
}

// ─────────────────────────────────────────────
// 副作用 / 侦听器
// ─────────────────────────────────────────────

/**
 * 当最后一条用户消息变化时，通知父层同步 agent/model。
 * 对应：
 *   createEffect(on(() => lastUserMessage()?.id, () => {
 *     const msg = lastUserMessage()
 *     if (msg?.agent) local.agent.set(msg.agent)
 *     if (msg?.model) local.model.set(msg.model)
 *   }))
 */
watch(
  () => lastUserMessage.value?.id,
  () => {
    emit("last-user-message-change", lastUserMessage.value)
  }
)
</script>

<template>
  <div class="relative w-full h-full min-w-0">
    <!-- ── 渲染早期消息按钮 ─────────────────────────────── -->
    <!--
      对应：
        <Show when={store.turnStart > 0}>
          <Button onClick={() => setStore("turnStart", 0)}>渲染早期消息</Button>
        </Show>
    -->
    <div v-if="store.turnStart > 0"
         class="w-full flex justify-center">
      <button class="text-12-medium opacity-50"
              @click="showAllMessages">
        渲染早期消息
      </button>
    </div>

    <!-- ── 加载更多历史记录按钮 ───────────────────────────── -->
    <!--
      对应：
        <Show when={historyMore()}>
          <Button disabled={historyLoading()} onClick={loadMoreHistory}>加载更早的消息</Button>
        </Show>
    -->
    <div v-if="historyMore"
         class="w-full flex justify-center">
      <button :disabled="historyLoading"
              class="text-12-medium opacity-50"
              @click="loadMoreHistory">
        {{ historyLoading ? "加载中..." : "加载更早的消息" }}
      </button>
    </div>

    <!-- ── 消息列表 ────────────────────────────────────────── -->
    <!--
      对应：
        <For each={renderedUserMessages()}>
          {(message) => (
            <div id={anchor(message.id)} data-message-id={message.id}>
              <SessionTurn
                sessionID={params.id!}
                messageID={message.id}
                lastUserMessageID={lastUserMessage()?.id}   ← 核心 prop
                stepsExpanded={store.expanded[message.id] ?? false}
                onStepsExpandedToggle={() =>
                  setStore("expanded", message.id, (open) => !open)
                }
                classes={{ root: "...", content: "...", container: "..." }}
              />
            </div>
          )}
        </For>
    -->
    <div v-for="message in renderedUserMessages"
         :id="anchor(message.id)"
         :key="message.id"
         :data-message-id="message.id"
         :class="[
        'min-w-0 w-full max-w-full',
        centered ? 'md:max-w-200' : '',
      ]">
      <SessionTurn :session-i-d="sessionID!"
                   :message-i-d="message.id"
                   :last-user-message-i-d="lastUserMessage?.id"
                   :steps-expanded="store.expanded[message.id] ?? false"
                   :classes="{
          root: 'min-w-0 w-full relative',
          content: 'flex flex-col justify-between !overflow-visible',
          container: 'w-full px-4 md:px-6',
        }"
                   @steps-expanded-toggle="toggleExpanded(message.id)" />
    </div>
  </div>
</template>
