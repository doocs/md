import type { PdfExportOptions } from './pdf'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PDF_EXPORT_OPTIONS } from './pdf'

vi.mock(`@/i18n/translate`, () => ({
  t: (key: string) => {
    if (key === `store.pdf.pageFooter`)
      return `Page " counter(page) " of " counter(pages) "`
    if (key === `store.pdf.pageFooterN`)
      return `" counter(page) "`
    return key
  },
}))

const { buildPageCss, normalizePdfExportOptions, resolvePdfSiteFooterUrl } = await import(`./pdf`)

function options(partial: Partial<PdfExportOptions> = {}): PdfExportOptions {
  return { ...DEFAULT_PDF_EXPORT_OPTIONS, ...partial }
}

describe(`normalizePdfExportOptions`, () => {
  it(`fills defaults and drops unknown legacy fields`, () => {
    const normalized = normalizePdfExportOptions({
      showPageNumbers: false,
      paperSize: `Letter`,
    } as Partial<PdfExportOptions> & { paperSize: string })

    expect(normalized).toEqual({
      ...DEFAULT_PDF_EXPORT_OPTIONS,
      showPageNumbers: false,
    })
    expect(normalized).not.toHaveProperty(`paperSize`)
  })

  it(`rejects invalid enum values`, () => {
    const normalized = normalizePdfExportOptions({
      pageNumberFormat: `weird` as PdfExportOptions[`pageNumberFormat`],
      pageNumberPosition: `top` as PdfExportOptions[`pageNumberPosition`],
      margins: `huge` as PdfExportOptions[`margins`],
    })
    expect(normalized.pageNumberFormat).toBe(`nOfM`)
    expect(normalized.pageNumberPosition).toBe(`bottomRight`)
    expect(normalized.margins).toBe(`default`)
  })
})

describe(`resolvePdfSiteFooterUrl`, () => {
  it(`uses origin for http(s) pages`, () => {
    expect(resolvePdfSiteFooterUrl({ protocol: `https:`, origin: `https://md.doocs.org` }))
      .toBe(`https://md.doocs.org`)
    expect(resolvePdfSiteFooterUrl({ protocol: `http:`, origin: `http://localhost:5173` }))
      .toBe(`http://localhost:5173`)
  })

  it(`falls back outside http(s) contexts`, () => {
    expect(resolvePdfSiteFooterUrl({ protocol: `chrome-extension:`, origin: `chrome-extension://abc` }))
      .toBe(`https://md.doocs.org`)
  })
})

describe(`buildPageCss`, () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it(`uses preset margins with chrome aligned toward content`, () => {
    const css = buildPageCss(options(), `My Title`, `https://example.com`)
    expect(css).toContain(`margin: 1.5cm 1cm 2cm 1cm`)
    expect(css).toContain(`vertical-align: bottom`)
    expect(css).toContain(`vertical-align: top`)
    expect(css).toContain(`padding-bottom: 0.5cm`)
    expect(css).toContain(`padding-top: 0.5cm`)
  })

  it(`maps margin presets`, () => {
    expect(buildPageCss(options({ margins: `compact` }), `t`, `https://example.com`))
      .toContain(`margin: 1cm`)
    expect(buildPageCss(options({ margins: `comfortable` }), `t`, `https://example.com`))
      .toContain(`margin: 2cm 1.5cm 2.5cm 1.5cm`)
  })

  it(`keeps content edge inset when all chrome is off`, () => {
    const css = buildPageCss(options({
      showPageNumbers: false,
      showSiteFooter: false,
      showTitleHeader: false,
      margins: `default`,
    }), `t`, `https://example.com`)
    expect(css).toContain(`margin: 1cm`)
    expect(css).toContain(`content: "";`)
    expect(css).not.toContain(`content: none`)
    expect(css).not.toContain(`counter(page)`)
    expect(css).not.toContain(`example.com`)
  })

  it(`keeps top content inset when only footer chrome is on`, () => {
    const css = buildPageCss(options({
      showTitleHeader: false,
      showPageNumbers: true,
      showSiteFooter: false,
      margins: `default`,
    }), `t`, `https://example.com`)
    expect(css).toContain(`margin: 1cm 1cm 2cm 1cm`)
    expect(css).toContain(`vertical-align: top`)
    expect(css).toContain(`padding-top: 0.5cm`)
  })

  it(`keeps bottom content inset when only title chrome is on`, () => {
    const css = buildPageCss(options({
      showTitleHeader: true,
      showPageNumbers: false,
      showSiteFooter: false,
      margins: `default`,
    }), `t`, `https://example.com`)
    expect(css).toContain(`margin: 1.5cm 1cm 1cm 1cm`)
    expect(css).toContain(`vertical-align: bottom`)
    expect(css).toContain(`padding-bottom: 0.5cm`)
  })

  it(`puts title in top-center when enabled`, () => {
    const css = buildPageCss(options({ showTitleHeader: true }), `Hello "World"`, `https://example.com`)
    expect(css).toContain(`content: "Hello _World_"`)
  })

  it(`puts the provided site URL in the footer when enabled`, () => {
    const css = buildPageCss(
      options({ showSiteFooter: true, showPageNumbers: false }),
      `t`,
      `https://example.com`,
    )
    expect(css).toContain(`https://example.com`)
  })

  it(`uses nOfM page footer format by default`, () => {
    const css = buildPageCss(options({ showPageNumbers: true, pageNumberFormat: `nOfM` }), `t`, `https://example.com`)
    expect(css).toContain(`Page " counter(page) " of " counter(pages) "`)
  })

  it(`uses n-only page footer format when selected`, () => {
    const css = buildPageCss(options({ showPageNumbers: true, pageNumberFormat: `n` }), `t`, `https://example.com`)
    expect(css).toContain(`content: "" counter(page) ""`)
    expect(css).not.toContain(`counter(pages)`)
  })

  it(`places page numbers at the selected position`, () => {
    expect(buildPageCss(options({ pageNumberPosition: `bottomLeft` }), `t`, `https://example.com`))
      .toContain(`@bottom-left {\n        content: "Page`)
    expect(buildPageCss(options({ pageNumberPosition: `bottomCenter` }), `t`, `https://example.com`))
      .toContain(`@bottom-center {\n        content: "Page`)
    expect(buildPageCss(options({ pageNumberPosition: `bottomRight` }), `t`, `https://example.com`))
      .toContain(`@bottom-right {\n        content: "Page`)
  })

  it(`prefers page numbers over site footer when both use bottom-left`, () => {
    const css = buildPageCss(options({
      showPageNumbers: true,
      pageNumberPosition: `bottomLeft`,
      showSiteFooter: true,
    }), `t`, `https://example.com`)
    expect(css).toContain(`counter(page)`)
    expect(css).not.toContain(`example.com`)
  })
})
