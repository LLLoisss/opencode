<template>
  <BasicTool v-bind="props"
             icon="bullet-list"
             :trigger="{
      title: t('ui.tool.list'),
      subtitle: getDirectory(props.input?.path || '/')
    }">
    <template v-if="props.output">
      <div data-component="tool-output"
           data-scrollable>
        <Markdown :text="props.output" />
      </div>
    </template>
  </BasicTool>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import BasicTool from "./BasicTool.vue"
import Markdown from "./Markdown.vue"
import { getDirectory as _getDirectory } from "@opencode-ai/util/path"
import { useData } from "./src/composables/useData"

interface ToolProps {
  input?: {
    path?: string
    [key: string]: any
  }
  metadata?: Record<string, any>
  tool?: string
  output?: string
  status?: string
  hideDetails?: boolean
  defaultOpen?: boolean
  forceOpen?: boolean
  locked?: boolean
}

const props = withDefaults(defineProps<ToolProps>(), {
  input: () => ({}),
  metadata: () => ({}),
  tool: "list",
  output: "",
  status: "",
  hideDetails: false,
  defaultOpen: false,
  forceOpen: false,
  locked: false,
})

const { t } = useI18n()

// 从 context 获取数据
const data = useData()

/**
 * 将绝对路径转换为相对路径，移除项目根目录前缀
 * @param text - 要处理的路径文本
 * @param directory - 项目根目录路径
 * @returns 相对化后的路径
 */
const relativizeProjectPaths = (text: string, directory?: string): string => {
  if (!text) return ""
  if (!directory) return text
  return text.split(directory).join("")
}

/**
 * 获取路径的目录部分，并转换为相对于项目根目录的路径
 * @param path - 文件路径
 * @returns 相对化后的目录路径
 */
const getDirectory = (path: string | undefined): string => {
  return relativizeProjectPaths(_getDirectory(path), data.directory)
}
</script>

<style scoped>
[data-component="tool-output"] {
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
}

[data-scrollable] {
  overflow: auto;
  max-height: 400px;
}
</style>
