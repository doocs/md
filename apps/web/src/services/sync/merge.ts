import type { SyncDocument } from './types'
import type { Post, PostHistory } from '@/types/post'
import { normalizePostHistory, parseStoredDateTime } from '@/lib/format/datetime'

export function toMs(value: Date | string | number | undefined): number {
  return parseStoredDateTime(value) ?? 0
}

export function postToDoc(post: Post): SyncDocument {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    parentId: post.parentId ?? null,
    history: normalizePostHistory(post.history),
    createDatetime: toMs(post.createDatetime),
    updateDatetime: toMs(post.updateDatetime),
    deleted: false,
  }
}

function docToPost(doc: SyncDocument): Post {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    history: normalizePostHistory(doc.history),
    createDatetime: new Date(doc.createDatetime),
    updateDatetime: new Date(doc.updateDatetime),
    parentId: doc.parentId ?? null,
    collapsed: false,
  }
}

/** Merge loser content into winner history (dedupe by content). Returns true when entries were added. */
function mergeHistory(winner: Post, loserContent: string, loserDatetime: number): boolean {
  if (!loserContent)
    return false
  const history: PostHistory[] = winner.history ?? (winner.history = [])
  const exists = history.some(h => h.content === loserContent)
    || winner.content === loserContent
  if (exists)
    return false
  history.push({
    datetime: loserDatetime,
    content: loserContent,
  })
  return true
}

export interface MergeResult {
  posts: Post[]
  changed: boolean
}

/**
 * Merge remote documents into the local post list.
 * - Last-write-wins by updateDatetime
 * - Loser content is appended to winner history as a safety net
 * - Remote soft-delete with newer timestamp removes the local post
 */
export function mergeRemoteIntoLocal(localPosts: Post[], remoteDocs: SyncDocument[]): MergeResult {
  const localMap = new Map(localPosts.map(p => [p.id, p]))
  let changed = false

  for (const doc of remoteDocs) {
    const local = localMap.get(doc.id)

    if (!local) {
      if (!doc.deleted) {
        localMap.set(doc.id, docToPost(doc))
        changed = true
      }
      continue
    }

    const localMs = toMs(local.updateDatetime)
    const remoteMs = doc.updateDatetime

    if (remoteMs > localMs) {
      if (doc.deleted) {
        localMap.delete(doc.id)
        changed = true
      }
      else {
        const winner = docToPost(doc)
        mergeHistory(winner, local.content, localMs)
        winner.collapsed = local.collapsed ?? false
        localMap.set(doc.id, winner)
        changed = true
      }
    }
    else {
      if (!doc.deleted && doc.content !== local.content) {
        if (mergeHistory(local, doc.content, remoteMs))
          changed = true
      }
    }
  }

  return { posts: Array.from(localMap.values()), changed }
}
