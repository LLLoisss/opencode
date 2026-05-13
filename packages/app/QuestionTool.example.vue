<template>
  <div class="app-container">
    <h1>QuestionTool 组件示例</h1>

    <div class="example-selector">
      <label for="example-select">选择示例：</label>
      <select id="example-select"
              v-model="selectedIndex">
        <option v-for="(item, index) in questionMockData"
                :key="index"
                :value="index">
          示例 {{ index + 1 }}: {{ getExampleTitle(index) }}
        </option>
      </select>
    </div>

    <div class="tool-container">
      <QuestionTool v-bind="currentExample" />
    </div>

    <div class="code-preview">
      <h3>当前示例数据：</h3>
      <pre>{{ JSON.stringify(currentExample, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, reactive } from "vue"
import QuestionTool from "./QuestionTool.vue"
import { questionMockData } from "./src/mocks/tool-mock-data"
import { DATA_CONTEXT_KEY, type DataContext, type DataStore } from "./src/composables/useData"

// 创建 store 数据
const store = reactive<DataStore>({
  directory: "/home/user/projects/my-app",
  session: [],
  message: {},
  part: {},
})

// 创建数据上下文
const dataContext: DataContext = {
  store,
  get directory() {
    return store.directory
  },
  respondToPermission: (input) => {
    console.log("Permission response:", input)
  },
  replyToQuestion: (input) => {
    console.log("Question reply:", input)
    // 实现问题回复逻辑
  },
  rejectQuestion: (input) => {
    console.log("Question rejected:", input)
    // 实现问题拒绝逻辑
  },
  navigateToSession: (sessionID) => {
    console.log("Navigate to session:", sessionID)
  },
}

// 通过 provide 提供给所有子组件
provide(DATA_CONTEXT_KEY, dataContext)

// 当前选中的示例索引
const selectedIndex = ref(0)

// 当前示例数据
const currentExample = computed(() => questionMockData[selectedIndex.value])

// 获取示例标题
const getExampleTitle = (index: number) => {
  const titles = [
    "单选问题 - 包管理器选择",
    "多选问题 - 开发工具选择",
    "多个问题 - 项目配置",
    "配置选项 - TypeScript配置",
    "部署平台选择",
  ]
  return titles[index] || `示例 ${index + 1}`
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: var(--color-text-primary, #333);
  margin-bottom: 24px;
}

.example-selector {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--color-bg-secondary, #f5f5f5);
  border-radius: 8px;
}

.example-selector label {
  font-weight: 500;
  margin-right: 12px;
}

.example-selector select {
  padding: 8px 12px;
  border: 1px solid var(--color-border, #ccc);
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  min-width: 300px;
}

.tool-container {
  margin-bottom: 24px;
  padding: 20px;
  background-color: white;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.code-preview {
  margin-top: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e0e0e0);
}

.code-preview h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--color-text-primary, #333);
  font-size: 16px;
}

.code-preview pre {
  margin: 0;
  padding: 16px;
  background-color: #282c34;
  color: #abb2bf;
  border-radius: 4px;
  overflow-x: auto;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>
