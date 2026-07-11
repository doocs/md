import type { Env } from './types'

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)
}

/** Browser extension pages send fetch requests with chrome-extension:// / moz-extension:// origins */
const EXTENSION_ORIGIN_RE = /^(?:chrome-extension|moz-extension|safari-web-extension):\/\/[^/]+$/i

export function isBrowserExtensionOrigin(origin: string | undefined | null): boolean {
  if (!origin)
    return false
  return EXTENSION_ORIGIN_RE.test(origin)
}

/**
 * Whether an origin matches a pattern.
 * - Exact match: strings are equal
 * - Wildcard `*`: matches a single host label (no `.` or `/`), safe for
 *   preview subdomains (e.g. `https://*--doocs-md.netlify.app`, `http://localhost:*`)
 */
export function matchPattern(origin: string, pattern: string): boolean {
  if (!pattern)
    return false
  if (pattern === origin)
    return true
  if (!pattern.includes(`*`))
    return false
  const re = new RegExp(`^${pattern.split(`*`).map(escapeRegex).join(`[^./]+`)}$`)
  return re.test(origin)
}

/** Parse APP_URL (comma-separated) into pattern list */
export function allowedPatterns(env: Env): string[] {
  return env.APP_URL.split(`,`).map(s => s.trim()).filter(Boolean)
}

/** Whether origin is on the allowlist */
export function isAllowedOrigin(env: Env, origin: string | undefined | null): boolean {
  if (!origin)
    return false
  return allowedPatterns(env).some(p => matchPattern(origin, p))
}

/** Default redirect origin: first pattern without wildcards, else the first pattern */
export function defaultOrigin(env: Env): string {
  const patterns = allowedPatterns(env)
  return patterns.find(p => !p.includes(`*`)) ?? patterns[0] ?? ``
}

/**
 * Validate a requested redirect URL: if its origin is allowlisted,
 * return the full URL (including path); otherwise fall back to the default origin.
 * Also accepts legacy values that pass only an origin.
 */
export function resolveRedirect(env: Env, requested: string | undefined | null): string {
  if (requested) {
    try {
      const url = new URL(requested)
      if (isAllowedOrigin(env, url.origin))
        return url.toString()
    }
    catch { /* invalid URL — fall back to default */ }
  }
  return defaultOrigin(env)
}
