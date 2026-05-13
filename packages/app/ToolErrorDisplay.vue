<template>
  <el-card v-if="errorMessage"
           class="tool-error-card"
           shadow="never"
           :body-style="{ padding: '12px 16px' }">
    <div data-component="tool-error">
      <el-icon :size="16"
               class="error-icon">
        <CircleClose />
      </el-icon>

      <div v-if="errorTitle && errorTitle.length < 30"
           data-slot="message-part-tool-error-content">
        <div data-slot="message-part-tool-error-title"
             class="error-title">
          {{ errorTitle }}
        </div>
        <span data-slot="message-part-tool-error-message"
              class="error-message">
          {{ errorDetails }}
        </span>
      </div>

      <span v-else
            data-slot="message-part-tool-error-message"
            class="error-message">
        {{ cleanedError }}
      </span>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { ElCard, ElIcon } from "element-plus"
import { CircleClose } from "@element-plus/icons-vue"

interface ToolPart {
  state: {
    status: string
    error?: string
  }
}

interface Props {
  part: ToolPart
}

const props = defineProps<Props>()

// 计算错误消息
const errorMessage = computed(() => {
  return props.part.state.status === "error" && props.part.state.error ? props.part.state.error : ""
})

// 清理错误消息（移除 "Error: " 前缀）
const cleanedError = computed(() => {
  return errorMessage.value.replace("Error: ", "")
})

// 解析错误标题和详细信息
const errorTitle = computed(() => {
  const parts = cleanedError.value.split(": ")
  return parts.length > 1 ? parts[0] : ""
})

const errorDetails = computed(() => {
  const parts = cleanedError.value.split(": ")
  if (parts.length > 1) {
    return parts.slice(1).join(": ")
  }
  return ""
})
</script>

<style scoped lang="scss">
.tool-error-card {
  border: 1px solid var(--el-color-danger-light-5);
  background-color: var(--el-color-danger-light-9);

  :deep(.el-card__body) {
    padding: 12px 16px;
  }
}

[data-component="tool-error"] {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: var(--el-color-danger);

  .error-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }
}

[data-slot="message-part-tool-error-content"] {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.error-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-color-danger);
}

.error-message {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}
</style>
