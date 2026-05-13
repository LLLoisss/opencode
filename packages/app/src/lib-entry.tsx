/**
 * 库模式入口文件 - 用于构建可嵌入的模块
 */
import { render } from "solid-js/web"
import { PlatformProvider, type Platform } from "./context/platform"
import { AppBaseProviders, AppInterface } from "./app"
import pkg from "../package.json"
import "@/index.css"

// 导出类型
export type { Platform } from "./context/platform"

const DEFAULT_SERVER_URL_KEY = "opencode.settings.dat:defaultServerUrl"

/**
 * OpenCode 挂载配置
 */
export interface MountConfig {
  /** 默认服务器URL */
  serverUrl?: string
  /** 自定义平台配置 */
  platform?: Partial<Platform>
}

/**
 * 挂载 OpenCode 应用到指定容器
 * @param container - DOM容器元素
 * @param config - 可选配置
 * @returns 卸载函数
 */
export function mountOpenCode(container: HTMLElement, config?: MountConfig): () => void {
  // 创建默认平台配置
  const defaultPlatform: Platform = {
    platform: "web",
    version: pkg.version,
    openLink(url: string) {
      window.open(url, "_blank")
    },
    back() {
      window.history.back()
    },
    forward() {
      window.history.forward()
    },
    restart: async () => {
      window.location.reload()
    },
    notify: async (title, description, href) => {
      if (!("Notification" in window)) return

      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission().catch(() => "denied")
          : Notification.permission

      if (permission !== "granted") return

      const inView = document.visibilityState === "visible" && document.hasFocus()
      if (inView) return

      await Promise.resolve()
        .then(() => {
          const notification = new Notification(title, {
            body: description ?? "",
            icon: "https://opencode.ai/favicon-96x96-v3.png",
          })
          notification.onclick = () => {
            window.focus()
            if (href) {
              window.history.pushState(null, "", href)
              window.dispatchEvent(new PopStateEvent("popstate"))
            }
            notification.close()
          }
        })
        .catch(() => undefined)
    },
    getDefaultServerUrl: () => {
      if (typeof localStorage === "undefined") return null
      try {
        return localStorage.getItem(DEFAULT_SERVER_URL_KEY)
      } catch {
        return null
      }
    },
    setDefaultServerUrl: (url) => {
      if (typeof localStorage === "undefined") return
      try {
        if (url) {
          localStorage.setItem(DEFAULT_SERVER_URL_KEY, url)
          return
        }
        localStorage.removeItem(DEFAULT_SERVER_URL_KEY)
      } catch {
        return
      }
    },
    ...config?.platform,
  }

  // 渲染应用
  const dispose = render(
    () => (
      <PlatformProvider value={defaultPlatform}>
        <AppBaseProviders>
          <AppInterface defaultUrl={config?.serverUrl} />
        </AppBaseProviders>
      </PlatformProvider>
    ),
    container,
  )

  return dispose
}
