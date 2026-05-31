/**
 * Sync service entry point.
 *
 * Export everything needed by the rest of the app from one place so
 * consumers never have to reach into the providers directory directly.
 */

import type { SyncConfig, SyncProvider } from './types'
import { GitHubSyncProvider } from './providers/github'
import { S3SyncProvider } from './providers/s3'
import { WebDAVProvider } from './providers/webdav'

export { GitHubSyncProvider } from './providers/github'
export { S3SyncProvider } from './providers/s3'
export { WebDAVProvider } from './providers/webdav'
export type {
  GitHubSyncConfig,
  S3SyncConfig,
  SyncConfig,
  SyncManifest,
  SyncManifestDocument,
  SyncProvider,
  SyncProviderType,
  WebDAVConfig,
} from './types'
export { DEFAULT_SYNC_CONFIG } from './types'

/**
 * Instantiate the correct SyncProvider from a persisted SyncConfig.
 * Returns null when no provider type has been selected.
 */
export function createSyncProvider(config: SyncConfig): SyncProvider | null {
  switch (config.type) {
    case `webdav`:
      return new WebDAVProvider(config.webdav)
    case `s3`:
      return new S3SyncProvider(config.s3)
    case `github`:
      return new GitHubSyncProvider(config.github)
    default:
      return null
  }
}

/** Options suitable for a <Select> component. */
export const SYNC_PROVIDER_OPTIONS = [
  { value: `none`, label: `未配置` },
  { value: `webdav`, label: `WebDAV` },
  { value: `s3`, label: `S3 兼容（OSS / COS / MinIO / R2 …）` },
  { value: `github`, label: `GitHub 仓库` },
] as const
