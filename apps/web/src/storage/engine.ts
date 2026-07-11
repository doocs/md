/**
 * Storage engine interface — fully async with sync read cache after initStorage preload.
 */
export interface StorageEngine {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  remove: (key: string) => Promise<void>
  has: (key: string) => Promise<boolean>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
  /** After preload, supports synchronous store.reactive initialization. */
  getSync?: (key: string) => string | null
  supportsSyncRead?: () => boolean
}
