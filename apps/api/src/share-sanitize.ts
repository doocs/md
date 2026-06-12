/** CSP for read-only share pages (no scripts, inline styles only). */
export const SHARE_PAGE_CSP = [
  `default-src 'self'`,
  `script-src 'none'`,
  `style-src 'unsafe-inline'`,
  `img-src 'self' https: data: blob:`,
  `font-src https: data:`,
  `connect-src 'none'`,
  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'none'`,
  `form-action 'self'`,
].join(`; `)

export function sharePageCspMeta(): string {
  return `<meta http-equiv="Content-Security-Policy" content="${SHARE_PAGE_CSP}" />`
}

const SCRIPT_TAG = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const DANGEROUS_TAGS = /<\/?(?:iframe|object|embed|form|meta|link|base)\b[^>]*>/gi
const EVENT_HANDLERS = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const DANGEROUS_URL_ATTRS = /\s(href|src|xlink:href)\s*=\s*(?:("|')\s*)?(?:javascript|vbscript):[^"'>\s]*/gi
const STYLE_BREAKOUT = /<\/style>/gi
const DANGEROUS_CSS_IMPORT = /@import\s[^;]*(?:javascript|data:text\/html)/gi

export function sanitizeHtmlSnapshot(html: string): string {
  return html
    .replace(SCRIPT_TAG, ``)
    .replace(DANGEROUS_TAGS, ``)
    .replace(EVENT_HANDLERS, ``)
    .replace(DANGEROUS_URL_ATTRS, ``)
}

export function sanitizeStylesSnapshot(stylesHtml: string): string {
  return sanitizeHtmlSnapshot(stylesHtml)
    .replace(STYLE_BREAKOUT, ``)
    .replace(DANGEROUS_CSS_IMPORT, ``)
}
