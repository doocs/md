import { store } from '@/storage/manager'
import { isStorageQuotaError, parseStoredValue, warnStorageQuota } from '@/storage/quota'

export { isStorageQuotaError, parseStoredValue, warnStorageQuota }

/** Sync read (uses in-memory cache after initStorage). */
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

/** Write storage (async persist, sync memory cache update). */
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
