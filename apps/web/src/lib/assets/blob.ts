/** Convert a Blob to a data URL for export pipelines. */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Prefer a live blob URL attached to the preview, then fall back to storage.
 * Export clones can be taken before hydration finishes, so the fallback is
 * still important.
 */
export async function readBlobFromLiveUrl(
  src: string | null,
  fallback: () => Promise<Blob | null>,
): Promise<Blob | null> {
  if (src?.startsWith(`blob:`)) {
    try {
      const blob = await (await fetch(src)).blob()
      if (blob.size > 0)
        return blob
    }
    catch {
      // Revoked URLs and cross-frame failures fall back to durable storage.
    }
  }
  return fallback()
}
