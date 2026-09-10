import { useEmojiPackStore } from '@/stores/emojiPack'

/**
 * Walk `#output` for emoji placeholders and attach resolved cloud URLs.
 * Covers `<Emoji id="…">` (rendered as `img.md-emoji[data-emoji-id]` or
 * `img.md-asset-img[data-asset-id]` when `width` is set) plus the legacy
 * `{{emoji:<id>}}` / `![name](asset://<id>){N%}` aliases. The observer is a
 * fallback for renders that happened before the cloud manifest was ready.
 */
export function setupEmojiHydration(outputEl: HTMLElement): () => void {
  const store = useEmojiPackStore()
  const pending = new Set<HTMLImageElement>()

  function getId(img: HTMLImageElement): string | null {
    return img.getAttribute(`data-emoji-id`) ?? img.getAttribute(`data-asset-id`)
  }

  async function hydrateOne(img: HTMLImageElement): Promise<void> {
    const id = getId(img)
    if (!id)
      return
    const url = await store.ensureLoaded(id)
    if (url && img.src !== url)
      img.src = url
  }

  function scan(root: ParentNode): void {
    const imgs = root.querySelectorAll<HTMLImageElement>(
      `img.md-emoji[data-emoji-id], img.md-asset-img[data-asset-id]`,
    )
    for (const img of imgs) {
      if (img.src && img.src !== `about:blank`)
        continue
      pending.add(img)
      void hydrateOne(img).finally(() => pending.delete(img))
    }
  }

  scan(outputEl)

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLImageElement
          && (node.classList.contains(`md-emoji`) || node.classList.contains(`md-asset-img`))
        ) {
          pending.add(node)
          void hydrateOne(node).finally(() => pending.delete(node))
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
