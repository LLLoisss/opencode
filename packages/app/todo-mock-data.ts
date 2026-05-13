/**
 * Mock数据文件 - 用于TodoWriteTool组件测试
 */

export interface Todo {
  id?: number
  content: string
  status: "completed" | "not-started" | "in-progress"
}

export interface TodoToolProps {
  input: {
    todos?: Todo[]
  }
  metadata: {
    todos?: Todo[]
  }
  tool: string
  output?: string
  status?: string
}

// 完整的Mock数据 - 可直接用于TodoWriteTool组件
export const mockTodoData: TodoToolProps = {
  input: {},
  metadata: {
    todos: [
      {
        id: 1,
        content: "搭建项目脚手架",
        status: "completed",
      },
      {
        id: 2,
        content: "配置TypeScript和ESLint",
        status: "completed",
      },
      {
        id: 3,
        content: "集成Vue Router和Pinia",
        status: "completed",
      },
      {
        id: 4,
        content: "实现用户认证功能",
        status: "in-progress",
      },
      {
        id: 5,
        content: "开发核心业务模块",
        status: "in-progress",
      },
      {
        id: 6,
        content: "编写单元测试",
        status: "not-started",
      },
      {
        id: 7,
        content: "性能优化",
        status: "not-started",
      },
      {
        id: 8,
        content: "部署到生产环境",
        status: "not-started",
      },
    ],
  },
  tool: "todowrite",
  status: "completed",
}
