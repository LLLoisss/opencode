<template>
  <BasicTool :icon="'code-lines'"
             :trigger="{ title: t('ui.tool.patch'), subtitle: subtitle }"
             v-bind="$attrs">
    <div v-if="files.length > 0"
         data-component="apply-patch-files">
      <div v-for="(file, index) in files"
           :key="index"
           data-component="apply-patch-file">
        <div data-slot="apply-patch-file-header">
          <!-- Action badge -->
          <el-tag v-if="file.type === 'delete'"
                  type="danger"
                  size="small"
                  data-slot="apply-patch-file-action"
                  data-type="delete">
            {{ t('ui.patch.action.deleted') }}
          </el-tag>
          <el-tag v-else-if="file.type === 'add'"
                  type="success"
                  size="small"
                  data-slot="apply-patch-file-action"
                  data-type="add">
            {{ t('ui.patch.action.created') }}
          </el-tag>
          <el-tag v-else-if="file.type === 'move'"
                  type="warning"
                  size="small"
                  data-slot="apply-patch-file-action"
                  data-type="move">
            {{ t('ui.patch.action.moved') }}
          </el-tag>
          <el-tag v-else-if="file.type === 'update'"
                  type="info"
                  size="small"
                  data-slot="apply-patch-file-action"
                  data-type="update">
            {{ t('ui.patch.action.patched') }}
          </el-tag>

          <!-- File path -->
          <span data-slot="apply-patch-file-path">{{ file.relativePath }}</span>

          <!-- Diff changes (non-delete) -->
          <DiffChanges v-if="file.type !== 'delete'"
                       :changes="{ additions: file.additions, deletions: file.deletions }" />

          <!-- Deletion count (delete only) -->
          <span v-if="file.type === 'delete'"
                data-slot="apply-patch-deletion-count">
            -{{ file.deletions }}
          </span>
        </div>

        <!-- Diff viewer (non-delete) -->
        <div v-if="file.type !== 'delete'"
             data-component="apply-patch-file-diff">
          <component :is="diffComponent"
                     :before="{ name: file.filePath, contents: file.before }"
                     :after="{ name: file.filePath, contents: file.after }" />
        </div>
      </div>
    </div>
  </BasicTool>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import BasicTool from "./BasicTool.vue"
import DiffChanges from "./DiffChanges.vue"

interface ApplyPatchFile {
  filePath: string
  relativePath: string
  type: "add" | "update" | "delete" | "move"
  diff: string
  before: string
  after: string
  additions: number
  deletions: number
  movePath?: string
}

interface Props {
  /** Tool input parameters */
  input?: Record<string, any>
  /** Tool metadata containing file patch info */
  metadata?: Record<string, any>
  /** Tool name */
  tool?: string
  /** Tool output */
  output?: string
  /** Tool execution status */
  status?: string
  /** Whether to hide detail section */
  hideDetails?: boolean
  /** Whether the panel is open by default */
  defaultOpen?: boolean
  /** Force open the panel */
  forceOpen?: boolean
  /** Whether the tool is locked (e.g. waiting for permission) */
  locked?: boolean
  /** Dynamic diff viewer component */
  diffComponent?: ReturnType<typeof defineComponent> | string
}

const props = withDefaults(defineProps<Props>(), {
  input: () => ({}),
  metadata: () => ({}),
  tool: "apply_patch",
  diffComponent: "div",
})

const { t } = useI18n()

const files = computed<ApplyPatchFile[]>(() => {
  return (props.metadata.files ?? []) as ApplyPatchFile[]
})

const subtitle = computed(() => {
  const count = files.value.length
  if (count === 0) return ""
  const label = t(count > 1 ? "ui.common.file.other" : "ui.common.file.one")
  return `${count} ${label}`
})
</script>

<style scoped>
[data-component="apply-patch-files"] {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

[data-component="apply-patch-file"] {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 4px;
  overflow: hidden;
}

[data-slot="apply-patch-file-header"] {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter, #fafafa);
  font-size: 13px;
}

[data-slot="apply-patch-file-path"] {
  font-family: monospace;
  color: var(--el-text-color-regular, #606266);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-slot="apply-patch-deletion-count"] {
  color: var(--el-color-danger, #f56c6c);
  font-family: monospace;
  font-size: 12px;
}

[data-component="apply-patch-file-diff"] {
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
}
</style>
