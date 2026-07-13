/**
 * Shell CSS variables for export / share / standalone preview.
 * Normally provided by the app global styles (:root in index.css); theme CSS references
 * hsl(var(--foreground)) / var(--blockquote-background). Outside the app they must be
 * inlined or table borders, blockquote backgrounds, etc. break.
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

/** Remap `#output` theme selectors to an isolated preview scope (e.g. history / share). */
export function scopeThemeCss(cssContent: string, scope: string): string {
  let css = cssContent
  css = css.replace(/#output\s*\{/g, `${scope} {`)
  css = css.replace(/#output\s+/g, `${scope} `)
  css = css.replace(/^#output\s*/gm, `${scope} `)
  return css
}

/** Strip #output scope so juice matches fragment nodes without a body/#output ancestor. */
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
    console.warn('[getThemeStyles] theme styles not found')
    return ``
  }

  const cssContent = stripOutputScope(themeStyle.textContent)
  return `<style>${cssContent}</style>`
}

/** Share page styles (fixed light theme, scoped to .share-content). */
export async function getShareExportStyles(): Promise<string> {
  const themeStyle = document.querySelector(`#md-theme`) as HTMLStyleElement
  if (!themeStyle?.textContent) {
    console.warn('[getShareExportStyles] theme styles not found')
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

/** Styles bundled for export and share pages. */
export async function getExportStyles(): Promise<string> {
  return getStylesToAdd()
}

export async function getStylesToAdd(): Promise<string> {
  const themeStyles = getThemeStyles()
  const hljsStyles = await getHljsStyles()
  return [themeStyles, hljsStyles].filter(Boolean).join(``)
}
