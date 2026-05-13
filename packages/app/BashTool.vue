<template>
  <div class="bash-tool">
    <BasicToolVue :icon="'console'"
                  :trigger="triggerConfig"
                  :status="status"
                  :hide-details="hideDetails"
                  :default-open="defaultOpen"
                  :force-open="forceOpen"
                  :locked="locked">
      <template #output>
        <div class="tool-output"
             data-scrollable>
          <el-scrollbar max-height="500px">
            <div class="markdown-content"
                 v-html="renderMarkdown(commandText)"></div>
          </el-scrollbar>
        </div>
      </template>
    </BasicToolVue>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import BasicToolVue from "./BasicTool-vue2.vue"
import { marked } from "marked"

interface BashInput {
  command?: string
  description?: string
}

interface Props {
  input: BashInput
  metadata?: Record<string, any>
  tool: string
  output?: string
  status?: string
  hideDetails?: boolean
  defaultOpen?: boolean
  forceOpen?: boolean
  locked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  metadata: () => ({}),
  hideDetails: false,
  defaultOpen: false,
  forceOpen: false,
  locked: false,
})

const { t } = useI18n()

/**
 * 使用正则表达式清除 ANSI 颜色代码
 * ANSI 转义序列格式: \x1b[...m 或 \u001b[...m
 */
const removeAnsiCodes = (text: string): string => {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "")
}

// 获取命令
const command = computed(() => {
  return props.input.command ?? props.metadata?.command ?? ""
})

// 获取输出并清理 ANSI 颜色代码
const commandOutput = computed(() => {
  const rawOutput = props.output || props.metadata?.output
  if (!rawOutput) return ""
  // 使用自定义函数清除 ANSI 码
  return removeAnsiCodes(rawOutput)
})

// 构建完整的命令文本（Markdown 格式）
const commandText = computed(() => {
  const cmd = command.value
  const output = commandOutput.value

  let text = "```command\n$ " + cmd

  if (output) {
    text += "\n\n" + output
  }

  text += "\n```"

  return text
})

// 触发器配置
const triggerConfig = computed(() => ({
  title: t("ui.tool.shell"),
  subtitle: props.input.description || "",
}))

// 渲染 Markdown
const renderMarkdown = (text: string): string => {
  return marked(text) as string
}
</script>

<style scoped lang="scss">
.bash-tool {
  margin: 8px 0;
}

.tool-output {
  padding: 12px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;

  &[data-scrollable] {
    max-height: 500px;
    overflow: auto;
  }
}

.markdown-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);

  :deep(pre) {
    background-color: #1e1e1e;
    color: #d4d4d4;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0;

    code {
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.5;
      color: inherit;
      background: none;
      padding: 0;
    }
  }

  // 命令提示符样式
  :deep(pre code) {
    display: block;
    white-space: pre;
    word-wrap: normal;
  }

  // 亮色主题适配
  @media (prefers-color-scheme: light) {
    :deep(pre) {
      background-color: #f6f8fa;
      color: #24292f;
    }
  }
}
</style>
