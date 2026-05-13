<template>
  <div class="webfetch-tool">
    <BasicToolVue :icon="'window-cursor'"
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
import { computed, h } from "vue"
import { useI18n } from "vue-i18n"
import { ElIcon } from "element-plus"
import { TopRight } from "@element-plus/icons-vue"
import BasicToolVue from "./BasicTool-vue2.vue"
import { marked } from "marked"

interface WebfetchInput {
  url?: string
  format?: string
}

interface Props {
  input: WebfetchInput
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

// 构建参数列表
const args = computed(() => {
  return props.input.format ? [`format=${props.input.format}`] : []
})

// 触发器配置
const triggerConfig = computed(() => ({
  title: t("ui.tool.webfetch"),
  subtitle: props.input.url || "",
  args: args.value,
  action: h(
    "div",
    { class: "tool-action" },
    h(ElIcon, { size: 16 }, () => h(TopRight))
  ),
}))

// 渲染 Markdown
const renderMarkdown = (text: string): string => {
  return marked(text) as string
}

// 打开外部链接（可选功能）
const openExternalLink = () => {
  if (props.input.url) {
    window.open(props.input.url, "_blank", "noopener,noreferrer")
  }
}

defineExpose({
  openExternalLink,
})
</script>

<style scoped lang="scss">
.webfetch-tool {
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

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  :deep(a) {
    color: var(--el-color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.tool-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>
