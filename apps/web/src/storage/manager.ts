import type { Ref } from 'vue'
import type { StorageEngine } from '@/storage/engine'
import { customRef, ref, toRaw, watch } from 'vue'
import { IndexedDBEngine, LocalStorageEngine, RestfulStorageEngine } from '@/storage/engines/indexed-db'
import { isCacheKey } from '@/storage/keys'
import { isStorageQuotaError, warnStorageQuota } from '@/storage/quota'
import { trimCacheValue } from '@/storage/repositories/cache'

export { IndexedDBEngine, LocalStorageEngine, RestfulStorageEngine }
export type { StorageEngine }

/** Unified storage manager. */
class StorageManager {
  private engine: StorageEngine = new LocalStorageEngine()

  setEngine(engine: StorageEngine): void {
    this.engine = engine
  }

  getEngine(): StorageEngine {
    return this.engine
  }

  /** Serialized values written by reactive() but not yet flushed to the engine. */
  private pendingWrites = new Map<string, string>()

  /** localStorage backup of pendingWrites, written on pagehide (engine writes may not survive tab kill). */
  private static readonly PAGEHIDE_BACKUP_KEY = `MD__pending_writes_backup`

  /** Sync read (available after initStorage preload). */
  getSync(key: string): string | null {
    // Prefer the pending overlay: debounced reactive writes must be visible to
    // sync readers (e.g. cloud sync's collectChangedSettings) immediately.
    const pending = this.pendingWrites.get(key)
    if (pending !== undefined)
      return pending
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
    const pending = this.pendingWrites.get(key)
    if (pending !== undefined)
      return pending
    return this.engine.get(key)
  }

  async set(key: string, value: string): Promise<void> {
    // External writes win over any debounced reactive snapshot for the same key.
    this.pendingWrites.delete(key)
    return this.writeToEngine(key, value)
  }

  /** Engine write that keeps the pending overlay intact (used by the debounced flush). */
  private writeToEngine(key: string, value: string): Promise<void> {
    const toStore = isCacheKey(key) ? trimCacheValue(key, value) : value
    return this.engine.set(key, toStore)
  }

  /**
   * Mirror pendingWrites to a synchronous localStorage backup (or clear it when
   * nothing is pending). Called on pagehide and after each successful flush.
   */
  private refreshPagehideBackup(): void {
    if (typeof localStorage === `undefined`)
      return
    try {
      if (this.pendingWrites.size === 0) {
        localStorage.removeItem(StorageManager.PAGEHIDE_BACKUP_KEY)
        return
      }
      localStorage.setItem(
        StorageManager.PAGEHIDE_BACKUP_KEY,
        JSON.stringify(Object.fromEntries(this.pendingWrites)),
      )
    }
    catch {
      // Quota / privacy mode — the backup is best effort only.
    }
  }

  /**
   * Re-apply writes that were backed up on pagehide but never reached the
   * engine. Must run after setEngine() with the real (preloaded) engine.
   */
  async restorePendingWrites(): Promise<void> {
    if (typeof localStorage === `undefined`)
      return
    const raw = localStorage.getItem(StorageManager.PAGEHIDE_BACKUP_KEY)
    if (!raw)
      return
    localStorage.removeItem(StorageManager.PAGEHIDE_BACKUP_KEY)
    let entries: Record<string, string>
    try {
      entries = JSON.parse(raw)
    }
    catch {
      return
    }
    for (const [key, value] of Object.entries(entries)) {
      try {
        await this.writeToEngine(key, value)
      }
      catch (error) {
        console.error(`[Storage] Failed to restore pending write:`, key, error)
      }
    }
  }

  async getJSON<T>(key: string, defaultValue: T): Promise<T>
  async getJSON<T>(key: string): Promise<T | null>
  async getJSON<T>(key: string, defaultValue?: T): Promise<T | null> {
    const pending = this.pendingWrites.get(key)
    const value = pending !== undefined ? pending : await this.engine.get(key)
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
    this.pendingWrites.delete(key)
    return this.engine.remove(key)
  }

  async has(key: string): Promise<boolean> {
    if (this.pendingWrites.has(key))
      return true
    return this.engine.has(key)
  }

  async clear(): Promise<void> {
    this.pendingWrites.clear()
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
      // Deep watchers fire on every keystroke-level mutation. Serialize eagerly
      // into the pendingWrites overlay (so sync reads stay current), but
      // coalesce the actual engine writes; flush on pagehide so the final state
      // is never lost.
      let timer: ReturnType<typeof setTimeout> | null = null

      const flush = () => {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }
        const value = this.pendingWrites.get(key)
        if (value === undefined)
          return

        this.writeToEngine(key, value)
          .then(() => {
            // Drop the overlay entry only if no newer write arrived meanwhile.
            if (this.pendingWrites.get(key) === value)
              this.pendingWrites.delete(key)
            // Keep any pagehide backup in sync once the engine has the data.
            this.refreshPagehideBackup()
          })
          .catch((error) => {
            if (isStorageQuotaError(error))
              warnStorageQuota()
            console.error(`[Storage] Failed to save reactive data:`, key, error)
          })
      }

      watch(
        data,
        () => {
          try {
            const serialized = isStringType
              ? data.value as string
              : JSON.stringify(toRaw(data.value))
            this.pendingWrites.set(key, serialized)
            if (timer)
              clearTimeout(timer)
            timer = setTimeout(flush, 300)
          }
          catch (error) {
            console.error(`[Storage] Failed to stringify reactive data:`, key, error)
          }
        },
        { deep: true },
      )

      if (typeof window !== `undefined`) {
        window.addEventListener(`pagehide`, () => {
          // The async engine flush may not finish before the tab is killed, so
          // also snapshot pending writes synchronously; restored on next launch.
          flush()
          this.refreshPagehideBackup()
        })
      }
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
