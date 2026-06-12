/** 分享页 favicon（静态文件见 public/images/） */
export const SHARE_FAVICON_PATH = `/images/favicon-32x32.png`

export function sharePageFaviconLink(): string {
  return `<link rel="icon" type="image/png" sizes="32x32" href="${SHARE_FAVICON_PATH}" />`
}
