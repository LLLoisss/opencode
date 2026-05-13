<script setup lang="ts">
import { ref } from "vue"
import {
  bashMockData,
  readMockData,
  listMockData,
  grepMockData,
  globMockData,
  webfetchMockData,
  type ToolMockData,
} from "../mocks/tool-mock-data"

// 导入你的Vue3工具组件（根据实际路径调整）
// import BashTool from '../components/BashTool.vue'
// import ReadTool from '../components/ReadTool.vue'
// import ListTool from '../components/ListTool.vue'
// import GrepTool from '../components/GrepTool.vue'
// import GlobTool from '../components/GlobTool.vue'
// import WebfetchTool from '../components/WebfetchTool.vue'

const activeTab = ref<"bash" | "read" | "list" | "grep" | "glob" | "webfetch">("bash")
const selectedBashIndex = ref(0)
const selectedReadIndex = ref(0)
const selectedListIndex = ref(0)
const selectedGrepIndex = ref(0)
const selectedGlobIndex = ref(0)
const selectedWebfetchIndex = ref(0)

const tabs = [
  { key: "bash", label: "Bash" },
  { key: "read", label: "Read" },
  { key: "list", label: "List" },
  { key: "grep", label: "Grep" },
  { key: "glob", label: "Glob" },
  { key: "webfetch", label: "Webfetch" },
]
</script>

<template>
  <div class="tool-examples">
    <h1>工具组件示例展示</h1>

    <!-- Tab导航 -->
    <div class="tabs">
      <button v-for="tab in tabs"
              :key="tab.key"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key as any">
        {{ tab.label }}
      </button>
    </div>

    <!-- Bash Tool 示例 -->
    <div v-if="activeTab === 'bash'"
         class="example-section">
      <h2>Bash 工具示例</h2>
      <div class="mock-selector">
        <label>选择示例: </label>
        <select v-model="selectedBashIndex">
          <option v-for="(data, index) in bashMockData"
                  :key="index"
                  :value="index">
            示例 {{ index + 1 }}: {{ data.input.description }}
          </option>
        </select>
      </div>

      <!-- 取消注释以使用实际组件 -->
      <!-- <BashTool v-bind="bashMockData[selectedBashIndex]" /> -->

      <!-- 临时展示数据结构 -->
      <div class="mock-preview">
        <h3>Mock数据预览:</h3>
        <pre>{{ JSON.stringify(bashMockData[selectedBashIndex], null, 2) }}</pre>
      </div>
    </div>

    <!-- Read Tool 示例 -->
    <div v-if="activeTab === 'read'"
         class="example-section">
      <h2>Read 工具示例</h2>
      <div class="mock-selector">
        <label>选择示例: </label>
        <select v-model="selectedReadIndex">
          <option v-for="(data, index) in readMockData"
                  :key="index"
                  :value="index">
            示例 {{ index + 1 }}: {{ data.input.filePath }}
          </option>
        </select>
      </div>

      <!-- <ReadTool v-bind="readMockData[selectedReadIndex]" /> -->

      <div class="mock-preview">
        <h3>Mock数据预览:</h3>
        <pre>{{ JSON.stringify(readMockData[selectedReadIndex], null, 2) }}</pre>
      </div>
    </div>

    <!-- List Tool 示例 -->
    <div v-if="activeTab === 'list'"
         class="example-section">
      <h2>List 工具示例</h2>
      <div class="mock-selector">
        <label>选择示例: </label>
        <select v-model="selectedListIndex">
          <option v-for="(data, index) in listMockData"
                  :key="index"
                  :value="index">
            示例 {{ index + 1 }}: {{ data.input.path }}
          </option>
        </select>
      </div>

      <!-- <ListTool v-bind="listMockData[selectedListIndex]" /> -->

      <div class="mock-preview">
        <h3>Mock数据预览:</h3>
        <pre>{{ JSON.stringify(listMockData[selectedListIndex], null, 2) }}</pre>
      </div>
    </div>

    <!-- Grep Tool 示例 -->
    <div v-if="activeTab === 'grep'"
         class="example-section">
      <h2>Grep 工具示例</h2>
      <div class="mock-selector">
        <label>选择示例: </label>
        <select v-model="selectedGrepIndex">
          <option v-for="(data, index) in grepMockData"
                  :key="index"
                  :value="index">
            示例 {{ index + 1 }}: {{ data.input.pattern }}
          </option>
        </select>
      </div>

      <!-- <GrepTool v-bind="grepMockData[selectedGrepIndex]" /> -->

      <div class="mock-preview">
        <h3>Mock数据预览:</h3>
        <pre>{{ JSON.stringify(grepMockData[selectedGrepIndex], null, 2) }}</pre>
      </div>
    </div>

    <!-- Glob Tool 示例 -->
    <div v-if="activeTab === 'glob'"
         class="example-section">
      <h2>Glob 工具示例</h2>
      <div class="mock-selector">
        <label>选择示例: </label>
        <select v-model="selectedGlobIndex">
          <option v-for="(data, index) in globMockData"
                  :key="index"
                  :value="index">
            示例 {{ index + 1 }}: {{ data.input.pattern }}
          </option>
        </select>
      </div>

      <!-- <GlobTool v-bind="globMockData[selectedGlobIndex]" /> -->

      <div class="mock-preview">
        <h3>Mock数据预览:</h3>
        <pre>{{ JSON.stringify(globMockData[selectedGlobIndex], null, 2) }}</pre>
      </div>
    </div>

    <!-- Webfetch Tool 示例 -->
    <div v-if="activeTab === 'webfetch'"
         class="example-section">
      <h2>Webfetch 工具示例</h2>
      <div class="mock-selector">
        <label>选择示例: </label>
        <select v-model="selectedWebfetchIndex">
          <option v-for="(data, index) in webfetchMockData"
                  :key="index"
                  :value="index">
            示例 {{ index + 1 }}: {{ data.input.url }}
          </option>
        </select>
      </div>

      <!-- <WebfetchTool v-bind="webfetchMockData[selectedWebfetchIndex]" /> -->

      <div class="mock-preview">
        <h3>Mock数据预览:</h3>
        <pre>{{ JSON.stringify(webfetchMockData[selectedWebfetchIndex], null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-examples {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  transition: all 0.3s;
}

.tabs button:hover {
  color: #2c3e50;
  background-color: #f5f5f5;
}

.tabs button.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.example-section {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.mock-selector {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.mock-selector label {
  margin-right: 1rem;
  font-weight: 500;
}

.mock-selector select {
  padding: 0.5rem 1rem;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0.95rem;
  min-width: 300px;
}

.mock-preview {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f7fa;
  border-radius: 4px;
}

.mock-preview h3 {
  margin-bottom: 1rem;
  color: #606266;
  font-size: 1rem;
}

.mock-preview pre {
  background: #282c34;
  color: #abb2bf;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
