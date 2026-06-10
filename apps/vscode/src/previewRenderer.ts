import type { ThemeName } from '@md/shared/configs/theme'
import { initRenderer } from '@md/core/renderer'
import { generateCSSVariables } from '@md/core/theme'
import { modifyHtmlContent } from '@md/core/utils'
import { baseCSSContent, themeMap } from '@md/shared/configs/theme'
import { css } from './css'

export interface PreviewOptions {
  markdown: string
  primaryColor: string
  fontFamily: string
  fontSize: string
  theme: ThemeName
  countStatus: boolean
  isMacCodeBlock: boolean
  citeStatus: boolean
}

export function buildPreviewHtml(options: PreviewOptions): string {
  const renderer = initRenderer({
    countStatus: options.countStatus,
    isMacCodeBlock: options.isMacCodeBlock,
    citeStatus: options.citeStatus,
    legend: `none`,
  })

  const html = modifyHtmlContent(options.markdown, renderer)

  const variables = generateCSSVariables({
    primaryColor: options.primaryColor,
    fontFamily: options.fontFamily,
    fontSize: options.fontSize,
    isUseIndent: false,
    isUseJustify: false,
  })

  const themeCSS = themeMap[options.theme]
  const completeCss = `${variables}\n\n${baseCSSContent}\n\n${themeCSS}\n\n${css}`

  return wrapHtmlTag(html, completeCss)
}

function wrapHtmlTag(html: string, cssText: string) {
  return `<html><head><meta charset="utf-8" /><style>${cssText}</style></head><body><div style="width: 375px; margin: auto;padding:20px;background:white;position: relative;min-height: 100%;margin: 0 auto;padding: 20px;font-size: 14px;box-sizing: border-box;outline: none;transition: all 300ms ease-in-out;word-wrap: break-word;">${html}</div></body></html>`
}
