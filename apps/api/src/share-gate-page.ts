import type { ShareFooterAuthor } from './share-page'
import { sharePageFaviconLink } from './share-head'
import { buildShareAuthorHtml } from './share-page'
import { sharePageCspMeta } from './share-sanitize'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/"/g, `&quot;`)
}

export function buildShareGateHtml(
  shareId: string,
  title: string,
  options: { error?: `invalid` | `rate_limited`, author?: ShareFooterAuthor } = {},
): string {
  const safeTitle = escapeHtml(title || `Markdown 分享`)
  const errorMessage = options.error === `rate_limited`
    ? `尝试次数过多，请稍后再试。`
    : options.error === `invalid`
      ? `密码错误，请重试。`
      : ``

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  ${sharePageCspMeta()}
  ${sharePageFaviconLink()}
  <title>${safeTitle} - 需要密码</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f5f5f5;
      color: #333;
    }
    .gate-card {
      width: 100%;
      max-width: 400px;
      background: #fff;
      border-radius: 12px;
      padding: 32px 28px;
      box-shadow: 0 8px 30px rgb(0 0 0 / 8%);
    }
    h1 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.4;
    }
    p {
      margin: 0 0 24px;
      font-size: 14px;
      color: #666;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
    }
    input[type="password"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #07c160;
      box-shadow: 0 0 0 3px rgb(7 193 96 / 15%);
    }
    button {
      width: 100%;
      margin-top: 16px;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      background: #07c160;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: #06ad56; }
    .error {
      margin-bottom: 16px;
      padding: 10px 12px;
      border-radius: 8px;
      background: #fef2f2;
      color: #b91c1c;
      font-size: 13px;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="gate-card">
    <h1>${safeTitle}</h1>
    <p>此分享链接已设置访问密码，请输入密码后查看。</p>
    ${errorMessage ? `<div class="error">${escapeHtml(errorMessage)}</div>` : ``}
    <form method="POST" action="/s/${escapeHtml(shareId)}/unlock">
      <label for="password">访问密码</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required autofocus />
      <button type="submit">查看内容</button>
    </form>
    <div class="footer">
      ${options.author ? buildShareAuthorHtml(options.author) : `由 doocs/md 分享`}
    </div>
  </div>
</body>
</html>`
}
