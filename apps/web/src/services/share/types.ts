export interface ShareHtmlSnapshot {
  bodyHtml: string
  stylesHtml: string
}

export type SharePasswordMode = `none` | `custom` | `auto`

export interface CreateShareRequest {
  postId: string
  title?: string
  htmlSnapshot: ShareHtmlSnapshot
  passwordMode?: SharePasswordMode
  password?: string
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
