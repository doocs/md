/** md-api base URL (cloud sync, account login, etc.). */
export const MD_API_URL = (
  import.meta.env.VITE_MD_API_URL
    ?? import.meta.env.VITE_SYNC_API_URL
    ?? ``
).replace(/\/$/, ``)

/** OAuth redirect fragment parameter name. */
export const OAUTH_TOKEN_HASH_KEY = `account_token`

export function isAccountConfigured(): boolean {
  return Boolean(MD_API_URL)
}

/** Whether to show account entry in UI (login / profile). */
export function isAccountUiEnabled(): boolean {
  const flag = import.meta.env.VITE_ACCOUNT_UI_ENABLED
  if (flag === `false` || flag === `0`)
    return false
  return isAccountConfigured()
}

/** Start GitHub OAuth login. */
export function gotoLogin(): void {
  const entry = `${window.location.origin}${window.location.pathname}`
  const redirect = encodeURIComponent(entry)
  window.location.href = `${MD_API_URL}/auth/github?redirect=${redirect}`
}
