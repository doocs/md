import type { KVRecord } from '@/storage/db'
import type { StorageEngine } from '@/storage/engine'
import { getDatabase } from '@/storage/db'
import { resolveStoreName } from '@/storage/keys'
import { isStorageQuotaError, warnStorageQuota } from '@/storage/quota'

type StoreName = ReturnType<typeof resolveStoreName>

/**
 * IndexedDB KV 引擎：settings / secrets / cache 三个 store。
 * 内存 cache 在 preload 后支持同步读，供 store.reactive 首屏初始化。
 */
export class IndexedDBEngine implements StorageEngine {
  private cache = new Map<string, string>()
  private preloaded = false

  supportsSyncRead(): boolean {
    return this.preloaded
  }

  getSync(key: string): string | null {
    return this.cache.get(key) ?? null
  }

  async preload(): Promise<void> {
    const db = await getDatabase()
    const stores: StoreName[] = [`settings`, `secrets`, `cache`]
    for (const storeName of stores) {
      const rows = await db.getAll(storeName)
      for (const row of rows)
        this.cache.set(row.key, row.value)
    }
    this.preloaded = true
  }

  async get(key: string): Promise<string | null> {
    if (this.cache.has(key))
      return this.cache.get(key)!

    const db = await getDatabase()
    const storeName = resolveStoreName(key)
    const row = await db.get(storeName, key)
    const value = row?.value ?? null
    if (value !== null)
      this.cache.set(key, value)
    return value
  }

  async set(key: string, value: string): Promise<void> {
    const db = await getDatabase()
    const storeName = resolveStoreName(key)
    const record: KVRecord = { key, value }
    await db.put(storeName, record)
    this.cache.set(key, value)
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key)
    const db = await getDatabase()
    const storeName = resolveStoreName(key)
    await db.delete(storeName, key)
  }

  async has(key: string): Promise<boolean> {
    if (this.cache.has(key))
      return true
    const db = await getDatabase()
    const storeName = resolveStoreName(key)
    const row = await db.get(storeName, key)
    return row !== undefined
  }

  async clear(): Promise<void> {
    const db = await getDatabase()
    await Promise.all([
      db.clear(`settings`),
      db.clear(`secrets`),
      db.clear(`cache`),
    ])
    for (const key of [...this.cache.keys()])
      this.cache.delete(key)
  }

  async keys(): Promise<string[]> {
    return [...this.cache.keys()]
  }
}

export class LocalStorageEngine implements StorageEngine {
  supportsSyncRead(): boolean {
    return true
  }

  getSync(key: string): string | null {
    try {
      return localStorage.getItem(key)
    }
    catch {
      return null
    }
  }

  async get(key: string): Promise<string | null> {
    return this.getSync(key)
  }

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value)
    }
    catch (error) {
      if (isStorageQuotaError(error))
        warnStorageQuota()
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(key) !== null
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage)
  }
}

/** RESTful API 存储引擎 - 用于远程存储（保留扩展点） */
export class RestfulStorageEngine implements StorageEngine {
  constructor(
    private baseURL: string,
    private getAuthToken?: () => string | null,
  ) {}

  private async request(method: string, endpoint: string, data?: unknown): Promise<unknown> {
    const headers: HeadersInit = {
      'Content-Type': `application/json`,
    }

    const token = this.getAuthToken?.()
    if (token)
      headers.Authorization = `Bearer ${token}`

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok)
      throw new Error(`Storage API error: ${response.statusText}`)

    return response.json()
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.request(`GET`, `/storage/${encodeURIComponent(key)}`) as { value?: string }
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
    return (await this.get(key)) !== null
  }

  async clear(): Promise<void> {
    await this.request(`DELETE`, `/storage`)
  }

  async keys(): Promise<string[]> {
    const result = await this.request(`GET`, `/storage/keys`) as { keys?: string[] }
    return result.keys ?? []
  }
}
