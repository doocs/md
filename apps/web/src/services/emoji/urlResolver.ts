import { getEmojiBlob, putEmojiBlob } from '@/storage/repositories/emoji'

/**
 * In-memory map of emoji id -> object URL.
 * Hydrated lazily on first access; populated when packs load.
 */
const urlCache = new Map<string, string>()
const inflight = new Map<string, Promise<string | null>>()

export function resolveAssetUrl(id: string): string {
  return urlCache.get(id) ?? `about:blank`
}

/** Resolve and cache an id -> blob URL. Returns `about:blank` if blob missing. */
export async function loadEmojiUrl(id: string): Promise<string | null> {
  if (urlCache.has(id))
    return urlCache.get(id)!
  if (inflight.has(id))
    return inflight.get(id)!

  const p = (async () => {
    const blob = await getEmojiBlob(id)
    if (!blob)
      return null
    const url = URL.createObjectURL(blob)
    urlCache.set(id, url)
    return url
  })()
  inflight.set(id, p)
  const out = await p
  inflight.delete(id)
  return out
}

/** Eagerly populate the URL cache for a list of ids (used when packs load). */
export async function primeEmojiUrls(ids: string[]): Promise<void> {
  await Promise.all(ids.map(id => loadEmojiUrl(id)))
}

/** Drop a single URL from the in-memory cache (e.g. on pack delete). */
export function evictEmojiUrl(id: string): void {
  const url = urlCache.get(id)
  if (url) {
    URL.revokeObjectURL(url)
    urlCache.delete(id)
  }
}

export function revokeAllEmojiUrls(): void {
  for (const url of urlCache.values()) URL.revokeObjectURL(url)
  urlCache.clear()
}

/** Persist a blob by id (used by importSinglePack / pickEmojiPacks). */
export async function saveEmojiBlob(id: string, blob: Blob): Promise<void> {
  await putEmojiBlob(id, blob)
  // Keep an existing object URL valid when another pack imports the same
  // content-addressed blob.
  if (!urlCache.has(id))
    await loadEmojiUrl(id)
}
