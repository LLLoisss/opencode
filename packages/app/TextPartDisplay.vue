<template>
  <div v-if="throttledText"
       data-component="text-part">
    <div data-slot="text-part-body">
      <Markdown :text="throttledText"
                :cache-key="part.id" />
      <div data-slot="text-part-copy-wrapper">
        <el-tooltip :content="copied ? $t('ui.message.copied') : $t('ui.message.copy')"
                    placement="top"
                    :offset="8">
          <el-button :icon="copied ? Check : CopyDocument"
                     type="default"
                     circle
                     @mousedown.prevent
                     @click="handleCopy"
                     :aria-label="copied ? $t('ui.message.copied') : $t('ui.message.copy')" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue"
import { Check, CopyDocument } from "@element-plus/icons-vue"
import type { TextPart } from "@opencode-ai/sdk/v2"
import Markdown from "./Markdown.vue"

interface Props {
  part: TextPart
}

const props = defineProps<Props>()

// 假设从某个全局状态或 provide/inject 获取
const data = inject("data") as { directory?: string }
const { t: $t } = useI18n()

const copied = ref(false)
const throttledText = ref("")
let throttleTimeout: NodeJS.Timeout | undefined

const TEXT_RENDER_THROTTLE_MS = 100

// 相对路径化处理
function relativizeProjectPaths(text: string, directory?: string): string {
  if (!text) return ""
  if (!directory) return text
  return text.split(directory).join("")
}

// 获取显示文本
const displayText = computed(() => relativizeProjectPaths((props.part.text ?? "").trim(), data.directory))

// 节流更新逻辑
let lastUpdate = 0
watch(
  displayText,
  (newText) => {
    const now = Date.now()
    const remaining = TEXT_RENDER_THROTTLE_MS - (now - lastUpdate)

    if (remaining <= 0) {
      if (throttleTimeout) {
        clearTimeout(throttleTimeout)
        throttleTimeout = undefined
      }
      lastUpdate = now
      throttledText.value = newText
      return
    }

    if (throttleTimeout) clearTimeout(throttleTimeout)
    throttleTimeout = setTimeout(() => {
      lastUpdate = Date.now()
      throttledText.value = newText
      throttleTimeout = undefined
    }, remaining)
  },
  { immediate: true }
)

// 复制功能
async function handleCopy() {
  const content = displayText.value
  if (!content) return

  try {
    await navigator.clipboard.writeText(content)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error("Failed to copy:", error)
  }
}

// 清理
onUnmounted(() => {
  if (throttleTimeout) {
    clearTimeout(throttleTimeout)
  }
})
</script>

<style scoped>
[data-component="text-part"] {
  position: relative;
}

[data-slot="text-part-body"] {
  position: relative;
}

[data-slot="text-part-copy-wrapper"] {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

[data-slot="text-part-body"]:hover [data-slot="text-part-copy-wrapper"] {
  opacity: 1;
}

.el-button {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}

.el-button:hover {
  background: var(--el-fill-color-light);
}
</style>
