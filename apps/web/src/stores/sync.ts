import type { SyncDocument } from '@/services/sync/types'
import { t } from '@/i18n/translate'
import { postSignature } from '@/lib/post-signature'
import { ApiError } from '@/services/account/client'
import { isSyncConfigured } from '@/services/sync/client'
import { hydrateSyncedSettings } from '@/services/sync/hydrate'
import { mergeRemoteIntoLocal, postToDoc, toMs } from '@/services/sync/merge'
import { isProPlan, SYNC_DEBOUNCE_MS_PRO, SYNC_PRO_ENABLED } from '@/services/sync/plan'
import { buildPushBatches } from '@/services/sync/push-batch'
import { applyRemoteSettings, collectChangedSettings } from '@/services/sync/settings'
import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'
import { safeGetItem, safeRemoveItem, safeSetItem } from '@/storage/safe-access'
import { useAuthStore } from '@/stores/auth'
import { usePostStore } from '@/stores/post'

export type SyncStatus = 'idle' | 'syncing' | 'error'

const SYNCED_IDS_KEY = addPrefix(`sync_post_ids`)

function readSyncedIds(): string[] {
  const raw = safeGetItem(SYNCED_IDS_KEY)
  if (!raw)
    return []
  try {
    return JSON.parse(raw) as string[]
  }
  catch {
    return []
  }
}

function writeSyncedIds(ids: string[]): void {
  safeSetItem(SYNCED_IDS_KEY, JSON.stringify(ids))
}

/** Cloud sync: state machine, manual/auto sync orchestration, last sync time. */
export const useSyncStore = defineStore(`sync`, () => {
  const authStore = useAuthStore()
  const postStore = usePostStore()

  const status = ref<SyncStatus>(`idle`)
  const lastError = ref<string>(``)
  const lastSyncAt = store.reactive<number>(addPrefix(`sync_last_at`), 0)
  const autoSyncEnabled = store.reactive(addPrefix(`sync_auto`), false)

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
        return t(`store.sync.rateLimited`)
      if (e.status === 403)
        return t(`store.sync.quotaExceeded`)
      if (e.status === 413)
        return t(`store.sync.payloadTooLarge`)
      return e.message
    }
    return e instanceof Error ? e.message : String(e)
  }

  async function pushInBatches(
    documents: SyncDocument[],
    settings: ReturnType<typeof collectChangedSettings>,
  ): Promise<number> {
    let nextCursor = 0
    for (const batch of buildPushBatches(documents, settings)) {
      const pushed = await authStore.syncClient.push(batch)
      nextCursor = Math.max(nextCursor, pushed.cursor)
    }
    return nextCursor
  }

  async function sync(): Promise<void> {
    if (!isAvailable.value || status.value === `syncing`)
      return

    status.value = `syncing`
    lastError.value = ``

    try {
      const tombstones = collectLocalDocuments().filter(doc => doc.deleted)
      if (tombstones.length)
        cursor = Math.max(cursor, await pushInBatches(tombstones, []))

      const pulled = await authStore.syncClient.pull(cursor)

      if (pulled.documents.length) {
        const { posts, changed } = mergeRemoteIntoLocal(postStore.posts, pulled.documents)
        if (changed)
          await postStore.replacePostsAndPersist(posts)
      }

      if (pulled.settings.length) {
        const { keys } = await applyRemoteSettings(pulled.settings)
        if (keys.length)
          await hydrateSyncedSettings(keys)
      }

      cursor = Math.max(cursor, pulled.cursor)

      const documents = collectLocalDocuments()
      const settings = collectChangedSettings()
      if (documents.length || settings.length)
        cursor = Math.max(cursor, await pushInBatches(documents, settings))

      writeSyncedIds(postStore.posts.map(p => p.id))
      await postStore.persistImmediately()
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

  let autoSyncWatcherStarted = false

  function startAutoSyncWatcher(): void {
    if (!SYNC_PRO_ENABLED || autoSyncWatcherStarted)
      return
    autoSyncWatcherStarted = true
    // Shallow per-post signatures instead of a deep watch: only fires when a
    // field that matters for sync actually changes, and never deep-traverses
    // post bodies or history entries on every edit.
    watch(
      () => postStore.posts.map(postSignature),
      () => scheduleAutoSync(),
    )
    watch(syncDebounceMs, () => {
      if (autoSyncEnabled.value)
        scheduleAutoSync()
    })
  }

  function reset(): void {
    cursor = 0
    lastSyncAt.value = 0
    status.value = `idle`
    safeRemoveItem(SYNCED_IDS_KEY)
    safeRemoveItem(addPrefix(`sync_settings_meta`))
  }

  return {
    status,
    lastError,
    lastSyncAt,
    autoSyncEnabled,
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
