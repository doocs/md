import type { Ref } from 'vue'
import type { StorageEngine } from '@/storage/engine'
import { customRef, ref, watch } from 'vue'
import { IndexedDBEngine, LocalStorageEngine, RestfulStorageEngine } from '@/storage/engines/indexed-db'
import { isCacheKey } from '@/storage/keys'
import { isStorageQuotaError, warnStorageQuota } from '@/storage/quota'
import { trimCacheValue } from '@/storage/repositories/cache'

export { IndexedDBEngine, LocalStorageEngine, RestfulStorageEngine }
export type { StorageEngine }

/**
 * 统一存储管理器
 */
class StorageManager {
  private engine: StorageEngine = new LocalStorageEngine()

  setEngine(engine: StorageEngine): void {
    this.engine = engine
  }

  getEngine(): StorageEngine {
    return this.engine
  }

  /** 同步读取（initStorage 预加载后可用） */
  getSync(key: string): string | null {
    if (this.engine.getSync)
      return this.engine.getSync(key)
    if (this.engine instanceof LocalStorageEngine)
      return this.engine.getSync(key)
    return null
  }

  supportsSyncRead(): boolean {
    return this.engine.supportsSyncRead?.() ?? false
  }

  async get(key: string): Promise<string | null> {
    return this.engine.get(key)
  }

  async set(key: string, value: string): Promise<void> {
    const toStore = isCacheKey(key) ? trimCacheValue(key, value) : value
    return this.engine.set(key, toStore)
  }

  async getJSON<T>(key: string, defaultValue: T): Promise<T>
  async getJSON<T>(key: string): Promise<T | null>
  async getJSON<T>(key: string, defaultValue?: T): Promise<T | null> {
    const value = await this.engine.get(key)
    if (!value)
      return (defaultValue ?? null) as T | null

    try {
      return JSON.parse(value) as T
    }
    catch (error) {
      console.error(`[Storage] Failed to parse JSON for key:`, key, error)
      return (defaultValue ?? null) as T | null
    }
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value)
      return this.set(key, jsonString)
    }
    catch (error) {
      console.error(`[Storage] Failed to stringify JSON for key:`, key, error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    return this.engine.remove(key)
  }

  async has(key: string): Promise<boolean> {
    return this.engine.has(key)
  }

  async clear(): Promise<void> {
    return this.engine.clear()
  }

  async keys(): Promise<string[]> {
    return this.engine.keys()
  }

  reactive<T>(key: string, defaultValue: T): Ref<T> {
    const isStringType = typeof defaultValue === `string`
    let initialValue: T = defaultValue

    if (this.supportsSyncRead()) {
      try {
        const stored = this.getSync(key)
        if (stored !== null)
          initialValue = isStringType ? (stored as T) : this.parseJSON(stored, defaultValue)
      }
      catch (error) {
        console.error(`[Storage] Failed to read initial value:`, key, error)
      }
    }
    else if (this.engine instanceof LocalStorageEngine) {
      try {
        const stored = this.engine.getSync(key)
        if (stored !== null)
          initialValue = isStringType ? (stored as T) : this.parseJSON(stored, defaultValue)
      }
      catch (error) {
        console.error(`[Storage] Failed to read initial value:`, key, error)
      }
    }

    const data = ref<T>(initialValue) as Ref<T>

    if (!this.supportsSyncRead() && !(this.engine instanceof LocalStorageEngine)) {
      const loadAsync = isStringType
        ? this.get(key).then(value => value !== null ? (value as T) : null)
        : this.getJSON<T>(key, defaultValue)

      loadAsync.then((value) => {
        if (value !== null)
          data.value = value
      })
    }

    Promise.resolve().then(() => {
      watch(
        data,
        (newValue) => {
          const savePromise = isStringType
            ? this.set(key, newValue as string)
            : this.setJSON(key, newValue)

          savePromise.catch((error) => {
            if (isStorageQuotaError(error))
              warnStorageQuota()
            console.error(`[Storage] Failed to save reactive data:`, key, error)
          })
        },
        { deep: true },
      )
    })

    return data
  }

  customReactive<T>(
    key: string,
    defaultValue: T,
    options?: {
      get?: (stored: T | null) => T
      set?: (value: T) => T
    },
  ): Ref<T> {
    let cachedValue: T = defaultValue

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

        this.setJSON(key, valueToStore).catch((error: unknown) => {
          if (isStorageQuotaError(error))
            warnStorageQuota()
          console.error(`[Storage] Failed to save custom reactive data:`, key, error)
        })
      },
    }))
  }

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

export const store = new StorageManager()
