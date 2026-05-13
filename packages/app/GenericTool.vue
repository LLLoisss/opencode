<script setup lang="ts">
import BasicTool from "./BasicTool.vue"

interface Props {
  tool: string
  hideDetails?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <BasicTool icon="mcp"
             :trigger="{ title: props.tool }"
             :hide-details="props.hideDetails" />
</template>
