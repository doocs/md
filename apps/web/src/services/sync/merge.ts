import type { SyncDocument } from './types'
import type { Post, PostHistory } from '@/types/post'
import { formatLocalDateTime } from '@/i18n/translate'

export function toMs(value: Date | string | number | undefined): number {
  if (value == null)
    return 0
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isFinite(ms) ? ms : 0
}

export function postToDoc(post: Post): SyncDocument {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    parentId: post.parentId ?? null,
    history: post.history ?? [],
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
    history: doc.history ?? [],
    createDatetime: new Date(doc.createDatetime),
    updateDatetime: new Date(doc.updateDatetime),
    parentId: doc.parentId ?? null,
    collapsed: false,
  }
}

/** 把败方内容并入胜方历史，避免数据丢失（按内容去重） */
function mergeHistory(winner: Post, loserContent: string, loserDatetime: number): void {
  if (!loserContent)
    return
  const history: PostHistory[] = winner.history ?? (winner.history = [])
  const exists = history.some(h => h.content === loserContent)
    || winner.content === loserContent
  if (exists)
    return
  history.push({
    datetime: formatLocalDateTime(new Date(loserDatetime)),
    content: loserContent,
  })
}

export interface MergeResult {
  posts: Post[]
  changed: boolean
}

/**
 * 将远端文档合并进本地文章列表。
 * - 按 updateDatetime 做 last-write-wins
 * - 败方内容并入胜方 history 兜底
 * - 远端软删除且更新时间较新时，从本地移除
 */
export function mergeRemoteIntoLocal(localPosts: Post[], remoteDocs: SyncDocument[]): MergeResult {
  const localMap = new Map(localPosts.map(p => [p.id, p]))
  let changed = false

  for (const doc of remoteDocs) {
    const local = localMap.get(doc.id)

    if (!local) {
      // 本地不存在
      if (!doc.deleted) {
        localMap.set(doc.id, docToPost(doc))
        changed = true
      }
      continue
    }

    const localMs = toMs(local.updateDatetime)
    const remoteMs = doc.updateDatetime

    if (remoteMs > localMs) {
      // 远端较新
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
      // 本地较新（或同时）：保留本地，远端内容并入历史兜底
      if (!doc.deleted && doc.content !== local.content) {
        mergeHistory(local, doc.content, remoteMs)
        changed = true
      }
    }
  }

  return { posts: Array.from(localMap.values()), changed }
}
