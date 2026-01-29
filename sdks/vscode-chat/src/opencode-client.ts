import * as vscode from "vscode"

export interface Session {
  id: string
  title?: string
  time: {
    created: number
    updated: number
  }
}

export interface Message {
  id: string
  role: "user" | "assistant"
  sessionID: string
  time: {
    created: number
    updated: number
  }
}

export interface Part {
  id: string
  type: string
  text?: string
}

export interface MessageWithParts {
  info: Message
  parts: Part[]
}

export class OpencodeClient {
  private baseUrl = "http://127.0.0.1:4096"
  private directory: string | undefined

  constructor() {
    const folders = vscode.workspace.workspaceFolders
    if (folders && folders.length > 0) {
      this.directory = folders[0].uri.fsPath
    }
  }

  setPort(port: number) {
    this.baseUrl = `http://127.0.0.1:${port}`
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    }

    if (this.directory) {
      headers["x-opencode-directory"] = this.directory
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<T>
  }

  async health(): Promise<{ healthy: boolean; version: string }> {
    return this.request("/global/health")
  }

  async listSessions(): Promise<Session[]> {
    return this.request("/session")
  }

  async createSession(title?: string): Promise<Session> {
    return this.request("/session", {
      method: "POST",
      body: JSON.stringify({ title }),
    })
  }

  async getSession(sessionID: string): Promise<Session> {
    return this.request(`/session/${sessionID}`)
  }

  async deleteSession(sessionID: string): Promise<boolean> {
    return this.request(`/session/${sessionID}`, {
      method: "DELETE",
    })
  }

  async getMessages(sessionID: string): Promise<MessageWithParts[]> {
    return this.request(`/session/${sessionID}/message`)
  }

  async sendMessage(
    sessionID: string,
    text: string,
    model?: { providerID: string; modelID: string }
  ): Promise<MessageWithParts> {
    return this.request(`/session/${sessionID}/message`, {
      method: "POST",
      body: JSON.stringify({
        parts: [{ type: "text", text }],
        model,
      }),
    })
  }

  async abortSession(sessionID: string): Promise<boolean> {
    return this.request(`/session/${sessionID}/abort`, {
      method: "POST",
    })
  }

  async *streamEvents(sessionID: string): AsyncGenerator<any> {
    const headers: Record<string, string> = {
      Accept: "text/event-stream",
    }

    if (this.directory) {
      headers["x-opencode-directory"] = this.directory
    }

    const response = await fetch(`${this.baseUrl}/session/${sessionID}/event`, {
      headers,
    })

    if (!response.ok || !response.body) {
      throw new Error(`Failed to connect to event stream: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data.trim()) {
            try {
              yield JSON.parse(data)
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    }
  }
}
