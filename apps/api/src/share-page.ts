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

const SHARE_DOOCS_URL = `https://github.com/doocs/md`

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
    .share-footer-copy a {
      color: #555;
      text-decoration: none;
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

function buildShareFooterHtml(viewCount: number | string): string {
  const count = typeof viewCount === `string`
    ? viewCount
    : String(Math.max(0, Math.floor(viewCount)))

  return `<div class="share-footer">
      <p class="share-footer-inner">
        <span class="share-footer-copy">Copyright © <a href="${SHARE_DOOCS_URL}" target="_blank" rel="noopener noreferrer">Doocs</a>. All rights reserved.</span>
        <span class="share-footer-divider" aria-hidden="true">·</span>
        <span class="share-footer-meta">阅读 ${count} 次</span>
      </p>
    </div>`
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
    ${buildShareFooterHtml(SHARE_VIEW_COUNT_PLACEHOLDER)}
  </div>
</body>
</html>`
}

const LEGACY_FOOTER_RE = /<div class="share-footer">[\s\S]*?<\/div>/

/** 将快照 HTML 中的阅读数占位符替换为当前值（兼容旧版 footer） */
export function injectShareViewCount(html: string, viewCount: number): string {
  const safeCount = Math.max(0, Math.floor(viewCount))
  const countText = String(safeCount)

  let next = html.includes(SHARE_VIEW_COUNT_PLACEHOLDER)
    ? html.replaceAll(SHARE_VIEW_COUNT_PLACEHOLDER, countText)
    : html

  if (next.includes(`share-footer-inner`))
    return next

  if (!LEGACY_FOOTER_RE.test(next))
    return next

  next = next.replace(LEGACY_FOOTER_RE, buildShareFooterHtml(safeCount))
  if (!next.includes(`.share-footer-inner {`))
    next = next.replace(`</style>`, `${SHARE_FOOTER_STYLES}\n  </style>`)
  return next
}
