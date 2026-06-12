import { sharePageCspMeta } from './share-sanitize'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/"/g, `&quot;`)
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
    .share-footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
    .share-footer a {
      color: inherit;
    }
    .share-view-count {
      margin: 0 0 8px;
    }
  </style>
</head>
<body>
  <div class="share-page">
    <div class="share-content">
    ${bodyHtml}
    </div>
    <div class="share-footer">
      <p class="share-view-count">阅读 {{SHARE_VIEW_COUNT}} 次</p>
      由 <a href="https://md.doocs.org" target="_blank" rel="noopener noreferrer">doocs/md</a> 渲染
    </div>
  </div>
</body>
</html>`
}

const SHARE_VIEW_COUNT_PLACEHOLDER = `{{SHARE_VIEW_COUNT}}`

/** 将快照 HTML 中的阅读数占位符替换为当前值（兼容旧版无占位符的快照） */
export function injectShareViewCount(html: string, viewCount: number): string {
  const safeCount = Math.max(0, Math.floor(viewCount))
  if (html.includes(SHARE_VIEW_COUNT_PLACEHOLDER))
    return html.replaceAll(SHARE_VIEW_COUNT_PLACEHOLDER, String(safeCount))

  const legacyFooter = `<div class="share-footer">\n      由 <a href="https://md.doocs.org"`
  if (html.includes(legacyFooter)) {
    return html.replace(
      legacyFooter,
      `<div class="share-footer">\n      <p class="share-view-count">阅读 ${safeCount} 次</p>\n      由 <a href="https://md.doocs.org"`,
    )
  }

  return html
}
