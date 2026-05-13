<template>
  <div class="diff-viewer"
       :class="{ 'diff-viewer--split': mode === 'split' }">
    <!-- 工具栏 -->
    <div class="diff-toolbar">
      <span v-if="fileName"
            class="diff-filename">{{ fileName }}</span>
      <div class="diff-toolbar-actions">
        <el-radio-group v-model="mode"
                        size="small">
          <el-radio-button label="unified">Unified</el-radio-button>
          <el-radio-button label="split">Split</el-radio-button>
        </el-radio-group>
        <el-tag v-if="stats.additions > 0"
                type="success"
                size="small"
                effect="plain">
          +{{ stats.additions }}
        </el-tag>
        <el-tag v-if="stats.deletions > 0"
                type="danger"
                size="small"
                effect="plain">
          -{{ stats.deletions }}
        </el-tag>
      </div>
    </div>

    <!-- Unified 模式 -->
    <div v-if="mode === 'unified'"
         class="diff-content"
         ref="scrollContainer">
      <table class="diff-table">
        <tbody>
          <tr v-for="(line, index) in unifiedLines"
              :key="index"
              class="diff-line"
              :class="lineClass(line.type)">
            <td class="diff-gutter diff-gutter-old">
              {{ line.oldNum ?? '' }}
            </td>
            <td class="diff-gutter diff-gutter-new">
              {{ line.newNum ?? '' }}
            </td>
            <td class="diff-indicator">
              {{ line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' ' }}
            </td>
            <td class="diff-code">
              <pre class="diff-code-inner">{{ line.text }}</pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Split 模式 -->
    <div v-else
         class="diff-content diff-content-split"
         ref="scrollContainer">
      <div class="diff-split-pane diff-split-left">
        <table class="diff-table">
          <tbody>
            <tr v-for="(line, index) in splitLines.left"
                :key="index"
                class="diff-line"
                :class="lineClass(line.type)">
              <td class="diff-gutter">{{ line.num ?? '' }}</td>
              <td class="diff-indicator">
                {{ line.type === 'del' ? '-' : ' ' }}
              </td>
              <td class="diff-code">
                <pre class="diff-code-inner">{{ line.text }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="diff-split-pane diff-split-right">
        <table class="diff-table">
          <tbody>
            <tr v-for="(line, index) in splitLines.right"
                :key="index"
                class="diff-line"
                :class="lineClass(line.type)">
              <td class="diff-gutter">{{ line.num ?? '' }}</td>
              <td class="diff-indicator">
                {{ line.type === 'add' ? '+' : ' ' }}
              </td>
              <td class="diff-code">
                <pre class="diff-code-inner">{{ line.text }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 无差异提示 -->
    <div v-if="unifiedLines.length === 0"
         class="diff-empty">
      <el-empty description="无差异"
                :image-size="48" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

// ==================== 类型定义 ====================

export interface FileContents {
  /** 文件名 */
  name?: string
  /** 文件内容 */
  contents?: string
}

interface DiffViewerProps {
  /** 修改前的文件 */
  before: FileContents
  /** 修改后的文件 */
  after: FileContents
}

type LineType = "add" | "del" | "normal"

interface UnifiedLine {
  type: LineType
  text: string
  oldNum?: number
  newNum?: number
}

interface SplitLine {
  type: LineType | "empty"
  text: string
  num?: number
}

// ==================== Props ====================

const props = defineProps<DiffViewerProps>()

// ==================== State ====================

const mode = ref<"unified" | "split">("unified")

// ==================== Diff 计算 ====================

/**
 * 简易 Myers diff 算法，计算两个字符串数组的编辑脚本
 * 返回 { type, value } 数组
 */
function computeDiff(oldLines: string[], newLines: string[]): { type: "equal" | "insert" | "delete"; value: string }[] {
  const oldLen = oldLines.length
  const newLen = newLines.length

  // 快速路径：完全相同
  if (oldLen === 0 && newLen === 0) return []
  if (oldLen === 0) return newLines.map((v) => ({ type: "insert" as const, value: v }))
  if (newLen === 0) return oldLines.map((v) => ({ type: "delete" as const, value: v }))

  // LCS-based diff using DP (适用于中等大小的文件)
  // 超大文件时会退化，但对一般编辑场景足够
  const MAX = oldLen + newLen
  const vSize = 2 * MAX + 1
  const v = new Int32Array(vSize).fill(-1)
  const offset = MAX
  const trace: Int32Array[] = []

  outer: for (let d = 0; d <= MAX; d++) {
    const vCopy = new Int32Array(v)
    trace.push(vCopy)

    for (let k = -d; k <= d; k += 2) {
      let x: number
      if (k === -d || (k !== d && v[k - 1 + offset] < v[k + 1 + offset])) {
        x = v[k + 1 + offset]
      } else {
        x = v[k - 1 + offset] + 1
      }
      let y = x - k
      while (x < oldLen && y < newLen && oldLines[x] === newLines[y]) {
        x++
        y++
      }
      v[k + offset] = x
      if (x >= oldLen && y >= newLen) {
        break outer
      }
    }
  }

  // Backtrack
  const result: { type: "equal" | "insert" | "delete"; value: string }[] = []
  let x = oldLen
  let y = newLen

  for (let d = trace.length - 1; d >= 0; d--) {
    const vPrev = trace[d]
    const k = x - y

    let prevK: number
    if (k === -d || (k !== d && vPrev[k - 1 + offset] < vPrev[k + 1 + offset])) {
      prevK = k + 1
    } else {
      prevK = k - 1
    }
    const prevX = vPrev[prevK + offset]
    const prevY = prevX - prevK

    // Diagonal (equal)
    while (x > prevX && y > prevY) {
      x--
      y--
      result.push({ type: "equal", value: oldLines[x] })
    }

    if (d > 0) {
      if (x === prevX) {
        // Insert
        y--
        result.push({ type: "insert", value: newLines[y] })
      } else {
        // Delete
        x--
        result.push({ type: "delete", value: oldLines[x] })
      }
    }
  }

  result.reverse()
  return result
}

// ==================== 计算属性 ====================

const fileName = computed(() => props.after?.name || props.before?.name || "")

/** 原始 diff 结果 */
const diffResult = computed(() => {
  const oldText = props.before?.contents ?? ""
  const newText = props.after?.contents ?? ""
  const oldLines = oldText ? oldText.split("\n") : []
  const newLines = newText ? newText.split("\n") : []
  return computeDiff(oldLines, newLines)
})

/** 统计信息 */
const stats = computed(() => {
  let additions = 0
  let deletions = 0
  for (const change of diffResult.value) {
    if (change.type === "insert") additions++
    if (change.type === "delete") deletions++
  }
  return { additions, deletions }
})

/** Unified 模式行 */
const unifiedLines = computed<UnifiedLine[]>(() => {
  const lines: UnifiedLine[] = []
  let oldNum = 1
  let newNum = 1

  for (const change of diffResult.value) {
    switch (change.type) {
      case "equal":
        lines.push({ type: "normal", text: change.value, oldNum: oldNum++, newNum: newNum++ })
        break
      case "delete":
        lines.push({ type: "del", text: change.value, oldNum: oldNum++ })
        break
      case "insert":
        lines.push({ type: "add", text: change.value, newNum: newNum++ })
        break
    }
  }
  return lines
})

/** Split 模式行 */
const splitLines = computed<{ left: SplitLine[]; right: SplitLine[] }>(() => {
  const left: SplitLine[] = []
  const right: SplitLine[] = []

  // 按连续的 del/add 块配对
  const changes = diffResult.value
  let i = 0
  let oldNum = 1
  let newNum = 1

  while (i < changes.length) {
    const change = changes[i]

    if (change.type === "equal") {
      left.push({ type: "normal", text: change.value, num: oldNum++ })
      right.push({ type: "normal", text: change.value, num: newNum++ })
      i++
    } else {
      // 收集连续的 delete 和 insert
      const dels: string[] = []
      const ins: string[] = []
      while (i < changes.length && changes[i].type === "delete") {
        dels.push(changes[i].value)
        i++
      }
      while (i < changes.length && changes[i].type === "insert") {
        ins.push(changes[i].value)
        i++
      }
      const maxLen = Math.max(dels.length, ins.length)
      for (let j = 0; j < maxLen; j++) {
        if (j < dels.length) {
          left.push({ type: "del", text: dels[j], num: oldNum++ })
        } else {
          left.push({ type: "empty", text: "" })
        }
        if (j < ins.length) {
          right.push({ type: "add", text: ins[j], num: newNum++ })
        } else {
          right.push({ type: "empty", text: "" })
        }
      }
    }
  }

  return { left, right }
})

// ==================== 辅助方法 ====================

function lineClass(type: string): string {
  switch (type) {
    case "add":
      return "diff-line--add"
    case "del":
      return "diff-line--del"
    case "empty":
      return "diff-line--empty"
    default:
      return ""
  }
}

const scrollContainer = ref<HTMLDivElement>()
</script>

<style scoped>
.diff-viewer {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 20px;
}

/* 工具栏 */
.diff-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
  gap: 8px;
}

.diff-filename {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diff-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 内容区域 */
.diff-content {
  overflow: auto;
  max-height: 500px;
}

.diff-content-split {
  display: flex;
}

.diff-split-pane {
  flex: 1;
  overflow: auto;
  min-width: 0;
}

.diff-split-left {
  border-right: 1px solid var(--el-border-color-lighter);
}

/* 表格 */
.diff-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* 行 */
.diff-line {
  height: 20px;
}

.diff-line--add {
  background-color: var(--el-color-success-light-9);
}

.diff-line--del {
  background-color: var(--el-color-danger-light-9);
}

.diff-line--empty {
  background-color: var(--el-fill-color-lighter);
}

/* 行号 */
.diff-gutter {
  width: 48px;
  min-width: 48px;
  padding: 0 8px;
  text-align: right;
  color: var(--el-text-color-placeholder);
  user-select: none;
  vertical-align: top;
  border-right: 1px solid var(--el-border-color-extra-light);
}

.diff-gutter-old {
  border-right: none;
}

/* 指示符 (+/-/空格) */
.diff-indicator {
  width: 20px;
  min-width: 20px;
  text-align: center;
  color: var(--el-text-color-placeholder);
  user-select: none;
  vertical-align: top;
}

.diff-line--add .diff-indicator {
  color: var(--el-color-success);
  font-weight: 600;
}

.diff-line--del .diff-indicator {
  color: var(--el-color-danger);
  font-weight: 600;
}

/* 代码 */
.diff-code {
  padding: 0 12px 0 4px;
  white-space: pre-wrap;
  word-break: break-all;
  vertical-align: top;
}

.diff-code-inner {
  margin: 0;
  padding: 0;
  font: inherit;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 空差异 */
.diff-empty {
  padding: 24px;
  text-align: center;
}
</style>
