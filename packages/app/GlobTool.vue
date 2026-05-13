<template>
  <BasicTool v-bind="props"
             icon="magnifying-glass-menu"
             :trigger="{
      title: t('ui.tool.glob'),
      subtitle: getDirectory(props.input?.path || '/'),
      args: props.input?.pattern ? ['pattern=' + props.input.pattern] : [],
    }">
    <div v-if="props.output"
         data-component="tool-output"
         data-scrollable>
      <Markdown :text="props.output" />
    </div>
  </BasicTool>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import BasicTool from "./BasicTool.vue"
import Markdown from "./Markdown.vue"

interface ToolProps {
  input: Record<string, any>
  metadata: Record<string, any>
  tool: string
  output?: string
  status?: string
  hideDetails?: boolean
  defaultOpen?: boolean
  forceOpen?: boolean
  locked?: boolean
}

const props = defineProps<ToolProps>()

const { t } = useI18n()

// 获取目录路径，相对化项目路径
const getDirectory = (path: string | undefined): string => {
  if (!path) return ""
  // 这里需要根据实际情况实现路径处理逻辑
  // 原代码中使用了_getDirectory和relativizeProjectPaths
  const parts = path.split("/")
  parts.pop() // 移除文件名，保留目录
  return parts.join("/") || "/"
}
</script>

<style scoped>
[data-component="tool-output"] {
  overflow: auto;
  max-height: 400px;
}

[data-scrollable] {
  scrollbar-width: thin;
}
</style>
