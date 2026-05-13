<template>
  <BasicTool :icon="CodeIcon"
             :hide-details="hideDetails"
             :default-open="defaultOpen"
             :force-open="forceOpen"
             :locked="locked">
    <!-- 自定义触发器：标题区域 + Diff 统计 -->
    <template #trigger>
      <div class="edit-trigger">
        <div class="title-area">
          <div class="title-row">
            <div class="title">
              <span class="title-text">Edit</span>
              <span class="title-filename">{{ filename }}</span>
            </div>
            <div v-if="hasDirectory"
                 class="path">
              <span class="directory">{{ directory }}</span>
            </div>
          </div>
        </div>
        <div class="actions">
          <DiffChanges v-if="metadata?.filediff"
                       :changes="metadata.filediff" />
        </div>
      </div>
    </template>

    <!-- 展开内容：Diff 视图 -->
    <div v-if="hasDiffContent"
         class="edit-content">
      <DiffViewer :before="diffBefore"
                  :after="diffAfter" />
    </div>

    <!-- 诊断信息 -->
    <DiagnosticsDisplay :diagnostics="diagnostics" />
  </BasicTool>
</template>

<script setup lang="ts">
import { computed, markRaw } from "vue"
import { Document } from "@element-plus/icons-vue"
import BasicTool from "./BasicTool.vue"
import DiffChanges from "./DiffChanges.vue"
import DiffViewer from "./DiffViewer.vue"
import DiagnosticsDisplay from "./DiagnosticsDisplay.vue"

// 使用 markRaw 避免图标组件被 Vue 代理
const CodeIcon = markRaw(Document)

// ==================== 类型定义 ====================

interface Diagnostic {
  range: {
    start: { line: number; character: number }
    end: { line: number; character: number }
  }
  message: string
  severity?: number
}

interface FileDiff {
  path?: string
  file?: string
  before?: string
  after?: string
  additions?: number
  deletions?: number
}

interface EditToolProps {
  /** 工具输入参数 */
  input: {
    filePath?: string
    oldString?: string
    newString?: string
    [key: string]: any
  }
  /** 工具元数据 */
  metadata: {
    filediff?: FileDiff
    diagnostics?: Record<string, Diagnostic[]>
    [key: string]: any
  }
  /** 工具名称 */
  tool?: string
  /** 工具输出 */
  output?: string
  /** 工具状态 */
  status?: string
  /** 是否隐藏详情 */
  hideDetails?: boolean
  /** 默认展开 */
  defaultOpen?: boolean
  /** 强制展开 */
  forceOpen?: boolean
  /** 是否锁定（权限等待中） */
  locked?: boolean
}

// ==================== Props ====================

const props = withDefaults(defineProps<EditToolProps>(), {
  tool: "edit",
  hideDetails: false,
  defaultOpen: false,
  forceOpen: false,
  locked: false,
})

// ==================== 工具函数 ====================

function getFilename(filePath: string): string {
  if (!filePath) return ""
  const parts = filePath.replace(/\\/g, "/").split("/")
  return parts[parts.length - 1] || ""
}

function getDirectory(filePath: string | undefined): string {
  if (!filePath) return ""
  const normalized = filePath.replace(/\\/g, "/")
  const lastSlash = normalized.lastIndexOf("/")
  if (lastSlash === -1) return ""
  return normalized.substring(0, lastSlash + 1)
}

function filterDiagnostics(
  diagnosticsByFile: Record<string, Diagnostic[]> | undefined,
  filePath: string | undefined
): Diagnostic[] {
  if (!diagnosticsByFile || !filePath) return []
  const list = diagnosticsByFile[filePath] ?? []
  return list.filter((d) => d.severity === 1).slice(0, 3)
}

// ==================== 计算属性 ====================

const filename = computed(() => getFilename(props.input.filePath ?? ""))

const hasDirectory = computed(() => !!props.input.filePath?.includes("/"))

const directory = computed(() => getDirectory(props.input.filePath))

const diagnostics = computed(() => filterDiagnostics(props.metadata?.diagnostics, props.input.filePath))

const hasDiffContent = computed(() => !!(props.metadata?.filediff?.path || props.input.filePath))

const diffBefore = computed(() => ({
  name: props.metadata?.filediff?.file || props.input.filePath,
  contents: props.metadata?.filediff?.before || props.input.oldString,
}))

const diffAfter = computed(() => ({
  name: props.metadata?.filediff?.file || props.input.filePath,
  contents: props.metadata?.filediff?.after || props.input.newString,
}))
</script>

<style scoped>
.edit-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.title-area {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.title-row {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.title-text {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.title-filename {
  font-family: var(--el-font-family-mono, monospace);
  font-size: 13px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path {
  margin-top: 2px;
}

.directory {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: var(--el-font-family-mono, monospace);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.edit-content {
  border-top: 1px solid var(--el-border-color-lighter);
  overflow: auto;
}
</style>
