# OpenCode Chat - VS Code Extension

这是一个集成 OpenCode 对话功能的 VS Code 插件。

## 功能

- 🎯 **侧边栏聊天界面**: 在 VS Code 侧边栏中提供简洁的对话界面
- 💬 **会话管理**: 支持创建、切换和删除多个对话会话
- 🔄 **实时通信**: 与本地 OpenCode 服务器实时通信
- 🎨 **主题适配**: 自动适配 VS Code 的明暗主题

## 先决条件

1. 确保已安装 [OpenCode](https://github.com/anomalyco/opencode)
2. 启动 OpenCode 服务器：
   ```bash
   opencode serve --port 4096
   ```

## 开发

### 安装依赖

```bash
cd sdks/vscode-chat
bun install
```

### 编译

```bash
bun run compile
```

### 监听模式开发

```bash
bun run watch
```

### 打包

```bash
bun run package
```

## 使用方法

1. 点击侧边栏的 "OpenCode Chat" 图标
2. 或使用快捷键 `Ctrl+Shift+O` (Mac: `Cmd+Shift+O`)
3. 在输入框中输入消息，按 `Ctrl+Enter` 或点击发送按钮

## 架构

```
src/
├── extension.ts          # 插件入口
├── opencode-client.ts    # OpenCode API 客户端
└── chat-view-provider.ts # Webview 视图提供者
```

## API 端点

插件与以下 OpenCode API 端点通信：

- `GET /global/health` - 健康检查
- `GET /session` - 获取会话列表
- `POST /session` - 创建新会话
- `GET /session/{id}` - 获取会话详情
- `DELETE /session/{id}` - 删除会话
- `GET /session/{id}/message` - 获取消息列表
- `POST /session/{id}/message` - 发送消息
- `POST /session/{id}/abort` - 中止会话

## License

MIT
