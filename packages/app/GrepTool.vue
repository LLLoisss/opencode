<template>
  <div class="grep-tool">
    <BasicToolVue :icon="'magnifying-glass-menu'"
                  :trigger="triggerConfig"
                  :status="status"
                  :hide-details="hideDetails"
                  :default-open="defaultOpen"
                  :force-open="forceOpen"
                  :locked="locked">
      <template #output>
        <div v-if="output"
             class="tool-output"
             data-scrollable>
          <el-scrollbar max-height="400px">
            <div class="markdown-content"
                 v-html="renderMarkdown(output)"></div>
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

interface GrepInput {
  pattern?: string
  include?: string
  path?: string
}

interface Props {
  input: GrepInput
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

// 获取目录路径（简化版本，移除项目路径前缀）
const getDirectory = (path?: string): string => {
  if (!path) return "/"
  const parts = path.split("/")
  return parts.slice(0, -1).join("/") || "/"
}

// 构建参数列表
const args = computed(() => {
  const result: string[] = []
  if (props.input.pattern) {
    result.push(`pattern=${props.input.pattern}`)
  }
  if (props.input.include) {
    result.push(`include=${props.input.include}`)
  }
  return result
})

// 触发器配置
const triggerConfig = computed(() => ({
  title: t("ui.tool.grep"),
  subtitle: getDirectory(props.input.path || "/"),
  args: args.value,
}))

// 渲染 Markdown
const renderMarkdown = (text: string): string => {
  return marked(text) as string
}
</script>

<style scoped lang="scss">
.grep-tool {
  margin: 8px 0;
}

.tool-output {
  padding: 12px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;

  &[data-scrollable] {
    max-height: 400px;
    overflow: auto;
  }
}

.markdown-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);

  :deep(pre) {
    background-color: var(--el-fill-color-light);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }

  :deep(code) {
    font-family: "Consolas", "Monaco", "Courier New", monospace;
    font-size: 13px;
  }
}
</style>
