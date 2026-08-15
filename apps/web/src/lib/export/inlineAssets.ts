import { inlineEmojiImagesAsBase64 } from '@/lib/export/inlineEmojiImages'
import { inlineFolderImagesAsBase64 } from '@/lib/export/inlineFolderImages'

/**
 * Inline every self-contained image source in a cloned preview container as a
 * base64 data URL. Used by export and clipboard pipelines so the resulting
 * HTML survives transport to WeChat (which cannot resolve `blob:` URLs from
 * another origin or the custom `asset:` / folder schemes).
 *
 * Currently delegates to two parallel-safe passes:
 *   - emoji (`asset:` / `data-emoji-id` / `data-asset-id`)
 *   - local folder images (`data-folder-src`)
 *
 * The two passes read disjoint selectors, so running them in parallel is
 * safe even though both mutate `img.src` on the same container.
 */
export async function inlineAssetsAsBase64(container: HTMLElement): Promise<void> {
  await Promise.all([
    inlineEmojiImagesAsBase64(container),
    inlineFolderImagesAsBase64(container),
  ])
}
