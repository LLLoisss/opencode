import * as vscode from "vscode"
import { OpencodeClient } from "./opencode-client"
import { ChatViewProvider } from "./chat-view-provider"

export function activate(context: vscode.ExtensionContext) {
  const client = new OpencodeClient()
  const chatViewProvider = new ChatViewProvider(context.extensionUri, client)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("opencode-chat.chatView", chatViewProvider)
  )

  const openChatCommand = vscode.commands.registerCommand("opencode-chat.open", () => {
    vscode.commands.executeCommand("workbench.view.extension.opencode-chat")
  })

  context.subscriptions.push(openChatCommand)
}

export function deactivate() {}
