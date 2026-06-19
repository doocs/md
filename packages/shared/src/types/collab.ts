import type { PerThemeSettingsMap } from '../configs/style'
import type { ThemeName } from '../configs/theme-css'
import type { CustomComponentDef } from './component'

export type CollabRole = `owner` | `editor` | `viewer`
export type CollabInviteRole = `editor` | `viewer`

export interface CollabCustomCssTab {
  id: string
  title: string
  content: string
}

export interface CollabStyleLayout {
  useIndent: boolean
  useJustify: boolean
  isCiteStatus: boolean
  isCountStatus: boolean
  legend: string
  previewWidth: string
}

/** 协作文档级样式包（与个人账户偏好隔离） */
export interface CollabStyleBundle {
  version: 1
  theme: ThemeName
  themeSettings: PerThemeSettingsMap
  layout: CollabStyleLayout
  customCss: {
    activeTabId: string
    tabs: CollabCustomCssTab[]
  }
  customComponents?: CustomComponentDef[]
}

export interface CollabHistoryEntry {
  datetime: string
  content: string
}

export interface CollabDocument {
  id: string
  ownerUserId: string
  sourcePostId: string | null
  title: string
  content: string
  style: CollabStyleBundle
  contentUpdatedAt: number
  styleUpdatedAt: number
  history: CollabHistoryEntry[]
  createdAt: number
  updatedAt: number
  deleted: boolean
}

export interface CollabListItem {
  id: string
  title: string
  role: CollabRole
  ownerLogin: string
  contentUpdatedAt: number
  styleUpdatedAt: number
  updatedAt: number
}

export interface CollabMember {
  userId: string
  login: string
  name: string | null
  avatar: string | null
  role: CollabRole
  joinedAt: number
}

export interface CreateCollabRequest {
  sourcePostId?: string
  title: string
  content: string
  style: CollabStyleBundle
}

export interface CreateCollabResponse {
  id: string
  document: CollabDocument
}

export interface CollabInviteRequest {
  role: CollabInviteRole
  expiresInHours?: number
  maxUses?: number
}

export interface CollabInviteResponse {
  token: string
  role: CollabInviteRole
  expiresAt: number | null
  maxUses: number | null
  inviteUrl: string
}

export interface AcceptCollabInviteResponse {
  documentId: string
  role: CollabRole
}

export interface CollabPushRequest {
  title?: string
  content?: string
  contentUpdatedAt?: number
  style?: CollabStyleBundle
  styleUpdatedAt?: number
}

export interface CollabPushResponse {
  document: CollabDocument
  cursor: number
  merged: {
    contentAccepted: boolean
    styleAccepted: boolean
  }
}

export interface CollabPullResponse {
  document: CollabDocument | null
  role: CollabRole
  cursor: number
}

export interface CollabDetailResponse {
  document: CollabDocument
  role: CollabRole
  members: CollabMember[]
}
