import { MD_API_URL, OAUTH_TOKEN_HASH_KEY } from './config'

interface IdentityApi {
  getRedirectURL: (path?: string) => string
  launchWebAuthFlow: (details: { url: string, interactive: boolean }) => Promise<string>
}

const EXTENSION_PROTOCOLS = new Set([
  `chrome-extension:`,
  `moz-extension:`,
  `safari-web-extension:`,
])

export type ExtensionLoginResult
  = | { ok: true, token: string }
    | { ok: false, reason: `cancelled` | `no_token` | `unavailable` }

function getExtensionRuntimeId(): string | undefined {
  const g = globalThis as {
    browser?: { runtime?: { id?: string } }
    chrome?: { runtime?: { id?: string } }
  }
  return g.browser?.runtime?.id ?? g.chrome?.runtime?.id
}

/** 是否在浏览器扩展页面内运行（chrome-extension:// / moz-extension://） */
export function isExtensionContext(): boolean {
  if (!EXTENSION_PROTOCOLS.has(window.location.protocol))
    return false
  return Boolean(getExtensionRuntimeId())
}

function getIdentityApi(): IdentityApi | null {
  const g = globalThis as {
    browser?: { identity?: IdentityApi }
    chrome?: { identity?: IdentityApi }
  }
  return g.browser?.identity ?? g.chrome?.identity ?? null
}

export function extractOAuthTokenFromUrl(url: string): string | null {
  try {
    const hash = new URL(url).hash.replace(/^#/, ``)
    return new URLSearchParams(hash).get(OAUTH_TOKEN_HASH_KEY)
  }
  catch {
    return null
  }
}

function isOAuthFlowCancelled(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /cancell?ed|did not approve|closed|aborted/i.test(message)
}

/** 通过 chrome.identity / browser.identity 在扩展内完成 OAuth，不离开当前页面 */
export async function loginViaExtensionIdentity(): Promise<ExtensionLoginResult> {
  const identity = getIdentityApi()
  if (!identity || !MD_API_URL)
    return { ok: false, reason: `unavailable` }

  const redirect = identity.getRedirectURL()
  const authUrl = `${MD_API_URL}/auth/github?redirect=${encodeURIComponent(redirect)}`

  try {
    const responseUrl = await identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true,
    })
    const token = extractOAuthTokenFromUrl(responseUrl)
    if (!token)
      return { ok: false, reason: `no_token` }
    return { ok: true, token }
  }
  catch (error) {
    if (isOAuthFlowCancelled(error))
      return { ok: false, reason: `cancelled` }
    return { ok: false, reason: `unavailable` }
  }
}

export function canLoginInExtension(): boolean {
  return isExtensionContext() && Boolean(getIdentityApi() && MD_API_URL)
}
