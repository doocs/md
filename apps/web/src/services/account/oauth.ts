import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'
import { OAUTH_TOKEN_HASH_KEY } from './config'

export const ACCOUNT_TOKEN_KEY = addPrefix(`account_token`)
export const OAUTH_ERROR_HASH_KEY = `oauth_error`

export function parseOAuthHash(hash: string): { token: string | null, error: string | null } {
  const params = new URLSearchParams(hash.replace(/^#/, ``))
  return {
    token: params.get(OAUTH_TOKEN_HASH_KEY),
    error: params.get(OAUTH_ERROR_HASH_KEY),
  }
}

export function stripOAuthHashParams(hash: string): string {
  const params = new URLSearchParams(hash.replace(/^#/, ``))
  params.delete(OAUTH_TOKEN_HASH_KEY)
  params.delete(OAUTH_ERROR_HASH_KEY)
  return params.toString()
}

function replaceOAuthHash(): void {
  const rest = stripOAuthHashParams(window.location.hash)
  const newUrl = window.location.pathname + window.location.search + (rest ? `#${rest}` : ``)
  window.history.replaceState({}, ``, newUrl)
}

/** Capture OAuth redirect token / error from the URL fragment and clean the address bar. */
export function captureOAuthResult(setToken: (token: string) => void): { token: string | null, error: string | null } {
  const result = parseOAuthHash(window.location.hash)
  if (result.token) {
    setToken(result.token)
    store.set(ACCOUNT_TOKEN_KEY, result.token).catch(() => {})
  }

  if (result.token || result.error)
    replaceOAuthHash()

  return result
}

/** Capture OAuth redirect token from URL fragment and clean the address bar. */
export function captureOAuthToken(setToken: (token: string) => void): boolean {
  return Boolean(captureOAuthResult(setToken).token)
}
