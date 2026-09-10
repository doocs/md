import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames } from 'idb'
import { openDB } from 'idb'
import {
  DB_NAME,
  DB_VERSION,
  LEGACY_EMOJI_PACK_KEY,
  STORE_CACHE,
  STORE_DOCUMENTS,
  STORE_META,
  STORE_SECRETS,
  STORE_SETTINGS,
} from './keys'

export interface StoredDocument {
  id: string
  title: string
  content: string
  history: { datetime: number | string, content: string }[]
  createDatetime: string
  updateDatetime: string
  parentId?: string | null
  collapsed?: boolean
}

export interface KVRecord {
  key: string
  value: string
}

export interface MetaRecord {
  key: string
  value: string
}

interface MdDBSchema extends DBSchema {
  documents: {
    key: string
    value: StoredDocument
    indexes: { updateDatetime: string, parentId: string }
  }
  settings: {
    key: string
    value: KVRecord
  }
  secrets: {
    key: string
    value: KVRecord
  }
  cache: {
    key: string
    value: KVRecord
  }
  meta: {
    key: string
    value: MetaRecord
  }
  /** Legacy v3 store, removed during the v4 upgrade. */
  emoji: {
    key: string
    value: Blob
  }
}

export type MdDatabase = IDBPDatabase<MdDBSchema>
export type UpgradeTx = IDBPTransaction<MdDBSchema, StoreNames<MdDBSchema>[], 'versionchange'>

let dbPromise: Promise<MdDatabase> | null = null

/** Exported for testing. Reuses the versionchange transaction supplied by idb. */
export async function upgradeDB(
  db: IDBPDatabase<MdDBSchema>,
  oldVersion: number,
  _newVersion: number | null,
  transaction: UpgradeTx,
): Promise<void> {
  if (oldVersion < 1) {
    if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
      const docStore = db.createObjectStore(STORE_DOCUMENTS, { keyPath: `id` })
      docStore.createIndex(`updateDatetime`, `updateDatetime`)
      docStore.createIndex(`parentId`, `parentId`)
    }
    if (!db.objectStoreNames.contains(STORE_SETTINGS))
      db.createObjectStore(STORE_SETTINGS, { keyPath: `key` })
    if (!db.objectStoreNames.contains(STORE_SECRETS))
      db.createObjectStore(STORE_SECRETS, { keyPath: `key` })
    if (!db.objectStoreNames.contains(STORE_CACHE))
      db.createObjectStore(STORE_CACHE, { keyPath: `key` })
    if (!db.objectStoreNames.contains(STORE_META))
      db.createObjectStore(STORE_META, { keyPath: `key` })
  }

  // v4 replaces local emoji packs with the cloud-backed system. Remove both
  // metadata and binaries once; users explicitly do not migrate local packs.
  if (oldVersion < 4 && db.objectStoreNames.contains(STORE_SETTINGS)) {
    await transaction.objectStore(STORE_SETTINGS).delete(LEGACY_EMOJI_PACK_KEY)
  }
  if (oldVersion < 4 && db.objectStoreNames.contains(STORE_CACHE)) {
    const cacheStore = transaction.objectStore(STORE_CACHE as StoreNames<MdDBSchema>)
    let cursor = await cacheStore.openCursor()
    while (cursor) {
      const row = cursor.value as { key?: string, value?: unknown }
      if (typeof row?.key === `string` && row.key.startsWith(`MD__emoji_blob:`))
        await cursor.delete()
      cursor = await cursor.continue()
    }
  }
  if (oldVersion < 4 && db.objectStoreNames.contains(`emoji`))
    db.deleteObjectStore(`emoji`)
}

export function getDatabase(): Promise<MdDatabase> {
  if (!dbPromise) {
    dbPromise = openDB<MdDBSchema>(DB_NAME, DB_VERSION, {
      // Delegate to the exported upgradeDB so the versionchange transaction
      // idb provides is reused. Opening db.transaction(...) here would try to
      // start a new transaction while the versionchange one is still running
      // and throw InvalidStateError.
      async upgrade(db, oldVersion, newVersion, transaction) {
        await upgradeDB(db, oldVersion, newVersion, transaction as UpgradeTx)
      },
    })
  }
  return dbPromise
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDatabase()
  const row = await db.get(STORE_META, key)
  return row?.value ?? null
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDatabase()
  await db.put(STORE_META, { key, value })
}
