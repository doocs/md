/**
 * 现代化存储抽象层 - 完全异步化设计
 * 支持本地存储和 RESTful API 存储，便于后续扩展
 */

import type { Ref } from 'vue'
import { customRef, ref, watch } from 'vue'

/**
 * 存储引擎接口 - 完全异步化
 */
export interface StorageEngine {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  remove: (key: string) => Promise<void>
  has: (key: string) => Promise<boolean>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
}

/**
 * 本地存储引擎 - 使用 localStorage
 */
export class LocalStorageEngine implements StorageEngine {
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key)
    }
    catch (error) {
      console.error(`[Storage] Failed to get item:`, key, error)
      return null
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value)
    }
    catch (error) {
      console.error(`[Storage] Failed to set item:`, key, error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    }
    catch (error) {
      console.error(`[Storage] Failed to remove item:`, key, error)
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      return localStorage.getItem(key) !== null
    }
    catch {
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear()
    }
    catch (error) {
      console.error(`[Storage] Failed to clear storage:`, error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      return Object.keys(localStorage)
    }
    catch {
      return []
    }
  }
}

/**
 * RESTful API 存储引擎 - 用于远程存储
 */
export class RestfulStorageEngine implements StorageEngine {
  constructor(
    private baseURL: string,
    private getAuthToken?: () => string | null,
  ) {}

  private async request(method: string, endpoint: string, data?: any): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': `application/json`,
    }

    const token = this.getAuthToken?.()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Storage API error: ${response.statusText}`)
    }

    return response.json()
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.request(`GET`, `/storage/${encodeURIComponent(key)}`)
      return result.value ?? null
    }
    catch {
      return null
    }
  }

  async set(key: string, value: string): Promise<void> {
    await this.request(`PUT`, `/storage/${encodeURIComponent(key)}`, { value })
  }

  async remove(key: string): Promise<void> {
    await this.request(`DELETE`, `/storage/${encodeURIComponent(key)}`)
  }

  async has(key: string): Promise<boolean> {
    try {
      await this.request(`HEAD`, `/storage/${encodeURIComponent(key)}`)
      return true
    }
    catch {
      return false
    }
  }

  async clear(): Promise<void> {
    await this.request(`DELETE`, `/storage`)
  }

  async keys(): Promise<string[]> {
    const result = await this.request(`GET`, `/storage/keys`)
    return result.keys ?? []
  }
}

/**
 * 统一存储管理器
 */
class StorageManager {
  private engine: StorageEngine = new LocalStorageEngine()

  /**
   * 切换存储引擎
   */
  setEngine(engine: StorageEngine): void {
    this.engine = engine
  }

  /**
   * 获取当前引擎
   */
  getEngine(): StorageEngine {
    return this.engine
  }

  /**
   * 获取字符串值
   */
  async get(key: string): Promise<string | null> {
    return this.engine.get(key)
  }

  /**
   * 设置字符串值
   */
  async set(key: string, value: string): Promise<void> {
    return this.engine.set(key, value)
  }

  /**
   * 获取 JSON 值（带默认值重载）
   */
  async getJSON<T>(key: string, defaultValue: T): Promise<T>
  async getJSON<T>(key: string): Promise<T | null>
  async getJSON<T>(key: string, defaultValue?: T): Promise<T | null> {
    const value = await this.engine.get(key)
    if (!value) {
      return (defaultValue ?? null) as T | null
    }

    try {
      return JSON.parse(value) as T
    }
    catch (error) {
      console.error(`[Storage] Failed to parse JSON for key:`, key, error)
      return (defaultValue ?? null) as T | null
    }
  }

  /**
   * 设置 JSON 值
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value)
      return this.engine.set(key, jsonString)
    }
    catch (error) {
      console.error(`[Storage] Failed to stringify JSON for key:`, key, error)
      throw error
    }
  }

  /**
   * 删除值
   */
  async remove(key: string): Promise<void> {
    return this.engine.remove(key)
  }

  /**
   * 检查键是否存在
   */
  async has(key: string): Promise<boolean> {
    return this.engine.has(key)
  }

  /**
   * 清空所有存储
   */
  async clear(): Promise<void> {
    return this.engine.clear()
  }

  /**
   * 获取所有键
   */
  async keys(): Promise<string[]> {
    return this.engine.keys()
  }

  /**
   * 创建响应式存储引用
   * - 对于 LocalStorageEngine：同步读取初始值，确保首次渲染正确
   * - 对于其他引擎：异步加载，加载完成后更新
   * - 自动监听变化并保存到存储
   */
  reactive<T>(key: string, defaultValue: T): Ref<T> {
    const isStringType = typeof defaultValue === `string`
    let initialValue: T = defaultValue

    // LocalStorageEngine 同步读取初始值
    if (this.engine instanceof LocalStorageEngine) {
      try {
        const stored = localStorage.getItem(key)
        if (stored !== null) {
          initialValue = isStringType ? (stored as T) : this.parseJSON(stored, defaultValue)
        }
      }
      catch (error) {
        console.error(`[Storage] Failed to read initial value:`, key, error)
      }
    }

    const data = ref<T>(initialValue) as Ref<T>

    // 非 LocalStorageEngine 异步加载
    if (!(this.engine instanceof LocalStorageEngine)) {
      const loadAsync = isStringType
        ? this.get(key).then(value => value !== null ? (value as T) : null)
        : this.getJSON<T>(key, defaultValue)

      loadAsync.then((value) => {
        if (value !== null) {
          data.value = value
        }
      })
    }

    // 监听变化并自动保存
    // 使用 Promise.resolve() 确保在下一个微任务中设置 watch，避免初始赋值触发保存
    Promise.resolve().then(() => {
      watch(
        data,
        (newValue) => {
          const savePromise = isStringType
            ? this.set(key, newValue as string)
            : this.setJSON(key, newValue)

          savePromise.catch((error) => {
            console.error(`[Storage] Failed to save reactive data:`, key, error)
          })
        },
        { deep: true },
      )
    })

    return data
  }

  /**
   * 创建自定义响应式存储引用
   * 支持自定义 getter/setter 转换逻辑
   */
  customReactive<T>(
    key: string,
    defaultValue: T,
    options?: {
      get?: (stored: T | null) => T
      set?: (value: T) => T
    },
  ): Ref<T> {
    let cachedValue: T = defaultValue

    // 异步加载初始值
    this.getJSON<T>(key, defaultValue).then((value) => {
      const stored = value ?? defaultValue
      cachedValue = options?.get ? options.get(stored) : stored
    })

    return customRef<T>((track, trigger) => ({
      get() {
        track()
        return cachedValue
      },
      set: (newValue: T) => {
        const valueToStore = options?.set ? options.set(newValue) : newValue
        cachedValue = valueToStore
        trigger()

        // 异步保存
        this.setJSON(key, valueToStore).catch((error: any) => {
          console.error(`[Storage] Failed to save custom reactive data:`, key, error)
        })
      },
    }))
  }

  /**
   * 解析 JSON 字符串的辅助方法
   */
  private parseJSON<T>(value: string, fallback: T): T {
    try {
      return JSON.parse(value) as T
    }
    catch {
      console.warn(`[Storage] Failed to parse JSON, using fallback`)
      return fallback
    }
  }
}

/**
 * 全局存储实例 - 统一通过 store.xxx 调用
 */
export const store = new StorageManager()
