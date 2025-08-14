/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, `&amp;`) // 转义 &
    .replace(/</g, `&lt;`) // 转义 <
    .replace(/>/g, `&gt;`) // 转义 >
    .replace(/"/g, `&quot;`) // 转义 "
    .replace(/'/g, `&#39;`) // 转义 '
}

/**
 * 首字母大写
 */
export function ucfirst(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
}
