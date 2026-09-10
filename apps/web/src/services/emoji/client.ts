import type { EmojiPack } from '@md/shared/types/emoji'
import { ApiError, MdApiClient } from '@/services/account/client'
import { isAccountConfigured } from '@/services/account/config'

export const USER_EMOJI_LIMIT = 100
export const EMOJI_MAX_BYTES = 5 * 1024 * 1024
export const EMOJI_ACCEPT = `image/png,image/jpeg,image/gif,image/webp`

export function isEmojiCloudConfigured(): boolean {
  return isAccountConfigured()
}

interface EmojiItemResponse {
  id: string
  name: string
  mime: string
  size: number
  width: number | null
  height: number | null
  sortOrder: number
  url: string
}

interface EmojiManifestResponse {
  id: string
  kind: `system` | `user`
  name: string
  createdAt: number
  updatedAt: number
  items: EmojiItemResponse[]
}

function normalizeManifest(manifest: EmojiManifestResponse): EmojiPack {
  return {
    id: manifest.id,
    name: manifest.name,
    source: manifest.kind,
    createdAt: manifest.createdAt,
    updatedAt: manifest.updatedAt,
    maxItems: manifest.kind === `user` ? USER_EMOJI_LIMIT : undefined,
    files: manifest.items.map(item => ({
      id: item.id,
      name: item.name,
      mimeType: item.mime,
      size: item.size,
      url: item.url,
      width: item.width ?? undefined,
      height: item.height ?? undefined,
      sortOrder: item.sortOrder,
    })),
  }
}

export class EmojiClient extends MdApiClient {
  async getDefault(): Promise<EmojiPack> {
    return normalizeManifest(await this.request<EmojiManifestResponse>(`GET`, `/emojis/default`))
  }

  async getMine(): Promise<EmojiPack> {
    return normalizeManifest(await this.request<EmojiManifestResponse>(`GET`, `/emojis/me`))
  }

  async renameMine(name: string): Promise<EmojiPack> {
    const manifest = await this.request<EmojiManifestResponse>(`PATCH`, `/emojis/me`, { name })
    return normalizeManifest(manifest)
  }

  async upload(file: File): Promise<EmojiPack> {
    const form = new FormData()
    form.set(`file`, file)
    const manifest = await this.request<EmojiManifestResponse>(`POST`, `/emojis/me/items`, form)
    return normalizeManifest(manifest)
  }

  async removeItem(id: string): Promise<EmojiPack> {
    const manifest = await this.request<EmojiManifestResponse>(
      `DELETE`,
      `/emojis/me/items/${encodeURIComponent(id)}`,
    )
    return normalizeManifest(manifest)
  }

  clearMine(): Promise<{ ok: true }> {
    return this.request<{ ok: true }>(`DELETE`, `/emojis/me`)
  }
}

export function getEmojiErrorCode(error: unknown): string {
  return error instanceof ApiError ? error.message : `emoji_request_failed`
}
