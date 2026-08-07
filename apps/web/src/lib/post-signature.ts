import type { Post } from '@/types/post'

/**
 * Cheap per-post fingerprint covering every field that must trigger
 * persistence/sync. Content mutations always bump `updateDatetime`, so
 * `content.length` + millisecond `updateDatetime` together catch content
 * edits without hashing full text.
 */
export function postSignature(post: Post): string {
  return `${post.id}:${post.title}:${post.content.length}:${post.updateDatetime.getTime()}:${post.parentId ?? ``}:${post.history?.length ?? 0}:${post.collapsed ? 1 : 0}`
}
