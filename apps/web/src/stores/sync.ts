import type { SyncConfig, SyncManifest } from '@/services/sync'
import type { Post } from '@/stores/post'
import { storeToRefs } from 'pinia'
import { createSyncProvider, DEFAULT_SYNC_CONFIG } from '@/services/sync'
import { usePostStore } from '@/stores/post'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

// ──────────────────────────────────────────────────
// Settings keys that are included in every sync snapshot.
//
// These are all the localStorage keys that represent meaningful
// user configuration (preferences, credentials, theme, CSS).
// Purely ephemeral UI state (dialog open/close, isMobile…) is NOT included.
// ──────────────────────────────────────────────────
export const SYNC_SETTINGS_KEYS: string[] = [
  // Image / file upload
  `imgHost`,
  `githubConfig`,
  `giteeConfig`,
  `aliOSSConfig`,
  `txCOSConfig`,
  `qiniuConfig`,
  `minioConfig`,
  `s3Config`,
  `mpConfig`,
  `r2Config`,
  `upyunConfig`,
  `telegramConfig`,
  `cloudinaryConfig`,
  `formCustomConfig`,
  `useCompression`,
  // Editor preferences
  addPrefix(`isEditOnLeft`),
  addPrefix(`enableScrollSync`),
  addPrefix(`enableImageReupload`),
  `viewMode`,
  `previewDevice`,
  // Theme & style
  addPrefix(`theme`),
  addPrefix(`themeSettings`),
  addPrefix(`css_content_config`),
  `isCiteStatus`,
  `isCountStatus`,
  addPrefix(`use_indent`),
  addPrefix(`use_justify`),
  `legend`,
  `previewWidth`,
]

/** Sanitise a post title into a safe filename segment (max 50 chars). */
function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\u4E00-\u9FA5\-. ]/g, `_`).trim().slice(0, 50) || `untitled`
}

export const useSyncStore = defineStore(`sync`, () => {
  const syncConfig = store.reactive<SyncConfig>(`syncConfig`, DEFAULT_SYNC_CONFIG)
  const status = ref<`idle` | `testing` | `syncing` | `error`>(`idle`)
  const lastSyncTime = ref<string | null>(null)
  const statusMessage = ref(``)

  // ──────────────────────────────────────────────────
  // Settings helpers
  // ──────────────────────────────────────────────────

  async function captureSettings(): Promise<Record<string, string>> {
    const snapshot: Record<string, string> = {}
    for (const key of SYNC_SETTINGS_KEYS) {
      const value = await store.get(key)
      if (value !== null)
        snapshot[key] = value
    }
    return snapshot
  }

  async function applySettings(snapshot: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(snapshot)) {
      if (SYNC_SETTINGS_KEYS.includes(key)) {
        await store.set(key, value)
      }
    }
  }

  // ──────────────────────────────────────────────────
  // Public actions
  // ──────────────────────────────────────────────────

  /** Test the current provider configuration. Throws on failure. */
  async function testConnection(): Promise<void> {
    const provider = createSyncProvider(syncConfig.value)
    if (!provider)
      throw new Error(`请先选择同步提供商`)
    status.value = `testing`
    statusMessage.value = `正在连接…`
    try {
      await provider.test()
      status.value = `idle`
      statusMessage.value = `连接成功 ✓`
    }
    catch (e: any) {
      status.value = `error`
      statusMessage.value = e.message
      throw e
    }
  }

  /**
   * Push all documents + app settings to the remote backend.
   *
   * Write order:
   *  1. settings.json  – app configuration snapshot
   *  2. docs/*.md      – each post's Markdown content
   *  3. manifest.json  – document index (written last so it only appears
   *                      after all content has landed)
   */
  async function pushAll(): Promise<void> {
    const provider = createSyncProvider(syncConfig.value)
    if (!provider)
      throw new Error(`请先配置同步提供商`)

    status.value = `syncing`
    statusMessage.value = `正在上传…`

    try {
      const postStore = usePostStore()
      const { posts } = storeToRefs(postStore)
      const now = new Date().toISOString()

      // 1. Settings
      const settings = await captureSettings()
      await provider.write(`settings.json`, JSON.stringify(settings, null, 2), `application/json`)

      // 2. Documents
      const manifest: SyncManifest = { version: 1, updated: now, documents: [] }

      for (const post of posts.value) {
        const filename = `docs/${sanitizeFilename(post.title)}_${post.id.slice(0, 8)}.md`
        await provider.write(filename, post.content, `text/markdown; charset=utf-8`)
        manifest.documents.push({
          id: post.id,
          title: post.title,
          filename,
          updatedAt: new Date(post.updateDatetime).toISOString(),
        })
        statusMessage.value = `正在上传 ${manifest.documents.length} / ${posts.value.length}…`
      }

      // 3. Manifest (last)
      await provider.write(`manifest.json`, JSON.stringify(manifest, null, 2), `application/json`)

      lastSyncTime.value = now
      status.value = `idle`
      statusMessage.value = `上传完成 (${manifest.documents.length} 篇文档)`
    }
    catch (e: any) {
      status.value = `error`
      statusMessage.value = e.message
      throw e
    }
  }

  /**
   * Pull all documents + app settings from the remote backend.
   *
   * Merge strategy:
   *  - If a post with the same `id` already exists locally → update title + content.
   *  - If the post does not exist locally → import it as a new post.
   *  - Local-only posts are NOT deleted (non-destructive pull).
   *
   * After the call the caller should reload the page or trigger a full
   * re-render so that settings changes take effect.
   */
  async function pullAll(): Promise<{ documents: number, settingsApplied: boolean }> {
    const provider = createSyncProvider(syncConfig.value)
    if (!provider)
      throw new Error(`请先配置同步提供商`)

    status.value = `syncing`
    statusMessage.value = `正在下载…`

    try {
      const postStore = usePostStore()
      const { posts } = storeToRefs(postStore)

      // 1. Manifest
      const manifestStr = await provider.read(`manifest.json`)
      if (!manifestStr)
        throw new Error(`未找到同步数据，请先执行上传`)
      const manifest: SyncManifest = JSON.parse(manifestStr)

      // 2. Documents
      let imported = 0
      for (const docMeta of manifest.documents) {
        const content = await provider.read(docMeta.filename)
        if (content === null)
          continue

        const existing = posts.value.find(p => p.id === docMeta.id)
        if (existing) {
          postStore.updatePostContent(docMeta.id, content)
          postStore.renamePost(docMeta.id, docMeta.title)
        }
        else {
          const newPost: Post = {
            id: docMeta.id,
            title: docMeta.title,
            content,
            history: [{ datetime: new Date().toLocaleString(`zh-cn`), content }],
            createDatetime: new Date(),
            updateDatetime: new Date(docMeta.updatedAt),
          }
          posts.value.push(newPost)
        }
        imported++
        statusMessage.value = `已下载 ${imported} / ${manifest.documents.length}…`
      }

      // 3. Settings
      let settingsApplied = false
      const settingsStr = await provider.read(`settings.json`)
      if (settingsStr) {
        await applySettings(JSON.parse(settingsStr))
        settingsApplied = true
      }

      lastSyncTime.value = new Date().toISOString()
      status.value = `idle`
      statusMessage.value = `下载完成 (${imported} 篇文档${settingsApplied ? `，设置已应用` : ``})`
      return { documents: imported, settingsApplied }
    }
    catch (e: any) {
      status.value = `error`
      statusMessage.value = e.message
      throw e
    }
  }

  return {
    syncConfig,
    status,
    lastSyncTime,
    statusMessage,
    testConnection,
    pushAll,
    pullAll,
  }
})
