import * as vscode from "vscode"
import { OpencodeClient } from "./opencode-client"
import { OpencodeServer } from "./opencode-server"
import { ChatViewProvider } from "./chat-view-provider"

let server: OpencodeServer | undefined

export async function activate(context: vscode.ExtensionContext) {
  server = new OpencodeServer()
  const client = new OpencodeClient()

  // Auto-start server
  try {
    const url = await server.start({ port: 4096, timeout: 15000 })
    client.setBaseUrl(url)
    vscode.window.showInformationMessage(`OpenCode 服务器已启动`)
  } catch (error) {
    vscode.window.showWarningMessage(
      `OpenCode 服务器启动失败，请确保已安装 opencode 命令行工具`
    )
  }

  const chatViewProvider = new ChatViewProvider(context.extensionUri, client, server)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("opencode-chat.chatView", chatViewProvider)
  )

  const openChatCommand = vscode.commands.registerCommand("opencode-chat.open", () => {
    vscode.commands.executeCommand("workbench.view.extension.opencode-chat")
  })

  const restartServerCommand = vscode.commands.registerCommand("opencode-chat.restartServer", async () => {
    if (!server) return

    vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: "重启 OpenCode 服务器..." },
      async () => {
        await server!.stop()
        try {
          const url = await server!.start({ port: 4096, timeout: 15000 })
          client.setBaseUrl(url)
          vscode.window.showInformationMessage("OpenCode 服务器已重启")
        } catch (error) {
          vscode.window.showErrorMessage(`重启失败: ${error}`)
        }
      }
    )
  })

  const showLogsCommand = vscode.commands.registerCommand("opencode-chat.showLogs", () => {
    server?.showOutput()
  })

  context.subscriptions.push(openChatCommand, restartServerCommand, showLogsCommand)
  context.subscriptions.push({ dispose: () => server?.dispose() })
}

export async function deactivate() {
  await server?.stop()
}
