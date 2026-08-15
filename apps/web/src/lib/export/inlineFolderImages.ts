import { blobToDataUrl, readBlobFromLiveUrl } from '@/lib/assets/blob'
import { getFileBlobByRelativePath } from '@/services/folder/fileResolver'
import { usePostStore } from '@/stores/post'

/**
 * Walk a container (typically `#output` clone) and replace any
 * `img.md-folder-img[data-folder-src]` placeholder with a base64 data URL so
 * the resulting HTML is self-contained for export to WeChat / PDF / PNG.
 *
 * Mirror of `inlineEmojiImagesAsBase64`. The export path cannot depend on
 * `blob:` URLs because WeChat and similar editors will not resolve them,
 * and PNG capture (`html-to-image`) cannot serialize blob URLs across frames.
 */
export async function inlineFolderImagesAsBase64(container: HTMLElement): Promise<void> {
  const postStore = usePostStore()
  const mdFilePath = postStore.currentPost?.sourceFilePath
  if (!mdFilePath) {
    return
  }

  const imgs = Array.from(
    container.querySelectorAll<HTMLImageElement>(`img.md-folder-img[data-folder-src]`),
  )

  await Promise.all(imgs.map(async (img) => {
    const relPath = img.getAttribute(`data-folder-src`)
    if (!relPath)
      return

    const blob = await readBlobFromLiveUrl(img.getAttribute(`src`), () =>
      getFileBlobByRelativePath(mdFilePath, relPath))
    if (!blob)
      return
    img.src = await blobToDataUrl(blob)
  }))
}
