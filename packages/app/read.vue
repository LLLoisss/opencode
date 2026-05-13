<template>
  <div class="read-tool">
    <BasicTool v-bind="props"
               icon="glasses"
               :trigger="{
        title: i18n.t('ui.tool.read'),
        subtitle: props.input.filePath ? getFilename(props.input.filePath) : '',
        args,
      }" />
    <div v-for="filepath in loaded"
         :key="filepath"
         data-component="tool-loaded-file">
      <el-icon size="small">
        <component :is="'Enter'" />
      </el-icon>
      <span>
        {{ i18n.t('ui.tool.loaded') }} {{ relativizeProjectPaths(filepath, data.directory) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { getFilename } from "@opencode-ai/util/path"
import BasicTool from "./BasicTool.vue"
import { useData } from "../context"
import { useI18n } from "../context/i18n"

interface Props {
  input: {
    filePath?: string
    offset?: number
    limit?: number
  }
  metadata: {
    loaded?: any
  }
  status?: string
  [key: string]: any
}

const props = defineProps<Props>()

const data = useData()
const i18n = useI18n()

const args = computed(() => {
  const result: string[] = []
  if (props.input.offset) result.push("offset=" + props.input.offset)
  if (props.input.limit) result.push("limit=" + props.input.limit)
  return result
})

const loaded = computed(() => {
  if (props.status !== "completed") return []
  const value = props.metadata.loaded
  if (!value || !Array.isArray(value)) return []
  return value.filter((p): p is string => typeof p === "string")
})

function relativizeProjectPaths(text: string, directory?: string) {
  if (!text) return ""
  if (!directory) return text
  return text.split(directory).join("")
}
</script>

<style scoped>
[data-component="tool-loaded-file"] {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

[data-component="tool-loaded-file"] span {
  word-break: break-all;
}
</style>
