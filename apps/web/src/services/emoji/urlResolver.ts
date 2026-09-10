import type { EmojiFile } from '@md/shared/types/emoji'
import { MD_API_URL } from '@/services/account/config'

const urlCache = new Map<string, string>()

export function resolveAssetUrl(id: string): string {
  return urlCache.get(id)
    ?? (MD_API_URL ? `${MD_API_URL}/emojis/assets/${encodeURIComponent(id)}` : `about:blank`)
}

export async function loadEmojiUrl(id: string): Promise<string | null> {
  const url = resolveAssetUrl(id)
  return url === `about:blank` ? null : url
}

export function registerEmojiFiles(files: EmojiFile[]): void {
  for (const file of files) {
    if (file.url)
      urlCache.set(file.id, file.url)
  }
}

export function unregisterEmojiFiles(ids: string[]): void {
  for (const id of ids)
    urlCache.delete(id)
}

export function revokeAllEmojiUrls(): void {
  urlCache.clear()
}
