import { blobToDataUrl, readBlobFromLiveUrl } from '@/lib/assets/blob'
import { getEmojiBlob } from '@/storage/repositories/emoji'

/**
 * Pull the emoji id out of an `asset:` / `asset://` source string.
 *
 * Why: `EmojiManagerPanel` inserts the original-size emoji using
 * `![name](asset://<id>){20%}`, while older content may use the
 * single-slash form `asset:<id>`. Both must resolve to the same id
 * when looking up the blob in IDB.
 */
function resolveAssetId(src: string | null): string | null {
  if (!src)
    return null
  // Tolerate any number of slashes between "asset:" and the id.
  const m = /^asset:\/*([^\s/]+)\/*$/.exec(src)
  return m?.[1] || null
}

/**
 * Resolve a `<img class="md-emoji">` to its blob, preferring the live blob URL
 * already attached by the hydration observer (so the in-flight blob cache is
 * reused) and falling back to the IDB store.
 */
async function readEmojiBlob(img: HTMLImageElement, id: string): Promise<Blob | null> {
  return readBlobFromLiveUrl(img.getAttribute(`src`), () => getEmojiBlob(id))
}

/**
 * Walk a container (typically `#output` clone) and replace any
 * `asset:` / `asset://` image sources and any `img.md-emoji[data-emoji-id]`
 * inline emoji references with base64 data URLs so the resulting HTML is
 * self-contained for export to WeChat / PDF / PNG.
 *
 * WeChat and similar editors cannot resolve `blob:` URLs from this origin,
 * nor the custom `asset:` scheme, so every emoji must be inlined before the
 * HTML is handed to the clipboard.
 */
export async function inlineEmojiImagesAsBase64(container: HTMLElement): Promise<void> {
  const unresolvedAssetImgs = Array.from(
    container.querySelectorAll<HTMLImageElement>(`img[src^="asset:"]`),
  )
  const emojiImgs = Array.from(
    container.querySelectorAll<HTMLImageElement>(`img.md-emoji[data-emoji-id]`),
  )
  // Emoji-panel-inserted images that the renderer already rewrote to a blob
  // URL; we still need to convert that blob URL to a base64 data URL here so
  // the export HTML is self-contained.
  const assetByDataIdImgs = Array.from(
    container.querySelectorAll<HTMLImageElement>(`img.md-asset-img[data-asset-id]`),
  )

  await Promise.all([
    ...unresolvedAssetImgs.map(async (img) => {
      const id = resolveAssetId(img.getAttribute(`src`))
      if (!id)
        return
      const blob = await getEmojiBlob(id)
      if (!blob)
        return
      img.src = await blobToDataUrl(blob)
    }),
    ...emojiImgs.map(async (img) => {
      const id = img.getAttribute(`data-emoji-id`)
      if (!id)
        return
      const blob = await readEmojiBlob(img, id)
      if (!blob)
        return
      img.src = await blobToDataUrl(blob)
    }),
    ...assetByDataIdImgs.map(async (img) => {
      const id = img.getAttribute(`data-asset-id`)
      if (!id)
        return
      const blob = await readEmojiBlob(img, id)
      if (!blob)
        return
      img.src = await blobToDataUrl(blob)
    }),
  ])
}
