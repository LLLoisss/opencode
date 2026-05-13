<template>
  <div class="tool-part-wrapper"
       :data-permission="hasChildPermission">
    <!-- 有子会话权限请求时 -->
    <template v-if="childPermission">
      <!-- 显示子工具部分（如果有匹配的 tool part） -->
      <template v-if="childToolPartData">
        <component :is="childToolRender"
                   :input="childToolInput"
                   :tool="childToolPartData.part.tool"
                   :metadata="childToolMetadata"
                   :output="childToolOutput"
                   :status="childToolPartData.part.state?.status"
                   :default-open="true" />
      </template>
      <!-- 否则显示基本的 task 工具 -->
      <BasicTool v-else
                 icon="task"
                 :default-open="true"
                 :trigger="{
          title: agentTitle,
          titleClass: 'capitalize',
          subtitle: input.description,
        }"
                 @subtitle-click="handleSubtitleClick" />

      <!-- 权限操作按钮 -->
      <div class="permission-prompt">
        <div class="permission-actions">
          <el-button size="small"
                     text
                     @click="respond('reject')">
            {{ t('ui.permission.deny') }}
          </el-button>
          <el-button size="small"
                     type="info"
                     @click="respond('always')">
            {{ t('ui.permission.allowAlways') }}
          </el-button>
          <el-button size="small"
                     type="primary"
                     @click="respond('once')">
            {{ t('ui.permission.allowOnce') }}
          </el-button>
        </div>
      </div>
    </template>

    <!-- 无权限请求时的正常渲染 -->
    <template v-else>
      <BasicTool icon="task"
                 :default-open="true"
                 :trigger="{
          title: agentTitle,
          titleClass: 'capitalize',
          subtitle: input.description,
        }"
                 @subtitle-click="handleSubtitleClick">
        <div ref="scrollRef"
             class="tool-output"
             data-scrollable
             @scroll="handleScroll">
          <div ref="contentRef"
               class="task-tools">
            <div v-for="item in summary"
                 :key="item.id"
                 class="task-tool-item">
              <el-icon :size="14">
                <component :is="getToolIcon(item.tool)" />
              </el-icon>
              <span class="task-tool-title">{{ getToolTitle(item.tool) }}</span>
              <span v-if="item.state.title"
                    class="task-tool-subtitle">
                {{ item.state.title }}
              </span>
            </div>
          </div>
        </div>
      </BasicTool>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, inject, type Component } from "vue"
import { ElButton, ElIcon } from "element-plus"
import BasicTool from "./BasicTool.vue"
import GenericTool from "./GenericTool.vue"

// ==================== 类型定义 ====================

/** 工具摘要项 */
interface TaskSummaryItem {
  id: string
  tool: string
  state: {
    status: string
    title?: string
  }
}

/** 工具部分 */
interface ToolPart {
  type: string
  tool: string
  callID: string
  state: {
    input?: Record<string, any>
    output?: string
    status?: string
    metadata?: Record<string, any>
  }
}

/** 消息 */
interface Message {
  id: string
  sessionID: string
  role: string
}

/** 部分 */
interface Part {
  type: string
  [key: string]: any
}

/** 权限项 */
interface Permission {
  id: string
  sessionID: string
  tool?: {
    callID: string
    messageID: string
  }
  metadata?: Record<string, any>
}

/** 数据仓库类型（简化） */
interface DataStore {
  permission?: Record<string, Permission[]>
  message: Record<string, Message[]>
  part: Record<string, Part[]>
}

/** 注入的 data 上下文 */
interface DataContext {
  store: DataStore
  respondToPermission?: (payload: { sessionID: string; permissionID: string; response: string }) => void
  navigateToSession?: (sessionId: string) => void
}

/** 工具信息 */
interface ToolInfo {
  icon: string
  title: string
  subtitle?: string
}

// ==================== Props 定义 ====================

export interface TaskToolProps {
  /** 工具输入参数 */
  input: Record<string, any>
  /** 工具元数据 */
  metadata: Record<string, any>
  /** 工具名称 */
  tool: string
  /** 工具输出 */
  output?: string
  /** 工具状态 */
  status?: string
  /** 是否默认展开 */
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<TaskToolProps>(), {
  defaultOpen: true,
})

// ==================== 注入依赖 ====================

/**
 * 注入数据上下文
 * 实际使用时替换为你的 provide/inject key 或 composable
 */
const data = inject<DataContext>("dataContext", {
  store: { message: {}, part: {} },
})

// ==================== i18n ====================

/**
 * 国际化翻译函数
 * 实际使用时替换为你的 i18n 实例（如 vue-i18n 的 useI18n）
 */
const i18nInstance = inject<{ t: (key: string, params?: Record<string, any>) => string }>("i18n", {
  t: (key: string) => key,
})

function t(key: string, params?: Record<string, any>): string {
  return i18nInstance.t(key, params)
}

// ==================== 工具注册表 ====================

/**
 * 工具注册表
 * 实际使用时替换为你的全局工具注册逻辑
 */
const toolRegistry = inject<{
  render: (name: string) => Component | undefined
}>("toolRegistry", {
  render: () => undefined,
})

// ==================== 计算属性 ====================

/** 工具摘要列表 */
const summary = computed<TaskSummaryItem[]>(() => {
  return (props.metadata.summary ?? []) as TaskSummaryItem[]
})

/** 子会话 ID */
const childSessionId = computed<string | undefined>(() => {
  return props.metadata.sessionId as string | undefined
})

/** 子会话的权限请求 */
const childPermission = computed<Permission | undefined>(() => {
  const sessionId = childSessionId.value
  if (!sessionId) return undefined
  const permissions = data.store.permission?.[sessionId] ?? []
  return permissions[0]
})

/** 是否有子权限请求（用于 data 属性） */
const hasChildPermission = computed(() => !!childPermission.value)

/** 子会话中匹配权限 callID 的工具部分 */
const childToolPartData = computed<{ part: ToolPart; message: Message } | undefined>(() => {
  const perm = childPermission.value
  if (!perm || !perm.tool) return undefined

  const sessionId = childSessionId.value
  if (!sessionId) return undefined

  // 查找匹配权限 messageID 的消息（从后往前找）
  const messages = data.store.message[sessionId] ?? []
  let message: Message | undefined
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].id === perm.tool!.messageID) {
      message = messages[i]
      break
    }
  }
  if (!message) return undefined

  // 查找匹配 callID 的工具部分
  const parts = data.store.part[message.id] ?? []
  for (const part of parts) {
    if (part.type === "tool" && (part as unknown as ToolPart).callID === perm.tool!.callID) {
      return { part: part as unknown as ToolPart, message }
    }
  }

  return undefined
})

/** 子工具的渲染组件 */
const childToolRender = computed<Component>(() => {
  const toolData = childToolPartData.value
  if (!toolData) return GenericTool
  return toolRegistry.render(toolData.part.tool) ?? GenericTool
})

/** 子工具的输入 */
const childToolInput = computed<Record<string, any>>(() => {
  return childToolPartData.value?.part.state?.input ?? {}
})

/** 子工具的元数据 */
const childToolMetadata = computed<Record<string, any>>(() => {
  return childToolPartData.value?.part.state?.metadata ?? {}
})

/** 子工具的输出 */
const childToolOutput = computed<string | undefined>(() => {
  return childToolPartData.value?.part.state?.output
})

/** Agent 标题 */
const agentTitle = computed(() => {
  return t("ui.tool.agent", { type: props.input.subagent_type || props.tool })
})

// ==================== 自动滚动 ====================

const scrollRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()
let isUserScrolledUp = false

function handleScroll() {
  const el = scrollRef.value
  if (!el) return
  const threshold = 30
  isUserScrolledUp = el.scrollTop + el.clientHeight < el.scrollHeight - threshold
}

function scrollToBottom() {
  if (isUserScrolledUp) return
  const el = scrollRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

let observer: MutationObserver | undefined

onMounted(() => {
  const el = contentRef.value
  if (!el) return
  observer = new MutationObserver(() => scrollToBottom())
  observer.observe(el, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

// ==================== 方法 ====================

/** 响应权限请求 */
function respond(response: "once" | "always" | "reject") {
  const perm = childPermission.value
  if (!perm || !data.respondToPermission) return
  data.respondToPermission({
    sessionID: perm.sessionID,
    permissionID: perm.id,
    response,
  })
}

/** 副标题点击 → 导航到子会话 */
function handleSubtitleClick() {
  const sessionId = childSessionId.value
  if (sessionId && data.navigateToSession) {
    data.navigateToSession(sessionId)
  }
}

// ==================== 工具信息映射 ====================

/** 工具名称 → 图标名映射 */
const toolIconMap: Record<string, string> = {
  read: "View",
  list: "List",
  glob: "Search",
  grep: "Search",
  webfetch: "Monitor",
  task: "Checked",
  bash: "Monitor",
  edit: "EditPen",
  write: "EditPen",
  apply_patch: "EditPen",
  todowrite: "Finished",
  todoread: "Finished",
  question: "ChatDotRound",
}

/** 工具名称 → 标题映射 */
const toolTitleMap: Record<string, string> = {
  read: "ui.tool.read",
  list: "ui.tool.list",
  glob: "ui.tool.glob",
  grep: "ui.tool.grep",
  webfetch: "ui.tool.webfetch",
  task: "ui.tool.agent",
  bash: "ui.tool.shell",
  edit: "ui.messagePart.title.edit",
  write: "ui.messagePart.title.write",
  apply_patch: "ui.tool.patch",
  todowrite: "ui.tool.todos",
  todoread: "ui.tool.todos.read",
  question: "ui.tool.questions",
}

function getToolIcon(tool: string): string {
  return toolIconMap[tool] ?? "SetUp"
}

function getToolTitle(tool: string): string {
  const key = toolTitleMap[tool]
  return key ? t(key) : tool
}
</script>

<style scoped>
.tool-part-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 权限提示区域 */
.permission-prompt {
  padding: 8px 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-fill-color-lighter);
  border-radius: 0 0 4px 4px;
}

.permission-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* 工具输出滚动区域 */
.tool-output {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

/* 子工具列表 */
.task-tools {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.task-tool-item:hover {
  background-color: var(--el-fill-color-light);
}

.task-tool-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.task-tool-subtitle {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* capitalize 工具类 */
:deep(.capitalize) {
  text-transform: capitalize;
}
</style>
