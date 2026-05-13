/**
 * Mock data for tool components
 * 用于测试和展示各种工具组件的模拟数据
 */

export interface ToolMockData {
  input: Record<string, any>
  metadata: Record<string, any>
  tool: string
  output?: string
  status?: string
}

// Bash工具的mock数据
export const bashMockData: ToolMockData[] = [
  {
    tool: "bash",
    input: {
      command: "npm install",
      description: "安装项目依赖",
    },
    metadata: {
      command: "npm install",
      output: `npm notice Created a lockfile as package-lock.json. You should commit this file.
added 1247 packages from 649 contributors and audited 1247 packages in 23.456s
found 0 vulnerabilities`,
    },
    output: `npm notice Created a lockfile as package-lock.json. You should commit this file.
added 1247 packages from 649 contributors and audited 1247 packages in 23.456s
found 0 vulnerabilities`,
    status: "completed",
  },
  {
    tool: "bash",
    input: {
      command: "git status",
      description: "检查Git仓库状态",
    },
    metadata: {
      command: "git status",
      output: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/app.tsx
        modified:   src/components/message-part.tsx

no changes added to commit (use "git add" and/or "git commit -a")`,
    },
    output: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/app.tsx
        modified:   src/components/message-part.tsx

no changes added to commit (use "git add" and/or "git commit -a")`,
    status: "completed",
  },
  {
    tool: "bash",
    input: {
      command: "bun dev",
      description: "启动开发服务器",
    },
    metadata: {
      command: "bun dev",
      output: `  VITE v5.0.12  ready in 1247 ms

  ➜  Local:   http://localhost:4444/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`,
    },
    output: `  VITE v5.0.12  ready in 1247 ms

  ➜  Local:   http://localhost:4444/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`,
    status: "running",
  },
]

// Read工具的mock数据
export const readMockData: ToolMockData[] = [
  {
    tool: "read",
    input: {
      filePath: "/src/app.tsx",
      offset: 0,
      limit: 50,
    },
    metadata: {
      loaded: ["/src/app.tsx", "/src/components/button.tsx"],
    },
    status: "completed",
  },
  {
    tool: "read",
    input: {
      filePath: "/src/utils/helpers.ts",
    },
    metadata: {
      loaded: ["/src/utils/helpers.ts"],
    },
    status: "completed",
  },
  {
    tool: "read",
    input: {
      filePath: "/package.json",
      offset: 10,
      limit: 100,
    },
    metadata: {
      loaded: ["/package.json", "/tsconfig.json"],
    },
    status: "completed",
  },
]

// List工具的mock数据
export const listMockData: ToolMockData[] = [
  {
    tool: "list",
    input: {
      path: "/src/components",
    },
    metadata: {},
    output: `📁 src/components/
├── 📄 button.tsx
├── 📄 card.tsx
├── 📄 dialog.tsx
├── 📄 icon.tsx
├── 📄 input.tsx
├── 📄 message-part.tsx
├── 📄 tooltip.tsx
└── 📁 session/
    ├── 📄 session-list.tsx
    ├── 📄 session-item.tsx
    └── 📄 session-header.tsx`,
    status: "completed",
  },
  {
    tool: "list",
    input: {
      path: "/",
    },
    metadata: {},
    output: `📁 /
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 README.md
├── 📁 src/
├── 📁 public/
├── 📁 e2e/
└── 📁 script/`,
    status: "completed",
  },
]

// Grep工具的mock数据
export const grepMockData: ToolMockData[] = [
  {
    tool: "grep",
    input: {
      pattern: "createSignal",
      include: "*.tsx",
      path: "/src",
    },
    metadata: {},
    output: `Found 15 matches in 8 files:

📄 src/app.tsx
  Line 12: import { createSignal, createEffect } from "solid-js"
  Line 45: const [count, setCount] = createSignal(0)

📄 src/components/dialog.tsx
  Line 8: import { createSignal, Show } from "solid-js"
  Line 23: const [open, setOpen] = createSignal(false)

📄 src/components/message-part.tsx
  Line 15: import { createSignal, For, Match, Switch } from "solid-js"
  Line 289: const [copied, setCopied] = createSignal(false)
  Line 295: const [expanded, setExpanded] = createSignal(false)

📄 src/pages/home.tsx
  Line 5: const [loading, setLoading] = createSignal(true)`,
    status: "completed",
  },
  {
    tool: "grep",
    input: {
      pattern: "TODO|FIXME",
      path: "/src",
    },
    metadata: {},
    output: `Found 5 matches in 3 files:

📄 src/utils/helpers.ts
  Line 34: // TODO: Add error handling

📄 src/components/terminal.tsx
  Line 67: // FIXME: Memory leak when terminal is closed
  Line 128: // TODO: Add copy functionality

📄 src/app.tsx
  Line 156: // TODO: Optimize re-renders`,
    status: "completed",
  },
]

// Glob工具的mock数据
export const globMockData: ToolMockData[] = [
  {
    tool: "glob",
    input: {
      pattern: "**/*.vue",
      path: "/src",
    },
    metadata: {},
    output: `Found 12 matching files:

📄 src/components/BasicTool.vue
📄 src/components/BashTool.vue
📄 src/components/GenericTool.vue
📄 src/components/GlobTool.vue
📄 src/components/GrepTool.vue
📄 src/components/ListTool.vue
📄 src/components/ReadTool.vue
📄 src/components/WebfetchTool.vue
📄 src/components/ReasoningPartDisplay.vue
📄 src/components/SessionTurn.vue
📄 src/components/TextPartDisplay.vue
📄 src/components/ToolErrorDisplay.vue`,
    status: "completed",
  },
  {
    tool: "glob",
    input: {
      pattern: "*.config.*",
      path: "/",
    },
    metadata: {},
    output: `Found 5 matching files:

📄 vite.config.ts
📄 tsconfig.json
📄 playwright.config.ts
📄 bunfig.toml
📄 vitest.config.ts`,
    status: "completed",
  },
  {
    tool: "glob",
    input: {
      pattern: "**/*.test.ts",
      path: "/src",
    },
    metadata: {},
    output: `Found 8 matching files:

📄 src/addons/serialize.test.ts
📄 src/utils/array.test.ts
📄 src/utils/encode.test.ts
📄 src/utils/path.test.ts
📄 src/components/button.test.ts
📄 src/components/dialog.test.ts
📄 src/hooks/useAutoScroll.test.ts
📄 src/hooks/useDebounce.test.ts`,
    status: "completed",
  },
]

// Webfetch工具的mock数据
export const webfetchMockData: ToolMockData[] = [
  {
    tool: "webfetch",
    input: {
      url: "https://api.github.com/repos/opencode-ai/opencode",
      format: "json",
    },
    metadata: {},
    output: `# GitHub Repository Information

**Name:** opencode
**Full Name:** opencode-ai/opencode
**Description:** Open-source AI coding assistant
**Stars:** ⭐ 2,547
**Forks:** 🍴 184
**Language:** TypeScript
**Open Issues:** 23
**License:** MIT

**Topics:** ai, coding-assistant, typescript, vscode, developer-tools

**Created:** 2024-03-15
**Last Updated:** 2026-02-08`,
    status: "completed",
  },
  {
    tool: "webfetch",
    input: {
      url: "https://www.npmjs.com/package/solid-js",
      format: "html",
    },
    metadata: {},
    output: `# solid-js - npm

**Version:** 1.8.11
**Weekly Downloads:** 245,678
**License:** MIT

## Description
A declarative, efficient, and flexible JavaScript library for building user interfaces.

## Installation
\`\`\`bash
npm install solid-js
\`\`\`

## Keywords
- reactive
- components
- jsx
- framework
- performance

**Repository:** https://github.com/solidjs/solid
**Homepage:** https://solidjs.com`,
    status: "completed",
  },
  {
    tool: "webfetch",
    input: {
      url: "https://vitejs.dev/guide/",
      format: "markdown",
    },
    metadata: {},
    output: `# Getting Started with Vite

Vite (French word for "quick", pronounced /vit/, like "veet") is a build tool that aims to provide a faster and leaner development experience for modern web projects.

## Overview

Vite consists of two major parts:
- A dev server with rich feature enhancements over native ES modules
- A build command that bundles your code with Rollup

## Scaffolding Your First Vite Project

\`\`\`bash
npm create vite@latest
\`\`\`

Then follow the prompts!

## Browser Support

The default build targets browsers that support native ES Modules and native dynamic import.`,
    status: "completed",
  },
]

// Question工具的mock数据
export const questionMockData: ToolMockData[] = [
  // 示例1: 单个单选问题 - 已回答
  {
    tool: "question",
    input: {
      questions: [
        {
          question: "您希望使用哪个包管理器？",
          header: "包管理器",
          options: [
            { label: "npm", description: "Node.js默认包管理器" },
            { label: "yarn", description: "快速、可靠的依赖管理工具" },
            { label: "pnpm", description: "节省磁盘空间的包管理器" },
            { label: "bun", description: "超快的JavaScript运行时和包管理器" },
          ],
          multiple: false,
        },
      ],
    },
    metadata: {
      answers: [["bun"]],
    },
    status: "completed",
  },
  // 示例2: 多选问题 - 已回答
  {
    tool: "question",
    input: {
      questions: [
        {
          question: "您想要安装哪些开发工具？",
          header: "开发工具",
          options: [
            { label: "ESLint", description: "代码质量检查工具" },
            { label: "Prettier", description: "代码格式化工具" },
            { label: "TypeScript", description: "JavaScript的超集" },
            { label: "Vite", description: "下一代前端构建工具" },
            { label: "Vitest", description: "基于Vite的单元测试框架" },
          ],
          multiple: true,
        },
      ],
    },
    metadata: {
      answers: [["ESLint", "Prettier", "TypeScript", "Vite"]],
    },
    status: "completed",
  },
  // 示例3: 多个问题 - 全部已回答
  {
    tool: "question",
    input: {
      questions: [
        {
          question: "选择项目类型",
          header: "项目类型",
          options: [{ label: "Web应用" }, { label: "移动应用" }, { label: "桌面应用" }, { label: "命令行工具" }],
          multiple: false,
        },
        {
          question: "选择前端框架",
          header: "框架",
          options: [
            { label: "React", description: "用于构建用户界面的JavaScript库" },
            { label: "Vue", description: "渐进式JavaScript框架" },
            { label: "Solid", description: "简单高效的响应式库" },
            { label: "Svelte", description: "编译型前端框架" },
          ],
          multiple: false,
        },
        {
          question: "需要哪些额外功能？",
          header: "功能",
          options: [{ label: "路由" }, { label: "状态管理" }, { label: "国际化" }, { label: "PWA支持" }],
          multiple: true,
        },
      ],
    },
    metadata: {
      answers: [["Web应用"], ["Solid"], ["路由", "状态管理", "国际化"]],
    },
    status: "completed",
  },
  // 示例4: 配置选项问题
  {
    tool: "question",
    input: {
      questions: [
        {
          question: "您希望如何配置TypeScript？",
          header: "TypeScript配置",
          options: [
            { label: "strict", description: "启用所有严格类型检查选项" },
            { label: "recommended", description: "推荐的配置" },
            { label: "basic", description: "基础配置" },
            { label: "custom", description: "自定义配置" },
          ],
          multiple: false,
        },
      ],
    },
    metadata: {
      answers: [["strict"]],
    },
    status: "completed",
  },
  // 示例5: 部署平台选择
  {
    tool: "question",
    input: {
      questions: [
        {
          question: "选择部署平台",
          header: "部署",
          options: [
            { label: "Vercel", description: "前端应用的云平台" },
            { label: "Netlify", description: "现代web项目平台" },
            { label: "AWS", description: "Amazon Web Services" },
            { label: "Cloudflare Pages", description: "Cloudflare的网站托管服务" },
            { label: "自托管", description: "使用自己的服务器" },
          ],
          multiple: false,
        },
      ],
    },
    metadata: {
      answers: [["Vercel"]],
    },
    status: "completed",
  },
]

// 导出所有mock数据的集合
export const allToolMockData = {
  bash: bashMockData,
  read: readMockData,
  list: listMockData,
  grep: grepMockData,
  glob: globMockData,
  webfetch: webfetchMockData,
  question: questionMockData,
}

// 随机获取某个工具的mock数据
export function getRandomMockData(tool: string): ToolMockData | undefined {
  const data = allToolMockData[tool as keyof typeof allToolMockData]
  if (!data || data.length === 0) return undefined
  return data[Math.floor(Math.random() * data.length)]
}

// 获取所有工具的第一个mock数据
export function getDefaultMockData(tool: string): ToolMockData | undefined {
  const data = allToolMockData[tool as keyof typeof allToolMockData]
  return data?.[0]
}
