export interface EmojiFile {
  /** sha256 of file contents; also used as the `asset://<id>` token. */
  id: string
  /** Original filename, e.g. `0003.gif`. */
  name: string
  mimeType: string
  size: number
  /** Natural pixel dimensions, probed via `createImageBitmap` on first import. */
  width?: number
  height?: number
}

export interface EmojiPack {
  id: string
  name: string
  source: `directory-handle` | `webkitdirectory`
  /** Display path, e.g. `Emojis/aru`. */
  sourcePath?: string
  createdAt: number
  files: EmojiFile[]
}

export type EmojiInsertMode = `small` | `original`
