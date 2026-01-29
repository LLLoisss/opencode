import * as vscode from "vscode"
import { OpencodeClient, Session } from "./opencode-client"
import { OpencodeServer } from "./opencode-server"

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView
  private currentSession?: Session

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly client: OpencodeClient,
    private readonly server?: OpencodeServer
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    }

    webviewView.webview.html = this.getHtmlContent(webviewView.webview)

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "sendMessage":
          await this.handleSendMessage(message.text)
          break
        case "newSession":
          await this.handleNewSession()
          break
        case "loadSessions":
          await this.handleLoadSessions()
          break
        case "selectSession":
          await this.handleSelectSession(message.sessionId)
          break
        case "deleteSession":
          await this.handleDeleteSession(message.sessionId)
          break
        case "checkHealth":
          await this.handleCheckHealth()
          break
        case "abort":
          await this.handleAbort()
          break
        case "restartServer":
          await this.handleRestartServer()
          break
        case "showLogs":
          this.server?.showOutput()
          break
      }
    })

    this.handleCheckHealth()
  }

  private async handleRestartServer() {
    if (!this.server) {
      this.postMessage({ type: "error", message: "服务器管理器不可用" })
      return
    }

    this.postMessage({ type: "serverRestarting", data: true })

    try {
      await this.server.stop()
      const url = await this.server.start({ port: 4096, timeout: 15000 })
      this.client.setBaseUrl(url)
      this.postMessage({ type: "serverRestarting", data: false })
      await this.handleCheckHealth()
    } catch (error) {
      this.postMessage({ type: "serverRestarting", data: false })
      this.postMessage({ type: "error", message: `重启服务器失败: ${error}` })
    }
  }

  private async handleCheckHealth() {
    // If server is managed by us, try to start it if not running
    if (this.server && !this.server.isRunning) {
      try {
        const url = await this.server.start({ port: 4096, timeout: 15000 })
        this.client.setBaseUrl(url)
      } catch {
        this.postMessage({ type: "health", data: null, error: "OpenCode 服务器启动失败" })
        return
      }
    }

    try {
      const health = await this.client.health()
      this.postMessage({ type: "health", data: health })
    } catch {
      this.postMessage({ type: "health", data: null, error: "无法连接到 OpenCode 服务器" })
    }
  }

  private async handleLoadSessions() {
    try {
      const sessions = await this.client.listSessions()
      this.postMessage({ type: "sessions", data: sessions })
    } catch (error) {
      this.postMessage({ type: "error", message: `加载会话失败: ${error}` })
    }
  }

  private async handleNewSession() {
    try {
      this.currentSession = await this.client.createSession()
      this.postMessage({ type: "sessionCreated", data: this.currentSession })
      this.postMessage({ type: "messages", data: [] })
    } catch (error) {
      this.postMessage({ type: "error", message: `创建会话失败: ${error}` })
    }
  }

  private async handleSelectSession(sessionId: string) {
    try {
      this.currentSession = await this.client.getSession(sessionId)
      const messages = await this.client.getMessages(sessionId)
      this.postMessage({ type: "sessionSelected", data: this.currentSession })
      this.postMessage({ type: "messages", data: messages })
    } catch (error) {
      this.postMessage({ type: "error", message: `加载会话失败: ${error}` })
    }
  }

  private async handleDeleteSession(sessionId: string) {
    try {
      await this.client.deleteSession(sessionId)
      if (this.currentSession?.id === sessionId) {
        this.currentSession = undefined
        this.postMessage({ type: "sessionCleared" })
      }
      await this.handleLoadSessions()
    } catch (error) {
      this.postMessage({ type: "error", message: `删除会话失败: ${error}` })
    }
  }

  private async handleSendMessage(text: string) {
    if (!text.trim()) return

    try {
      if (!this.currentSession) {
        this.currentSession = await this.client.createSession()
        this.postMessage({ type: "sessionCreated", data: this.currentSession })
      }

      this.postMessage({
        type: "userMessage",
        data: { text, sessionId: this.currentSession.id },
      })

      this.postMessage({ type: "assistantTyping", data: true })

      const response = await this.client.sendMessage(this.currentSession.id, text)

      this.postMessage({ type: "assistantTyping", data: false })
      this.postMessage({ type: "assistantMessage", data: response })
    } catch (error) {
      this.postMessage({ type: "assistantTyping", data: false })
      this.postMessage({ type: "error", message: `发送消息失败: ${error}` })
    }
  }

  private async handleAbort() {
    if (!this.currentSession) return

    try {
      await this.client.abortSession(this.currentSession.id)
      this.postMessage({ type: "assistantTyping", data: false })
    } catch (error) {
      this.postMessage({ type: "error", message: `中止失败: ${error}` })
    }
  }

  private postMessage(message: any) {
    this.view?.webview.postMessage(message)
  }

  private getHtmlContent(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline';">
  <title>OpenCode Chat</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-sideBar-background);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      padding: 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .header-title {
      font-weight: 600;
      font-size: 13px;
    }

    .header-buttons {
      display: flex;
      gap: 4px;
    }

    .btn {
      padding: 4px 8px;
      border: none;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-primary:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .btn-danger {
      background: var(--vscode-inputValidation-errorBackground);
      color: var(--vscode-inputValidation-errorForeground);
    }

    .status {
      padding: 8px 12px;
      background: var(--vscode-inputValidation-infoBackground);
      color: var(--vscode-inputValidation-infoForeground);
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status.error {
      background: var(--vscode-inputValidation-errorBackground);
      color: var(--vscode-inputValidation-errorForeground);
    }

    .status.success {
      background: var(--vscode-inputValidation-infoBackground);
    }

    .sessions-panel {
      padding: 8px;
      border-bottom: 1px solid var(--vscode-panel-border);
      max-height: 150px;
      overflow-y: auto;
      display: none;
    }

    .sessions-panel.show {
      display: block;
    }

    .session-item {
      padding: 6px 8px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }

    .session-item:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .session-item.active {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .session-delete {
      opacity: 0;
      padding: 2px 6px;
      font-size: 10px;
    }

    .session-item:hover .session-delete {
      opacity: 1;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      padding: 10px 12px;
      border-radius: 8px;
      max-width: 90%;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .message.user {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .message.assistant {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .message.typing {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
    }

    .typing-indicator span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--vscode-foreground);
      opacity: 0.5;
      animation: typing 1.4s infinite ease-in-out both;
    }

    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .input-container {
      padding: 12px;
      border-top: 1px solid var(--vscode-panel-border);
      display: flex;
      gap: 8px;
    }

    .input-wrapper {
      flex: 1;
      display: flex;
      gap: 8px;
    }

    textarea {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      resize: none;
      font-family: inherit;
      font-size: inherit;
      min-height: 36px;
      max-height: 120px;
    }

    textarea:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }

    .send-btn {
      padding: 8px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .send-btn:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--vscode-descriptionForeground);
      text-align: center;
      padding: 20px;
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state-text {
      font-size: 14px;
      margin-bottom: 8px;
    }

    .empty-state-hint {
      font-size: 12px;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="header-title">OpenCode Chat</span>
    <div class="header-buttons">
      <button class="btn" id="logsBtn" title="查看日志">📜</button>
      <button class="btn" id="restartBtn" title="重启服务器">🔄</button>
      <button class="btn" id="sessionsBtn" title="会话列表">📋</button>
      <button class="btn btn-primary" id="newSessionBtn" title="新会话">+ 新建</button>
    </div>
  </div>

  <div id="status" class="status" style="display: none;"></div>

  <div id="sessionsPanel" class="sessions-panel">
    <div id="sessionsList"></div>
  </div>

  <div id="messages" class="messages">
    <div class="empty-state">
      <div class="empty-state-icon">💬</div>
      <div class="empty-state-text">开始一个新对话</div>
      <div class="empty-state-hint">在下方输入消息，与 OpenCode 助手交流</div>
    </div>
  </div>

  <div class="input-container">
    <div class="input-wrapper">
      <textarea 
        id="messageInput" 
        placeholder="输入消息... (Ctrl+Enter 发送)"
        rows="1"
      ></textarea>
      <button class="send-btn" id="sendBtn">发送</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const newSessionBtn = document.getElementById('newSessionBtn');
    const sessionsBtn = document.getElementById('sessionsBtn');
    const sessionsPanel = document.getElementById('sessionsPanel');
    const sessionsList = document.getElementById('sessionsList');
    const statusDiv = document.getElementById('status');
    const restartBtn = document.getElementById('restartBtn');
    const logsBtn = document.getElementById('logsBtn');

    let currentSessionId = null;
    let sessions = [];
    let isTyping = false;
    let hasMessages = false;
    let isRestarting = false;

    // Initialize
    vscode.postMessage({ type: 'checkHealth' });
    vscode.postMessage({ type: 'loadSessions' });

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    newSessionBtn.addEventListener('click', () => vscode.postMessage({ type: 'newSession' }));
    sessionsBtn.addEventListener('click', toggleSessionsPanel);
    restartBtn.addEventListener('click', () => {
      if (!isRestarting) {
        vscode.postMessage({ type: 'restartServer' });
      }
    });
    logsBtn.addEventListener('click', () => vscode.postMessage({ type: 'showLogs' }));

    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });

    function sendMessage() {
      const text = messageInput.value.trim();
      if (!text || isTyping) return;

      vscode.postMessage({ type: 'sendMessage', text });
      messageInput.value = '';
      messageInput.style.height = 'auto';
    }

    function toggleSessionsPanel() {
      sessionsPanel.classList.toggle('show');
      if (sessionsPanel.classList.contains('show')) {
        vscode.postMessage({ type: 'loadSessions' });
      }
    }

    function showStatus(message, type = 'info') {
      statusDiv.textContent = message;
      statusDiv.className = 'status ' + type;
      statusDiv.style.display = 'flex';
    }

    function hideStatus() {
      statusDiv.style.display = 'none';
    }

    function addMessage(text, role) {
      if (!hasMessages) {
        messagesContainer.innerHTML = '';
        hasMessages = true;
      }

      const messageDiv = document.createElement('div');
      messageDiv.className = 'message ' + role;
      messageDiv.textContent = text;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
      if (!hasMessages) {
        messagesContainer.innerHTML = '';
        hasMessages = true;
      }

      const existing = document.getElementById('typingIndicator');
      if (existing) return;

      const typingDiv = document.createElement('div');
      typingDiv.id = 'typingIndicator';
      typingDiv.className = 'message assistant typing';
      typingDiv.innerHTML = \`
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
        <span>思考中...</span>
      \`;
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
      const typingDiv = document.getElementById('typingIndicator');
      if (typingDiv) typingDiv.remove();
    }

    function renderSessions() {
      sessionsList.innerHTML = sessions.map(session => \`
        <div class="session-item \${session.id === currentSessionId ? 'active' : ''}" data-id="\${session.id}">
          <span>\${session.title || '新会话'}</span>
          <button class="btn session-delete" data-id="\${session.id}">删除</button>
        </div>
      \`).join('');

      sessionsList.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('session-delete')) {
            e.stopPropagation();
            vscode.postMessage({ type: 'deleteSession', sessionId: e.target.dataset.id });
          } else {
            vscode.postMessage({ type: 'selectSession', sessionId: item.dataset.id });
            sessionsPanel.classList.remove('show');
          }
        });
      });
    }

    function renderMessages(messages) {
      messagesContainer.innerHTML = '';
      hasMessages = false;

      if (!messages || messages.length === 0) {
        messagesContainer.innerHTML = \`
          <div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <div class="empty-state-text">开始一个新对话</div>
            <div class="empty-state-hint">在下方输入消息，与 OpenCode 助手交流</div>
          </div>
        \`;
        return;
      }

      hasMessages = true;
      messages.forEach(msg => {
        const role = msg.info.role;
        const text = msg.parts
          .filter(p => p.type === 'text' && p.text)
          .map(p => p.text)
          .join('\\n');
        
        if (text) {
          addMessage(text, role);
        }
      });
    }

    // Handle messages from extension
    window.addEventListener('message', event => {
      const message = event.data;

      switch (message.type) {
        case 'health':
          if (message.data) {
            showStatus(\`已连接 OpenCode v\${message.data.version}\`, 'success');
            setTimeout(hideStatus, 3000);
          } else {
            showStatus(message.error || '无法连接到 OpenCode 服务器', 'error');
          }
          break;

        case 'serverRestarting':
          isRestarting = message.data;
          restartBtn.disabled = isRestarting;
          if (isRestarting) {
            showStatus('正在重启服务器...', 'info');
          }
          break;

        case 'sessions':
          sessions = message.data || [];
          renderSessions();
          break;

        case 'sessionCreated':
        case 'sessionSelected':
          currentSessionId = message.data.id;
          renderSessions();
          break;

        case 'sessionCleared':
          currentSessionId = null;
          renderMessages([]);
          break;

        case 'messages':
          renderMessages(message.data);
          break;

        case 'userMessage':
          addMessage(message.data.text, 'user');
          break;

        case 'assistantTyping':
          isTyping = message.data;
          sendBtn.disabled = isTyping;
          if (isTyping) {
            showTypingIndicator();
          } else {
            hideTypingIndicator();
          }
          break;

        case 'assistantMessage':
          const text = message.data.parts
            .filter(p => p.type === 'text' && p.text)
            .map(p => p.text)
            .join('\\n');
          if (text) {
            addMessage(text, 'assistant');
          }
          break;

        case 'error':
          showStatus(message.message, 'error');
          setTimeout(hideStatus, 5000);
          break;
      }
    });
  </script>
</body>
</html>`
  }
}
