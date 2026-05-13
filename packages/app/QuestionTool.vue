<template>
  <BasicTool v-bind="props"
             :default-open="completed"
             icon="bubble-5"
             :trigger="{
      title: t('ui.tool.questions'),
      subtitle: subtitle,
    }">
    <div v-if="completed"
         data-component="question-answers">
      <div v-for="(q, index) in questions"
           :key="index"
           data-slot="question-answer-item">
        <input type="checkbox"
               :checked="!!answers[index]?.length"
               disabled
               data-slot="question-checkbox" />
        <div data-slot="question-content">
          <div data-slot="question-text">{{ q.question }}</div>
          <div data-slot="answer-text">
            {{ answers[index]?.join(', ') || t('ui.question.answer.none') }}
          </div>
        </div>
      </div>
    </div>
  </BasicTool>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import BasicTool from "./BasicTool.vue"

interface QuestionInfo {
  question: string
  options?: Array<{
    label: string
    description?: string
  }>
  multiple?: boolean
  header?: string
}

type QuestionAnswer = string[]

interface QuestionToolProps {
  input: {
    questions?: QuestionInfo[]
    [key: string]: any
  }
  metadata: {
    answers?: QuestionAnswer[]
    [key: string]: any
  }
  tool: string
  output?: string
  status?: string
  hideDetails?: boolean
  defaultOpen?: boolean
  forceOpen?: boolean
  locked?: boolean
}

const props = defineProps<QuestionToolProps>()

const { t } = useI18n()

const questions = computed<QuestionInfo[]>(() => {
  return (props.input.questions ?? []) as QuestionInfo[]
})

const answers = computed<QuestionAnswer[]>(() => {
  return (props.metadata.answers ?? []) as QuestionAnswer[]
})

const completed = computed<boolean>(() => {
  return answers.value.length > 0
})

const subtitle = computed<string>(() => {
  const count = questions.value.length
  if (count === 0) return ""
  if (completed.value) {
    return t("ui.question.subtitle.answered", { count })
  }
  return `${count} ${t(count > 1 ? "ui.common.question.other" : "ui.common.question.one")}`
})
</script>

<style scoped>
[data-component="question-answers"] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

[data-slot="question-answer-item"] {
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-bg-secondary, #f5f5f5);
  border-radius: 6px;
  align-items: flex-start;
}

[data-slot="question-checkbox"] {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: not-allowed;
  accent-color: #22c55e;
}

[data-slot="question-checkbox"]:checked {
  accent-color: #22c55e;
}

[data-slot="question-content"] {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

[data-slot="question-text"] {
  font-weight: 500;
  color: var(--color-text-primary, #333);
}

[data-slot="answer-text"] {
  color: var(--color-text-secondary, #666);
  font-size: 14px;
}
</style>
