import type { DBSchema, IDBPDatabase } from 'idb'
import { openDB } from 'idb'
import {
  DB_NAME,
  DB_VERSION,
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
}

export type MdDatabase = IDBPDatabase<MdDBSchema>

let dbPromise: Promise<MdDatabase> | null = null

export function getDatabase(): Promise<MdDatabase> {
  if (!dbPromise) {
    dbPromise = openDB<MdDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
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
