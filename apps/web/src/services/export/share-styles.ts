/**
 * 导出 / 分享 / 独立预览的 shell 变量。
 * 这些变量原本由 Web App 的全局样式（index.css 的 :root）提供，主题 CSS 通过
 * hsl(var(--foreground)) / var(--blockquote-background) 引用它们。脱离 App 后
 * 需手动补上，否则表格边框、引用块背景等会因变量未定义而失效。
 */
export const SHARE_SHELL_VARS_CSS = `:root {
  --foreground: 0 0% 3.9%;
  --blockquote-background: #f7f7f7;
}`

async function getHljsStyles(): Promise<string> {
  const hljsLink = document.querySelector(`#hljs`) as HTMLLinkElement
  if (!hljsLink)
    return ``

  try {
    const response = await fetch(hljsLink.href)
    const cssText = await response.text()
    return `<style>${cssText}</style>`
  }
  catch (error) {
    console.warn(`Failed to fetch highlight.js styles:`, error)
    return ``
  }
}

function scopeThemeCss(cssContent: string, scope: string): string {
  let css = cssContent
  css = css.replace(/#output\s*\{/g, `${scope} {`)
  css = css.replace(/#output\s+/g, `${scope} `)
  css = css.replace(/^#output\s*/gm, `${scope} `)
  return css
}

/** 复制/导出：剥离 #output 前缀，使 juice 能匹配片段内元素（无 body/#output 祖先） */
function stripOutputScope(cssContent: string): string {
  let css = cssContent
  css = css.replace(/#output\s*\{/g, `body {`)
  css = css.replace(/#output\s+/g, ``)
  css = css.replace(/^#output\s*/gm, ``)
  return css
}

function getThemeStyles(): string {
  const themeStyle = document.querySelector(`#md-theme`) as HTMLStyleElement

  if (!themeStyle || !themeStyle.textContent) {
    console.warn('[getThemeStyles] 未找到主题样式')
    return ``
  }

  const cssContent = stripOutputScope(themeStyle.textContent)
  return `<style>${cssContent}</style>`
}

/** 分享页专用样式（固定浅色，作用域到 .share-content） */
export async function getShareExportStyles(): Promise<string> {
  const themeStyle = document.querySelector(`#md-theme`) as HTMLStyleElement
  if (!themeStyle?.textContent) {
    console.warn('[getShareExportStyles] 未找到主题样式')
    return ``
  }

  const parts: string[] = [
    `<style>${SHARE_SHELL_VARS_CSS}</style>`,
    `<style>${scopeThemeCss(themeStyle.textContent, `.share-content`)}</style>`,
  ]

  const hljsStyles = await getHljsStyles()
  if (hljsStyles)
    parts.push(hljsStyles)

  return parts.join(``)
}

/** 获取需要添加的样式（导出 / 分享页使用） */
export async function getExportStyles(): Promise<string> {
  return getStylesToAdd()
}

export async function getStylesToAdd(): Promise<string> {
  const themeStyles = getThemeStyles()
  const hljsStyles = await getHljsStyles()
  return [themeStyles, hljsStyles].filter(Boolean).join(``)
}
