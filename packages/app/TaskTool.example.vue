<template>
  <div class="task-tool-demo">
    <h1>TaskTool 组件演示</h1>

    <!-- 切换场景的选项卡 -->
    <el-tabs v-model="activeTab"
             type="card"
             class="demo-tabs">
      <el-tab-pane label="正在执行的任务"
                   name="running" />
      <el-tab-pane label="已完成的任务"
                   name="completed" />
      <el-tab-pane label="等待权限的任务"
                   name="withPermission" />
      <el-tab-pane label="复杂任务流程"
                   name="complex" />
    </el-tabs>

    <!-- 当前场景的描述 -->
    <el-card class="scene-description"
             shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon>
            <InfoFilled />
          </el-icon>
          <span>场景说明</span>
        </div>
      </template>
      <p>{{ sceneDescription }}</p>
    </el-card>

    <!-- TaskTool 组件展示 -->
    <div class="task-tool-container">
      <TaskTool v-bind="currentTaskData"
                :key="activeTab" />
    </div>

    <!-- Mock 数据展示 -->
    <el-collapse v-model="expandedPanels"
                 class="mock-data-section">
      <el-collapse-item title="查看 Props Mock 数据"
                        name="props">
        <pre><code>{{ JSON.stringify(currentTaskData, null, 2) }}</code></pre>
      </el-collapse-item>
      <el-collapse-item title="查看 DataContext Mock 数据"
                        name="context">
        <pre><code>{{ JSON.stringify(currentDataStore, null, 2) }}</code></pre>
      </el-collapse-item>
    </el-collapse>

    <!-- 使用说明 -->
    <el-card class="usage-guide"
             shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon>
            <Document />
          </el-icon>
          <span>使用指南</span>
        </div>
      </template>
      <div class="usage-content">
        <h3>1. 在父组件中提供依赖</h3>
        <pre><code>import { provide } from 'vue'
import { mockDataContext, mockI18n, mockToolRegistry } from './task-tool-mock-data'

// 在 setup 中
provide('dataContext', mockDataContext)
provide('i18n', mockI18n)
provide('toolRegistry', mockToolRegistry)</code></pre>

        <h3>2. 使用 TaskTool 组件</h3>
        <pre><code>&lt;TaskTool
  :input="{ description: '分析代码', subagent_type: 'researcher' }"
  :metadata="{ sessionId: 'child-001', summary: [...] }"
  tool="task"
  status="running"
/&gt;</code></pre>

        <h3>3. Mock 数据结构</h3>
        <ul>
          <li><strong>input:</strong> 包含 description 和 subagent_type</li>
          <li><strong>metadata.summary:</strong> 子工具执行摘要数组</li>
          <li><strong>metadata.sessionId:</strong> 子会话 ID（用于导航）</li>
          <li><strong>dataContext.store:</strong> 包含 permission、message、part 数据</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from "vue"
import { ElTabs, ElTabPane, ElCard, ElCollapse, ElCollapseItem, ElIcon } from "element-plus"
import { InfoFilled, Document } from "@element-plus/icons-vue"
import TaskTool from "./TaskTool.vue"
import { allTaskMockData, allMockProviders, type TaskToolProps, type DataContext } from "./task-tool-mock-data"

// 当前激活的选项卡
const activeTab = ref<"running" | "completed" | "withPermission" | "complex">("running")

// 展开的面板
const expandedPanels = ref<string[]>([])

// 场景描述映射
const sceneDescriptions: Record<string, string> = {
  running: "展示一个正在执行的任务，包含多个子工具的执行状态（已完成、运行中、待执行）",
  completed: "展示一个已完成的任务，所有子工具都已成功执行",
  withPermission: "展示一个等待权限确认的任务，用户需要点击按钮来允许或拒绝执行敏感操作（如部署命令）",
  complex: "展示一个复杂的任务流程，包含文件搜索、读取、写入、补丁应用等多种工具",
}

// 当前场景描述
const sceneDescription = computed(() => sceneDescriptions[activeTab.value])

// 当前任务数据
const currentTaskData = computed<TaskToolProps>(() => {
  return allTaskMockData[activeTab.value]
})

// 当前数据存储
const currentDataStore = computed(() => {
  // 如果是 withPermission 场景，使用带权限的 dataContext
  const providers =
    activeTab.value === "withPermission" ? allMockProviders.withPermission : allMockProviders.noPermission
  return providers.dataContext.store
})

// 提供依赖注入
const providers = computed(() => {
  return activeTab.value === "withPermission" ? allMockProviders.withPermission : allMockProviders.noPermission
})

provide("dataContext", providers.value.dataContext)
provide("i18n", providers.value.i18n)
provide("toolRegistry", providers.value.toolRegistry)
</script>

<style scoped>
.task-tool-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--el-text-color-primary);
}

.demo-tabs {
  margin-bottom: 24px;
}

.scene-description {
  margin-bottom: 24px;
  background-color: var(--el-color-info-light-9);
  border: 1px solid var(--el-color-info-light-7);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.scene-description p {
  margin: 0;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.task-tool-container {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.mock-data-section {
  margin-bottom: 24px;
}

.mock-data-section pre {
  margin: 0;
  padding: 16px;
  background-color: var(--el-fill-color-darker);
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.mock-data-section code {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.usage-guide {
  background-color: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-7);
}

.usage-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.usage-content h3:first-child {
  margin-top: 0;
}

.usage-content pre {
  margin: 8px 0 16px;
  padding: 12px;
  background-color: var(--el-fill-color-darker);
  border-radius: 4px;
  overflow-x: auto;
}

.usage-content code {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.usage-content ul {
  margin: 8px 0 16px;
  padding-left: 24px;
  line-height: 1.8;
}

.usage-content li {
  margin-bottom: 4px;
}

.usage-content strong {
  color: var(--el-color-primary);
  font-weight: 600;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .scene-description {
    background-color: var(--el-color-info-dark-2);
    border-color: var(--el-color-info);
  }

  .usage-guide {
    background-color: var(--el-color-success-dark-2);
    border-color: var(--el-color-success);
  }
}
</style>
