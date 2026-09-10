import type { EmojiFile, EmojiPack } from '@md/shared/types/emoji'
import { ApiError } from '@/services/account/client'
import {
  EmojiClient,
  getEmojiErrorCode,
  isEmojiCloudConfigured,
  USER_EMOJI_LIMIT,
} from '@/services/emoji/client'
import {
  loadEmojiUrl,
  registerEmojiFiles,
  resolveAssetUrl,
  unregisterEmojiFiles,
} from '@/services/emoji/urlResolver'
import { useAuthStore } from '@/stores/auth'

export const useEmojiPackStore = defineStore(`emojiPack`, () => {
  const authStore = useAuthStore()
  const client = new EmojiClient(() => authStore.token || null)

  const defaultPack = ref<EmojiPack | null>(null)
  const userPack = ref<EmojiPack | null>(null)
  const loadingDefault = ref(false)
  const loadingUser = ref(false)
  const uploading = ref(false)
  const uploadDone = ref(0)
  const uploadTotal = ref(0)
  const defaultError = ref<string | null>(null)
  const userError = ref<string | null>(null)

  const packs = computed(() =>
    [defaultPack.value, userPack.value].filter((pack): pack is EmojiPack => Boolean(pack)),
  )
  const allFiles = computed(() => packs.value.flatMap(pack => pack.files))
  const filesById = computed(() => new Map(allFiles.value.map(file => [file.id, file])))
  const isConfigured = computed(() => isEmojiCloudConfigured())
  const remainingSlots = computed(() =>
    Math.max(0, USER_EMOJI_LIMIT - (userPack.value?.files.length ?? 0)),
  )

  function setDefaultPack(pack: EmojiPack): void {
    if (defaultPack.value)
      unregisterEmojiFiles(defaultPack.value.files.map(file => file.id))
    defaultPack.value = pack
    registerEmojiFiles(pack.files)
  }

  function setUserPack(pack: EmojiPack | null): void {
    if (userPack.value)
      unregisterEmojiFiles(userPack.value.files.map(file => file.id))
    userPack.value = pack
    if (pack)
      registerEmojiFiles(pack.files)
  }

  async function loadDefault(force = false): Promise<boolean> {
    if (!isConfigured.value || loadingDefault.value || (defaultPack.value && !force))
      return Boolean(defaultPack.value)
    loadingDefault.value = true
    defaultError.value = null
    try {
      setDefaultPack(await client.getDefault())
      return true
    }
    catch (error) {
      defaultError.value = getEmojiErrorCode(error)
      return false
    }
    finally {
      loadingDefault.value = false
    }
  }

  async function loadMine(force = false): Promise<boolean> {
    if (!authStore.isLoggedIn) {
      setUserPack(null)
      return false
    }
    if (loadingUser.value || (userPack.value && !force))
      return Boolean(userPack.value)
    loadingUser.value = true
    userError.value = null
    try {
      setUserPack(await client.getMine())
      return true
    }
    catch (error) {
      userError.value = getEmojiErrorCode(error)
      if (error instanceof ApiError && error.status === 401)
        setUserPack(null)
      return false
    }
    finally {
      loadingUser.value = false
    }
  }

  async function renameUserPack(name: string): Promise<boolean> {
    const trimmed = name.trim()
    if (!trimmed || !authStore.isLoggedIn)
      return false
    try {
      setUserPack(await client.renameMine(trimmed))
      return true
    }
    catch (error) {
      userError.value = getEmojiErrorCode(error)
      return false
    }
  }

  async function uploadFiles(files: File[]): Promise<number> {
    const accepted = files.slice(0, remainingSlots.value)
    if (!authStore.isLoggedIn || !accepted.length)
      return 0

    uploading.value = true
    uploadDone.value = 0
    uploadTotal.value = accepted.length
    userError.value = null
    let uploaded = 0
    try {
      for (const file of accepted) {
        setUserPack(await client.upload(file))
        uploaded++
        uploadDone.value = uploaded
      }
      return uploaded
    }
    catch (error) {
      userError.value = getEmojiErrorCode(error)
      return uploaded
    }
    finally {
      uploading.value = false
    }
  }

  async function removeUserFile(fileId: string): Promise<boolean> {
    if (!userPack.value)
      return false
    try {
      setUserPack(await client.removeItem(fileId))
      return true
    }
    catch (error) {
      userError.value = getEmojiErrorCode(error)
      return false
    }
  }

  async function clearUserPack(): Promise<boolean> {
    if (!userPack.value)
      return false
    try {
      await client.clearMine()
      unregisterEmojiFiles(userPack.value.files.map(file => file.id))
      setUserPack(null)
      return loadMine(true)
    }
    catch (error) {
      userError.value = getEmojiErrorCode(error)
      return false
    }
  }

  function findFile(id: string): EmojiFile | undefined {
    return filesById.value.get(id)
  }

  function resolveUrl(id: string): string {
    return resolveAssetUrl(id)
  }

  async function ensureLoaded(id: string): Promise<string | null> {
    return loadEmojiUrl(id)
  }

  watch(() => authStore.isLoggedIn, (loggedIn) => {
    if (loggedIn)
      void loadMine(true)
    else
      setUserPack(null)
  })

  return {
    defaultPack,
    userPack,
    packs,
    allFiles,
    filesById,
    loadingDefault,
    loadingUser,
    uploading,
    uploadDone,
    uploadTotal,
    defaultError,
    userError,
    isConfigured,
    remainingSlots,
    loadDefault,
    loadMine,
    renameUserPack,
    uploadFiles,
    removeUserFile,
    clearUserPack,
    findFile,
    resolveUrl,
    ensureLoaded,
  }
})
