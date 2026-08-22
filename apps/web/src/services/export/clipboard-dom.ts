/**
 * Pure clipboard HTML transforms used by WeChat copy flow.
 * Kept free of Pinia/store imports so unit tests can run without app bootstrap.
 */

const GENERIC_FONT_FAMILIES = /^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|inherit|initial|unset|revert|revert-layer)$/i

/** Mermaid may emit `style="undefined;"` on edges; juice's CSS parser then throws. */
function isUndefinedCssValue(value: string): boolean {
  const normalized = value.replace(/\s*!important$/i, ``).trim()
  return !normalized || /^undefined$/i.test(normalized) || /\bundefined\b/i.test(normalized)
}

function mapFontFamilyName(family: string): string {
  const unquoted = family.replace(/["']/g, ``).trim()
  if (!unquoted)
    return family
  if (/^var\(/i.test(family))
    return family
  if (GENERIC_FONT_FAMILIES.test(unquoted))
    return unquoted
  // Quote multi-word / CJK names so juice/PostCSS can parse them.
  // Do not rewrite them to generic families: a mid-stack `sans-serif`
  // would make later serif fonts unreachable (WeChat copy of the serif preset).
  if (/\s/.test(unquoted) || unquoted.split(``).some(ch => ch.charCodeAt(0) > 127))
    return `'${unquoted}'`
  return unquoted
}

function quoteFontFamilyList(value: string): string {
  return value
    .split(/,(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/)
    .map(part => mapFontFamilyName(part.trim()))
    .filter(Boolean)
    .join(`, `)
}

/** C4 / sequence / gantt default to unquoted `Open Sans`, which juice/PostCSS rejects. */
function quoteUnquotedFontFamilies(css: string): string {
  return css
    .replace(/font-family\s*:\s*([^;}{]+)/gi, (_, value: string) => `font-family: ${quoteFontFamilyList(value)}`)
    .replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi, `sans-serif`)
}

function decodeStyleAttr(value: string): string {
  return value
    .replace(/&quot;/g, `"`)
    .replace(/&#34;/g, `"`)
    .replace(/&apos;|&#39;/g, `'`)
    .replace(/&amp;/g, `&`)
}

function encodeStyleAttr(value: string, quote: string): string {
  let next = value.replace(/&/g, `&amp;`)
  if (quote === `"`)
    next = next.replace(/"/g, `&quot;`)
  else
    next = next.replace(/'/g, `&#39;`)
  return next
}

function sanitizeCssDeclarations(css: string): string {
  const cleaned = css
    .split(`;`)
    .map(part => part.trim())
    .filter((part) => {
      if (!part || /^undefined$/i.test(part))
        return false
      const colon = part.indexOf(`:`)
      if (colon === -1)
        return false
      return !isUndefinedCssValue(part.slice(colon + 1))
    })
    .join(`; `)
  return quoteUnquotedFontFamilies(cleaned)
}

function sanitizeEmbeddedStylesheet(css: string): string {
  return quoteUnquotedFontFamilies(
    css.replace(/([a-z_-]+)\s*:\s*undefined\b\s*;?/gi, ``),
  )
}

/**
 * Drop / rewrite CSS that juice cannot parse.
 * Mermaid emits `style="undefined;"` on edges and unquoted `Open Sans` on C4 / sequence / gantt.
 * Must run before juice inlines styles for WeChat copy.
 */
export function stripInvalidCssForJuice(root: ParentNode) {
  root.querySelectorAll(`[style]`).forEach((el) => {
    const raw = el.getAttribute(`style`)
    if (raw == null)
      return
    const next = sanitizeCssDeclarations(raw)
    if (next)
      el.setAttribute(`style`, next)
    else
      el.removeAttribute(`style`)
  })

  root.querySelectorAll(`style`).forEach((el) => {
    const raw = el.textContent
    if (!raw)
      return
    if (/\bundefined\b/i.test(raw) || /font-family\s*:/i.test(raw) || /\bOpen Sans\b/i.test(raw))
      el.textContent = sanitizeEmbeddedStylesheet(raw)
  })
}

/**
 * Quote / drop juice-invalid CSS in the HTML string juice actually parses.
 * Needed because browsers re-serialize `style="font-family: 'Open Sans'"` as
 * unquoted `Open Sans`, which PostCSS then rejects (`Unknown word Open`).
 */
export function sanitizeHtmlCssForJuice(html: string): string {
  const withStyleAttrs = html.replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi, (_full, quote: string, value: string) => {
    const sanitized = sanitizeCssDeclarations(decodeStyleAttr(value))
    return ` style=${quote}${encodeStyleAttr(sanitized, quote)}${quote}`
  })

  const withSheets = withStyleAttrs.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_full, open: string, css: string, close: string) => {
    return `${open}${sanitizeEmbeddedStylesheet(css)}${close}`
  })

  // Mermaid also sets SVG presentation attributes: font-family="Open Sans, sans-serif"
  const withFontAttrs = withSheets.replace(/\sfont-family\s*=\s*(["'])([\s\S]*?)\1/gi, (_full, quote: string, value: string) => {
    return ` font-family=${quote}${encodeStyleAttr(quoteFontFamilyList(decodeStyleAttr(value)), quote)}${quote}`
  })

  return withFontAttrs.replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi, `sans-serif`)
}

export function stripFontFamilyForJuiceFallback(html: string): string {
  return html
    .replace(/font-family\s*:[^;}{]+;?/gi, ``)
    .replace(/\sfont-family\s*=\s*(["'])[\s\S]*?\1/gi, ``)
    .replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi, `sans-serif`)
}

export function solveWeChatImage(container?: HTMLElement) {
  const clipboardDiv = container ?? document.getElementById(`output`)
  if (!clipboardDiv)
    return
  const images = clipboardDiv.getElementsByTagName(`img`)

  Array.from(images).forEach((image) => {
    const width = image.getAttribute(`width`)
    const height = image.getAttribute(`height`)

    if (width) {
      image.removeAttribute(`width`)
      image.style.width = /^\d+$/.test(width) ? `${width}px` : width
    }

    if (height) {
      image.removeAttribute(`height`)
      image.style.height = /^\d+$/.test(height) ? `${height}px` : height
    }
  })
}

export function modifyHtmlStructure(htmlString: string): string {
  const tempDiv = document.createElement(`div`)
  tempDiv.innerHTML = htmlString

  tempDiv.querySelectorAll(`li > ul, li > ol`).forEach((originalItem) => {
    originalItem.parentElement?.insertAdjacentElement(`afterend`, originalItem)
  })

  return tempDiv.innerHTML
}

export function createEmptyNode(): HTMLElement {
  const node = document.createElement(`p`)
  node.style.fontSize = `0`
  node.style.lineHeight = `0`
  node.style.margin = `0`
  node.innerHTML = `&nbsp;`
  return node
}

/**
 * Mermaid labels live in <foreignObject><div xmlns ...> (flowchart nodeLabel,
 * ER .name / .attribute-*, class, C4, …). WeChat drops that HTML unless the
 * inner node is a <section>.
 */
export function promoteSvgHtmlLabels(root: ParentNode) {
  if (!root.querySelector(`.mermaid-diagram foreignObject`))
    return

  root.querySelectorAll(`foreignObject`).forEach((foreign) => {
    if (!foreign.closest(`.mermaid-diagram`))
      return

    const inner = foreign.querySelector(`:scope > div, :scope > span, :scope > section`)
    if (!inner || inner.localName === `section`)
      return

    const section = document.createElement(`section`)
    section.setAttribute(`xmlns`, inner.getAttribute(`xmlns`) || `http://www.w3.org/1999/xhtml`)
    const style = inner.getAttribute(`style`) || ``
    if (style)
      section.setAttribute(`style`, style)
    section.innerHTML = inner.innerHTML
    foreign.replaceChildren(section)
  })
}
