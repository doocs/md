/**
 * 云同步前后端共享契约（与 @md/sync-worker 保持一致）。
 * 时间字段统一为 epoch 毫秒。
 */

export interface SyncDocument {
  id: string
  title: string
  content: string
  parentId: string | null
  history: { datetime: string, content: string }[]
  createDatetime: number
  updateDatetime: number
  deleted: boolean
}

export interface SyncSetting {
  key: string
  /** localStorage 中的原始字符串值（保持原样回写，避免二次编解码） */
  value: string | null
  updatedAt: number
}

export type SyncPlan = `free` | `pro`

export interface SyncUser {
  id: string
  login: string
  name: string | null
  avatar: string | null
  plan: SyncPlan
  planExpiresAt: number | null
}

export interface ActivateProResponse {
  plan: SyncPlan
  planExpiresAt: number
}

export interface PullResponse {
  documents: SyncDocument[]
  settings: SyncSetting[]
  cursor: number
}

export interface PushRequest {
  documents?: SyncDocument[]
  settings?: SyncSetting[]
}

export interface PushResponse {
  documents: SyncDocument[]
  settings: SyncSetting[]
  cursor: number
}
