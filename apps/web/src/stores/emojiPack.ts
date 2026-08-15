import type { EmojiFile, EmojiPack } from '@md/shared/types/emoji'
import {
  evictEmojiUrl,
  loadEmojiUrl,
  primeEmojiUrls,
  resolveAssetUrl,
  saveEmojiBlob,
} from '@/services/emoji/urlResolver'
import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'
import { deleteEmojiBlobs } from '@/storage/repositories/emoji'

/** Local Pinia store: emoji metadata + cache hydration. */
export const useEmojiPackStore = defineStore(`emojiPack`, () => {
  const packs = store.reactive<EmojiPack[]>(addPrefix(`emoji_packs`), [])

  /** All files across all packs flattened. */
  const allFiles = computed<EmojiFile[]>(() => packs.value.flatMap(p => p.files))

  /** id -> file lookup. */
  const filesById = computed(() => {
    const map = new Map<string, EmojiFile>()
    for (const f of allFiles.value) map.set(f.id, f)
    return map
  })

  /** Resolve an emoji id to a `blob:` URL (sync; cache hit only). */
  function resolveUrl(id: string): string {
    return resolveAssetUrl(id)
  }

  function removeBlobsIfUnreferenced(
    removedPacks: EmojiPack[],
    retainedPacks: EmojiPack[],
  ): void {
    const retainedIds = new Set(retainedPacks.flatMap(pack => pack.files.map(file => file.id)))
    const removableIds = [
      ...new Set(removedPacks.flatMap(pack => pack.files.map(file => file.id))),
    ].filter(id => !retainedIds.has(id))

    for (const id of removableIds)
      evictEmojiUrl(id)
    void deleteEmojiBlobs(removableIds)
  }

  /** Add a pack and persist its blob binaries. */
  async function addPack(pack: EmojiPack, blobs: Map<string, Blob>): Promise<void> {
    await Promise.all(pack.files.map((f) => {
      const blob = blobs.get(f.id)
      return blob ? saveEmojiBlob(f.id, blob) : undefined
    }))
    packs.value = [...packs.value, pack]
    await primeEmojiUrls(pack.files.map(f => f.id))
  }

  function removePack(packId: string): void {
    const removedPacks = packs.value.filter(pack => pack.id === packId)
    const retainedPacks = packs.value.filter(pack => pack.id !== packId)
    if (!removedPacks.length)
      return

    removeBlobsIfUnreferenced(removedPacks, retainedPacks)
    packs.value = retainedPacks
  }

  /** Remove a batch of packs in a single IDB transaction. Used by the multi-select popover. */
  function removePacks(packIds: string[]): void {
    if (!packIds.length)
      return
    const idSet = new Set(packIds)
    const removed = packs.value.filter(p => idSet.has(p.id))
    if (!removed.length)
      return
    const retained = packs.value.filter(p => !idSet.has(p.id))
    removeBlobsIfUnreferenced(removed, retained)
    packs.value = retained
  }

  function findFile(id: string): EmojiFile | undefined {
    return filesById.value.get(id)
  }

  /** Re-hydrate URLs for all known packs (called on app boot). */
  async function hydrate(): Promise<void> {
    const ids = packs.value.flatMap(p => p.files.map(f => f.id))
    await primeEmojiUrls(ids)
  }

  /** Ensure a single id is loaded (used by hydration hook). */
  async function ensureLoaded(id: string): Promise<string | null> {
    return loadEmojiUrl(id)
  }

  return {
    packs,
    allFiles,
    filesById,
    resolveUrl,
    addPack,
    removePack,
    removePacks,
    findFile,
    hydrate,
    ensureLoaded,
  }
})
