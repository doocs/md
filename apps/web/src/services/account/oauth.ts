import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'
import { OAUTH_TOKEN_HASH_KEY } from './config'

export const ACCOUNT_TOKEN_KEY = addPrefix(`account_token`)

/** 从 URL fragment 捕获 OAuth 回跳 token，捕获后清理地址栏 */
export function captureOAuthToken(setToken: (token: string) => void): boolean {
  const hash = window.location.hash.replace(/^#/, ``)
  const params = new URLSearchParams(hash)
  const token = params.get(OAUTH_TOKEN_HASH_KEY)

  if (!token)
    return false

  setToken(token)
  store.set(ACCOUNT_TOKEN_KEY, token).catch(() => {})

  params.delete(OAUTH_TOKEN_HASH_KEY)
  const rest = params.toString()
  const newUrl = window.location.pathname + window.location.search + (rest ? `#${rest}` : ``)
  window.history.replaceState({}, ``, newUrl)
  return true
}
