<template>
  <div ref="rootRef"
       data-component="session-turn"
       :class="classes?.root">
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
          <template v-if="isShellMode">
            <Part :part="shellModePart"
                  :message="message"
                  :default-open="true" />
          </template>

          <!-- Normal Mode -->
          <template v-else>
            <!-- Attachments -->
            <div v-if="attachmentParts.length > 0"
                 data-slot="session-turn-attachments"
                 aria-live="off">
              <Message :message="message"
                       :parts="attachmentParts" />
            </div>

            <div ref="stickyRef"
                 data-slot="session-turn-sticky">
              <!-- User Message -->
              <div data-slot="session-turn-message-content"
                   aria-live="off">
                <Message :message="message"
                         :parts="stickyParts" />
              </div>

              <!-- Trigger (sticky) -->
              <div v-if="working || hasSteps"
                   data-slot="session-turn-response-trigger">
                <el-button :data-expandable="assistantMessages.length > 0"
                           data-slot="session-turn-collapsible-trigger-content"
                           text
                           size="small"
                           @click="handleStepsToggle"
                           :aria-expanded="stepsExpanded">
                  <!-- Icon -->
                  <el-icon v-if="working"
                           class="is-loading">
                    <Loading />
                  </el-icon>
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

                  <!-- Status Text -->
                  <template v-if="retryInfo">
                    <span data-slot="session-turn-retry-message">
                      {{ retryInfo.message.length > 60 ? retryInfo.message.slice(0, 60) + '...' : retryInfo.message }}
                    </span>
                    <span data-slot="session-turn-retry-seconds">
                      · {{ t('ui.sessionTurn.retry.retrying') }}
                      {{ retrySeconds > 0 ? ' ' + t('ui.sessionTurn.retry.inSeconds', { seconds: retrySeconds }) : '' }}
                    </span>
                    <span data-slot="session-turn-retry-attempt">(#{{ retryInfo.attempt }})</span>
                  </template>
                  <template v-else-if="working">
                    <span data-slot="session-turn-status-text">
                      {{ currentStatus || t('ui.sessionTurn.status.consideringNextSteps') }}
                    </span>
                  </template>
                  <template v-else-if="stepsExpanded">
                    <span data-slot="session-turn-status-text">{{ t('ui.sessionTurn.steps.hide') }}</span>
                  </template>
                  <template v-else>
                    <span data-slot="session-turn-status-text">{{ t('ui.sessionTurn.steps.show') }}</span>
                  </template>

                  <span aria-hidden="true">·</span>
                  <span aria-live="off">{{ durationText }}</span>
                </el-button>
              </div>
            </div>

            <!-- Expanded Steps Response -->
            <div v-if="stepsExpanded && assistantMessages.length > 0"
                 data-slot="session-turn-collapsible-content-inner"
                 :aria-hidden="working">
              <AssistantMessageItem v-for="assistantMessage in assistantMessages"
                                    :key="assistantMessage.id"
                                    :message="assistantMessage"
                                    :response-part-id="responsePartId"
                                    :hide-response-part="hideResponsePart"
                                    :hide-reasoning="!working" />
              <el-alert v-if="error"
                        type="error"
                        :closable="false"
                        class="error-card">
                {{ error.data?.message }}
              </el-alert>
            </div>

            <!-- Permission Parts -->
            <div v-if="!stepsExpanded && permissionParts.length > 0"
                 data-slot="session-turn-permission-parts">
              <Part v-for="item in permissionParts"
                    :key="item.part.id"
                    :part="item.part"
                    :message="item.message" />
            </div>

            <!-- Screen Reader Response -->
            <div class="sr-only"
                 aria-live="polite">
              {{ !working && response ? response : '' }}
            </div>

            <!-- Summary Section -->
            <div v-if="!working && (response || hasDiffs)"
                 data-slot="session-turn-summary-section">
              <div data-slot="session-turn-summary-header">
                <h2 data-slot="session-turn-summary-title">{{ t('ui.sessionTurn.summary.response') }}</h2>
                <div data-slot="session-turn-response">
                  <Markdown data-slot="session-turn-markdown"
                            :data-diffs="hasDiffs"
                            :text="response || ''"
                            :cache-key="responsePartId" />
                  <div v-if="response"
                       data-slot="session-turn-response-copy-wrapper">
                    <el-tooltip :content="copied ? t('ui.message.copied') : t('ui.message.copy')"
                                placement="top">
                      <el-button :icon="copied ? Check : DocumentCopy"
                                 circle
                                 size="small"
                                 @mousedown.prevent
                                 @click.stop="handleCopy"
                                 :aria-label="copied ? t('ui.message.copied') : t('ui.message.copy')" />
                    </el-tooltip>
                  </div>
                </div>
              </div>

              <!-- Diffs Accordion -->
              <el-collapse v-model="diffsOpen"
                           data-slot="session-turn-accordion">
                <el-collapse-item v-for="diff in visibleDiffs"
                                  :key="diff.file"
                                  :name="diff.file">
                  <template #title>
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
                        <el-icon>
                          <DArrowRight />
                        </el-icon>
                      </div>
                    </div>
                  </template>
                  <component v-if="diffsOpen.includes(diff.file)"
                             :is="diffComponent"
                             :before="{ name: diff.file, contents: diff.before }"
                             :after="{ name: diff.file, contents: diff.after }" />
                </el-collapse-item>
              </el-collapse>

              <el-button v-if="messageDiffs.length > diffLimit"
                         data-slot="session-turn-accordion-more"
                         text
                         size="small"
                         @click="loadMoreDiffs">
                {{ t('ui.sessionTurn.diff.showMore', { count: messageDiffs.length - diffLimit }) }}
              </el-button>
            </div>

            <!-- Error Display (collapsed state) -->
            <el-alert v-if="error && !stepsExpanded"
                      type="error"
                      :closable="false"
                      class="error-card">
              {{ error.data?.message }}
            </el-alert>
          </template>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue"
import { useResizeObserver } from "@vueuse/core"
import { ElButton, ElIcon, ElAlert, ElCollapse, ElCollapseItem, ElTooltip } from "element-plus"
import { Loading, Check, DocumentCopy, DArrowRight } from "@element-plus/icons-vue"
import type {
  AssistantMessage,
  FilePart,
  Message as MessageType,
  Part as PartType,
  PermissionRequest,
  TextPart,
  ToolPart,
} from "@opencode-ai/sdk/v2/client"
import type { FileDiff } from "@opencode-ai/sdk/v2"
import { DateTime, Interval, type DurationUnit } from "luxon"
import { getDirectory, getFilename } from "@opencode-ai/util/path"

/**
 * SessionTurn 组件的 Props
 */
interface Props {
  /** 会话 ID */
  sessionID: string
  /** 会话标题（可选） */
  sessionTitle?: string
  /** 消息 ID */
  messageID: string
  /** 最后一条用户消息的 ID（可选） */
  lastUserMessageID?: string
  /** 是否展开步骤详情 */
  stepsExpanded?: boolean
  /** 自定义 CSS 类名 */
  classes?: {
    root?: string
    content?: string
    container?: string
  }
}

/**
 * SessionTurn 组件的 Emits
 */
interface Emits {
  /** 当步骤展开/折叠时触发 */
  (e: "steps-expanded-toggle"): void
  /** 当用户交互时触发 */
  (e: "user-interacted"): void
}

const props = withDefaults(defineProps<Props>(), {
  sessionTitle: undefined,
  lastUserMessageID: undefined,
  stepsExpanded: false,
  classes: () => ({}),
})

const emit = defineEmits<Emits>()

// 假设这些来自于全局状态管理或注入
// 你需要根据实际情况调整这些导入
const data = inject("data") // useData()
const diffComponent = inject("diffComponent") // useDiffComponent()
const t = inject("i18n").t // useI18n()
const locale = inject("i18n").locale

// Refs
const rootRef = ref<HTMLDivElement>()
const stickyRef = ref<HTMLDivElement>()
const scrollRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()

// State
const copied = ref(false)
const retrySeconds = ref(0)
const diffsOpen = ref<string[]>([])
const diffLimit = ref(20)
const currentStatus = ref<string>()
const durationText = ref("")

// Constants
const DIFF_INIT = 20
const DIFF_BATCH = 20
const emptyMessages: MessageType[] = []
const emptyParts: PartType[] = []
const emptyFiles: FilePart[] = []
const emptyAssistant: AssistantMessage[] = []
const emptyPermissions: PermissionRequest[] = []
const emptyPermissionParts: { part: ToolPart; message: AssistantMessage }[] = []
const emptyDiffs: FileDiff[] = []
const idle = { type: "idle" as const }

// Computed
const allMessages = computed(() => data.store.message[props.sessionID] ?? emptyMessages)

const messageIndex = computed(() => {
  const messages = allMessages.value
  const result = Binary.search(messages, props.messageID, (m) => m.id)
  if (!result.found) return -1
  const msg = messages[result.index]
  if (!msg || msg.role !== "user") return -1
  return result.index
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
      if (part?.type === "text") return part as TextPart
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

const permissions = computed(() => data.store.permission?.[props.sessionID] ?? emptyPermissions)
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
const retryInfo = computed(() => {
  const s = status.value
  if (s.type !== "retry") return
  return s
})

const response = computed(() => lastTextPart.value?.text)
const responsePartId = computed(() => lastTextPart.value?.id)
const messageDiffs = computed(() => message.value?.summary?.diffs ?? emptyDiffs)
const hasDiffs = computed(() => messageDiffs.value.length > 0)
const hideResponsePart = computed(() => !working.value && !!responsePartId.value)

const visibleDiffs = computed(() => messageDiffs.value.slice(0, diffLimit.value))

// Helper Functions
function isAttachment(part: PartType | undefined) {
  if (part?.type !== "file") return false
  const mime = (part as FilePart).mime ?? ""
  return mime.startsWith("image/") || mime === "application/pdf"
}

function computeStatusFromPart(part: PartType | undefined): string | undefined {
  if (!part) return undefined
  if (part.type === "tool") {
    switch (part.tool) {
      case "task":
        return t("ui.sessionTurn.status.delegating")
      case "todowrite":
      case "todoread":
        return t("ui.sessionTurn.status.planning")
      case "read":
        return t("ui.sessionTurn.status.gatheringContext")
      case "list":
      case "grep":
      case "glob":
        return t("ui.sessionTurn.status.searchingCodebase")
      case "webfetch":
        return t("ui.sessionTurn.status.searchingWeb")
      case "edit":
      case "write":
        return t("ui.sessionTurn.status.makingEdits")
      case "bash":
        return t("ui.sessionTurn.status.runningCommands")
      default:
        return undefined
    }
  }
  if (part.type === "reasoning") {
    const text = part.text ?? ""
    const match = text.trimStart().match(/^\*\*(.+?)\*\*/)
    if (match) return t("ui.sessionTurn.status.thinkingWithTopic", { topic: match[1].trim() })
    return t("ui.sessionTurn.status.thinking")
  }
  if (part.type === "text") {
    return t("ui.sessionTurn.status.gatheringThoughts")
  }
  return undefined
}

function computeDuration() {
  const msg = message.value
  if (!msg) return ""
  const completed = lastAssistantMessage.value?.time.completed
  const from = DateTime.fromMillis(msg.time.created)
  const to = completed ? DateTime.fromMillis(completed) : DateTime.now()
  const interval = Interval.fromDateTimes(from, to)
  const unit: DurationUnit[] = interval.length("seconds") > 60 ? ["minutes", "seconds"] : ["seconds"]
  const currentLocale = locale.value
  const human = interval.toDuration(unit).normalize().reconfigure({ locale: currentLocale }).toHuman({
    notation: "compact",
    unitDisplay: "narrow",
    compactDisplay: "short",
    showZeros: false,
  })
  return currentLocale.startsWith("zh") ? human.replaceAll("、", "") : human
}

// Event Handlers
function handleStepsToggle() {
  emit("steps-expanded-toggle")
}

function handleInteraction() {
  emit("user-interacted")
}

function handleScroll() {
  // Auto-scroll logic
}

async function handleCopy() {
  const content = response.value ?? ""
  if (!content) return
  await navigator.clipboard.writeText(content)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function loadMoreDiffs() {
  const total = messageDiffs.value.length
  diffLimit.value = Math.min(diffLimit.value + DIFF_BATCH, total)
}

function updateStickyHeight(height: number) {
  const root = rootRef.value
  if (!root) return
  const next = Math.ceil(height)
  root.style.setProperty("--session-turn-sticky-height", `${next}px`)
}

// Watchers
watch(
  () => message.value?.id,
  () => {
    diffsOpen.value = []
    diffLimit.value = DIFF_INIT
  }
)

watch(retryInfo, (r) => {
  if (!r) {
    retrySeconds.value = 0
    return
  }
  const updateSeconds = () => {
    const next = r.next
    if (next) retrySeconds.value = Math.max(0, Math.round((next - Date.now()) / 1000))
  }
  updateSeconds()
  const timer = setInterval(updateSeconds, 1000)
  onBeforeUnmount(() => clearInterval(timer))
})

watch(working, (isWorking) => {
  if (!isWorking) return
  const timer = setInterval(() => {
    durationText.value = computeDuration()
  }, 1000)
  onBeforeUnmount(() => clearInterval(timer))
})

// Resize Observer
useResizeObserver(stickyRef, ({ height }) => {
  updateStickyHeight(height)
})

// Lifecycle
onMounted(() => {
  durationText.value = computeDuration()
  nextTick(() => {
    const root = rootRef.value
    const sticky = stickyRef.value
    if (root && sticky) {
      updateStickyHeight(sticky.getBoundingClientRect().height)
    }
  })
})
</script>

<style scoped>
/* 根据你的实际样式需求添加样式 */
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
