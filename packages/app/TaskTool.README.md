# TaskTool 组件使用指南

TaskTool 是一个用于展示子任务（subagent）执行状态的 Vue 3 + Element Plus 组件。

## 📁 文件说明

- **TaskTool.vue** - 主组件
- **task-tool-mock-data.ts** - Mock 数据
- **TaskTool.example.vue** - 演示页面

## 🚀 快速开始

### 1. 查看演示

运行演示组件查看所有场景：

```bash
# 将 TaskTool.example.vue 添加到你的路由或直接渲染
```

演示包含 4 个场景：

- ✅ 正在执行的任务
- ✅ 已完成的任务
- ⏸️ 等待权限的任务（带交互按钮）
- 🔄 复杂任务流程

### 2. 在你的项目中使用

#### 步骤 1: 提供依赖注入

```vue
<script setup lang="ts">
import { provide } from "vue"
import { mockDataContext, mockI18n, mockToolRegistry } from "./task-tool-mock-data"

// 提供依赖
provide("dataContext", mockDataContext)
provide("i18n", mockI18n)
provide("toolRegistry", mockToolRegistry)
</script>

<template>
  <TaskTool v-bind="taskData" />
</template>
```

#### 步骤 2: 准备数据

```typescript
const taskData = {
  input: {
    description: "分析项目代码结构",
    subagent_type: "researcher",
  },
  metadata: {
    sessionId: "child-session-001",
    summary: [
      {
        id: "tool-1",
        tool: "read",
        state: {
          status: "completed",
          title: "src/app.tsx",
        },
      },
      // ...更多工具
    ],
  },
  tool: "task",
  status: "running",
  defaultOpen: true,
}
```

## 📊 Mock 数据说明

### Props 数据结构

```typescript
interface TaskToolProps {
  input: {
    description: string // 任务描述
    subagent_type?: string // 子代理类型
  }
  metadata: {
    sessionId?: string // 子会话 ID
    summary?: TaskSummaryItem[] // 工具执行摘要
  }
  tool: string // 工具名称 (固定为 'task')
  status?: string // 任务状态
  defaultOpen?: boolean // 是否默认展开
}
```

### Summary 项结构

```typescript
interface TaskSummaryItem {
  id: string // 唯一标识
  tool: string // 工具名称 (read/write/bash等)
  state: {
    status: string // 状态: completed/running/pending
    title?: string // 显示标题
  }
}
```

### DataContext 结构

```typescript
interface DataContext {
  store: {
    permission?: Record<string, Permission[]> // 权限请求
    message: Record<string, Message[]> // 消息列表
    part: Record<string, Part[]> // 消息部分
  }
  respondToPermission?: Function // 响应权限请求
  navigateToSession?: Function // 导航到子会话
}
```

## 🎨 自定义工具图标和标题

组件内置了常用工具的映射，也可以扩展：

```typescript
// 在 TaskTool.vue 中修改
const toolIconMap: Record<string, string> = {
  read: "View",
  write: "EditPen",
  bash: "Monitor",
  // 添加你的工具
  custom: "Setting",
}

const toolTitleMap: Record<string, string> = {
  read: "ui.tool.read",
  // 添加你的翻译 key
  custom: "ui.tool.custom",
}
```

## 🔧 可用的 Mock 数据

在 `task-tool-mock-data.ts` 中提供了以下数据：

| 数据名称                      | 说明           | 用途         |
| ----------------------------- | -------------- | ------------ |
| `mockTaskDataRunning`         | 正在执行的任务 | 展示实时进度 |
| `mockTaskDataCompleted`       | 已完成的任务   | 展示完成状态 |
| `mockTaskDataWithPermission`  | 等待权限的任务 | 测试权限交互 |
| `mockTaskDataComplex`         | 复杂任务流程   | 压力测试     |
| `mockDataContext`             | 带权限的上下文 | 权限场景     |
| `mockDataContextNoPermission` | 无权限的上下文 | 普通场景     |
| `mockI18n`                    | 国际化实例     | 文本翻译     |
| `mockToolRegistry`            | 工具注册表     | 工具渲染     |

## 🎯 常见场景示例

### 场景 1: 显示任务进度

```vue
<TaskTool
  :input="{
    description: '优化数据库查询',
    subagent_type: 'optimizer',
  }"
  :metadata="{
    summary: [
      { id: '1', tool: 'read', state: { status: 'completed' } },
      { id: '2', tool: 'write', state: { status: 'running' } },
    ],
  }"
  tool="task"
  status="running"
/>
```

### 场景 2: 处理权限请求

```vue
<!-- 需要在 dataContext 中提供 permission 数据 -->
<TaskTool
  :input="{ description: '部署到生产环境' }"
  :metadata="{ sessionId: 'session-001' }"
  tool="task"
  status="waiting_permission"
/>
```

### 场景 3: 导航到子会话

```typescript
const dataContext = {
  // ...other props
  navigateToSession: (sessionId: string) => {
    router.push(`/session/${sessionId}`)
  },
}
```

## 🛠️ 开发建议

1. **自动滚动**: 组件内置了自动滚动到底部的功能，适合展示实时更新的工具列表

2. **权限交互**: 当存在 `childPermission` 时会显示权限按钮（拒绝/始终允许/允许一次）

3. **子会话导航**: 点击副标题可以导航到子会话（需要实现 `navigateToSession`）

4. **工具图标**: 使用 Element Plus 图标，可根据需要替换

## 📝 注意事项

- 确保已安装 Element Plus
- 需要在父组件中提供 `dataContext`、`i18n`、`toolRegistry` 依赖
- 组件使用 TypeScript，建议在 TS 环境中使用
- CSS 变量使用 Element Plus 主题变量，支持深色模式

## 📚 参考

- [Element Plus 文档](https://element-plus.org/)
- [Vue 3 文档](https://vuejs.org/)
- [原始 SolidJS 实现](../ui/src/components/message-part.tsx)
