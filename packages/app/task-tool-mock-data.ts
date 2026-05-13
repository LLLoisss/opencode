/**
 * Mock数据文件 - 用于TaskTool组件测试
 */

import type { Component } from "vue"

// ==================== 类型定义 ====================

/** 工具摘要项 */
export interface TaskSummaryItem {
  id: string
  tool: string
  state: {
    status: string
    title?: string
  }
}

/** 工具部分 */
export interface ToolPart {
  type: string
  tool: string
  callID: string
  state: {
    input?: Record<string, any>
    output?: string
    status?: string
    metadata?: Record<string, any>
  }
}

/** 消息 */
export interface Message {
  id: string
  sessionID: string
  role: string
}

/** 部分 */
export interface Part {
  type: string
  [key: string]: any
}

/** 权限项 */
export interface Permission {
  id: string
  sessionID: string
  tool?: {
    callID: string
    messageID: string
  }
  metadata?: Record<string, any>
}

/** 数据仓库类型 */
export interface DataStore {
  permission?: Record<string, Permission[]>
  message: Record<string, Message[]>
  part: Record<string, Part[]>
}

/** 数据上下文 */
export interface DataContext {
  store: DataStore
  respondToPermission?: (payload: { sessionID: string; permissionID: string; response: string }) => void
  navigateToSession?: (sessionId: string) => void
}

/** TaskTool Props */
export interface TaskToolProps {
  input: Record<string, any>
  metadata: Record<string, any>
  tool: string
  output?: string
  status?: string
  defaultOpen?: boolean
}

// ==================== Mock 数据 1: 正常执行中的任务 ====================

export const mockTaskDataRunning: TaskToolProps = {
  input: {
    description: "分析项目代码结构并生成文档",
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
      {
        id: "tool-2",
        tool: "list",
        state: {
          status: "completed",
          title: "src/components",
        },
      },
      {
        id: "tool-3",
        tool: "grep",
        state: {
          status: "running",
          title: "搜索导出函数",
        },
      },
      {
        id: "tool-4",
        tool: "write",
        state: {
          status: "pending",
          title: "docs/architecture.md",
        },
      },
    ] as TaskSummaryItem[],
  },
  tool: "task",
  status: "running",
  defaultOpen: true,
}

// ==================== Mock 数据 2: 已完成的任务 ====================

export const mockTaskDataCompleted: TaskToolProps = {
  input: {
    description: "重构用户认证模块",
    subagent_type: "code",
  },
  metadata: {
    sessionId: "child-session-002",
    summary: [
      {
        id: "tool-5",
        tool: "read",
        state: {
          status: "completed",
          title: "src/auth/login.ts",
        },
      },
      {
        id: "tool-6",
        tool: "edit",
        state: {
          status: "completed",
          title: "src/auth/login.ts",
        },
      },
      {
        id: "tool-7",
        tool: "write",
        state: {
          status: "completed",
          title: "src/auth/__tests__/login.test.ts",
        },
      },
      {
        id: "tool-8",
        tool: "bash",
        state: {
          status: "completed",
          title: "运行测试",
        },
      },
    ] as TaskSummaryItem[],
  },
  tool: "task",
  status: "completed",
  defaultOpen: true,
}

// ==================== Mock 数据 3: 带权限请求的任务 ====================

export const mockTaskDataWithPermission: TaskToolProps = {
  input: {
    description: "部署应用到生产环境",
    subagent_type: "deployment",
  },
  metadata: {
    sessionId: "child-session-003",
    summary: [
      {
        id: "tool-9",
        tool: "bash",
        state: {
          status: "running",
          title: "npm run build",
        },
      },
    ] as TaskSummaryItem[],
  },
  tool: "task",
  status: "waiting_permission",
  defaultOpen: true,
}

// ==================== Mock 数据 4: 复杂任务流程 ====================

export const mockTaskDataComplex: TaskToolProps = {
  input: {
    description: "实现完整的用户管理功能",
    subagent_type: "fullstack",
  },
  metadata: {
    sessionId: "child-session-004",
    summary: [
      {
        id: "tool-10",
        tool: "glob",
        state: {
          status: "completed",
          title: "查找相关文件",
        },
      },
      {
        id: "tool-11",
        tool: "read",
        state: {
          status: "completed",
          title: "src/models/user.ts",
        },
      },
      {
        id: "tool-12",
        tool: "write",
        state: {
          status: "completed",
          title: "src/api/user.ts",
        },
      },
      {
        id: "tool-13",
        tool: "write",
        state: {
          status: "completed",
          title: "src/components/UserList.vue",
        },
      },
      {
        id: "tool-14",
        tool: "write",
        state: {
          status: "completed",
          title: "src/components/UserForm.vue",
        },
      },
      {
        id: "tool-15",
        tool: "apply_patch",
        state: {
          status: "running",
          title: "应用路由补丁",
        },
      },
      {
        id: "tool-16",
        tool: "todowrite",
        state: {
          status: "pending",
        },
      },
    ] as TaskSummaryItem[],
  },
  tool: "task",
  status: "running",
  defaultOpen: true,
}

// ==================== Mock DataContext ====================

export const mockDataContext: DataContext = {
  store: {
    message: {
      "child-session-003": [
        {
          id: "msg-001",
          sessionID: "child-session-003",
          role: "assistant",
        },
      ],
    },
    part: {
      "msg-001": [
        {
          type: "tool",
          tool: "bash",
          callID: "call-bash-001",
          state: {
            input: {
              command: "npm run deploy",
              description: "部署到生产环境",
            },
            status: "waiting_permission",
            metadata: {},
          },
        } as ToolPart,
      ],
    },
    permission: {
      "child-session-003": [
        {
          id: "perm-001",
          sessionID: "child-session-003",
          tool: {
            callID: "call-bash-001",
            messageID: "msg-001",
          },
          metadata: {
            reason: "此命令将部署应用到生产环境",
          },
        },
      ],
    },
  },
  respondToPermission: (payload) => {
    console.log("权限响应:", payload)
    // 模拟响应权限请求
    alert(`权限响应: ${payload.response} (SessionID: ${payload.sessionID})`)
  },
  navigateToSession: (sessionId) => {
    console.log("导航到会话:", sessionId)
    // 模拟导航到子会话
    alert(`导航到子会话: ${sessionId}`)
  },
}

// ==================== Mock DataContext (无权限版本) ====================

export const mockDataContextNoPermission: DataContext = {
  store: {
    message: {
      "child-session-001": [],
      "child-session-002": [],
      "child-session-004": [],
    },
    part: {},
  },
  respondToPermission: (payload) => {
    console.log("权限响应:", payload)
  },
  navigateToSession: (sessionId) => {
    console.log("导航到会话:", sessionId)
  },
}

// ==================== Mock i18n ====================

const translations: Record<string, string> = {
  "ui.permission.deny": "拒绝",
  "ui.permission.allowAlways": "始终允许",
  "ui.permission.allowOnce": "允许一次",
  "ui.tool.agent": "代理: {type}",
  "ui.tool.read": "读取文件",
  "ui.tool.list": "列出目录",
  "ui.tool.glob": "文件搜索",
  "ui.tool.grep": "文本搜索",
  "ui.tool.webfetch": "网页抓取",
  "ui.tool.shell": "Shell命令",
  "ui.messagePart.title.edit": "编辑文件",
  "ui.messagePart.title.write": "写入文件",
  "ui.tool.patch": "应用补丁",
  "ui.tool.todos": "任务列表",
  "ui.tool.todos.read": "读取任务",
  "ui.tool.questions": "问题列表",
}

export const mockI18n = {
  t: (key: string, params?: Record<string, any>): string => {
    let result = translations[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v))
      })
    }
    return result
  },
}

// ==================== Mock ToolRegistry ====================

export const mockToolRegistry = {
  render: (name: string): Component | undefined => {
    // 返回 undefined，让组件使用 GenericTool 作为后备
    return undefined
  },
}

// ==================== 导出所有 Mock 数据供组件使用 ====================

export const allTaskMockData = {
  running: mockTaskDataRunning,
  completed: mockTaskDataCompleted,
  withPermission: mockTaskDataWithPermission,
  complex: mockTaskDataComplex,
}

export const allMockProviders = {
  withPermission: {
    dataContext: mockDataContext,
    i18n: mockI18n,
    toolRegistry: mockToolRegistry,
  },
  noPermission: {
    dataContext: mockDataContextNoPermission,
    i18n: mockI18n,
    toolRegistry: mockToolRegistry,
  },
}
