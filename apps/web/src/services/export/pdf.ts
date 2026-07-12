import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { t } from '@/i18n/translate'
import { waitForPreviewReady } from '@/lib/preview/preview-ready'
import { EXPORT_LAYOUT_CSS } from './apply-export-layout'
import { getHtmlContent } from './html-content'
import { getStylesToAdd, SHARE_SHELL_VARS_CSS } from './share-styles'

export type PdfPageNumberFormat = `nOfM` | `n`
export type PdfPageNumberPosition = `bottomLeft` | `bottomCenter` | `bottomRight`
export type PdfMargins = `compact` | `default` | `comfortable`

export interface PdfExportOptions {
  showPageNumbers: boolean
  pageNumberFormat: PdfPageNumberFormat
  pageNumberPosition: PdfPageNumberPosition
  showTitleHeader: boolean
  showSiteFooter: boolean
  margins: PdfMargins
}

export const DEFAULT_PDF_EXPORT_OPTIONS: PdfExportOptions = {
  showPageNumbers: true,
  pageNumberFormat: `nOfM`,
  pageNumberPosition: `bottomRight`,
  showTitleHeader: true,
  showSiteFooter: true,
  margins: `default`,
}

const PAGE_NUMBER_FORMATS = new Set<PdfPageNumberFormat>([`nOfM`, `n`])
const PAGE_NUMBER_POSITIONS = new Set<PdfPageNumberPosition>([`bottomLeft`, `bottomCenter`, `bottomRight`])
const MARGIN_PRESETS = new Set<PdfMargins>([`compact`, `default`, `comfortable`])

const MARGIN_VALUES: Record<PdfMargins, string> = {
  compact: `1cm`,
  default: `1.5cm 1cm 2cm 1cm`,
  comfortable: `2cm 1.5cm 2.5cm 1.5cm`,
}

/** Gap between chrome text (header / page number) and article content. */
const CHROME_CONTENT_GAP = `0.5cm`

/** Prefer the current http(s) origin; fall back for extension / file contexts. */
export function resolvePdfSiteFooterUrl(
  locationLike: Pick<Location, `protocol` | `origin`> = window.location,
): string {
  if (locationLike.protocol === `http:` || locationLike.protocol === `https:`)
    return locationLike.origin
  return `https://md.doocs.org`
}

function escapeCssQuotedString(value: string): string {
  return value.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`)
}

const PAGE_NUMBER_BOX: Record<PdfPageNumberPosition, string> = {
  bottomLeft: `@bottom-left`,
  bottomCenter: `@bottom-center`,
  bottomRight: `@bottom-right`,
}

/** All 16 CSS page margin boxes (Chrome 131+). */
const ALL_MARGIN_BOXES = [
  `@top-left-corner`,
  `@top-left`,
  `@top-center`,
  `@top-right`,
  `@top-right-corner`,
  `@bottom-left-corner`,
  `@bottom-left`,
  `@bottom-center`,
  `@bottom-right`,
  `@bottom-right-corner`,
  `@left-top`,
  `@left-middle`,
  `@left-bottom`,
  `@right-top`,
  `@right-middle`,
  `@right-bottom`,
] as const

interface MarginSides {
  top: string
  right: string
  bottom: string
  left: string
}

function resolveMarginSides(margins: PdfMargins): MarginSides {
  const parts = MARGIN_VALUES[margins].trim().split(/\s+/)
  if (parts.length === 1) {
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
  }
  if (parts.length === 2) {
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
  }
  if (parts.length === 3) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
  }
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
}

function formatSides({ top, right, bottom, left }: MarginSides): string {
  if (top === right && right === bottom && bottom === left)
    return top
  if (top === bottom && right === left)
    return `${top} ${right}`
  return `${top} ${right} ${bottom} ${left}`
}

function marginBoxRule(
  box: string,
  content: string,
  extras: string = ``,
): string {
  return `
      ${box} {
        content: ${content};${extras}
      }`
}

/** Strip unknown/legacy fields (e.g. paperSize) and fill missing keys. */
export function normalizePdfExportOptions(
  input?: Partial<PdfExportOptions> | null,
): PdfExportOptions {
  const src = input ?? {}
  return {
    showPageNumbers: typeof src.showPageNumbers === `boolean`
      ? src.showPageNumbers
      : DEFAULT_PDF_EXPORT_OPTIONS.showPageNumbers,
    pageNumberFormat: PAGE_NUMBER_FORMATS.has(src.pageNumberFormat as PdfPageNumberFormat)
      ? src.pageNumberFormat as PdfPageNumberFormat
      : DEFAULT_PDF_EXPORT_OPTIONS.pageNumberFormat,
    pageNumberPosition: PAGE_NUMBER_POSITIONS.has(src.pageNumberPosition as PdfPageNumberPosition)
      ? src.pageNumberPosition as PdfPageNumberPosition
      : DEFAULT_PDF_EXPORT_OPTIONS.pageNumberPosition,
    showTitleHeader: typeof src.showTitleHeader === `boolean`
      ? src.showTitleHeader
      : DEFAULT_PDF_EXPORT_OPTIONS.showTitleHeader,
    showSiteFooter: typeof src.showSiteFooter === `boolean`
      ? src.showSiteFooter
      : DEFAULT_PDF_EXPORT_OPTIONS.showSiteFooter,
    margins: MARGIN_PRESETS.has(src.margins as PdfMargins)
      ? src.margins as PdfMargins
      : DEFAULT_PDF_EXPORT_OPTIONS.margins,
  }
}

/**
 * Build `@page` CSS from export options.
 * Unclaimed margin boxes get `content: ""` so Chromium does not fill in defaults.
 * Top/bottom always keep a content inset (never flush to the page edge). When chrome
 * is present on an edge, that edge uses the fuller preset height and chrome text is
 * aligned toward the content with a consistent gap.
 */
export function buildPageCss(
  options: PdfExportOptions,
  title: string,
  siteUrl: string = resolvePdfSiteFooterUrl(),
): string {
  const resolved = normalizePdfExportOptions(options)
  const safeTitle = sanitizeTitle(title)
  const safeSiteUrl = escapeCssQuotedString(siteUrl)
  const sides = resolveMarginSides(resolved.margins)
  const pageBox = resolved.showPageNumbers
    ? PAGE_NUMBER_BOX[resolved.pageNumberPosition]
    : null

  // Prefer page numbers when they share the same box as the site footer.
  const showSiteFooter = resolved.showSiteFooter && pageBox !== `@bottom-left`
  const needsTop = resolved.showTitleHeader
  const needsBottom = Boolean(resolved.showPageNumbers || showSiteFooter)

  // Side inset doubles as the "no chrome" top/bottom inset so content never flush-cuts.
  const contentEdge = sides.left
  const pageMargin: MarginSides = {
    top: needsTop ? sides.top : contentEdge,
    right: sides.right,
    bottom: needsBottom ? sides.bottom : contentEdge,
    left: sides.left,
  }

  const claimed = new Map<string, string>()

  if (resolved.showTitleHeader) {
    claimed.set(`@top-center`, marginBoxRule(
      `@top-center`,
      `"${safeTitle}"`,
      `
        font-size: 12px;
        color: #666;
        vertical-align: bottom;
        padding-bottom: ${CHROME_CONTENT_GAP};`,
    ))
  }

  if (showSiteFooter) {
    claimed.set(`@bottom-left`, marginBoxRule(
      `@bottom-left`,
      `"${safeSiteUrl}"`,
      `
        font-size: 10px;
        color: #999;
        vertical-align: top;
        padding-top: ${CHROME_CONTENT_GAP};`,
    ))
  }

  if (resolved.showPageNumbers && pageBox) {
    const pageFooter = resolved.pageNumberFormat === `n`
      ? t(`store.pdf.pageFooterN`)
      : t(`store.pdf.pageFooter`)
    claimed.set(pageBox, marginBoxRule(
      pageBox,
      `"${pageFooter}"`,
      `
        font-size: 10px;
        color: #999;
        vertical-align: top;
        padding-top: ${CHROME_CONTENT_GAP};`,
    ))
  }

  const boxes = ALL_MARGIN_BOXES.map(box =>
    claimed.get(box) ?? marginBoxRule(box, `""`),
  )

  return `
    @page {
      margin: ${formatSides(pageMargin)};${boxes.join(``)}
    }

    html, body {
      margin: 0;
    }`
}

/** Export PDF document (current theme system). */
export async function exportPDF(title: string = `untitled`, options?: Partial<PdfExportOptions>) {
  await waitForPreviewReady()
  const htmlStr = getHtmlContent({ staticLayout: true })
  const stylesToAdd = await getStylesToAdd()
  const safeTitle = sanitizeTitle(title)
  const resolved = normalizePdfExportOptions(options)
  const pageCss = buildPageCss(resolved, title, resolvePdfSiteFooterUrl())

  const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>
  <style>${SHARE_SHELL_VARS_CSS}</style>
  ${stylesToAdd}
  <style>${EXPORT_LAYOUT_CSS}</style>
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    ${pageCss}
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 750px; margin: auto;">
    ${htmlStr}
  </div>
</body>
</html>`

  // Blob URL avoids "about:srcdoc" if browser headers ever leak through.
  const blob = new Blob([printHtml], { type: `text/html` })
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement(`iframe`)
  iframe.style.cssText = `position:fixed;width:0;height:0;top:-9999px;left:-9999px;border:none;`
  iframe.src = url
  document.body.appendChild(iframe)

  const removeIframe = () => {
    URL.revokeObjectURL(url)
    if (iframe.parentNode)
      document.body.removeChild(iframe)
  }

  iframe.onload = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(removeIframe, 500)
  }

  iframe.onerror = () => {
    removeIframe()
  }

  setTimeout(removeIframe, 5000)
}
