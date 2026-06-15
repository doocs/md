import type { SyncSetting } from './types'
import { store } from '@/storage/manager'
import { safeGetItem } from '@/utils/localStorageSafe'
import { addPrefix } from '@/utils/prefix'

export interface ApplyRemoteSettingsResult {
  keys: string[]
}

/**
 * 允许同步的偏好设置 key 白名单（显式枚举，避免泄露密钥）。
 * 刻意不包含：图床配置（githubConfig/aliOSSConfig/s3Config 等）、
 * AI 密钥（openai_key_*）、运行时/临时状态。
 */
export const SYNC_SETTING_KEYS: string[] = [
  // 主题与样式
  addPrefix(`theme`),
  addPrefix(`themeSettings`),
  addPrefix(`use_indent`),
  addPrefix(`use_justify`),
  `isCiteStatus`,
  `isCountStatus`,
  `legend`,
  `previewWidth`,
  // 编辑器 / UI 偏好
  `isEditOnLeft`,
  `showAIToolbox`,
  `viewMode`,
  `previewDevice`,
  addPrefix(`copyMode`),
  addPrefix(`sort_mode`),
  addPrefix(`enableImageReupload`),
  addPrefix(`enableScrollSync`),
  // AI 非敏感参数（不含 key、不含 model）
  `openai_type`,
  `openai_temperature`,
  `openai_max_token`,
  // 自定义内容
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
 * 收集本地发生变化的设置项（与上次同步快照比对），并刷新元数据时间戳。
 * 返回需要推送的设置列表。
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
 * 应用远端设置到本地（LWW，仅当远端更新时间较新时写入）。
 * 返回实际应用的 key 列表，供 hydrateSyncedSettings 热更新 Store。
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
