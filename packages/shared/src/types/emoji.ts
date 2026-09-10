export interface EmojiFile {
  /** Stable cloud identifier, used as `<Emoji id="…">`. */
  id: string
  /** Human-readable display name. */
  name: string
  mimeType: string
  size: number
  /** Public URL returned by md-api. */
  url?: string
  width?: number
  height?: number
  sortOrder?: number
}

export interface EmojiPack {
  id: string
  name: string
  source: `system` | `user`
  sourcePath?: string
  createdAt: number
  updatedAt?: number
  maxItems?: number
  files: EmojiFile[]
}

export type EmojiInsertMode = `small` | `original`
