import { sharePageFaviconLink } from './share-head'
import { sharePageCspMeta } from './share-sanitize'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/"/g, `&quot;`)
}

export const SHARE_VIEW_COUNT_PLACEHOLDER = `{{SHARE_VIEW_COUNT}}`
export const SHARE_AUTHOR_PLACEHOLDER = `{{SHARE_AUTHOR}}`

export interface ShareFooterAuthor {
  displayName: string
}

const SHARE_FOOTER_STYLES = `
    .share-footer {
      margin-top: 56px;
      padding: 24px 16px 16px;
      border-top: 1px solid #ebebeb;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .share-footer-inner {
      margin: 0;
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 6px 10px;
      max-width: 100%;
      font-size: 12px;
      line-height: 1.6;
      color: #888;
    }
    .share-footer-author {
      color: #555;
      font-weight: 500;
    }
    .share-footer-divider {
      color: #d4d4d4;
      user-select: none;
      font-weight: 300;
    }
    .share-footer-meta {
      color: #aaa;
      font-size: 11px;
      letter-spacing: 0.02em;
    }`

export function buildShareAuthorHtml(author: ShareFooterAuthor): string {
  const safeName = escapeHtml(author.displayName)
  return `由 ${safeName} 分享`
}

function buildShareFooterHtml(authorHtml: string, viewCount: number | string): string {
  const count = typeof viewCount === `string`
    ? viewCount
    : String(Math.max(0, Math.floor(viewCount)))

  return `<div class="share-footer">
      <p class="share-footer-inner">
        <span class="share-footer-author">${authorHtml}</span>
        <span class="share-footer-divider" aria-hidden="true">·</span>
        <span class="share-footer-meta">阅读 ${count} 次</span>
      </p>
    </div>`
}

function buildShareFooterWithPlaceholders(): string {
  return buildShareFooterHtml(SHARE_AUTHOR_PLACEHOLDER, SHARE_VIEW_COUNT_PLACEHOLDER)
}

export function buildSharePageHtml(
  title: string,
  bodyHtml: string,
  stylesHtml: string,
): string {
  const safeTitle = escapeHtml(title || `Markdown 分享`)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  ${sharePageCspMeta()}
  ${sharePageFaviconLink()}
  <title>${safeTitle}</title>
  ${stylesHtml}
  <style>
    body {
      margin: 0;
      background: #f5f5f5;
    }
    .share-page {
      max-width: 750px;
      margin: 0 auto;
      padding: 20px;
      background: #ffffff;
      box-sizing: border-box;
      min-height: 100vh;
    }
    .share-content {
      background: #ffffff;
    }
    .share-page .diagram-download-bar {
      display: none !important;
    }
    ${SHARE_FOOTER_STYLES}
  </style>
</head>
<body>
  <div class="share-page">
    <div class="share-content">
    ${bodyHtml}
    </div>
    ${buildShareFooterWithPlaceholders()}
  </div>
</body>
</html>`
}

const LEGACY_FOOTER_RE = /<div class="share-footer">[\s\S]*?<\/div>/

function ensureShareFooterStyles(html: string): string {
  if (html.includes(`.share-footer-author {`))
    return html
  return html.replace(`</style>`, `${SHARE_FOOTER_STYLES}\n  </style>`)
}

/** Replace footer placeholders in snapshot HTML with author and view count (legacy footers supported) */
export function injectShareFooter(
  html: string,
  author: ShareFooterAuthor,
  viewCount: number,
): string {
  const authorHtml = buildShareAuthorHtml(author)
  const countText = String(Math.max(0, Math.floor(viewCount)))

  let next = html
  if (next.includes(SHARE_AUTHOR_PLACEHOLDER))
    next = next.replaceAll(SHARE_AUTHOR_PLACEHOLDER, authorHtml)
  if (next.includes(SHARE_VIEW_COUNT_PLACEHOLDER))
    next = next.replaceAll(SHARE_VIEW_COUNT_PLACEHOLDER, countText)

  const needsLegacyFooter = next.includes(`share-footer-copy`)
    || (next.includes(`share-footer`) && !next.includes(`share-footer-author`))

  if (needsLegacyFooter && LEGACY_FOOTER_RE.test(next)) {
    next = next.replace(LEGACY_FOOTER_RE, buildShareFooterHtml(authorHtml, countText))
    next = ensureShareFooterStyles(next)
  }

  return next
}
