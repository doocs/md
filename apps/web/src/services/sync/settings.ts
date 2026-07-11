import type { SyncSetting } from './types'
import { store } from '@/storage/manager'
import { addPrefix } from '@/storage/prefix'
import { safeGetItem } from '@/storage/safe-access'

export interface ApplyRemoteSettingsResult {
  keys: string[]
}

/**
 * Whitelist of preference keys allowed to sync (explicit enum; excludes secrets).
 * Excludes image-host configs (githubConfig/aliOSSConfig/s3Config, etc.),
 * AI keys (openai_key_*), and runtime/ephemeral state.
 */
export const SYNC_SETTING_KEYS: string[] = [
  // Theme and styling
  addPrefix(`theme`),
  addPrefix(`themeSettings`),
  addPrefix(`use_indent`),
  addPrefix(`use_justify`),
  `isCiteStatus`,
  `isCountStatus`,
  `legend`,
  `previewWidth`,
  // Editor / UI preferences
  `locale`,
  `showAIToolbox`,
  `viewMode`,
  `previewDevice`,
  addPrefix(`copyMode`),
  addPrefix(`sort_mode`),
  addPrefix(`enableImageReupload`),
  addPrefix(`enableScrollSync`),
  // Non-sensitive AI params (no keys, no model)
  `openai_type`,
  `openai_temperature`,
  `openai_max_token`,
  // Custom content
  addPrefix(`css_content_config`),
  addPrefix(`templates`),
  addPrefix(`custom_components`),
  `quick_commands`,
]

const META_KEY = addPrefix(`sync_settings_meta`)

interface SettingMeta {
  value: string | null
  updatedAt: number
}

type MetaMap = Record<string, SettingMeta>

function readMeta(): MetaMap {
  const raw = safeGetItem(META_KEY)
  if (!raw)
    return {}
  try {
    return JSON.parse(raw) as MetaMap
  }
  catch {
    return {}
  }
}

async function writeMeta(meta: MetaMap): Promise<void> {
  await store.set(META_KEY, JSON.stringify(meta))
}

function readLocal(key: string): string | null {
  return safeGetItem(key)
}

/**
 * Collect locally changed settings (vs last sync snapshot) and refresh meta timestamps.
 * Returns the list to push upstream.
 */
export function collectChangedSettings(): SyncSetting[] {
  const meta = readMeta()
  const now = Date.now()
  const changed: SyncSetting[] = []

  for (const key of SYNC_SETTING_KEYS) {
    const current = readLocal(key)
    const prev = meta[key]
    if (!prev || prev.value !== current) {
      meta[key] = { value: current, updatedAt: now }
      changed.push({ key, value: current, updatedAt: now })
    }
  }

  void writeMeta(meta)
  return changed
}

/**
 * Apply remote settings locally (LWW; write only when remote is newer).
 * Returns applied keys for hydrateSyncedSettings to hot-reload stores.
 */
export async function applyRemoteSettings(remote: SyncSetting[]): Promise<ApplyRemoteSettingsResult> {
  const meta = readMeta()
  const appliedKeys: string[] = []

  for (const setting of remote) {
    if (!SYNC_SETTING_KEYS.includes(setting.key))
      continue

    const local = meta[setting.key]
    if (local && local.updatedAt >= setting.updatedAt)
      continue

    try {
      if (setting.value === null)
        await store.remove(setting.key)
      else
        await store.set(setting.key, setting.value)
    }
    catch {
      continue
    }

    meta[setting.key] = { value: setting.value, updatedAt: setting.updatedAt }
    appliedKeys.push(setting.key)
  }

  await writeMeta(meta)
  return { keys: appliedKeys }
}
