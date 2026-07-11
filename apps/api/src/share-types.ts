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

/** Pro: 1d / 7d / 30d / never; free users are fixed to 1 day */
export type ShareExpiresMode = `1d` | `7d` | `30d` | `never`

export interface CreateShareRequest {
  /** Frontend post id; re-sharing the same post keeps the same link */
  postId: string
  title?: string
  htmlSnapshot: ShareHtmlSnapshot
  /** No password / custom password / system-generated password */
  passwordMode?: SharePasswordMode
  /** Required when passwordMode=custom */
  password?: string
  /** Link expiry; Pro users may choose; free users are always capped at 1 day */
  expiresMode?: ShareExpiresMode
}

export interface CreateShareResponse {
  id: string
  url: string
  expiresAt: number | null
  /** true if an existing share was updated; false if newly created */
  updated: boolean
  /** Whether access password protection is enabled */
  protected: boolean
  /** Plaintext password returned only when passwordMode=auto */
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
