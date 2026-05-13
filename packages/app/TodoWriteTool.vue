<template>
  <BasicTool v-bind="props"
             :default-open="true"
             icon="checklist"
             :trigger="{
      title: t('ui.tool.todos'),
      subtitle: subtitle,
    }">
    <div v-if="todos.length > 0"
         data-component="todos">
      <el-checkbox v-for="(todo, index) in todos"
                   :key="index"
                   :model-value="todo.status === 'completed'"
                   :checked="todo.status === 'completed'"
                   :disabled="true">
        <div data-slot="message-part-todo-content"
             :data-completed="todo.status === 'completed'">
          {{ todo.content }}
        </div>
      </el-checkbox>
    </div>
  </BasicTool>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { ElCheckbox } from "element-plus"
import BasicTool from "./BasicTool.vue"

interface Todo {
  content: string
  status: "completed" | "not-started" | "in-progress"
  id?: number
}

interface Props {
  input: Record<string, any>
  metadata: Record<string, any>
  tool: string
  output?: string
  status?: string
  hideDetails?: boolean
  defaultOpen?: boolean
  forceOpen?: boolean
  locked?: boolean
}

const props = defineProps<Props>()

const { t } = useI18n()

const todos = computed<Todo[]>(() => {
  const meta = props.metadata?.todos
  if (Array.isArray(meta)) return meta

  const input = props.input.todos
  if (Array.isArray(input)) return input

  return []
})

const subtitle = computed(() => {
  const list = todos.value
  if (list.length === 0) return ""
  return `${list.filter((t: Todo) => t.status === "completed").length}/${list.length}`
})
</script>

<style scoped>
[data-component="todos"] {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

[data-slot="message-part-todo-content"] {
  user-select: text;
}

[data-slot="message-part-todo-content"][data-completed="true"] {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
