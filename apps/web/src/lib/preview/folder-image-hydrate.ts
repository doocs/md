import { t } from '@/i18n/translate'
import { toast } from '@/lib/toast'
import { getFileBlobByRelativePath } from '@/services/folder/fileResolver'
import { useFolderSourceStore } from '@/stores/folderSource'
import { usePostStore } from '@/stores/post'

/**
 * Walk `#output` for `img.md-folder-img[data-folder-src]` placeholders and
 * attach resolved blob URLs. Re-runs on every render via a `MutationObserver`.
 *
 * Mirrors `setupEmojiHydration`, but the resolver uses the File System Access
 * API to read the image from the local folder that the active `.md` was
 * opened from. We also keep the folderImageBlobCache in the store up to date
 * so the renderer's synchronous `folderImageResolver` can hand the blob URL
 * back on subsequent re-renders without a roundtrip through the observer.
 */
export function setupFolderImageHydration(outputEl: HTMLElement): () => void {
  const folderStore = useFolderSourceStore()
  const postStore = usePostStore()

  async function hydrateOne(img: HTMLImageElement): Promise<void> {
    const relPath = img.getAttribute(`data-folder-src`)
    if (!relPath)
      return

    // The currently-active markdown file is the source of the relative path.
    // If the post has been switched (or the folder closed) we leave the img
    // alone — the next render will replace this node anyway.
    const mdFilePath = postStore.currentPost?.sourceFilePath
    if (!mdFilePath)
      return

    const cached = folderStore.resolveFolderImageSync(mdFilePath, relPath)
    if (cached && img.src !== cached) {
      img.src = cached
      return
    }

    try {
      const blob = await getFileBlobByRelativePath(mdFilePath, relPath)
      if (!blob) {
        toast.error(t('store.folder.imageResolveFailed', { path: relPath }))
        return
      }
      const url = URL.createObjectURL(blob)
      folderStore.setFolderImageBlobUrl(mdFilePath, relPath, url)
      if (img.src !== url)
        img.src = url
    }
    catch {
      // Fall through: the next render / mutation will retry; we keep the
      // placeholder `<img src="about:blank">` rather than logging every retry.
    }
  }

  function scan(root: ParentNode): void {
    const imgs = root.querySelectorAll<HTMLImageElement>(`img.md-folder-img[data-folder-src]`)
    for (const img of imgs) {
      if (img.src && img.src !== `about:blank`)
        continue
      void hydrateOne(img)
    }
  }

  scan(outputEl)

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement && node.classList.contains(`md-folder-img`)) {
          void hydrateOne(node)
        }
        else if (node instanceof HTMLElement) {
          scan(node)
        }
      })
    }
  })

  observer.observe(outputEl, { childList: true, subtree: true })

  return () => observer.disconnect()
}
