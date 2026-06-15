import type { PerThemeSettings, PerThemeSettingsMap, ThemeName } from '@md/shared/configs'

import type { IndexedDBEngine } from '@/storage/engines/indexed-db'
import type { Post } from '@/types/post'
import { defaultPerThemeSettings, defaultStyleConfig } from '@md/shared/configs'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '@/storage/db'
import {
  isAppLocalStorageKey,
  KEY_LEGACY_MIGRATED,
  KEY_MP_PROFILE_MIGRATED,
  KEY_THEME,
  KEY_THEME_SETTINGS,
  LEGACY_POSTS_KEY,
  LEGACY_THEME_KEYS,
  STORE_CACHE,
} from '@/storage/keys'
import { parseStoredValue } from '@/storage/quota'
import { trimCacheValue } from '@/storage/repositories/cache'
import { documentRepo } from '@/storage/repositories/documents'
import { addPrefix } from '@/utils/prefix'

function legacyRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  }
  catch {
    // ignore
  }
}

function collectLocalStorageKeys(): string[] {
  const keys: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key)
        keys.push(key)
    }
  }
  catch {
    // ignore
  }
  return keys
}

function legacyGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  }
  catch {
    return null
  }
}

export interface MigrationResult {
  ok: boolean
  keys: string[]
}

/**
 * 迁移完成后清理 localStorage 中已迁入 IndexedDB 的应用数据。
 * @param explicitKeys 本次迁移涉及的 key；省略则扫描所有本应用 key
 * @returns 删除的 key 数量
 */
export function cleanupMigratedLocalStorage(explicitKeys?: string[]): number {
  const candidates = new Set<string>()

  if (explicitKeys?.length) {
    for (const key of explicitKeys)
      candidates.add(key)
  }
  else {
    for (const key of collectLocalStorageKeys()) {
      if (isAppLocalStorageKey(key))
        candidates.add(key)
    }
  }

  candidates.add(LEGACY_POSTS_KEY)
  candidates.add(addPrefix(`mp-profile`))
  for (const key of LEGACY_THEME_KEYS)
    candidates.add(key)

  let removed = 0
  for (const key of candidates) {
    if (legacyGet(key) === null)
      continue
    legacyRemove(key)
    removed++
  }

  if (removed > 0)
    console.info(`[Storage] Removed ${removed} migrated localStorage entries`)

  return removed
}

function parsePosts(raw: string): Post[] | null {
  try {
    const parsed = JSON.parse(raw) as Post[]
    if (!Array.isArray(parsed))
      return null
    return parsed.map((post, index) => {
      const now = Date.now()
      return {
        ...post,
        createDatetime: new Date(post.createDatetime ?? now + index),
        updateDatetime: new Date(post.updateDatetime ?? now + index),
        history: post.history ?? [],
      }
    })
  }
  catch {
    return null
  }
}

export async function migrateLegacyThemeSettings(engine: IndexedDBEngine): Promise<void> {
  if (legacyGet(KEY_LEGACY_MIGRATED) !== null || (await engine.get(KEY_LEGACY_MIGRATED)) !== null)
    return

  const hasAnyLegacyKey = LEGACY_THEME_KEYS.some(key => legacyGet(key) !== null)
  if (!hasAnyLegacyKey)
    return

  const initialTheme = (legacyGet(KEY_THEME) ?? (await engine.get(KEY_THEME)) ?? defaultStyleConfig.theme) as ThemeName
  const existingMapRaw = legacyGet(KEY_THEME_SETTINGS) ?? (await engine.get(KEY_THEME_SETTINGS))
  const existingMap: PerThemeSettingsMap = existingMapRaw
    ? parseStoredValue(existingMapRaw, {} as PerThemeSettingsMap)
    : {}

  const defaults = defaultPerThemeSettings()
  const settings: PerThemeSettings = { ...existingMap[initialTheme] ?? defaults }

  const legacyFont = legacyGet(`fonts`)
  if (legacyFont)
    settings.fontFamily = legacyFont

  const legacySize = legacyGet(`size`)
  if (legacySize)
    settings.fontSize = legacySize

  const legacyColor = legacyGet(`color`)
  if (legacyColor)
    settings.primaryColor = legacyColor

  const legacyCodeTheme = legacyGet(`codeBlockTheme`)
  if (legacyCodeTheme)
    settings.codeBlockTheme = legacyCodeTheme

  const legacyHeading = legacyGet(`headingStyles`)
  if (legacyHeading) {
    try { settings.headingStyles = JSON.parse(legacyHeading) }
    catch { /* ignore */ }
  }

  const legacyMacBlock = legacyGet(`isMacCodeBlock`)
  if (legacyMacBlock !== null)
    settings.isMacCodeBlock = legacyMacBlock === `true`

  const legacyLineNum = legacyGet(`isShowLineNumber`)
  if (legacyLineNum !== null)
    settings.isShowLineNumber = legacyLineNum === `true`

  const result: PerThemeSettingsMap = { ...existingMap, [initialTheme]: settings }
  await engine.set(KEY_THEME_SETTINGS, JSON.stringify(result))
  await engine.set(KEY_LEGACY_MIGRATED, `1`)

  for (const key of LEGACY_THEME_KEYS) {
    try { localStorage.removeItem(key) }
    catch { /* ignore */ }
  }
}

export async function migrateMpProfile(engine: IndexedDBEngine): Promise<void> {
  if ((await engine.get(KEY_MP_PROFILE_MIGRATED)) === `1`)
    return

  const accountsKey = addPrefix(`mp-accounts`)
  const existing = await engine.get(accountsKey)
  if (existing !== null) {
    await engine.set(KEY_MP_PROFILE_MIGRATED, `1`)
    return
  }

  const oldRaw = legacyGet(addPrefix(`mp-profile`))
  if (!oldRaw) {
    await engine.set(KEY_MP_PROFILE_MIGRATED, `1`)
    return
  }

  try {
    const old = JSON.parse(oldRaw)
    if (!old || (!old.name && !old.id)) {
      await engine.set(KEY_MP_PROFILE_MIGRATED, `1`)
      return
    }

    const migrated = [{
      id: uuidv4(),
      mpId: old.id ?? ``,
      name: old.name ?? ``,
      logo: old.logo ?? ``,
      desc: old.desc ?? ``,
      serviceType: old.serviceType ?? `1`,
      verify: old.verify ?? `0`,
    }]
    await engine.set(accountsKey, JSON.stringify(migrated))
    await engine.set(addPrefix(`mp-current-account-id`), migrated[0].id)
  }
  catch {
    // ignore
  }
  finally {
    await engine.set(KEY_MP_PROFILE_MIGRATED, `1`)
    legacyRemove(addPrefix(`mp-profile`))
  }
}

/**
 * 将 localStorage 全量迁入 IndexedDB（首次启动执行一次）。
 */
export async function migrateFromLocalStorage(engine: IndexedDBEngine): Promise<MigrationResult> {
  const keysToMigrate: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key)
        keysToMigrate.push(key)
    }
  }
  catch {
    // ignore
  }

  const postsRaw = legacyGet(LEGACY_POSTS_KEY)
  if (postsRaw !== null) {
    const posts = parsePosts(postsRaw)
    if (posts === null)
      return { ok: false, keys: keysToMigrate }
    if (posts.length)
      await documentRepo.saveAll(posts)
  }

  try {
    for (const key of keysToMigrate) {
      if (key === LEGACY_POSTS_KEY)
        continue

      const value = legacyGet(key)
      if (value === null)
        continue

      await engine.set(key, trimCacheValue(key, value))
    }
    return { ok: true, keys: keysToMigrate }
  }
  catch (error) {
    console.error(`[Storage] KV migration failed:`, error)
    return { ok: false, keys: keysToMigrate }
  }
}

/** 清除 cache store */
export async function clearCacheStore(): Promise<void> {
  const db = await getDatabase()
  await db.clear(STORE_CACHE)
}
