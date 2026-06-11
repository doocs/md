import type { SyncDocument } from '@/services/sync/types'
import { isSyncConfigured } from '@/services/sync/client'
import { mergeRemoteIntoLocal, postToDoc } from '@/services/sync/merge'
import { applyRemoteSettings, collectChangedSettings } from '@/services/sync/settings'
import { useAuthStore } from '@/stores/auth'
import { usePostStore } from '@/stores/post'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

export type SyncStatus = 'idle' | 'syncing' | 'error'

const SYNCED_IDS_KEY = addPrefix(`sync_post_ids`)
const AUTO_SYNC_DEBOUNCE = 3000

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
  // 上次同步成功时间（持久化展示）
  const lastSyncAt = store.reactive<number>(addPrefix(`sync_last_at`), 0)
  // 是否开启自动同步
  const autoSyncEnabled = store.reactive(addPrefix(`sync_auto`), true)
  // 应用了远端设置、建议刷新生效
  const needsRefresh = ref(false)

  // 会话内增量游标（每次启动从 0 全量拉取，避免账号切换错乱）
  let cursor = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const isAvailable = computed(() => isSyncConfigured() && authStore.isLoggedIn)
  const isSyncing = computed(() => status.value === `syncing`)

  // 本地最近一次编辑时间（取所有文章 updateDatetime 的最大值）
  const lastLocalEditAt = computed(() => {
    let max = 0
    for (const p of postStore.posts) {
      const t = new Date(p.updateDatetime).getTime()
      if (Number.isFinite(t) && t > max)
        max = t
    }
    return max
  })

  // 是否存在尚未同步到云端的本地改动
  const hasPendingChanges = computed(() => lastSyncAt.value === 0 || lastLocalEditAt.value > lastSyncAt.value)

  /**
   * 同步图标状态：
   * - syncing：正在同步（loading）
   * - synced：已与云端一致（绿色对勾）
   * - error：上次同步失败
   * - pending：有本地改动待同步（普通云朵）
   */
  const syncState = computed<'syncing' | 'synced' | 'error' | 'pending'>(() => {
    if (status.value === `syncing`)
      return `syncing`
    if (status.value === `error`)
      return `error`
    if (lastSyncAt.value > 0 && !hasPendingChanges.value)
      return `synced`
    return `pending`
  })

  /** 收集本地待推送的文档（含本地删除的墓碑） */
  function collectLocalDocuments(): SyncDocument[] {
    const now = Date.now()
    const currentDocs = postStore.posts.map(postToDoc)
    const currentIds = new Set(postStore.posts.map(p => p.id))

    // 上次同步存在、本地已不存在 ➜ 视为本地删除，下发墓碑
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

    return [...currentDocs, ...tombstones]
  }

  /** 执行一次完整同步：pull ➜ 合并 ➜ push */
  async function sync(): Promise<void> {
    if (!isAvailable.value || status.value === `syncing`)
      return

    status.value = `syncing`
    lastError.value = ``

    try {
      // 1. 拉取远端变更
      const pulled = await authStore.client.pull(cursor)

      // 2. 合并文档（LWW，败方进 history）
      if (pulled.documents.length) {
        const { posts, changed } = mergeRemoteIntoLocal(postStore.posts, pulled.documents)
        if (changed)
          postStore.posts = posts
      }

      // 3. 应用远端设置
      if (pulled.settings.length) {
        const applied = applyRemoteSettings(pulled.settings)
        if (applied > 0)
          needsRefresh.value = true
      }

      cursor = Math.max(cursor, pulled.cursor)

      // 4. 收集并推送本地变更
      const documents = collectLocalDocuments()
      const settings = collectChangedSettings()
      if (documents.length || settings.length) {
        const pushed = await authStore.client.push({ documents, settings })
        cursor = Math.max(cursor, pushed.cursor)
      }

      // 5. 记录已同步快照
      writeSyncedIds(postStore.posts.map(p => p.id))
      lastSyncAt.value = Date.now()
      status.value = `idle`
    }
    catch (e) {
      status.value = `error`
      lastError.value = e instanceof Error ? e.message : String(e)
    }
  }

  /** 自动同步（防抖触发） */
  function scheduleAutoSync(): void {
    if (!autoSyncEnabled.value || !isAvailable.value)
      return
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      sync()
    }, AUTO_SYNC_DEBOUNCE)
  }

  /** 监听本地文章变化，触发防抖自动同步 */
  function startAutoSyncWatcher(): void {
    watch(
      () => postStore.posts,
      () => scheduleAutoSync(),
      { deep: true },
    )
  }

  /** 登出时清理同步本地痕迹，防止账号间数据串味 */
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
    hasPendingChanges,
    syncState,
    sync,
    scheduleAutoSync,
    startAutoSyncWatcher,
    reset,
  }
})
