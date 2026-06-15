/**
 * 存储引擎接口 - 完全异步化，支持同步读缓存（initStorage 预加载后）
 */
export interface StorageEngine {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  remove: (key: string) => Promise<void>
  has: (key: string) => Promise<boolean>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
  /** 预加载完成后可用于 store.reactive 同步初始化 */
  getSync?: (key: string) => string | null
  supportsSyncRead?: () => boolean
}
