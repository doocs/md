import type { ThemeName } from '@md/shared/configs'
import type { HeadingStyles } from '@md/shared/configs/style'
import type { HeadingStylesInput, LegendValue } from './config-options'
import fs from 'node:fs'
import path from 'node:path'
import { initRenderer } from '@md/core/renderer'
import { processCSS } from '@md/core/theme/cssProcessor'
import { generateCSSVariables, generateHeadingStyles } from '@md/core/theme/cssVariables'
import { postProcessHtml, renderMarkdown } from '@md/core/utils'
import {
  defaultRenderOptions,

} from './config-options'

export interface RenderMarkdownInput {
  markdown: string
  theme?: ThemeName
  primaryColor?: string
  fontFamily?: string
  fontSize?: string
  legend?: LegendValue
  isMacCodeBlock?: boolean
  isShowLineNumber?: boolean
  citeStatus?: boolean
  countStatus?: boolean
  themeMode?: 'light' | 'dark'
  isUseIndent?: boolean
  isUseJustify?: boolean
  headingStyles?: HeadingStylesInput
  codeBlockTheme?: string
  customCSS?: string
}

const themeDir = path.resolve(import.meta.dirname, `../../shared/src/configs/theme-css`)

function loadCSSFile(filename: string): string {
  return fs.readFileSync(path.join(themeDir, filename), `utf-8`)
}

const baseCSSContent = loadCSSFile(`base.css`)
const themeMap: Record<string, string> = {
  default: loadCSSFile(`default.css`),
  grace: loadCSSFile(`grace.css`),
  simple: loadCSSFile(`simple.css`),
}

const hljsCssCache = new Map<string, string>()

export async function fetchCodeBlockCSS(url: string): Promise<string> {
  const cached = hljsCssCache.get(url)
  if (cached)
    return cached

  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Failed to fetch code block theme CSS (${response.status}): ${url}`)

  const css = await response.text()
  hljsCssCache.set(url, css)
  return css
}

function normalizeHeadingStyles(input?: HeadingStylesInput): HeadingStyles | undefined {
  if (!input)
    return undefined

  const normalized: HeadingStyles = {}
  for (const [level, style] of Object.entries(input)) {
    if (style && style !== `default`)
      normalized[level as keyof HeadingStyles] = style
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined
}

export async function buildRenderedOutput(input: RenderMarkdownInput) {
  const theme = input.theme ?? defaultRenderOptions.theme
  const primaryColor = input.primaryColor ?? defaultRenderOptions.primaryColor
  const fontFamily = input.fontFamily ?? defaultRenderOptions.fontFamily
  const fontSize = input.fontSize ?? defaultRenderOptions.fontSize
  const legend = input.legend ?? defaultRenderOptions.legend
  const codeBlockTheme = input.codeBlockTheme ?? defaultRenderOptions.codeBlockTheme
  const headingStyles = normalizeHeadingStyles(input.headingStyles)

  const renderer = initRenderer({
    isMacCodeBlock: input.isMacCodeBlock ?? defaultRenderOptions.isMacCodeBlock,
    isShowLineNumber: input.isShowLineNumber ?? defaultRenderOptions.isShowLineNumber,
    citeStatus: input.citeStatus ?? defaultRenderOptions.citeStatus,
    countStatus: input.countStatus ?? defaultRenderOptions.countStatus,
    themeMode: input.themeMode ?? defaultRenderOptions.themeMode,
    legend,
  })

  const { html: baseHtml, readingTime } = renderMarkdown(input.markdown, renderer)
  const processedHtml = postProcessHtml(baseHtml, readingTime, renderer)
  const { yamlData } = renderer.parseFrontMatterAndContent(input.markdown)

  const cssConfig = {
    primaryColor,
    fontFamily,
    fontSize,
    isUseIndent: input.isUseIndent ?? defaultRenderOptions.isUseIndent,
    isUseJustify: input.isUseJustify ?? defaultRenderOptions.isUseJustify,
    headingStyles,
  }

  const variablesCSS = generateCSSVariables(cssConfig)
  const headingStylesCSS = generateHeadingStyles(cssConfig)
  const themeCSS = themeMap[theme] || themeMap.default
  const hljsCSS = codeBlockTheme ? await fetchCodeBlockCSS(codeBlockTheme) : ``
  const customCSS = input.customCSS?.trim() ?? ``

  let mergedCSS = [
    variablesCSS,
    baseCSSContent,
    themeCSS,
    headingStylesCSS,
    hljsCSS,
    customCSS,
  ].filter(Boolean).join(`\n\n`)

  mergedCSS = processCSS(mergedCSS)

  const html = `<style>\n${mergedCSS}\n</style>\n${processedHtml}`

  return {
    html,
    frontMatter: yamlData,
    readingTime: {
      words: readingTime.words,
      minutes: readingTime.minutes,
    },
  }
}

export function clearHljsCssCache() {
  hljsCssCache.clear()
}
