import * as vscode from "vscode"
import { spawn, ChildProcess } from "child_process"

export interface ServerOptions {
  hostname?: string
  port?: number
  timeout?: number
}

export class OpencodeServer {
  private proc: ChildProcess | undefined
  private url: string | undefined
  private outputChannel: vscode.OutputChannel
  private starting = false

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel("OpenCode Server")
  }

  get serverUrl(): string | undefined {
    return this.url
  }

  get isRunning(): boolean {
    return this.proc !== undefined && this.url !== undefined
  }

  async start(options?: ServerOptions): Promise<string> {
    if (this.isRunning) {
      return this.url!
    }

    if (this.starting) {
      // Wait for existing start to complete
      while (this.starting) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      if (this.url) return this.url
    }

    this.starting = true

    const hostname = options?.hostname ?? "127.0.0.1"
    const port = options?.port ?? 4096
    const timeout = options?.timeout ?? 10000

    this.outputChannel.appendLine(`Starting OpenCode server on ${hostname}:${port}...`)

    const args = ["serve", `--hostname=${hostname}`, `--port=${port}`]

    try {
      this.proc = spawn("opencode", args, {
        env: {
          ...process.env,
          OPENCODE_CALLER: "vscode-chat",
        },
        shell: true,
      })

      this.proc.stdout?.on("data", (chunk) => {
        this.outputChannel.append(chunk.toString())
      })

      this.proc.stderr?.on("data", (chunk) => {
        this.outputChannel.append(chunk.toString())
      })

      this.proc.on("error", (error) => {
        this.outputChannel.appendLine(`Server error: ${error.message}`)
        this.cleanup()
      })

      this.proc.on("exit", (code) => {
        this.outputChannel.appendLine(`Server exited with code ${code}`)
        this.cleanup()
      })

      // Wait for server to be ready
      this.url = await this.waitForServer(`http://${hostname}:${port}`, timeout)
      this.outputChannel.appendLine(`Server started at ${this.url}`)
      this.starting = false
      return this.url
    } catch (error) {
      this.starting = false
      this.cleanup()
      throw error
    }
  }

  private async waitForServer(url: string, timeout: number): Promise<string> {
    const start = Date.now()
    const healthUrl = `${url}/global/health`

    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(healthUrl)
        if (response.ok) {
          return url
        }
      } catch {
        // Server not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    throw new Error(`Server failed to start within ${timeout}ms`)
  }

  async stop(): Promise<void> {
    if (!this.proc) return

    this.outputChannel.appendLine("Stopping OpenCode server...")

    return new Promise((resolve) => {
      if (!this.proc) {
        resolve()
        return
      }

      const onExit = () => {
        this.cleanup()
        resolve()
      }

      this.proc.once("exit", onExit)

      // Try graceful shutdown first
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(this.proc.pid), "/f", "/t"], { shell: true })
      } else {
        this.proc.kill("SIGTERM")
      }

      // Force kill after 3 seconds
      setTimeout(() => {
        if (this.proc) {
          this.proc.kill("SIGKILL")
        }
      }, 3000)
    })
  }

  private cleanup() {
    this.proc = undefined
    this.url = undefined
    this.starting = false
  }

  showOutput() {
    this.outputChannel.show()
  }

  dispose() {
    this.stop()
    this.outputChannel.dispose()
  }
}
