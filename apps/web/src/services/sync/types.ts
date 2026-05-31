/**
 * Sync storage abstraction layer.
 *
 * Separates two concerns that are often conflated in the existing codebase:
 *  1. Object upload  (image / file → public URL)   – handled by file.ts / imgHost
 *  2. Sync storage   (read + write structured data) – handled here
 *
 * A SyncProvider supports arbitrary file read/write at known paths,
 * enabling document and config synchronisation across devices.
 */

/** Core read/write interface that every backend must implement. */
export interface SyncProvider {
  readonly id: string
  readonly name: string
  /** Verify connectivity and credentials. Throws a descriptive error on failure. */
  test: () => Promise<void>
  /** Read a file. Returns null when the file does not exist. */
  read: (path: string) => Promise<string | null>
  /** Write content to a file, creating parent directories as needed. */
  write: (path: string, content: string, mimeType?: string) => Promise<void>
  /** List files under an optional prefix. Returns paths relative to the provider's basePath. */
  list: (prefix?: string) => Promise<string[]>
  /** Delete a file. Silently succeeds if the file does not exist. */
  delete: (path: string) => Promise<void>
}

// ──────────────────────────────────────────────────
// Provider-specific configuration shapes
// ──────────────────────────────────────────────────

export interface WebDAVConfig {
  /** e.g. "https://dav.example.com" (no trailing slash) */
  url: string
  username: string
  password: string
  /** Base path on the server, e.g. "/md-sync" */
  basePath: string
}

export interface S3SyncConfig {
  /** Custom endpoint for S3-compatible services (OSS, COS, MinIO, R2…). Leave empty for AWS. */
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  accessKeySecret: string
  /** Key prefix / "folder" inside the bucket, e.g. "md-sync" */
  path: string
  /** Force path-style addressing (required for MinIO, Ceph, etc.) */
  pathStyle: boolean
}

export interface GitHubSyncConfig {
  /** "owner/repo" */
  repo: string
  branch: string
  accessToken: string
  /** Path prefix in the repository, e.g. "md-sync" */
  path: string
}

// ──────────────────────────────────────────────────
// Unified config stored under the "syncConfig" key
// ──────────────────────────────────────────────────

export type SyncProviderType = `webdav` | `s3` | `github` | `none`

export interface SyncConfig {
  /** Which provider is active. Empty string or 'none' means "not configured". */
  type: SyncProviderType | ``
  webdav: WebDAVConfig
  s3: S3SyncConfig
  github: GitHubSyncConfig
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  type: `none`,
  webdav: { url: ``, username: ``, password: ``, basePath: `/md-sync` },
  s3: {
    endpoint: ``,
    region: ``,
    bucket: ``,
    accessKeyId: ``,
    accessKeySecret: ``,
    path: `md-sync`,
    pathStyle: false,
  },
  github: { repo: ``, branch: `main`, accessToken: ``, path: `md-sync` },
}

// ──────────────────────────────────────────────────
// Manifest – describes what has been pushed to the backend
// ──────────────────────────────────────────────────

export interface SyncManifestDocument {
  id: string
  title: string
  /** Path relative to the provider's basePath, e.g. "docs/my-post_abc12345.md" */
  filename: string
  updatedAt: string // ISO 8601
}

export interface SyncManifest {
  version: number
  updated: string // ISO 8601
  documents: SyncManifestDocument[]
}
