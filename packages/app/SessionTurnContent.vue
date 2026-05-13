<template>
  <div data-component="session-turn"
       :class="classes?.root"
       ref="rootRef">
    <div ref="scrollRef"
         @scroll="handleScroll"
         data-slot="session-turn-content"
         :class="classes?.content">
      <div @click="handleInteraction">
        <div v-if="message"
             ref="contentRef"
             :data-message="message.id"
             data-slot="session-turn-message-container"
             :class="classes?.container">
          <!-- Shell Mode -->
          <Part v-if="isShellMode && shellModePart"
                :part="shellModePart"
                :message="message"
                :defaultOpen="true" />

          <!-- 常规模式 -->
          <template v-else>
            <!-- 附件显示区域 -->
            <div v-if="attachmentParts.length > 0"
                 data-slot="session-turn-attachments"
                 aria-live="off">
              <Message :message="message"
                       :parts="attachmentParts" />
            </div>

            <!-- Sticky 区域: 用户消息 + { 图标 + 状态文本 + 时长 } -->
            <div data-slot="session-turn-sticky"
                 ref="stickyRef">
              <!-- 用户消息 -->
              <div data-slot="session-turn-message-content"
                   aria-live="off">
                <Message :message="message"
                         :parts="stickyParts" />
              </div>

              <!-- { 图标 + 状态文本 + 时长 } -->
              <div v-if="working || hasSteps"
                   data-slot="session-turn-response-trigger">
                <Button :data-expandable="assistantMessages.length > 0"
                        data-slot="session-turn-collapsible-trigger-content"
                        variant="ghost"
                        size="small"
                        @click="onStepsExpandedToggle?.()"
                        :aria-expanded="stepsExpanded">
                  <!-- 加载图标或三角形图标 -->
                  <Spinner v-if="working" />
                  <svg v-else
                       width="10"
                       height="10"
                       viewBox="0 0 10 10"
                       fill="none"
                       xmlns="http://www.w3.org/2000/svg"
                       data-slot="session-turn-trigger-icon">
                    <path d="M8.125 1.875H1.875L5 8.125L8.125 1.875Z"
                          fill="currentColor"
                          stroke="currentColor"
                          stroke-linejoin="round" />
                  </svg>

                  <!-- 状态文本 -->
                  <template v-if="retry">
                    <span data-slot="session-turn-retry-message">
                      {{ retry.message.length > 60 ? retry.message.slice(0, 60) + '...' : retry.message }}
                    </span>
                    <span data-slot="session-turn-retry-seconds">
                      · {{ t('ui.sessionTurn.retry.retrying') }}
                      {{ state.retrySeconds > 0 ? ' ' + t('ui.sessionTurn.retry.inSeconds', { seconds: state.retrySeconds }) : '' }}
                    </span>
                    <span data-slot="session-turn-retry-attempt">(#{{ retry.attempt }})</span>
                  </template>
                  <template v-else-if="working">
                    <span data-slot="session-turn-status-text">
                      {{ state.status ?? t('ui.sessionTurn.status.consideringNextSteps') }}
                    </span>
                  </template>
                  <template v-else-if="stepsExpanded">
                    <span data-slot="session-turn-status-text">{{ t('ui.sessionTurn.steps.hide') }}</span>
                  </template>
                  <template v-else>
                    <span data-slot="session-turn-status-text">{{ t('ui.sessionTurn.steps.show') }}</span>
                  </template>

                  <span aria-hidden="true">·</span>
                  <span aria-live="off">{{ state.duration }}</span>
                </Button>
              </div>
            </div>

            <!-- Response: 可展开的响应内容：展开时显示AI的详细执行步骤 -->
            <div v-if="stepsExpanded && assistantMessages.length > 0"
                 data-slot="session-turn-collapsible-content-inner"
                 :aria-hidden="working">
              <AssistantMessageItem v-for="assistantMessage in assistantMessages"
                                    :key="assistantMessage.id"
                                    :message="assistantMessage"
                                    :responsePartId="responsePartId"
                                    :hideResponsePart="hideResponsePart"
                                    :hideReasoning="!working" />
              <Card v-if="error"
                    variant="error"
                    class="error-card">
                {{ error?.data?.message }}
              </Card>
            </div>

            <!-- Response: 权限请求区：步骤折叠时，仍然显示需要用户批准的权限请求 -->
            <div v-if="!stepsExpanded && permissionParts.length > 0"
                 data-slot="session-turn-permission-parts">
              <Part v-for="(item, index) in permissionParts"
                    :key="index"
                    :part="item.part"
                    :message="item.message" />
            </div>

            <!-- Response: 显示AI的最终回复 -->
            <div class="sr-only"
                 aria-live="polite">
              {{ !working && response ? response : '' }}
            </div>

            <div v-if="!working && (response || hasDiffs)"
                 data-slot="session-turn-summary-section">
              <!-- 响应文本 -->
              <div data-slot="session-turn-summary-header">
                <h2 data-slot="session-turn-summary-title">{{ t('ui.sessionTurn.summary.response') }}</h2>
                <div data-slot="session-turn-response">
                  <Markdown data-slot="session-turn-markdown"
                            :data-diffs="hasDiffs"
                            :text="response ?? ''"
                            :cacheKey="responsePartId" />
                  <div v-if="response"
                       data-slot="session-turn-response-copy-wrapper">
                    <Tooltip :value="copied ? t('ui.message.copied') : t('ui.message.copy')"
                             placement="top"
                             :gutter="8">
                      <IconButton :icon="copied ? 'check' : 'copy'"
                                  variant="secondary"
                                  @mousedown.prevent
                                  @click.stop="handleCopy"
                                  :aria-label="copied ? t('ui.message.copied') : t('ui.message.copy')" />
                    </Tooltip>
                  </div>
                </div>
              </div>

              <!-- 文件差异列表 -->
              <Accordion data-slot="session-turn-accordion"
                         :multiple="true"
                         v-model:value="state.diffsOpen">
                <AccordionItem v-for="diff in messageDiffs.slice(0, state.diffLimit)"
                               :key="diff.file"
                               :value="diff.file">
                  <StickyAccordionHeader>
                    <AccordionTrigger>
                      <div data-slot="session-turn-accordion-trigger-content">
                        <div data-slot="session-turn-file-info">
                          <FileIcon :node="{ path: diff.file, type: 'file' }"
                                    data-slot="session-turn-file-icon" />
                          <div data-slot="session-turn-file-path">
                            <span v-if="diff.file.includes('/')"
                                  data-slot="session-turn-directory">
                              {{ `\u202A${getDirectory(diff.file)}\u202C` }}
                            </span>
                            <span data-slot="session-turn-filename">{{ getFilename(diff.file) }}</span>
                          </div>
                        </div>
                        <div data-slot="session-turn-accordion-actions">
                          <DiffChanges :changes="diff" />
                          <Icon name="chevron-grabber-vertical"
                                size="small" />
                        </div>
                      </div>
                    </AccordionTrigger>
                  </StickyAccordionHeader>
                  <AccordionContent data-slot="session-turn-accordion-content">
                    <component v-if="state.diffsOpen.includes(diff.file)"
                               :is="diffComponent"
                               :before="{ name: diff.file, contents: diff.before }"
                               :after="{ name: diff.file, contents: diff.after }" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <!-- 显示更多按钮 -->
              <Button v-if="messageDiffs.length > state.diffLimit"
                      data-slot="session-turn-accordion-more"
                      variant="ghost"
                      size="small"
                      @click="showMoreDiffs">
                {{ t('ui.sessionTurn.diff.showMore', { count: messageDiffs.length - state.diffLimit }) }}
              </Button>
            </div>

            <Card v-if="error && !stepsExpanded"
                  variant="error"
                  class="error-card">
              {{ error?.data?.message }}
            </Card>
          </template>
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue"
import type {
  AssistantMessage,
  FilePart,
  Message as MessageType,
  Part as PartType,
  ToolPart,
} from "@opencode-ai/sdk/v2/client"
import type { FileDiff } from "@opencode-ai/sdk/v2"
import { getDirectory, getFilename } from "@opencode-ai/util/path"
import { DateTime, Interval, type DurationUnit } from "luxon"

// 导入假设已实现的子组件
import Message from "./Message.vue"
import Part from "./Part.vue"
import AssistantMessageItem from "./AssistantMessageItem.vue"
import Button from "./Button.vue"
import Spinner from "./Spinner.vue"
import Card from "./Card.vue"
import Markdown from "./Markdown.vue"
import Tooltip from "./Tooltip.vue"
import IconButton from "./IconButton.vue"
import Accordion from "./Accordion.vue"
import AccordionItem from "./AccordionItem.vue"
import StickyAccordionHeader from "./StickyAccordionHeader.vue"
import AccordionTrigger from "./AccordionTrigger.vue"
import AccordionContent from "./AccordionContent.vue"
import FileIcon from "./FileIcon.vue"
import DiffChanges from "./DiffChanges.vue"
import Icon from "./Icon.vue"

// Props 定义
interface Props {
  sessionID: string
  sessionTitle?: string
  messageID: string
  lastUserMessageID?: string
  stepsExpanded?: boolean
  onStepsExpandedToggle?: () => void
  onUserInteracted?: () => void
  classes?: {
    root?: string
    content?: string
    container?: string
  }
}

const props = defineProps<Props>()

// 从上下文中获取的数据和方法（假设通过 inject 或 composable 获取）
// 这里需要根据实际项目调整
const { data, i18n, diffComponent, autoScroll } = useContext()
const t = i18n.t

// 本地状态
const state = reactive({
  retrySeconds: 0,
  diffsOpen: [] as string[],
  diffLimit: 20,
  status: undefined as string | undefined,
  duration: "",
})

const copied = ref(false)
const rootRef = ref<HTMLDivElement>()
const stickyRef = ref<HTMLDivElement>()
const scrollRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()

// 常量
const diffInit = 20
const diffBatch = 20
const emptyMessages: MessageType[] = []
const emptyParts: PartType[] = []
const emptyFiles: FilePart[] = []
const emptyAssistant: AssistantMessage[] = []
const emptyPermissionParts: { part: ToolPart; message: AssistantMessage }[] = []
const emptyDiffs: FileDiff[] = []
const idle = { type: "idle" as const }

// Computed properties
const allMessages = computed(() => data.store.message[props.sessionID] ?? emptyMessages)

const messageIndex = computed(() => {
  const messages = allMessages.value
  // 这里需要实现二分查找逻辑
  const index = messages.findIndex((m) => m.id === props.messageID)
  if (index < 0) return -1
  const msg = messages[index]
  if (!msg || msg.role !== "user") return -1
  return index
})

const message = computed(() => {
  const index = messageIndex.value
  if (index < 0) return undefined
  const messages = allMessages.value
  const msg = messages[index]
  if (!msg || msg.role !== "user") return undefined
  return msg
})

const lastUserMessageID = computed(() => {
  if (props.lastUserMessageID) return props.lastUserMessageID
  const messages = allMessages.value
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg?.role === "user") return msg.id
  }
  return undefined
})

const isLastUserMessage = computed(() => props.messageID === lastUserMessageID.value)

const parts = computed(() => {
  const msg = message.value
  if (!msg) return emptyParts
  return data.store.part[msg.id] ?? emptyParts
})

const attachmentParts = computed(() => {
  const msgParts = parts.value
  if (msgParts.length === 0) return emptyFiles
  return msgParts.filter((part) => isAttachment(part)) as FilePart[]
})

const stickyParts = computed(() => {
  const msgParts = parts.value
  if (msgParts.length === 0) return emptyParts
  if (attachmentParts.value.length === 0) return msgParts
  return msgParts.filter((part) => !isAttachment(part))
})

const assistantMessages = computed(() => {
  const msg = message.value
  if (!msg) return emptyAssistant

  const messages = allMessages.value
  const index = messageIndex.value
  if (index < 0) return emptyAssistant

  const result: AssistantMessage[] = []
  for (let i = index + 1; i < messages.length; i++) {
    const item = messages[i]
    if (!item) continue
    if (item.role === "user") break
    if (item.role === "assistant" && item.parentID === msg.id) {
      result.push(item as AssistantMessage)
    }
  }
  return result
})

const lastAssistantMessage = computed(() => assistantMessages.value.at(-1))

const error = computed(() => assistantMessages.value.find((m) => m.error)?.error)

const lastTextPart = computed(() => {
  const msgs = assistantMessages.value
  for (let mi = msgs.length - 1; mi >= 0; mi--) {
    const msgParts = data.store.part[msgs[mi].id] ?? emptyParts
    for (let pi = msgParts.length - 1; pi >= 0; pi--) {
      const part = msgParts[pi]
      if (part?.type === "text") return part
    }
  }
  return undefined
})

const hasSteps = computed(() => {
  for (const m of assistantMessages.value) {
    const msgParts = data.store.part[m.id]
    if (!msgParts) continue
    for (const p of msgParts) {
      if (p?.type === "tool") return true
    }
  }
  return false
})

const permissions = computed(() => data.store.permission?.[props.sessionID] ?? [])
const nextPermission = computed(() => permissions.value[0])

const permissionParts = computed(() => {
  if (props.stepsExpanded) return emptyPermissionParts

  const next = nextPermission.value
  if (!next || !next.tool) return emptyPermissionParts

  const message = assistantMessages.value.findLast((m) => m.id === next.tool!.messageID)
  if (!message) return emptyPermissionParts

  const parts = data.store.part[message.id] ?? emptyParts
  for (const part of parts) {
    if (part?.type !== "tool") continue
    const tool = part as ToolPart
    if (tool.callID === next.tool?.callID) return [{ part: tool, message }]
  }

  return emptyPermissionParts
})

const shellModePart = computed(() => {
  const p = parts.value
  if (p.length === 0) return
  if (!p.every((part) => part?.type === "text" && part?.synthetic)) return

  const msgs = assistantMessages.value
  if (msgs.length !== 1) return

  const msgParts = data.store.part[msgs[0].id] ?? emptyParts
  if (msgParts.length !== 1) return

  const assistantPart = msgParts[0]
  if (assistantPart?.type === "tool" && assistantPart.tool === "bash") return assistantPart
})

const isShellMode = computed(() => !!shellModePart.value)

const status = computed(() => data.store.session_status[props.sessionID] ?? idle)
const working = computed(() => status.value.type !== "idle" && isLastUserMessage.value)
const retry = computed(() => {
  const s = status.value
  if (s.type !== "retry") return
  return s
})

const response = computed(() => lastTextPart.value?.text)
const responsePartId = computed(() => lastTextPart.value?.id)
const messageDiffs = computed(() => message.value?.summary?.diffs ?? emptyDiffs)
const hasDiffs = computed(() => messageDiffs.value.length > 0)
const hideResponsePart = computed(() => !working.value && !!responsePartId.value)

// 辅助函数
function isAttachment(part: PartType | undefined) {
  if (part?.type !== "file") return false
  const mime = (part as FilePart).mime ?? ""
  return mime.startsWith("image/") || mime === "application/pdf"
}

function duration() {
  const msg = message.value
  if (!msg) return ""
  const completed = lastAssistantMessage.value?.time.completed
  const from = DateTime.fromMillis(msg.time.created)
  const to = completed ? DateTime.fromMillis(completed) : DateTime.now()
  const interval = Interval.fromDateTimes(from, to)
  const unit: DurationUnit[] = interval.length("seconds") > 60 ? ["minutes", "seconds"] : ["seconds"]

  const locale = i18n.locale()
  const human = interval.toDuration(unit).normalize().reconfigure({ locale }).toHuman({
    notation: "compact",
    unitDisplay: "narrow",
    compactDisplay: "short",
    showZeros: false,
  })
  return locale.startsWith("zh") ? human.replaceAll("、", "") : human
}

function updateStickyHeight(height: number) {
  const root = rootRef.value
  if (!root) return
  const next = Math.ceil(height)
  root.style.setProperty("--session-turn-sticky-height", `${next}px`)
}

const handleCopy = async () => {
  const content = response.value ?? ""
  if (!content) return
  await navigator.clipboard.writeText(content)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const showMoreDiffs = () => {
  const total = messageDiffs.value.length
  const next = state.diffLimit + diffBatch
  state.diffLimit = next > total ? total : next
}

const handleScroll = () => {
  // 处理滚动事件（需要从 autoScroll 中实现）
  autoScroll.handleScroll?.()
}

const handleInteraction = () => {
  // 处理用户交互（需要从 autoScroll 中实现）
  autoScroll.handleInteraction?.()
}

// Watchers
watch(
  () => message.value?.id,
  () => {
    state.diffsOpen = []
    state.diffLimit = diffInit
  }
)

watch(retry, (r) => {
  if (!r) {
    state.retrySeconds = 0
    return
  }
  const updateSeconds = () => {
    const next = r.next
    if (next) state.retrySeconds = Math.max(0, Math.round((next - Date.now()) / 1000))
  }
  updateSeconds()
  const timer = setInterval(updateSeconds, 1000)
  onBeforeUnmount(() => clearInterval(timer))
})

watch(working, () => {
  const update = () => {
    state.duration = duration()
  }
  update()

  if (!working.value) return

  const timer = setInterval(update, 1000)
  onBeforeUnmount(() => clearInterval(timer))
})

watch(
  () => permissions.value.length,
  (count, prev) => {
    if (!count) return
    if (prev !== undefined && count <= prev) return
    autoScroll.forceScrollToBottom?.()
  }
)

// 监听 sticky 区域高度变化
let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  if (stickyRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateStickyHeight(entry.contentRect.height)
      }
    })
    resizeObserver.observe(stickyRef.value)
  }

  // 初始化高度
  nextTick(() => {
    const root = rootRef.value
    const sticky = stickyRef.value
    if (!root || !sticky) return
    updateStickyHeight(sticky.getBoundingClientRect().height)
  })
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

// 假设的 composable 函数（需要根据实际项目实现）
function useContext() {
  // 这里应该使用 inject 或其他方式获取全局上下文
  // 返回示例结构
  return {
    data: {
      store: {
        message: {} as Record<string, MessageType[]>,
        part: {} as Record<string, PartType[]>,
        permission: {} as Record<string, any[]>,
        session_status: {} as Record<string, any>,
      },
    },
    i18n: {
      t: (key: string, params?: any) => key,
      locale: () => "zh-CN",
    },
    diffComponent: {} as any,
    autoScroll: {
      handleScroll: () => {},
      handleInteraction: () => {},
      forceScrollToBottom: () => {},
      scrollRef,
      contentRef,
    },
  }
}
</script>

<style scoped>
/* 在这里添加组件样式 */
.error-card {
  margin-top: 1rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
