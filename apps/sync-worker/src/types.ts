export interface Env {
  DB: D1Database
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  JWT_SECRET: string
  /** 前端地址，用于 OAuth 回跳与 CORS 白名单，多个用英文逗号分隔 */
  APP_URL: string
}

export interface JwtPayload {
  sub: string // 内部 user id
  login: string
  exp: number
}

export interface UserRow {
  id: string
  github_id: number
  login: string
  name: string | null
  avatar: string | null
  created_at: number
}

/** 同步用文档（前后端共享契约），时间字段统一为 epoch ms */
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

/** 同步用设置项 */
export interface SyncSetting {
  key: string
  value: unknown
  updatedAt: number
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
  /** 服务端合并后较新的文档（客户端需用其覆盖本地） */
  documents: SyncDocument[]
  settings: SyncSetting[]
  cursor: number
}
