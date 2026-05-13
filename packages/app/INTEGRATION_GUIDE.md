# OpenCode 集成指南

## 方案一: iframe 嵌入(✅ 推荐)

最简单快速的集成方式,适用于任何前端框架。

### 步骤

1. **启动 OpenCode 开发服务器**

   ```bash
   cd packages/app
   bun dev
   ```

   OpenCode 将运行在 `http://localhost:3000`

2. **在您的 Vue3 项目中集成**

```vue
<!-- YourComponent.vue -->
<template>
  <div>
    <el-button @click="openCodeEditor">打开 OpenCode 编辑器</el-button>

    <!-- 使用对话框全屏显示 -->
    <el-dialog v-model="visible" fullscreen :show-close="true" title="Code Editor">
      <iframe :src="opencodeUrl" style="width: 100%; height: calc(100vh - 60px); border: none;" v-if="visible" />
    </el-dialog>

    <!-- 或者直接嵌入页面 -->
    <div v-if="showInline" style="height: 600px;">
      <iframe :src="opencodeUrl" style="width: 100%; height: 100%; border: 1px solid #eee;" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const visible = ref(false)
const showInline = ref(false)

// OpenCode 服务器地址
const opencodeUrl = "http://localhost:3000"

const openCodeEditor = () => {
  visible.value = true
}
</script>
```

### 优点

- ✅ 无需修改任何代码
- ✅ 完全隔离,不会有样式和JS冲突
- ✅ 5分钟快速集成
- ✅ 支持所有浏览器

### 限制

- ⚠️ 需要确保 OpenCode 服务运行
- ⚠️ 跨域通信需要使用 `postMessage` API

---

## 方案二: 构建为独立包(⚠️ 复杂)

将 OpenCode 打包为可复用的 npm 包,在 Vue 项目中导入使用。

### 当前问题

由于 SolidJS 的 JSX 编译问题,库模式打包遇到困难。主要问题:

- `solid-js/h` 导出问题
- esbuild 无法正确处理 SolidJS 的 JSX 转换

### 待解决方案

1. 使用 Rollup 替代 Vite 的库模式
2. 配置正确的 SolidJS preset
3. 或采用微前端框架如 qiankun

---

## 方案三: 使用 Web Component

将 OpenCode 封装为 Web Component,可在任何框架中使用。

### 实现步骤

1. 创建 Web Component 封装:

```typescript
// src/web-component.ts
import { render } from 'solid-js/web'
import { App } from './app'

class OpenCodeEditor extends HTMLElement {
  private dispose?: () => void

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    const container = document.createElement('div')
    shadow.appendChild(container)

    this.dispose = render(() => <App />, container)
  }

  disconnectedCallback() {
    this.dispose?.()
  }
}

customElements.define('opencode-editor', OpenCodeEditor)
```

2. 在 Vue 项目中使用:

```vue
<template>
  <div>
    <el-button @click="showEditor = true">打开编辑器</el-button>
    <el-dialog v-model="showEditor" fullscreen>
      <opencode-editor></opencode-editor>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
// 导入 Web Component
import "@opencode-ai/app/web-component"

const showEditor = ref(false)
</script>
```

---

## 推荐方案对比

| 方案          | 难度   | 性能   | 隔离性 | 适用场景           |
| ------------- | ------ | ------ | ------ | ------------------ |
| iframe        | ⭐     | ⭐⭐   | ⭐⭐⭐ | 快速集成,演示 Demo |
| npm 包        | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐   | 需要深度定制       |
| Web Component | ⭐⭐   | ⭐⭐⭐ | ⭐⭐   | 跨框架复用         |

### 当前建议

**使用方案一(iframe)** 因为:

1. 无需构建配置
2. 立即可用
3. 完全隔离
4. OpenCode 作为独立服务更容易维护

### 生产环境部署

对于生产环境,建议:

1. 构建 OpenCode 静态资源
   ```bash
   bun run build
   ```
2. 部署到 CDN 或静态服务器
3. 在 Vue 项目中通过 iframe 指向生产环境 URL
   ```typescript
   const opencodeUrl = "https://your-domain.com/opencode"
   ```

---

## 高级用法: 通信

如果需要在 Vue 和 OpenCode 之间传递数据:

### Vue 端

```typescript
// 发送消息到 OpenCode
const iframe = document.querySelector("iframe")
iframe.contentWindow.postMessage(
  {
    type: "openFile",
    data: { path: "/src/app.ts" },
  },
  "http://localhost:3000",
)

// 接收来自 OpenCode 的消息
window.addEventListener("message", (event) => {
  if (event.origin !== "http://localhost:3000") return

  console.log("收到消息:", event.data)
})
```

### OpenCode 端

需要在 OpenCode 中添加消息监听器(需修改源码):

```typescript
// src/entry.tsx
window.addEventListener("message", (event) => {
  if (event.data.type === "openFile") {
    // 处理打开文件
    console.log("打开文件:", event.data.data.path)
  }
})
```

---

## 常见问题

### Q: iframe 如何全屏?

A: 使用 Element UI 的 `fullscreen` 属性或 CSS:

```css
iframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}
```

### Q: 如何隐藏 OpenCode 的某些 UI?

A: 可以通过 URL 参数或 postMessage 控制(需要 OpenCode 支持)

### Q: 性能如何?

A: iframe 性能非常好,现代浏览器对 iframe 有很好的优化

---

## 联系支持

如需进一步定制或技术支持,请查阅 [OpenCode 文档](https://opencode.ai/docs)
