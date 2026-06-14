import type { SyncDocument } from '@/services/sync/types'
import { ApiError } from '@/services/account/client'
import { isSyncConfigured } from '@/services/sync/client'
import { mergeRemoteIntoLocal, postToDoc, toMs } from '@/services/sync/merge'
import { isProPlan, SYNC_DEBOUNCE_MS_PRO, SYNC_PRO_ENABLED } from '@/services/sync/plan'
import { applyRemoteSettings, collectChangedSettings } from '@/services/sync/settings'
import { useAuthStore } from '@/stores/auth'
import { usePostStore } from '@/stores/post'
import { addPrefix } from '@/utils/prefix'
import { store } from '@/utils/storage'

export type SyncStatus = 'idle' | 'syncing' | 'error'

const SYNCED_IDS_KEY = addPrefix(`sync_post_ids`)

function readSyncedIds(): string[] {
  try {
    const raw = localStorage.getItem(SYNCED_IDS_KEY)
    return raw ? JSON.parse(raw) as string[] : []
  }
  catch {
    return []
  }
}

function writeSyncedIds(ids: string[]): void {
  try {
    localStorage.setItem(SYNCED_IDS_KEY, JSON.stringify(ids))
  }
  catch { /* 配额错误，非致命 */ }
}

/**
 * 云同步 Store
 * 负责同步状态机、手动/自动同步编排、上次同步时间
 */
export const useSyncStore = defineStore(`sync`, () => {
  const authStore = useAuthStore()
  const postStore = usePostStore()

  const status = ref<SyncStatus>(`idle`)
  const lastError = ref<string>(``)
  const lastSyncAt = store.reactive<number>(addPrefix(`sync_last_at`), 0)
  const autoSyncEnabled = store.reactive(addPrefix(`sync_auto`), false)
  const needsRefresh = ref(false)

  let cursor = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const isAvailable = computed(() => isSyncConfigured() && authStore.isLoggedIn)
  const isSyncing = computed(() => status.value === `syncing`)
  const isPro = computed(() => isProPlan(authStore.user?.plan))
  const syncDebounceMs = computed(() => SYNC_DEBOUNCE_MS_PRO)

  const lastLocalEditAt = computed(() => {
    let max = 0
    for (const p of postStore.posts) {
      const t = new Date(p.updateDatetime).getTime()
      if (Number.isFinite(t) && t > max)
        max = t
    }
    return max
  })

  const hasPendingChanges = computed(() => lastSyncAt.value === 0 || lastLocalEditAt.value > lastSyncAt.value)

  const syncState = computed<'syncing' | 'synced' | 'error' | 'pending'>(() => {
    if (status.value === `syncing`)
      return `syncing`
    if (status.value === `error`)
      return `error`
    if (lastSyncAt.value > 0 && !hasPendingChanges.value)
      return `synced`
    return `pending`
  })

  function collectLocalDocuments(): SyncDocument[] {
    const now = Date.now()
    const since = lastSyncAt.value
    const currentIds = new Set(postStore.posts.map(p => p.id))

    const changedDocs = postStore.posts
      .filter(p => since === 0 || toMs(p.updateDatetime) > since)
      .map(postToDoc)

    const tombstones: SyncDocument[] = readSyncedIds()
      .filter(id => !currentIds.has(id))
      .map(id => ({
        id,
        title: ``,
        content: ``,
        parentId: null,
        history: [],
        createDatetime: now,
        updateDatetime: now,
        deleted: true,
      }))

    return [...changedDocs, ...tombstones]
  }

  function formatSyncError(e: unknown): string {
    if (e instanceof ApiError) {
      if (e.status === 429)
        return `同步次数已达上限，请稍后再试`
      return e.message
    }
    return e instanceof Error ? e.message : String(e)
  }

  async function sync(): Promise<void> {
    if (!isAvailable.value || status.value === `syncing`)
      return

    status.value = `syncing`
    lastError.value = ``

    try {
      const pulled = await authStore.syncClient.pull(cursor)

      if (pulled.documents.length) {
        const { posts, changed } = mergeRemoteIntoLocal(postStore.posts, pulled.documents)
        if (changed)
          postStore.posts = posts
      }

      if (pulled.settings.length) {
        const applied = applyRemoteSettings(pulled.settings)
        if (applied > 0)
          needsRefresh.value = true
      }

      cursor = Math.max(cursor, pulled.cursor)

      const documents = collectLocalDocuments()
      const settings = collectChangedSettings()
      if (documents.length || settings.length) {
        const pushed = await authStore.syncClient.push({ documents, settings })
        cursor = Math.max(cursor, pushed.cursor)
      }

      writeSyncedIds(postStore.posts.map(p => p.id))
      lastSyncAt.value = Date.now()
      status.value = `idle`
    }
    catch (e) {
      status.value = `error`
      lastError.value = formatSyncError(e)
    }
  }

  function scheduleAutoSync(): void {
    if (!isPro.value || !autoSyncEnabled.value || !isAvailable.value)
      return
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      sync()
    }, syncDebounceMs.value)
  }

  function startAutoSyncWatcher(): void {
    if (!SYNC_PRO_ENABLED)
      return
    watch(
      () => postStore.posts,
      () => scheduleAutoSync(),
      { deep: true },
    )
    watch(syncDebounceMs, () => {
      if (autoSyncEnabled.value)
        scheduleAutoSync()
    })
  }

  function reset(): void {
    cursor = 0
    lastSyncAt.value = 0
    needsRefresh.value = false
    status.value = `idle`
    try {
      localStorage.removeItem(SYNCED_IDS_KEY)
      localStorage.removeItem(addPrefix(`sync_settings_meta`))
    }
    catch { /* ignore */ }
  }

  return {
    status,
    lastError,
    lastSyncAt,
    autoSyncEnabled,
    needsRefresh,
    isAvailable,
    isSyncing,
    isPro,
    syncDebounceMs,
    hasPendingChanges,
    syncState,
    sync,
    scheduleAutoSync,
    startAutoSyncWatcher,
    reset,
  }
})
