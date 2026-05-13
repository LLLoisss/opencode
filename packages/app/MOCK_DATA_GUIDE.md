# 工具组件 Mock 数据使用指南

该目录包含为Vue3工具组件创建的mock数据，用于开发和测试。

## 📁 文件说明

### `src/mocks/tool-mock-data.ts`

包含所有工具组件的mock数据定义。

### `src/examples/ToolComponentExamples.vue`

一个完整的示例页面，展示如何使用这些mock数据。

## 🚀 快速开始

### 1. 基本使用

在你的Vue3组件中导入mock数据：

```vue
<script setup lang="ts">
import { bashMockData } from "@/mocks/tool-mock-data"
import BashTool from "@/components/BashTool.vue"

// 使用第一个bash示例
const mockData = bashMockData[0]
</script>

<template>
  <BashTool v-bind="mockData" />
</template>
```

### 2. 动态选择数据

```vue
<script setup lang="ts">
import { ref } from "vue"
import { bashMockData, getRandomMockData } from "@/mocks/tool-mock-data"
import BashTool from "@/components/BashTool.vue"

const selectedIndex = ref(0)
const currentMock = computed(() => bashMockData[selectedIndex.value])

// 或者随机获取
const randomMock = getRandomMockData("bash")
</script>

<template>
  <div>
    <select v-model="selectedIndex">
      <option v-for="(data, i) in bashMockData" :key="i" :value="i">示例 {{ i + 1 }}</option>
    </select>

    <BashTool v-bind="currentMock" />
  </div>
</template>
```

## 📦 可用的 Mock 数据

### Bash 工具 (3个示例)

- **示例1**: npm install - 安装项目依赖
- **示例2**: git status - 检查Git仓库状态
- **示例3**: bun dev - 启动开发服务器

```typescript
import { bashMockData } from "@/mocks/tool-mock-data"
```

### Read 工具 (3个示例)

- **示例1**: 读取 /src/app.tsx (带offset和limit)
- **示例2**: 读取 /src/utils/helpers.ts
- **示例3**: 读取 /package.json (带offset和limit)

```typescript
import { readMockData } from "@/mocks/tool-mock-data"
```

### List 工具 (2个示例)

- **示例1**: 列出 /src/components 目录
- **示例2**: 列出根目录

```typescript
import { listMockData } from "@/mocks/tool-mock-data"
```

### Grep 工具 (2个示例)

- **示例1**: 搜索 "createSignal" (在.tsx文件中)
- **示例2**: 搜索 "TODO|FIXME" (在所有文件中)

```typescript
import { grepMockData } from "@/mocks/tool-mock-data"
```

### Glob 工具 (3个示例)

- **示例1**: 匹配所有 .vue 文件
- **示例2**: 匹配所有 config 文件
- **示例3**: 匹配所有测试文件

```typescript
import { globMockData } from "@/mocks/tool-mock-data"
```

### Webfetch 工具 (3个示例)

- **示例1**: 获取GitHub仓库信息 (JSON格式)
- **示例2**: 获取npm包信息 (HTML格式)
- **示例3**: 获取Vite文档 (Markdown格式)

```typescript
import { webfetchMockData } from "@/mocks/tool-mock-data"
```

### Question 工具 (5个示例)

- **示例1**: 单个单选问题 - 包管理器选择
- **示例2**: 多选问题 - 开发工具选择
- **示例3**: 多个问题 - 项目配置（项目类型 + 框架 + 功能）
- **示例4**: 配置选项 - TypeScript配置级别
- **示例5**: 部署平台选择

```typescript
import { questionMockData } from "@/mocks/tool-mock-data"
```

## 🎨 组件Props结构

所有工具组件都遵循相同的props接口：

```typescript
interface ToolProps {
  input: Record<string, any> // 工具的输入参数
  metadata: Record<string, any> // 工具的元数据
  tool: string // 工具名称
  output?: string // 工具的输出（可选）
  status?: string // 工具状态（可选）
}
```

### 各工具的具体Props

#### Bash

```typescript
{
  input: {
    command: string       // 要执行的命令
    description: string   // 命令描述
  },
  metadata: {
    command: string       // 实际执行的命令
    output: string        // 命令输出
  },
  tool: "bash",
  output: string,         // 命令输出
  status: "completed" | "running" | "error"
}
```

#### Read

```typescript
{
  input: {
    filePath: string      // 文件路径
    offset?: number       // 起始行（可选）
    limit?: number        // 读取行数（可选）
  },
  metadata: {
    loaded: string[]      // 已加载的文件列表
  },
  tool: "read",
  status: "completed"
}
```

#### List

```typescript
{
  input: {
    path: string          // 目录路径
  },
  metadata: {},
  tool: "list",
  output: string,         // 目录结构（Markdown格式）
  status: "completed"
}
```

#### Grep

```typescript
{
  input: {
    pattern: string       // 搜索模式
    include?: string      // 包含的文件模式
    path: string          // 搜索路径
  },
  metadata: {},
  tool: "grep",
  output: string,         // 搜索结果（Markdown格式）
  status: "completed"
}
```

#### Glob

```typescript
{
  input: {
    pattern: string       // Glob模式
    path: string          // 搜索路径
  },
  metadata: {},
  tool: "glob",
  output: string,         // 匹配的文件列表（Markdown格式）
  status: "completed"
}
```

#### Webfetch

```typescript
{
  input: {
    url: string           // 网页URL
    format?: string       // 格式（json/html/markdown）
  },
  metadata: {},
  tool: "webfetch",
  output: string,         // 网页内容（Markdown格式）
  status: "completed"
}
```

#### Question

```typescript
{
  input: {
    questions: Array<{      // 问题列表
      question: string      // 问题文本
      header?: string       // 问题标题（可选）
      options?: Array<{     // 选项列表（可选）
        label: string       // 选项标签
        description?: string // 选项描述（可选）
      }>
      multiple?: boolean    // 是否为多选（默认false）
    }>
  },
  metadata: {
    answers: string[][]     // 答案数组，每个问题对应一个字符串数组
  },
  tool: "question",
  status: "completed"
}
```

## 💡 使用提示

### 在Storybook中使用

```typescript
// BashTool.stories.ts
import { bashMockData } from "@/mocks/tool-mock-data"
import BashTool from "./BashTool.vue"

export default {
  title: "Tools/BashTool",
  component: BashTool,
}

export const Default = {
  args: bashMockData[0],
}

export const GitStatus = {
  args: bashMockData[1],
}

export const DevServer = {
  args: bashMockData[2],
}
```

### 在单元测试中使用

```typescript
import { mount } from "@vue/test-utils"
import { bashMockData } from "@/mocks/tool-mock-data"
import BashTool from "@/components/BashTool.vue"

describe("BashTool", () => {
  it("renders bash output correctly", () => {
    const wrapper = mount(BashTool, {
      props: bashMockData[0],
    })

    expect(wrapper.text()).toContain("npm install")
  })
})
```

### 在开发环境中预览

运行示例页面来查看所有组件的效果：

```bash
# 将示例页面添加到路由中
# 然后访问 /examples/tools
```

## 🔧 辅助函数

### `getRandomMockData(tool: string)`

随机获取指定工具的一个mock数据实例。

```typescript
import { getRandomMockData } from "@/mocks/tool-mock-data"

const randomBash = getRandomMockData("bash")
```

### `getDefaultMockData(tool: string)`

获取指定工具的第一个（默认）mock数据实例。

```typescript
import { getDefaultMockData } from "@/mocks/tool-mock-data"

const defaultBash = getDefaultMockData("bash")
```

### `allToolMockData`

访问所有工具的完整mock数据集合。

```typescript
import { allToolMockData } from "@/mocks/tool-mock-data"

console.log(allToolMockData.bash) // 所有bash示例
console.log(allToolMockData.read) // 所有read示例
// 等等...
```

## 📝 自定义Mock数据

你可以轻松创建自己的mock数据：

```typescript
import type { ToolMockData } from "@/mocks/tool-mock-data"

const customBashMock: ToolMockData = {
  tool: "bash",
  input: {
    command: "echo 'Hello World'",
    description: "打印Hello World",
  },
  metadata: {
    command: "echo 'Hello World'",
    output: "Hello World",
  },
  output: "Hello World",
  status: "completed",
}
```

## 🎯 最佳实践

1. **开发时**: 使用mock数据快速预览组件效果
2. **测试时**: 使用mock数据确保组件在各种场景下正常工作
3. **文档时**: 使用mock数据在Storybook中展示组件用例
4. **演示时**: 使用mock数据创建产品演示而无需真实后端

### QuestionTool 示例

```vue
<script setup lang="ts">
import { ref } from "vue"
import { questionMockData } from "@/mocks/tool-mock-data"
import QuestionTool from "@/components/QuestionTool.vue"

// 使用单选问题示例
const singleChoiceExample = questionMockData[0]

// 使用多选问题示例
const multipleChoiceExample = questionMockData[1]

// 使用多个问题示例
const multipleQuestionsExample = questionMockData[2]

// 动态切换示例
const selectedIndex = ref(0)
const currentExample = computed(() => questionMockData[selectedIndex.value])
</script>

<template>
  <div>
    <!-- 单选问题示例 -->
    <QuestionTool v-bind="singleChoiceExample" />

    <!-- 多选问题示例 -->
    <QuestionTool v-bind="multipleChoiceExample" />

    <!-- 多个问题示例 -->
    <QuestionTool v-bind="multipleQuestionsExample" />

    <!-- 动态切换示例 -->
    <select v-model="selectedIndex">
      <option :value="0">包管理器选择</option>
      <option :value="1">开发工具选择</option>
      <option :value="2">项目配置</option>
      <option :value="3">TypeScript配置</option>
      <option :value="4">部署平台选择</option>
    </select>
    <QuestionTool v-bind="currentExample" />
  </div>
</template>
```

## 📚 相关文件

- [BashTool.vue](../BashTool.vue)
- [ReadTool.vue](../ReadTool.vue) (根据实际路径调整)
- [ListTool.vue](../ListTool.vue)
- [GrepTool.vue](../GrepTool.vue)
- [GlobTool.vue](../GlobTool.vue)
- [WebfetchTool.vue](../WebfetchTool.vue)
- [QuestionTool.vue](../QuestionTool.vue)
