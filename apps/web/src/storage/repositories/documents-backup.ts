import type { StoredDocument } from '@/storage/db'
import type { Post } from '@/types/post'
import { normalizePostHistory } from '@/lib/format/datetime'
import { addPrefix } from '@/storage/prefix'

/** Sync localStorage snapshot written on pagehide / login redirect. */
export const DOCUMENTS_PAGEHIDE_BACKUP_KEY = addPrefix(`documents_pagehide_backup`)

let backupGeneration = 0

export function toBackupDocument(post: Post): StoredDocument {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    history: normalizePostHistory(post.history),
    createDatetime: new Date(post.createDatetime).toISOString(),
    updateDatetime: new Date(post.updateDatetime).toISOString(),
    parentId: post.parentId ?? null,
    collapsed: post.collapsed,
  }
}

export function fromBackupDocument(doc: StoredDocument): Post {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    history: normalizePostHistory(doc.history),
    createDatetime: new Date(doc.createDatetime),
    updateDatetime: new Date(doc.updateDatetime),
    parentId: doc.parentId ?? null,
    collapsed: doc.collapsed,
  }
}

export function parseDocumentsBackup(raw: string | null): Post[] | null {
  if (!raw)
    return null
  try {
    const parsed = JSON.parse(raw) as StoredDocument[]
    if (!Array.isArray(parsed) || parsed.length === 0)
      return null
    return parsed.map(fromBackupDocument)
  }
  catch {
    return null
  }
}

export function serializeDocumentsBackup(posts: Post[]): string {
  return JSON.stringify(posts.map(toBackupDocument))
}

/** Write a full document snapshot and return a generation for safe later clear. */
export function writeDocumentsPagehideBackup(posts: Post[]): number {
  const generation = ++backupGeneration
  if (typeof localStorage === `undefined`)
    return generation
  try {
    localStorage.setItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY, serializeDocumentsBackup(posts))
  }
  catch {
    // Quota / privacy mode — best effort only.
  }
  return generation
}

export function peekDocumentsPagehideBackup(): Post[] | null {
  if (typeof localStorage === `undefined`)
    return null
  try {
    return parseDocumentsBackup(localStorage.getItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY))
  }
  catch {
    return null
  }
}

export function clearDocumentsPagehideBackup(generation?: number): void {
  if (generation !== undefined && generation !== backupGeneration)
    return
  if (typeof localStorage === `undefined`)
    return
  try {
    localStorage.removeItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY)
  }
  catch {
    // ignore
  }
}
