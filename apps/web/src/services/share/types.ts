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
