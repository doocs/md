/**
 * Cloud sync contract shared with backend (aligned with @md/api).
 * Timestamps are epoch milliseconds.
 */

import type { UserPlan } from '@/services/account/types'

export type { UserPlan as SyncPlan, AccountUser as SyncUser } from '@/services/account/types'

export interface SyncDocument {
  id: string
  title: string
  content: string
  parentId: string | null
  /**
   * history.datetime is epoch ms for new data.
   * Legacy clients / older sync payloads may still use locale or ISO strings.
   */
  history: { datetime: number | string, content: string }[]
  createDatetime: number
  updateDatetime: number
  deleted: boolean
}

export interface SyncSetting {
  key: string
  /** Raw localStorage string value (written back as-is to avoid double encode/decode). */
  value: string | null
  updatedAt: number
}

export interface ActivateProResponse {
  plan: UserPlan
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
