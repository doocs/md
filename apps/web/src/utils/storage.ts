/**
 * 统一存储抽象层
 */

import type { RemovableRef } from '@vueuse/core'
import { useStorage as vueUseStorage } from '@vueuse/core'

/**
 * 存储适配器接口
 */
export interface StorageAdapter {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

/**
 * 默认存储适配器
 */
export class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    return localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value)
  }

  removeItem(key: string): void {
    localStorage.removeItem(key)
  }
}

/**
 * 全局存储适配器实例
 * 可以通过 setStorageAdapter 切换存储方式
 */
let storageAdapter: StorageAdapter = new LocalStorageAdapter()

/**
 * 设置全局存储适配器
 * @param adapter 新的存储适配器
 * @example
 * ```ts
 * // 切换到自定义存储
 * setStorageAdapter(new CustomStorageAdapter())
 * ```
 */
export function setStorageAdapter(adapter: StorageAdapter) {
  storageAdapter = adapter
}

/**
 * 获取当前存储适配器
 */
export function getStorageAdapter(): StorageAdapter {
  return storageAdapter
}

/**
 * 统一的存储 Hook（响应式）
 * 基于 VueUse 的 useStorage，但使用统一的适配器
 *
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 响应式引用
 *
 * @example
 * ```ts
 * const theme = useStorage('theme', 'light')
 * theme.value = 'dark' // 自动同步到存储
 * ```
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
): RemovableRef<T> {
  // 使用 VueUse 的 useStorage，但指定使用我们的适配器
  return vueUseStorage(key, defaultValue, storageAdapter as any)
}

/**
 * 同步获取存储值（非响应式）
 * @param key 存储键名
 * @returns 存储的字符串值或 null
 */
export function getStorageItem(key: string): string | null {
  return storageAdapter.getItem(key)
}

/**
 * 同步设置存储值（非响应式）
 * @param key 存储键名
 * @param value 要存储的值（会自动转为字符串）
 */
export function setStorageItem(key: string, value: string): void {
  storageAdapter.setItem(key, value)
}

/**
 * 删除存储值
 * @param key 存储键名
 */
export function removeStorageItem(key: string): void {
  storageAdapter.removeItem(key)
}

/**
 * 获取 JSON 格式的存储值
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 解析后的对象或默认值
 */
export function getStorageJSON<T>(key: string, defaultValue: T): T {
  const value = storageAdapter.getItem(key)
  if (!value) {
    return defaultValue
  }
  try {
    return JSON.parse(value) as T
  }
  catch {
    return defaultValue
  }
}

/**
 * 设置 JSON 格式的存储值
 * @param key 存储键名
 * @param value 要存储的对象
 */
export function setStorageJSON<T>(key: string, value: T): void {
  storageAdapter.setItem(key, JSON.stringify(value))
}

/**
 * 获取响应式的 JSON 存储
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 响应式引用
 */
export function useStorageJSON<T>(
  key: string,
  defaultValue: T,
): RemovableRef<T> {
  return useStorage(key, defaultValue)
}
