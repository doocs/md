import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'
import { LEGACY_OAUTH_TOKEN_HASH_KEY, OAUTH_TOKEN_HASH_KEY } from './config'

export const ACCOUNT_TOKEN_KEY = addPrefix(`account_token`)
const LEGACY_TOKEN_KEY = addPrefix(`sync_token`)

const HASH_KEYS = [OAUTH_TOKEN_HASH_KEY, LEGACY_OAUTH_TOKEN_HASH_KEY] as const

/** 启动时迁移旧版 sync_token 存储键 */
export async function migrateLegacyToken(): Promise<void> {
  try {
    const legacy = await store.get(LEGACY_TOKEN_KEY)
    if (!legacy)
      return
    const current = await store.get(ACCOUNT_TOKEN_KEY)
    if (!current)
      await store.set(ACCOUNT_TOKEN_KEY, legacy)
    await store.remove(LEGACY_TOKEN_KEY)
  }
  catch { /* ignore */ }
}

/**
 * 从 URL fragment 捕获 OAuth 回跳 token，捕获后清理地址栏。
 * 兼容 account_token 与旧版 sync_token。
 */
export function captureOAuthToken(setToken: (token: string) => void): boolean {
  const hash = window.location.hash.replace(/^#/, ``)
  const params = new URLSearchParams(hash)

  let matchedKey: string | null = null
  let token: string | null = null
  for (const key of HASH_KEYS) {
    const value = params.get(key)
    if (value) {
      matchedKey = key
      token = value
      break
    }
  }

  if (!matchedKey || !token)
    return false

  setToken(token)
  store.set(ACCOUNT_TOKEN_KEY, token).catch(() => {})

  params.delete(matchedKey)
  const rest = params.toString()
  const newUrl = window.location.pathname + window.location.search + (rest ? `#${rest}` : ``)
  window.history.replaceState({}, ``, newUrl)
  return true
}
