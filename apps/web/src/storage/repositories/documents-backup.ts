import type { Post, PostHistory } from '@/types/post'
import { normalizePostHistory } from '@/lib/format/datetime'
import { addPrefix } from '@/storage/prefix'

/** Sync localStorage snapshot written on pagehide / login redirect. */
export const DOCUMENTS_PAGEHIDE_BACKUP_KEY = addPrefix(`documents_pagehide_backup`)

/**
 * Compact post stored in localStorage. History is omitted so a full library
 * can fit under the ~5MB quota; crash recovery only needs the latest content.
 */
interface BackupDocument {
  id: string
  title: string
  content: string
  createDatetime: string
  updateDatetime: string
  parentId: string | null
  collapsed?: boolean
}

interface BackupEnvelope {
  token: string
  posts: BackupDocument[]
}

let backupSerial = 0

function backupToken(): string {
  backupSerial += 1
  return `${backupSerial}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function timeOf(date: Date | undefined): number {
  const time = date instanceof Date ? date.getTime() : Number.NaN
  return Number.isFinite(time) ? time : Number.NEGATIVE_INFINITY
}

function isBackupDocument(value: unknown): value is BackupDocument {
  if (!value || typeof value !== `object`)
    return false
  const doc = value as BackupDocument
  return typeof doc.id === `string` && doc.id.length > 0
}

function isEnvelope(value: unknown): value is BackupEnvelope {
  return Boolean(value)
    && typeof value === `object`
    && typeof (value as BackupEnvelope).token === `string`
    && Array.isArray((value as BackupEnvelope).posts)
}

export function toBackupDocument(post: Post): BackupDocument {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    createDatetime: new Date(post.createDatetime).toISOString(),
    updateDatetime: new Date(post.updateDatetime).toISOString(),
    parentId: post.parentId ?? null,
    collapsed: post.collapsed,
  }
}

export function fromBackupDocument(doc: BackupDocument): Post {
  return {
    id: doc.id,
    title: doc.title ?? ``,
    content: doc.content ?? ``,
    history: [],
    createDatetime: new Date(doc.createDatetime),
    updateDatetime: new Date(doc.updateDatetime),
    parentId: doc.parentId ?? null,
    collapsed: doc.collapsed,
  }
}

function seedHistory(post: Post): PostHistory[] {
  if (post.history.length > 0)
    return post.history
  return [{
    datetime: timeOf(post.updateDatetime),
    content: post.content,
  }]
}

/**
 * Keep IndexedDB posts that the backup does not mention.
 * A backup post replaces the stored one only when its updateDatetime is newer.
 * Existing history is kept, because the snapshot does not include it.
 */
export function mergeDocumentsWithBackup(existing: Post[], backup: Post[]): Post[] {
  const merged = new Map<string, Post>()
  for (const post of existing) {
    if (post.id)
      merged.set(post.id, post)
  }

  const appended: Post[] = []
  for (const incoming of backup) {
    if (!incoming.id)
      continue
    const current = merged.get(incoming.id)
    if (!current) {
      const created = { ...incoming, history: normalizePostHistory(seedHistory(incoming)) }
      merged.set(incoming.id, created)
      appended.push(created)
      continue
    }
    if (timeOf(incoming.updateDatetime) <= timeOf(current.updateDatetime))
      continue
    merged.set(incoming.id, {
      ...current,
      title: incoming.title,
      content: incoming.content,
      updateDatetime: incoming.updateDatetime,
      parentId: incoming.parentId ?? null,
      collapsed: incoming.collapsed,
    })
  }

  const seen = new Set<string>()
  const ordered: Post[] = []
  for (const post of existing) {
    const next = merged.get(post.id)
    if (!next || seen.has(post.id))
      continue
    ordered.push(next)
    seen.add(post.id)
  }
  for (const post of appended) {
    if (seen.has(post.id))
      continue
    ordered.push(post)
    seen.add(post.id)
  }
  return ordered
}

export function parseDocumentsBackup(raw: string | null): { token: string | null, posts: Post[] } | null {
  if (!raw)
    return null
  try {
    const parsed = JSON.parse(raw) as unknown
    const token = isEnvelope(parsed) ? parsed.token : null
    const list = Array.isArray(parsed)
      ? parsed
      : isEnvelope(parsed)
        ? parsed.posts
        : null
    if (!list?.length)
      return null
    const posts = list.filter(isBackupDocument).map(fromBackupDocument)
    if (posts.length === 0)
      return null
    return { token, posts }
  }
  catch {
    return null
  }
}

export function serializeDocumentsBackup(posts: Post[]): string {
  return JSON.stringify(posts.map(toBackupDocument))
}

function newestPost(posts: Post[]): Post | null {
  let newest: Post | null = null
  for (const post of posts) {
    if (!post.id)
      continue
    if (!newest || timeOf(post.updateDatetime) >= timeOf(newest.updateDatetime))
      newest = post
  }
  return newest
}

/** Write a snapshot and return a token so a later clear cannot drop a newer write. */
export function writeDocumentsPagehideBackup(posts: Post[]): string {
  const token = backupToken()
  if (typeof localStorage === `undefined` || posts.length === 0)
    return token

  const attempts = [posts]
  const latest = newestPost(posts)
  if (latest && posts.length > 1)
    attempts.push([latest])

  for (const attempt of attempts) {
    try {
      const envelope: BackupEnvelope = {
        token,
        posts: attempt.map(toBackupDocument),
      }
      localStorage.setItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY, JSON.stringify(envelope))
      return token
    }
    catch {
      // Quota / privacy mode — retry with only the newest post.
    }
  }
  return token
}

export function peekDocumentsPagehideBackup(): { token: string | null, posts: Post[] } | null {
  if (typeof localStorage === `undefined`)
    return null
  try {
    return parseDocumentsBackup(localStorage.getItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY))
  }
  catch {
    return null
  }
}

export function clearDocumentsPagehideBackup(token?: string): void {
  if (typeof localStorage === `undefined`)
    return
  try {
    if (token !== undefined) {
      const current = parseDocumentsBackup(localStorage.getItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY))
      if (!current || current.token !== token)
        return
    }
    localStorage.removeItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY)
  }
  catch {
    // ignore
  }
}
