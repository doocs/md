import { getDatabase } from '../db'
import { STORE_EMOJI } from '../keys'
import { addPrefix } from '../prefix'

/**
 * Emoji binaries live in a dedicated `emoji` IDB store with `Blob` values,
 * so the `IndexedDBEngine` preload (which uses a `Map<string, string>` for
 * `settings` / `secrets` / `cache`) can skip them safely.
 *
 * Key layout: `MD__emoji_blob:<sha256>`. Metadata (file list, pack list) is
 * persisted separately by `useEmojiPackStore` via `store.reactive` in the
 * `settings` store.
 */

const KEY_PREFIX = addPrefix(`emoji_blob:`)

function fullKey(id: string): string {
  return `${KEY_PREFIX}${id}`
}

export async function putEmojiBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDatabase()
  await db.put(STORE_EMOJI, blob, fullKey(id))
}

export async function getEmojiBlob(id: string): Promise<Blob | null> {
  const db = await getDatabase()
  const blob = await db.get(STORE_EMOJI, fullKey(id))
  return blob ?? null
}

export async function deleteEmojiBlob(id: string): Promise<void> {
  const db = await getDatabase()
  await db.delete(STORE_EMOJI, fullKey(id))
}

export async function deleteEmojiBlobs(ids: string[]): Promise<void> {
  if (!ids.length)
    return
  const db = await getDatabase()
  const tx = db.transaction(STORE_EMOJI, `readwrite`)
  await Promise.all([
    ...ids.map(id => tx.store.delete(fullKey(id))),
    tx.done,
  ])
}

export async function listEmojiBlobKeys(): Promise<string[]> {
  const db = await getDatabase()
  const keys = await db.getAllKeys(STORE_EMOJI)
  return keys
    .filter((k): k is string => typeof k === `string`)
    .map(k => k.slice(KEY_PREFIX.length))
}
