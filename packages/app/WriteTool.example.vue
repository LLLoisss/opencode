<template>
  <div class="write-tool-examples">
    <h1>WriteTool 组件示例</h1>

    <el-tabs v-model="activeTab"
             type="border-card">
      <!-- 基础示例 -->
      <el-tab-pane label="基础用法"
                   name="basic">
        <div class="example-section">
          <h3>创建新的 Vue 组件文件</h3>
          <WriteTool v-bind="mockExamples.basic"
                     :code-component="CodeViewer" />
        </div>
      </el-tab-pane>

      <!-- 带诊断错误 -->
      <el-tab-pane label="带错误诊断"
                   name="diagnostics">
        <div class="example-section">
          <h3>代码包含 TypeScript 类型错误</h3>
          <WriteTool v-bind="mockExamples.withDiagnostics"
                     :code-component="CodeViewer" />
        </div>
      </el-tab-pane>

      <!-- 深层路径 -->
      <el-tab-pane label="深层路径"
                   name="deepPath">
        <div class="example-section">
          <h3>深层嵌套的文件路径</h3>
          <WriteTool v-bind="mockExamples.deepPath"
                     :code-component="CodeViewer" />
        </div>
      </el-tab-pane>

      <!-- 执行中状态 -->
      <el-tab-pane label="执行中"
                   name="pending">
        <div class="example-section">
          <h3>正在写入文件</h3>
          <WriteTool v-bind="mockExamples.pending"
                     :code-component="CodeViewer" />
        </div>
      </el-tab-pane>

      <!-- 简单文件 -->
      <el-tab-pane label="简单文件"
                   name="simple">
        <div class="example-section">
          <h3>根目录下的 Markdown 文件</h3>
          <WriteTool v-bind="mockExamples.simple"
                     :code-component="CodeViewer" />
        </div>
      </el-tab-pane>

      <!-- 所有状态 -->
      <el-tab-pane label="所有示例"
                   name="all">
        <div class="example-section">
          <h3>基础用法</h3>
          <WriteTool v-bind="mockExamples.basic"
                     :code-component="CodeViewer" />
        </div>

        <el-divider />

        <div class="example-section">
          <h3>带错误诊断</h3>
          <WriteTool v-bind="mockExamples.withDiagnostics"
                     :code-component="CodeViewer" />
        </div>

        <el-divider />

        <div class="example-section">
          <h3>深层路径</h3>
          <WriteTool v-bind="mockExamples.deepPath"
                     :code-component="CodeViewer" />
        </div>
      </el-tab-pane>

      <!-- Props 说明 -->
      <el-tab-pane label="Props 文档"
                   name="props">
        <div class="props-doc">
          <h3>WriteToolProps 接口说明</h3>
          <el-table :data="propsTableData"
                    border
                    style="width: 100%">
            <el-table-column prop="name"
                             label="属性名"
                             width="180" />
            <el-table-column prop="type"
                             label="类型"
                             width="200" />
            <el-table-column prop="default"
                             label="默认值"
                             width="120" />
            <el-table-column prop="description"
                             label="说明" />
          </el-table>

          <h3 style="margin-top: 40px">Input 接口说明</h3>
          <el-table :data="inputTableData"
                    border
                    style="width: 100%">
            <el-table-column prop="name"
                             label="属性名"
                             width="180" />
            <el-table-column prop="type"
                             label="类型"
                             width="200" />
            <el-table-column prop="description"
                             label="说明" />
          </el-table>

          <h3 style="margin-top: 40px">Metadata 接口说明</h3>
          <el-table :data="metadataTableData"
                    border
                    style="width: 100%">
            <el-table-column prop="name"
                             label="属性名"
                             width="180" />
            <el-table-column prop="type"
                             label="类型"
                             width="200" />
            <el-table-column prop="description"
                             label="说明" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue"
import { ElTabs, ElTabPane, ElTable, ElTableColumn, ElDivider } from "element-plus"
import WriteTool from "./WriteTool.vue"
import { mockWriteToolExamples } from "./write-tool-mock-data"

// 使用 shallowRef 避免深层响应式
const mockExamples = shallowRef(mockWriteToolExamples)

// 当前选中的标签页
const activeTab = ref("basic")

// 简单的代码查看器组件（替代品，实际项目中应使用真实的代码编辑器）
const CodeViewer = {
  name: "CodeViewer",
  props: {
    file: {
      type: Object,
      required: true,
    },
    overflow: {
      type: String,
      default: "auto",
    },
  },
  template: `
    <pre style="margin: 0; padding: 16px; background: #f5f5f5; border-radius: 4px; overflow: auto; max-height: 400px;">
      <code>{{ file.contents }}</code>
    </pre>
  `,
}

// Props 文档表格数据
const propsTableData = [
  {
    name: "input",
    type: "WriteInput",
    default: "-",
    description: "工具输入参数，包含文件路径和内容",
  },
  {
    name: "metadata",
    type: "WriteMetadata",
    default: "-",
    description: "工具元数据，包含诊断信息等",
  },
  {
    name: "tool",
    type: "string",
    default: '"write"',
    description: "工具名称",
  },
  {
    name: "output",
    type: "string",
    default: "undefined",
    description: "工具输出信息",
  },
  {
    name: "status",
    type: "string",
    default: "undefined",
    description: "工具状态：pending | completed | error",
  },
  {
    name: "hideDetails",
    type: "boolean",
    default: "false",
    description: "是否隐藏详情内容",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "是否默认展开",
  },
  {
    name: "forceOpen",
    type: "boolean",
    default: "false",
    description: "是否强制展开",
  },
  {
    name: "locked",
    type: "boolean",
    default: "false",
    description: "是否锁定（无法折叠）",
  },
  {
    name: "codeComponent",
    type: "Component",
    default: "undefined",
    description: "代码展示组件",
  },
]

const inputTableData = [
  {
    name: "filePath",
    type: "string",
    description: "文件路径，支持相对路径和绝对路径",
  },
  {
    name: "content",
    type: "string",
    description: "文件内容",
  },
]

const metadataTableData = [
  {
    name: "diagnostics",
    type: "Record<string, Diagnostic[]>",
    description: "按文件路径分组的诊断信息（错误、警告等）",
  },
]
</script>

<style scoped>
.write-tool-examples {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.write-tool-examples h1 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #303133;
}

.example-section {
  margin-bottom: 30px;
}

.example-section h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #606266;
}

.props-doc {
  padding: 20px;
}

.props-doc h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #303133;
}

:deep(.el-tabs__content) {
  padding: 20px;
}

:deep(.el-divider) {
  margin: 40px 0;
}
</style>
