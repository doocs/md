import type { Env } from './types'

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)
}

/** 浏览器扩展页面发起的 fetch 会携带 chrome-extension:// / moz-extension:// 来源 */
const EXTENSION_ORIGIN_RE = /^(?:chrome-extension|moz-extension|safari-web-extension):\/\/[^/]+$/i

export function isBrowserExtensionOrigin(origin: string | undefined | null): boolean {
  if (!origin)
    return false
  return EXTENSION_ORIGIN_RE.test(origin)
}

/**
 * 判断 origin 是否匹配某个模式。
 * - 精确匹配：完全相等
 * - 通配符 `*`：匹配单个主机标签（不含 `.` 与 `/`），可安全用于
 *   预览子域名（如 `https://*--doocs-md.netlify.app`、`http://localhost:*`）
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

/** 解析 APP_URL（逗号分隔）为模式列表 */
export function allowedPatterns(env: Env): string[] {
  return env.APP_URL.split(`,`).map(s => s.trim()).filter(Boolean)
}

/** origin 是否在白名单内 */
export function isAllowedOrigin(env: Env, origin: string | undefined | null): boolean {
  if (!origin)
    return false
  return allowedPatterns(env).some(p => matchPattern(origin, p))
}

/** 默认回跳地址：取第一个不含通配符的模式，否则取第一个 */
export function defaultOrigin(env: Env): string {
  const patterns = allowedPatterns(env)
  return patterns.find(p => !p.includes(`*`)) ?? patterns[0] ?? ``
}

/**
 * 校验请求的回跳地址：解析其 origin 是否在白名单内，
 * 合法则返回完整 URL（含 path），否则回退到默认地址。
 * 兼容仅传 origin 的旧形式。
 */
export function resolveRedirect(env: Env, requested: string | undefined | null): string {
  if (requested) {
    try {
      const url = new URL(requested)
      if (isAllowedOrigin(env, url.origin))
        return url.toString()
    }
    catch { /* 非法 URL，回退默认 */ }
  }
  return defaultOrigin(env)
}
