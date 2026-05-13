import { inject, InjectionKey } from "vue"

/**
 * 数据存储接口，对应原 SolidJS 的 Data 类型
 */
export interface DataStore {
  directory: string
  session?: any[]
  message?: Record<string, any[]>
  part?: Record<string, any[]>
  // 添加其他需要的属性...
}

/**
 * 数据上下文接口，对应原 SolidJS 的 useData 返回类型
 */
export interface DataContext {
  store: DataStore
  directory: string
  respondToPermission?: (input: {
    sessionID: string
    permissionID: string
    response: "once" | "always" | "reject"
  }) => void
  replyToQuestion?: (input: { requestID: string; answers: any[] }) => void
  rejectQuestion?: (input: { requestID: string }) => void
  navigateToSession?: (sessionID: string) => void
}

// 创建注入键
export const DATA_CONTEXT_KEY: InjectionKey<DataContext> = Symbol("dataContext")

/**
 * 使用数据上下文的 composable
 * 对应原 SolidJS 的 useData() hook
 *
 * @returns DataContext 数据上下文对象
 * @throws 如果在没有提供 DataContext 的组件中使用
 *
 * @example
 * ```vue
 * <script setup>
 * import { useData } from './composables/useData'
 *
 * const data = useData()
 * console.log(data.directory)
 * console.log(data.store.session)
 * </script>
 * ```
 */
export function useData(): DataContext {
  const context = inject(DATA_CONTEXT_KEY)

  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }

  return context
}
