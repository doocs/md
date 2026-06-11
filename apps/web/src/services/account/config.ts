/** md-api 后端地址（云同步、账户登录等共用） */
export const MD_API_URL = (
  import.meta.env.VITE_MD_API_URL
    ?? import.meta.env.VITE_SYNC_API_URL
    ?? ``
).replace(/\/$/, ``)

/** OAuth 回跳 fragment 参数名 */
export const OAUTH_TOKEN_HASH_KEY = `account_token`

/** 旧版回跳参数名，兼容已部署后端 */
export const LEGACY_OAUTH_TOKEN_HASH_KEY = `sync_token`

export function isAccountConfigured(): boolean {
  return Boolean(MD_API_URL)
}

/** 是否在 UI 展示账户入口（登录/账户信息） */
export function isAccountUiEnabled(): boolean {
  const flag = import.meta.env.VITE_ACCOUNT_UI_ENABLED
  if (flag === `false` || flag === `0`)
    return false
  return isAccountConfigured()
}

/** 发起 GitHub 登录 */
export function gotoLogin(): void {
  const entry = `${window.location.origin}${window.location.pathname}`
  const redirect = encodeURIComponent(entry)
  window.location.href = `${MD_API_URL}/auth/github?redirect=${redirect}`
}
