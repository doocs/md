import type { StoredDocument } from '@/storage/db'
import type { Post } from '@/types/post'
import { getDatabase } from '@/storage/db'
import { LEGACY_POSTS_KEY, STORE_DOCUMENTS } from '@/storage/keys'
import { store } from '@/storage/manager'
import { isStorageQuotaError, warnStorageQuota } from '@/storage/quota'

function toStored(post: Post): StoredDocument {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    history: post.history ?? [],
    createDatetime: new Date(post.createDatetime).toISOString(),
    updateDatetime: new Date(post.updateDatetime).toISOString(),
    parentId: post.parentId ?? null,
    collapsed: post.collapsed,
  }
}

function fromStored(doc: StoredDocument): Post {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    history: doc.history ?? [],
    createDatetime: new Date(doc.createDatetime),
    updateDatetime: new Date(doc.updateDatetime),
    parentId: doc.parentId ?? null,
    collapsed: doc.collapsed,
  }
}

let cachedPosts: Post[] | null = null
let useLegacyStorage = false
let writeQueue: Promise<void> = Promise.resolve()

/** IndexedDB 不可用时，回退到 localStorage 整包存储 */
export function setUseLegacyDocumentStorage(enabled: boolean): void {
  useLegacyStorage = enabled
}

export function isUsingLegacyDocumentStorage(): boolean {
  return useLegacyStorage
}

export function getLoadedDocuments(): Post[] | null {
  return cachedPosts
}

export function clearDocumentCache(): void {
  cachedPosts = null
}

function runSerialized<T>(task: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(task, task)
  writeQueue = next.then(() => {}, () => {})
  return next
}

async function loadFromLegacy(): Promise<Post[]> {
  const raw = await store.get(LEGACY_POSTS_KEY)
  if (!raw)
    return []
  try {
    const parsed = JSON.parse(raw) as Post[]
    if (!Array.isArray(parsed))
      return []
    return parsed.map((post, index) => ({
      ...post,
      createDatetime: new Date(post.createDatetime ?? Date.now() + index),
      updateDatetime: new Date(post.updateDatetime ?? Date.now() + index),
      history: post.history ?? [],
    }))
  }
  catch {
    return []
  }
}

async function saveAllLegacy(posts: Post[]): Promise<void> {
  await store.setJSON(LEGACY_POSTS_KEY, posts)
  cachedPosts = [...posts]
}

async function saveAllIndexedDB(posts: Post[]): Promise<void> {
  const db = await getDatabase()
  const existing = await db.getAllKeys(STORE_DOCUMENTS)
  const nextIds = new Set(posts.map(p => p.id))
  const tx = db.transaction(STORE_DOCUMENTS, `readwrite`)
  await Promise.all([
    ...posts.map(p => tx.store.put(toStored(p))),
    ...existing.filter(id => !nextIds.has(String(id))).map(id => tx.store.delete(id)),
  ])
  await tx.done
  cachedPosts = [...posts]
}

async function savePostIndexedDB(post: Post): Promise<void> {
  const db = await getDatabase()
  await db.put(STORE_DOCUMENTS, toStored(post))
  if (cachedPosts) {
    const idx = cachedPosts.findIndex(p => p.id === post.id)
    if (idx === -1)
      cachedPosts.push(post)
    else
      cachedPosts[idx] = post
  }
}

export const documentRepo = {
  async loadAll(): Promise<Post[]> {
    if (cachedPosts)
      return cachedPosts

    if (useLegacyStorage) {
      cachedPosts = await loadFromLegacy()
      return cachedPosts
    }

    const db = await getDatabase()
    const rows = await db.getAll(STORE_DOCUMENTS)
    cachedPosts = rows.map(fromStored)
    return cachedPosts
  },

  async savePost(post: Post): Promise<void> {
    return runSerialized(async () => {
      try {
        if (useLegacyStorage) {
          const all = cachedPosts ?? await this.loadAll()
          const idx = all.findIndex(p => p.id === post.id)
          if (idx === -1)
            all.push(post)
          else
            all[idx] = post
          await saveAllLegacy(all)
          return
        }
        await savePostIndexedDB(post)
      }
      catch (error) {
        if (isStorageQuotaError(error))
          warnStorageQuota()
        console.error(`[documentRepo] savePost failed:`, error)
        throw error
      }
    })
  },

  async saveAll(posts: Post[]): Promise<void> {
    return runSerialized(async () => {
      try {
        if (useLegacyStorage) {
          await saveAllLegacy(posts)
          return
        }
        await saveAllIndexedDB(posts)
      }
      catch (error) {
        if (isStorageQuotaError(error))
          warnStorageQuota()
        console.error(`[documentRepo] saveAll failed:`, error)
        throw error
      }
    })
  },

  async deletePost(id: string): Promise<void> {
    return runSerialized(async () => {
      if (useLegacyStorage) {
        const all = (cachedPosts ?? await this.loadAll()).filter(p => p.id !== id)
        await saveAllLegacy(all)
        return
      }
      const db = await getDatabase()
      await db.delete(STORE_DOCUMENTS, id)
      if (cachedPosts)
        cachedPosts = cachedPosts.filter(p => p.id !== id)
    })
  },

  async clear(): Promise<void> {
    return runSerialized(async () => {
      if (useLegacyStorage) {
        await store.remove(LEGACY_POSTS_KEY)
        cachedPosts = []
        return
      }
      const db = await getDatabase()
      await db.clear(STORE_DOCUMENTS)
      cachedPosts = []
    })
  },
}
