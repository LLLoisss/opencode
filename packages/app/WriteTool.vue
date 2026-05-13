<template>
  <BasicTool :icon="CodeLines"
             :hide-details="hideDetails"
             :default-open="defaultOpen"
             :force-open="forceOpen"
             :locked="locked">
    <!-- 自定义 trigger 插槽 -->
    <template #trigger>
      <div class="write-trigger">
        <div class="message-part-title-area">
          <div class="message-part-title">
            <span class="message-part-title-text">{{ t("ui.messagePart.title.write") }}</span>
            <span class="message-part-title-filename">{{ filename }}</span>
          </div>
          <div v-if="hasDirectory"
               class="message-part-path">
            <span class="message-part-directory">{{ directory }}</span>
          </div>
        </div>
        <div class="message-part-actions">
          <!-- <DiffChanges :diff="diff" /> -->
        </div>
      </div>
    </template>

    <!-- 默认插槽：代码内容 + 诊断信息 -->
    <div v-if="input.content"
         class="write-content">
      <component :is="codeComponent"
                 :file="{
          name: input.filePath,
          contents: input.content,
          cacheKey: contentChecksum,
        }"
                 overflow="scroll" />
    </div>
    <DiagnosticsDisplay :diagnostics="diagnostics" />
  </BasicTool>
</template>

<script setup lang="ts">
import { computed, type Component as VueComponent } from "vue"
import { useI18n } from "vue-i18n"
import BasicTool from "./BasicTool.vue"
import DiagnosticsDisplay from "./DiagnosticsDisplay.vue"
import { CodeLines } from "./icons" // 根据项目实际图标路径调整

/**
 * 诊断信息接口
 */
interface Diagnostic {
  range: {
    start: { line: number; character: number }
    end: { line: number; character: number }
  }
  message: string
  severity?: number
}

/**
 * WriteTool 输入参数
 */
interface WriteInput {
  /** 文件路径 */
  filePath?: string
  /** 文件内容 */
  content?: string
}

/**
 * WriteTool 元数据
 */
interface WriteMetadata {
  /** 按文件路径分组的诊断信息 */
  diagnostics?: Record<string, Diagnostic[]>
}

/**
 * Props 定义
 */
interface WriteToolProps {
  /** 工具输入参数 */
  input: WriteInput
  /** 工具元数据 */
  metadata: WriteMetadata
  /** 工具名称 */
  tool?: string
  /** 工具输出 */
  output?: string
  /** 工具状态 */
  status?: string
  /** 是否隐藏详情 */
  hideDetails?: boolean
  /** 是否默认展开 */
  defaultOpen?: boolean
  /** 是否强制展开 */
  forceOpen?: boolean
  /** 是否锁定 */
  locked?: boolean
  /** 代码展示组件（通过 provide/inject 或 prop 传入） */
  codeComponent?: VueComponent
}

const props = withDefaults(defineProps<WriteToolProps>(), {
  tool: "write",
  hideDetails: false,
  defaultOpen: false,
  forceOpen: false,
  locked: false,
})

const { t } = useI18n()

// ============ 工具函数 ============

/**
 * 从文件路径中提取文件名
 */
function getFilename(filePath: string): string {
  if (!filePath) return ""
  const parts = filePath.split("/")
  return parts[parts.length - 1] || ""
}

/**
 * 从文件路径中提取目录部分
 */
function getDirectory(filePath: string | undefined): string {
  if (!filePath) return ""
  const lastSlash = filePath.lastIndexOf("/")
  if (lastSlash === -1) return ""
  return filePath.substring(0, lastSlash + 1)
}

/**
 * 计算内容的校验和（简易实现，可替换为实际的 checksum 工具）
 */
function checksum(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash.toString(36)
}

/**
 * 从诊断数据中筛选匹配文件且严重等级为 Error 的前 3 条
 */
function getDiagnostics(
  diagnosticsByFile: Record<string, Diagnostic[]> | undefined,
  filePath: string | undefined
): Diagnostic[] {
  if (!diagnosticsByFile || !filePath) return []
  const items = diagnosticsByFile[filePath] ?? []
  return items.filter((d) => d.severity === 1).slice(0, 3)
}

// ============ 计算属性 ============

/** 文件名 */
const filename = computed(() => getFilename(props.input.filePath ?? ""))

/** 是否包含目录路径 */
const hasDirectory = computed(() => !!props.input.filePath?.includes("/"))

/** 目录路径 */
const directory = computed(() => getDirectory(props.input.filePath))

/** 内容校验和 */
const contentChecksum = computed(() => (props.input.content ? checksum(props.input.content) : ""))

/** 筛选后的诊断信息 */
const diagnostics = computed(() => getDiagnostics(props.metadata?.diagnostics, props.input.filePath))

/** 代码展示组件（可通过 prop 或 inject 获取） */
const codeComponent = computed(() => props.codeComponent)
</script>

<style scoped>
.write-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.message-part-title-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.message-part-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.message-part-title-text {
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.message-part-title-filename {
  color: var(--el-text-color-regular);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-part-path {
  font-size: 12px;
}

.message-part-directory {
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-part-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.write-content {
  max-height: 400px;
  overflow: auto;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}
</style>
