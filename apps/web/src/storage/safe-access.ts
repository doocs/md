import { store } from '@/storage/manager'
import { isStorageQuotaError, parseStoredValue, warnStorageQuota } from '@/storage/quota'

export { isStorageQuotaError, parseStoredValue, warnStorageQuota }

/** 同步读取（initStorage 完成后走 IndexedDB 内存缓存） */
export function safeGetItem(key: string): string | null {
  try {
    if (store.supportsSyncRead())
      return store.getSync(key)

    return localStorage.getItem(key)
  }
  catch {
    return null
  }
}

/** 写入存储（异步持久化，同步更新内存缓存） */
export function safeSetItem(key: string, value: string): boolean {
  try {
    void store.set(key, value)
    return true
  }
  catch (error) {
    if (isStorageQuotaError(error))
      warnStorageQuota()
    return false
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    void store.remove(key)
    return true
  }
  catch {
    return false
  }
}
