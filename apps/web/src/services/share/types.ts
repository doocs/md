export interface ShareHtmlSnapshot {
  bodyHtml: string
  stylesHtml: string
}

export type SharePasswordMode = `none` | `custom` | `auto`

export type ShareExpiresMode = `1d` | `7d` | `30d` | `never`

export interface CreateShareRequest {
  postId: string
  title?: string
  htmlSnapshot: ShareHtmlSnapshot
  passwordMode?: SharePasswordMode
  password?: string
  expiresMode?: ShareExpiresMode
}

export interface CreateShareResponse {
  id: string
  url: string
  expiresAt: number | null
  updated: boolean
  protected: boolean
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
