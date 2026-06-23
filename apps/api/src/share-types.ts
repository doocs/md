export interface ShareRow {
  id: string
  post_id: string
  user_id: string
  title: string
  html: string
  password_hash: string | null
  created_at: number
  expires_at: number | null
  view_count: number
}

export interface ShareHtmlSnapshot {
  bodyHtml: string
  stylesHtml: string
}

export type SharePasswordMode = `none` | `custom` | `auto`

/** Pro 可选：1 天 / 7 天 / 30 天 / 永不过期；免费用户固定 1 天 */
export type ShareExpiresMode = `1d` | `7d` | `30d` | `never`

export interface CreateShareRequest {
  /** 前端文章 id，同一用户同一篇文章重复分享时链接不变 */
  postId: string
  title?: string
  htmlSnapshot: ShareHtmlSnapshot
  /** 无密码 / 自定义密码 / 系统随机生成 */
  passwordMode?: SharePasswordMode
  /** passwordMode=custom 时必填 */
  password?: string
  /** 链接有效期，Pro 用户可选；免费用户忽略并固定 1 天 */
  expiresMode?: ShareExpiresMode
}

export interface CreateShareResponse {
  id: string
  url: string
  expiresAt: number | null
  /** true 表示更新了已有分享，false 表示首次创建 */
  updated: boolean
  /** 是否启用了访问密码 */
  protected: boolean
  /** 仅 passwordMode=auto 时返回系统生成的明文密码 */
  password?: string
}

export interface ShareListItem {
  id: string
  postId: string
  title: string
  url: string
  createdAt: number
  expiresAt: number | null
  viewCount: number
  protected: boolean
  expired: boolean
}

export interface ListSharesResponse {
  shares: ShareListItem[]
}
