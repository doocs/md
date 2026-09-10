import { blobToDataUrl } from '@/lib/assets/blob'
import { resolveAssetUrl } from '@/services/emoji/urlResolver'

/**
 * Pull the emoji id out of an `asset:` / `asset://` source string.
 *
 * Why: older articles used `![name](asset://<id>){20%}` (or `asset:<id>`).
 * New inserts use `<Emoji id="…" width="20%">`, which already carries
 * `data-emoji-id`. Both must resolve to the same cloud asset.
 */
function resolveAssetId(src: string | null): string | null {
  if (!src)
    return null
  // Tolerate any number of slashes between "asset:" and the id.
  const m = /^asset:\/*([^\s/]+)\/*$/.exec(src)
  return m?.[1] || null
}

/**
 * Fetch a cloud emoji as a Blob so exported HTML remains self-contained.
 */
async function readEmojiBlob(img: HTMLImageElement, id: string): Promise<Blob | null> {
  const liveUrl = img.getAttribute(`src`)
  const candidates = [
    liveUrl && !liveUrl.startsWith(`asset:`) && liveUrl !== `about:blank` ? liveUrl : null,
    resolveAssetUrl(id),
  ].filter((url): url is string => Boolean(url && url !== `about:blank`))

  for (const url of [...new Set(candidates)]) {
    try {
      const response = await fetch(url)
      if (!response.ok)
        continue
      const blob = await response.blob()
      if (blob.size > 0)
        return blob
    }
    catch {
      // Try the deterministic md-api asset URL next.
    }
  }
  return null
}

/**
 * Walk a container (typically `#output` clone) and replace any
 * `asset:` / `asset://` image sources and any `img.md-emoji[data-emoji-id]`
 * cloud emoji references with base64 data URLs so the resulting HTML is
 * self-contained for export to WeChat / PDF / PNG.
 *
 * WeChat and similar editors should not depend on remote availability or the
 * custom `asset:` scheme, so every emoji must be inlined before the
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
      const blob = await readEmojiBlob(img, id)
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
