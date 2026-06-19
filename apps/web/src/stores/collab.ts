import type {
  CollabDocument,
  CollabListItem,
  CollabMember,
  CollabRole,
} from '@md/shared/types'
import { useEditorRefresh } from '@/composables/useEditorRefresh'
import { ApiError } from '@/services/account/client'
import { CollabClient } from '@/services/collab/client'
import {
  collabStyleEquals,
  collectCollabStyle,
  hydrateCollabStyle,
  restorePersonalStyle,
  snapshotPersonalStyle,
} from '@/services/collab/style'
import { useAuthStore } from '@/stores/auth'
import { useEditorStore } from '@/stores/editor'
import { useThemeStore } from '@/stores/theme'

const SYNC_DEBOUNCE_MS = 2000

export const useCollabStore = defineStore(`collab`, () => {
  const authStore = useAuthStore()
  const editorStore = useEditorStore()
  const { editorRefresh } = useEditorRefresh()

  const client = new CollabClient(() => authStore.token)

  const isCollabMode = ref(false)
  const activeId = ref<string | null>(null)
  const role = ref<CollabRole | null>(null)
  const document = ref<CollabDocument | null>(null)
  const members = ref<CollabMember[]>([])
  const list = ref<CollabListItem[]>([])
  const cursor = ref(0)
  const status = ref<`idle` | `syncing` | `error`>(`idle`)
  const lastError = ref(``)
  const personalStyleSnapshot = ref<ReturnType<typeof snapshotPersonalStyle> | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let lastPushedStyle: ReturnType<typeof collectCollabStyle> | null = null
  let lastPushedContent = ``

  const isReadOnly = computed(() => role.value === `viewer`)
  const canWrite = computed(() => role.value === `owner` || role.value === `editor`)
  const isOwner = computed(() => role.value === `owner`)

  function applyRemoteDocument(remote: CollabDocument, options?: { refreshEditor?: boolean }): void {
    document.value = remote

    const localContent = editorStore.getContent()
    if (remote.content !== localContent && options?.refreshEditor !== false) {
      editorStore.importContent(remote.content)
      editorRefresh()
    }

    const currentStyle = collectCollabStyle()
    if (!collabStyleEquals(currentStyle, remote.style)) {
      void hydrateCollabStyle(remote.style).then(() => {
        editorRefresh()
      })
    }

    lastPushedContent = remote.content
    lastPushedStyle = { ...remote.style }
  }

  async function loadList(): Promise<void> {
    if (!authStore.isLoggedIn)
      return
    const result = await client.list()
    list.value = result.documents
  }

  async function openDocument(id: string): Promise<void> {
    if (!authStore.isLoggedIn)
      throw new Error(`login_required`)

    const detail = await client.get(id)
    if (!personalStyleSnapshot.value && !isCollabMode.value)
      personalStyleSnapshot.value = snapshotPersonalStyle()

    isCollabMode.value = true
    activeId.value = id
    role.value = detail.role
    members.value = detail.members
    document.value = detail.document
    cursor.value = detail.document.updatedAt

    await hydrateCollabStyle(detail.document.style)
    editorStore.importContent(detail.document.content)
    editorRefresh()

    lastPushedContent = detail.document.content
    lastPushedStyle = { ...detail.document.style }

    startPolling()
  }

  async function createFromCurrentPost(sourcePostId: string, title: string, content: string): Promise<string> {
    const style = collectCollabStyle()
    const result = await client.create({
      sourcePostId,
      title: title.trim() || `无标题`,
      content,
      style,
    })
    await loadList()
    await openDocument(result.id)
    return result.id
  }

  async function syncNow(): Promise<void> {
    if (!isCollabMode.value || !activeId.value || !canWrite.value)
      return

    status.value = `syncing`
    lastError.value = ``

    try {
      const pulled = await client.pull(activeId.value, cursor.value)
      if (pulled.document)
        applyRemoteDocument(pulled.document, { refreshEditor: true })
      cursor.value = Math.max(cursor.value, pulled.cursor)
      role.value = pulled.role

      const content = editorStore.getContent()
      const style = collectCollabStyle()
      const now = Date.now()
      const payload: {
        title?: string
        content?: string
        contentUpdatedAt?: number
        style?: typeof style
        styleUpdatedAt?: number
      } = {}

      const doc = document.value
      if (doc && content !== lastPushedContent) {
        payload.title = doc.title
        payload.content = content
        payload.contentUpdatedAt = now
      }

      if (lastPushedStyle && !collabStyleEquals(style, lastPushedStyle)) {
        payload.style = style
        payload.styleUpdatedAt = now
      }
      else if (!lastPushedStyle) {
        payload.style = style
        payload.styleUpdatedAt = now
      }

      if (payload.content !== undefined || payload.style !== undefined) {
        const pushed = await client.push(activeId.value, payload)
        document.value = pushed.document
        cursor.value = Math.max(cursor.value, pushed.cursor)
        lastPushedContent = pushed.document.content
        lastPushedStyle = { ...pushed.document.style }

        if (!pushed.merged.contentAccepted && payload.content !== undefined)
          applyRemoteDocument(pushed.document)
        if (!pushed.merged.styleAccepted && payload.style !== undefined) {
          void hydrateCollabStyle(pushed.document.style).then(() => editorRefresh())
        }
      }

      status.value = `idle`
    }
    catch (e) {
      status.value = `error`
      lastError.value = e instanceof ApiError ? e.message : String(e)
    }
  }

  function scheduleSync(): void {
    if (!isCollabMode.value || !canWrite.value)
      return
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      void syncNow()
    }, SYNC_DEBOUNCE_MS)
  }

  function startPolling(): void {
    stopPolling()
    pollTimer = setInterval(() => {
      void pullRemote()
    }, 8000)
  }

  function stopPolling(): void {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  async function pullRemote(): Promise<void> {
    if (!isCollabMode.value || !activeId.value)
      return

    try {
      const pulled = await client.pull(activeId.value, cursor.value)
      if (pulled.document)
        applyRemoteDocument(pulled.document)
      cursor.value = Math.max(cursor.value, pulled.cursor)
      role.value = pulled.role
    }
    catch {
      // 轮询失败静默忽略
    }
  }

  async function acceptInvite(token: string): Promise<string> {
    const result = await client.acceptInvite(token)
    await loadList()
    return result.documentId
  }

  async function createInvite(inviteRole: `editor` | `viewer`): Promise<string> {
    if (!activeId.value || !isOwner.value)
      throw new Error(`forbidden`)
    const result = await client.invite(activeId.value, { role: inviteRole })
    return result.inviteUrl
  }

  async function refreshMembers(): Promise<void> {
    if (!activeId.value || !isOwner.value)
      return
    const result = await client.listMembers(activeId.value)
    members.value = result.members
  }

  async function removeMember(userId: string): Promise<void> {
    if (!activeId.value || !isOwner.value)
      return
    const result = await client.updateMember(activeId.value, userId, null)
    members.value = result.members
  }

  async function exitCollab(): Promise<void> {
    stopPolling()
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    if (canWrite.value && isCollabMode.value)
      await syncNow().catch(() => {})

    isCollabMode.value = false
    activeId.value = null
    role.value = null
    document.value = null
    members.value = []
    cursor.value = 0
    lastPushedStyle = null
    lastPushedContent = ``

    if (personalStyleSnapshot.value) {
      restorePersonalStyle(personalStyleSnapshot.value)
      personalStyleSnapshot.value = null
      const themeStore = useThemeStore()
      themeStore.updateCodeTheme()
      await themeStore.applyCurrentTheme()
      editorRefresh()
    }
  }

  async function deleteCollab(): Promise<void> {
    if (!activeId.value || !isOwner.value)
      return
    await client.remove(activeId.value)
    await exitCollab()
    await loadList()
  }

  function notifyContentChanged(): void {
    scheduleSync()
  }

  function notifyStyleChanged(): void {
    scheduleSync()
  }

  return {
    isCollabMode,
    activeId,
    role,
    document,
    members,
    list,
    cursor,
    status,
    lastError,
    isReadOnly,
    canWrite,
    isOwner,
    loadList,
    openDocument,
    createFromCurrentPost,
    syncNow,
    scheduleSync,
    acceptInvite,
    createInvite,
    refreshMembers,
    removeMember,
    exitCollab,
    deleteCollab,
    notifyContentChanged,
    notifyStyleChanged,
  }
})
