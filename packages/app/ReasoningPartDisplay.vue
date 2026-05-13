<template>
  <div v-if="throttledText"
       data-component="reasoning-part">
    <Markdown :text="throttledText"
              :cache-key="part.id" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue"
import type { ReasoningPart } from "@opencode-ai/sdk/v2"
import Markdown from "./Markdown.vue" // 需要根据实际路径调整

interface Props {
  part: ReasoningPart
}

const props = defineProps<Props>()

const TEXT_RENDER_THROTTLE_MS = 100

// 创建节流值的逻辑
const throttledText = ref("")
let timeout: ReturnType<typeof setTimeout> | undefined
let lastUpdate = 0

const text = computed(() => props.part.text.trim())

// 节流更新逻辑
watch(
  text,
  (newValue) => {
    const now = Date.now()
    const remaining = TEXT_RENDER_THROTTLE_MS - (now - lastUpdate)

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }
      lastUpdate = now
      throttledText.value = newValue
      return
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      lastUpdate = Date.now()
      throttledText.value = newValue
      timeout = undefined
    }, remaining)
  },
  { immediate: true }
)

// 清理定时器
onUnmounted(() => {
  if (timeout) clearTimeout(timeout)
})
</script>

<style scoped>
/* 如果需要特定样式，可以在这里添加 */
[data-component="reasoning-part"] {
  /* 添加你的样式 */
}
</style>
