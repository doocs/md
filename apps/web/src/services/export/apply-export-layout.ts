/** Off-screen PNG host; prefixed styles must not match the live preview. */
export const PNG_CAPTURE_HOST = `[data-png-export-host]`

/** Replaces #output in theme CSS for the cloned capture root. */
export const PNG_CAPTURE_ROOT_CLASS = `png-export-root`

function setImportant(el: HTMLElement, styles: Record<string, string>) {
  for (const [property, value] of Object.entries(styles))
    el.style.setProperty(property, value, `important`)
}

function isHorizontalScrollSection(section: HTMLElement): boolean {
  const inline = section.getAttribute(`style`) ?? ``
  return /overflow(?:-x)?:\s*(?:auto|scroll)/.test(inline)
}

function layoutTableCells(table: HTMLElement) {
  setImportant(table, {
    width: `100%`,
    maxWidth: `100%`,
    tableLayout: `fixed`,
  })

  table.querySelectorAll<HTMLElement>(`th, td`).forEach((cell) => {
    setImportant(cell, {
      wordBreak: `break-word`,
      whiteSpace: `normal`,
      overflowWrap: `anywhere`,
    })
  })
}

function layoutCodeBlocks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(`.code-scroll`).forEach((scroll) => {
    setImportant(scroll, { overflow: `visible` })
    scroll.querySelectorAll<HTMLElement>(`div`).forEach((inner) => {
      setImportant(inner, {
        whiteSpace: `pre-wrap`,
        wordBreak: `break-all`,
        minWidth: `auto`,
        maxWidth: `100%`,
      })
    })
  })

  root.querySelectorAll<HTMLElement>(`pre.code__pre, .hljs.code__pre`).forEach((pre) => {
    setImportant(pre, { overflow: `visible` })
  })

  root.querySelectorAll<HTMLElement>(`pre.code__pre > code, .hljs.code__pre > code`).forEach((code) => {
    setImportant(code, {
      overflow: `visible`,
      whiteSpace: `pre-wrap`,
      wordBreak: `break-all`,
      minWidth: `auto`,
      maxWidth: `100%`,
    })
  })

  root.querySelectorAll<HTMLElement>(`pre section, code section`).forEach((section) => {
    setImportant(section, { overflow: `visible` })
  })
}

/** Apply wrap-friendly layout on a cloned export root; does not affect live preview. */
export function applyExportLayout(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(`table.preview-table`).forEach((table) => {
    const wrapper = table.parentElement
    if (wrapper?.tagName === `SECTION`)
      setImportant(wrapper, { overflow: `visible`, maxWidth: `100%` })
    layoutTableCells(table)
  })

  root.querySelectorAll<HTMLElement>(`section`).forEach((section) => {
    if (!isHorizontalScrollSection(section) || !section.querySelector(`table`))
      return
    setImportant(section, { overflow: `visible` })
    section.querySelectorAll<HTMLElement>(`table`).forEach(layoutTableCells)
  })

  layoutCodeBlocks(root)
}

function scopeCssRules(css: string, scope: string): string {
  return css
    .split(`\n`)
    .map((line) => {
      const trimmed = line.trimStart()
      if (!trimmed || trimmed.startsWith(`/*`))
        return line
      const match = trimmed.match(/^([^{]+)\{/)
      if (!match)
        return line
      const selectors = match[1].trim()
      const scoped = selectors
        .split(`,`)
        .map(s => `${scope} ${s.trim()}`)
        .join(`, `)
      return line.replace(selectors, scoped)
    })
    .join(`\n`)
}

function scopeThemeToCaptureRoot(themeCss: string): string {
  const root = `${PNG_CAPTURE_HOST} .${PNG_CAPTURE_ROOT_CLASS}`
  let css = themeCss
  css = css.replace(/#output\s*\{/g, `${root} {`)
  css = css.replace(/#output\s+/g, `${root} `)
  css = css.replace(/^#output\s*/gm, `${root} `)
  return css
}

const EXPORT_LAYOUT_RULES = `
  section:has(> table.preview-table) { overflow: visible !important; }
  table.preview-table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
  table.preview-table th, table.preview-table td { word-break: break-word !important; white-space: normal !important; overflow-wrap: anywhere !important; }
  section[style*="overflow-x: auto"], section[style*="overflow: auto"] { overflow: visible !important; }
  section[style*="overflow-x: auto"] table, section[style*="overflow: auto"] table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
  section[style*="overflow-x: auto"] th, section[style*="overflow-x: auto"] td, section[style*="overflow: auto"] th, section[style*="overflow: auto"] td { word-break: break-word !important; white-space: normal !important; overflow-wrap: anywhere !important; }
  pre.code__pre, .hljs.code__pre, pre.code__pre > code, .hljs.code__pre > code, .code-scroll, pre section, code section { overflow: visible !important; }
  pre.code__pre > code, .code-scroll, .code-scroll > div { white-space: pre-wrap !important; word-break: break-all !important; min-width: auto !important; max-width: 100% !important; }
`

/** CSS for PDF / HTML export documents (isolated from the live app). */
export const EXPORT_LAYOUT_CSS = EXPORT_LAYOUT_RULES.trim()

function getScopedExportLayoutCss(scope: string): string {
  return scopeCssRules(EXPORT_LAYOUT_RULES, scope).trim()
}

export function getPngCaptureBackgroundColor(): string {
  const isDarkApp = document.documentElement.classList.contains(`dark`)
  const useNightPreview = isDarkApp
    && document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)
  return useNightPreview ? `#191919` : `#fff`
}

const PNG_PREVIEW_SHELL_CSS = `
  ${PNG_CAPTURE_HOST} .preview {
    position: relative;
    margin: 0 auto;
    padding: 20px;
    font-size: 14px;
    box-sizing: border-box;
    word-wrap: break-word;
  }

  ${PNG_CAPTURE_HOST} .preview table {
    margin-bottom: 10px;
    border-collapse: collapse;
    display: table;
    min-width: 100%;
  }
`

/** Scoped theme + layout styles for off-screen PNG capture. */
export async function getPngCaptureStyles(): Promise<string> {
  const themeStyle = document.querySelector(`#md-theme`) as HTMLStyleElement
  if (!themeStyle?.textContent)
    return ``

  const isDarkApp = document.documentElement.classList.contains(`dark`)
  const shellVars = isDarkApp
    ? `${PNG_CAPTURE_HOST} { --foreground: 0 0% 98%; --blockquote-background: #212121; }`
    : `${PNG_CAPTURE_HOST} { --foreground: 0 0% 3.9%; --blockquote-background: #f7f7f7; }`

  const parts = [
    `<style>${shellVars}</style>`,
    `<style>${PNG_PREVIEW_SHELL_CSS}</style>`,
    `<style>${scopeThemeToCaptureRoot(themeStyle.textContent)}</style>`,
    `<style>${getScopedExportLayoutCss(PNG_CAPTURE_HOST)}</style>`,
  ]

  const hljsLink = document.querySelector(`#hljs`) as HTMLLinkElement
  if (hljsLink) {
    try {
      const hljsText = await (await fetch(hljsLink.href)).text()
      parts.push(`<style>@scope (${PNG_CAPTURE_HOST}) { ${hljsText} }</style>`)
    }
    catch {
      // optional
    }
  }

  const useNightPreview = isDarkApp
    && document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)
  if (useNightPreview) {
    parts.push(
      `<style>${PNG_CAPTURE_HOST} .output_night .preview { background-color: #191919; }</style>`,
    )
  }

  return parts.join(``)
}
