<template>
  <div class="app-container">
    <!-- ListTool 组件现在可以通过 useData() 访问数据上下文 -->
    <ListTool :input="{ path: '/home/user/projects/my-app/src/components/Button.vue' }"
              :output="fileListOutput"
              status="completed" />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, reactive } from "vue"
import ListTool from "./ListTool.vue"
import { DATA_CONTEXT_KEY, type DataContext, type DataStore } from "./src/composables/useData"

// 创建 store 数据
const store = reactive<DataStore>({
  directory: "/home/user/projects/my-app",
  session: [],
  message: {},
  part: {},
  // 添加其他需要的属性...
})

// 创建数据上下文
const dataContext: DataContext = {
  store,
  get directory() {
    return store.directory
  },
  respondToPermission: (input) => {
    console.log("Permission response:", input)
    // 实现权限响应逻辑
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
    // 实现会话导航逻辑
  },
}

// 通过 provide 提供给所有子组件
provide(DATA_CONTEXT_KEY, dataContext)

// 模拟工具输出
const fileListOutput = ref(`
- Button.vue
- Input.vue
- Card.vue
- Dialog.vue
`)
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
