<template>
  <div v-if="diagnostics.length > 0"
       data-component="diagnostics">
    <div v-for="(diagnostic, index) in diagnostics"
         :key="index"
         data-slot="diagnostic">
      <el-tag type="danger"
              size="small"
              data-slot="diagnostic-label">错误</el-tag>
      <span data-slot="diagnostic-location">
        [{{ diagnostic.range.start.line + 1 }}:{{ diagnostic.range.start.character + 1 }}]
      </span>
      <span data-slot="diagnostic-message">{{ diagnostic.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DiagnosticPosition {
  line: number
  character: number
}

interface DiagnosticRange {
  start: DiagnosticPosition
  end: DiagnosticPosition
}

export interface Diagnostic {
  range: DiagnosticRange
  message: string
  severity?: number
}

defineProps<{
  diagnostics: Diagnostic[]
}>()
</script>

<style scoped>
[data-component="diagnostics"] {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
}

[data-slot="diagnostic"] {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 1.4;
}

[data-slot="diagnostic-location"] {
  font-family: monospace;
  color: var(--el-text-color-secondary);
}

[data-slot="diagnostic-message"] {
  color: var(--el-color-danger);
}
</style>
