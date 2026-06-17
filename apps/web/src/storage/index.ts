import { getMeta, setMeta } from '@/storage/db'
import { IndexedDBEngine } from '@/storage/engines/indexed-db'
import { LOCALSTORAGE_CLEANED_KEY, MIGRATION_V1_KEY } from '@/storage/keys'
import { store } from '@/storage/manager'
import {
  cleanupMigratedLocalStorage,
  migrateFromLocalStorage,
  migrateLegacyThemeSettings,
  migrateMpProfile,
} from '@/storage/migrate/from-local-storage'
import { documentRepo, setUseLegacyDocumentStorage } from '@/storage/repositories/documents'

export type { StorageEngine } from '@/storage/engine'
export { IndexedDBEngine, LocalStorageEngine, RestfulStorageEngine } from '@/storage/engines/indexed-db'
export { store } from '@/storage/manager'
export { clearCacheStore } from '@/storage/migrate/from-local-storage'
export { addPrefix } from '@/storage/prefix'
export { documentRepo, getLoadedDocuments, isUsingLegacyDocumentStorage } from '@/storage/repositories/documents'
export {
  isStorageQuotaError,
  parseStoredValue,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
  warnStorageQuota,
} from '@/storage/safe-access'

let readyPromise: Promise<void> | null = null
let initComplete = false

async function initLegacyFallback(reason: string): Promise<void> {
  console.warn(`[Storage] ${reason} — using localStorage fallback`)
  setUseLegacyDocumentStorage(true)
  await documentRepo.loadAll()
  initComplete = true
}

/** 初始化 IndexedDB 存储（在 createApp 之前 await） */
export function initStorage(): Promise<void> {
  if (readyPromise)
    return readyPromise

  readyPromise = (async () => {
    if (typeof indexedDB === `undefined`) {
      await initLegacyFallback(`IndexedDB unavailable`)
      return
    }

    try {
      const engine = new IndexedDBEngine()

      const migrated = await getMeta(MIGRATION_V1_KEY)
      let migrationKeys: string[] | undefined
      if (migrated !== `1`) {
        const result = await migrateFromLocalStorage(engine)
        if (!result.ok) {
          console.error(`[Storage] localStorage migration failed; will retry on next launch`)
          await initLegacyFallback(`Migration incomplete`)
          return
        }
        await setMeta(MIGRATION_V1_KEY, `1`)
        migrationKeys = result.keys
      }

      await engine.preload()
      await migrateLegacyThemeSettings(engine)
      await migrateMpProfile(engine)

      const cleaned = await getMeta(LOCALSTORAGE_CLEANED_KEY)
      if (cleaned !== `1`) {
        cleanupMigratedLocalStorage(migrationKeys)
        await setMeta(LOCALSTORAGE_CLEANED_KEY, `1`)
      }

      store.setEngine(engine)
      await documentRepo.loadAll()
      initComplete = true
    }
    catch (error) {
      console.error(`[Storage] IndexedDB init failed:`, error)
      await initLegacyFallback(`IndexedDB init error`)
    }
  })()

  return readyPromise
}

export function storageReady(): Promise<void> {
  return readyPromise ?? Promise.resolve()
}

export function isStorageReady(): boolean {
  return initComplete
}
