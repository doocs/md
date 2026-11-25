/**
 * Markdown -> WeChat-ready HTML rendering for the md-wechat bundle.
 *
 * The pipeline mirrors `packages/mcp-server/src/render-article.ts` (theme CSS,
 * CSS variables, heading styles, then `processCSS`), so this plugin produces
 * the same markup as the editor's "copy" output without importing any part of
 * the workspace that only a bundler can resolve. Theme stylesheets are read
 * from `theme/` beside the built bundle, so a new upstream theme directory is
 * picked up by rebuilding instead of editing this file.
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { initRenderer } from '@md/core/renderer'
import { generateCSSVariables, generateHeadingStyles, processCSS } from '@md/core/theme'
import { postProcessHtml, renderMarkdown } from '@md/core/utils'
import { allowedCodeBlockThemeUrls, defaultRenderOptions } from './presets'

/** 主题样式表目录：与打包后的 index.js 同级；测试用环境变量指向源码目录 */
const themeDir = process.env.MD_WECHAT_THEME_DIR ?? path.join(import.meta.dirname, `theme`)
const CODE_BLOCK_FETCH_TIMEOUT_MS = 10_000

export interface HeadingStylesInput {
  h1?: string
  h2?: string
  h3?: string
  h4?: string
  h5?: string
  h6?: string
}

export interface RenderArticleInput {
  markdown: string
  theme?: string
  primaryColor?: string
  fontFamily?: string
  fontSize?: string
  lineHeight?: string
  blockSpacing?: string
  linkColor?: string
  blockquoteBackground?: string
  legend?: string
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

export interface RenderArticleResult {
  html: string
  frontMatter: unknown
  readingTime: { words: number, minutes: number }
  warnings: string[]
}

interface ThemeCSS {
  base: string
  themes: Record<string, string>
}

let themeCSSCache: ThemeCSS | null = null

function loadThemeCSS(): ThemeCSS {
  if (themeCSSCache)
    return themeCSSCache

  let files: string[]
  try {
    files = readdirSync(themeDir)
  }
  catch (err) {
    throw new Error(
      `md-wechat: theme directory not found at ${themeDir}. `
      + `The bundle is incomplete; rebuild it with \`node apps/dsh/scripts/pack.mjs\`.`,
      { cause: err },
    )
  }

  const baseFile = files.includes(`base.css`) ? `base.css` : null
  if (!baseFile)
    throw new Error(`md-wechat: base.css is missing from ${themeDir}`)

  const themes: Record<string, string> = {}
  for (const file of files) {
    if (!file.endsWith(`.css`) || file === baseFile)
      continue
    themes[path.basename(file, `.css`)] = readFileSync(path.join(themeDir, file), `utf-8`)
  }

  themeCSSCache = { base: readFileSync(path.join(themeDir, baseFile), `utf-8`), themes }
  return themeCSSCache
}

/** Built-in theme names shipped with the bundle, discovered from `theme/`. */
export function listThemes(): string[] {
  return Object.keys(loadThemeCSS().themes)
}

function escapeStyleContent(css: string): string {
  return css.replace(/<\/style/gi, `<\\/style`)
}

const hljsCssCache = new Map<string, string>()

async function fetchCodeBlockCSS(url: string, warnings: string[]): Promise<string> {
  const cached = hljsCssCache.get(url)
  if (cached)
    return cached

  if (!allowedCodeBlockThemeUrls.has(url)) {
    warnings.push(`codeBlockTheme is not a known preset and was ignored: ${url}`)
    return ``
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(CODE_BLOCK_FETCH_TIMEOUT_MS) })
    if (!response.ok) {
      warnings.push(`code block theme CSS responded ${response.status} and was skipped: ${url}`)
      return ``
    }
    const css = escapeStyleContent(await response.text())
    hljsCssCache.set(url, css)
    return css
  }
  catch (err) {
    // Offline rendering stays useful: highlight.js colours are cosmetic.
    warnings.push(`code block theme CSS could not be fetched and was skipped: ${url} (${(err as Error).message})`)
    return ``
  }
}

function normalizeHeadingStyles(input?: HeadingStylesInput): Record<string, string> | undefined {
  if (!input)
    return undefined

  const normalized: Record<string, string> = {}
  for (const [level, style] of Object.entries(input)) {
    if (style && style !== `default`)
      normalized[level] = style
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined
}

/** Render one markdown document into a self-contained styled HTML article. */
export async function renderArticle(input: RenderArticleInput): Promise<RenderArticleResult> {
  const warnings: string[] = []
  const { base, themes } = loadThemeCSS()

  const theme = input.theme ?? defaultRenderOptions.theme
  const themeCSS = themes[theme] ?? themes[defaultRenderOptions.theme] ?? Object.values(themes)[0]
  if (!themeCSS)
    throw new Error(`md-wechat: no theme stylesheet was found in ${themeDir}`)
  if (input.theme && !themes[input.theme])
    warnings.push(`unknown theme "${input.theme}"; falling back to ${defaultRenderOptions.theme}`)

  const renderer = initRenderer({
    isMacCodeBlock: input.isMacCodeBlock ?? defaultRenderOptions.isMacCodeBlock,
    isShowLineNumber: input.isShowLineNumber ?? defaultRenderOptions.isShowLineNumber,
    citeStatus: input.citeStatus ?? defaultRenderOptions.citeStatus,
    countStatus: input.countStatus ?? defaultRenderOptions.countStatus,
    themeMode: input.themeMode ?? defaultRenderOptions.themeMode,
    legend: (input.legend ?? defaultRenderOptions.legend) as never,
  })

  const { html: baseHtml, readingTime } = renderMarkdown(input.markdown, renderer)
  const processedHtml = postProcessHtml(baseHtml, readingTime, renderer)
  const { yamlData } = renderer.parseFrontMatterAndContent(input.markdown)

  const cssConfig = {
    primaryColor: input.primaryColor ?? defaultRenderOptions.primaryColor,
    fontFamily: input.fontFamily ?? defaultRenderOptions.fontFamily,
    fontSize: input.fontSize ?? defaultRenderOptions.fontSize,
    lineHeight: input.lineHeight ?? defaultRenderOptions.lineHeight,
    blockSpacing: input.blockSpacing ?? defaultRenderOptions.blockSpacing,
    linkColor: input.linkColor ?? defaultRenderOptions.linkColor,
    blockquoteBackground: input.blockquoteBackground ?? `default`,
    isUseIndent: input.isUseIndent ?? defaultRenderOptions.isUseIndent,
    isUseJustify: input.isUseJustify ?? defaultRenderOptions.isUseJustify,
    headingStyles: normalizeHeadingStyles(input.headingStyles),
  }

  const hljsCSS = input.codeBlockTheme
    ? await fetchCodeBlockCSS(input.codeBlockTheme, warnings)
    : ``
  const customCSS = escapeStyleContent(input.customCSS?.trim() ?? ``)

  const mergedCSS = processCSS([
    generateCSSVariables(cssConfig),
    base,
    themeCSS,
    generateHeadingStyles(cssConfig),
    hljsCSS,
    customCSS,
  ].filter(Boolean).join(`\n\n`))

  return {
    html: `<style>\n${mergedCSS}\n</style>\n${processedHtml}`,
    frontMatter: yamlData,
    readingTime: {
      words: readingTime.words,
      minutes: readingTime.minutes,
    },
    warnings,
  }
}
