import type { MarkedExtension, Token } from 'marked'
import type { InfographicToken } from '../types/marked-tokens'
import { asDiagramToken, asTextTokenRenderer, isCodeToken } from '../types/marked-tokens'
import { simpleHash } from '../utils/basicHelpers'
import { createSVGCache } from '../utils/svgCache'

interface InfographicOptions {
  themeMode?: 'dark' | 'light'
}

type InfographicOptionsSource = InfographicOptions | (() => InfographicOptions | undefined)

// key -> svg（LRU 缓存，上限 50 条）
const svgCache = createSVGCache(50)
const pendingMeta = new Map<string, { code: string, options?: InfographicOptions }>()
const inFlight = new Set<string>()

const RE_INFOGRAPHIC_START = /^```infographic/m
const RE_INFOGRAPHIC_BLOCK = /^```infographic\r?\n([\s\S]*?)\r?\n```/
const INFOGRAPHIC_ID_PREFIX = `infographic-`
const OFFSCREEN_ROOT_ID = `md-infographic-offscreen-root`
const OFFSCREEN_WIDTH = `800px`

const INFOGRAPHIC_LIGHT_COLORS = {
  theme: `default` as const,
  colorBg: `#ffffff`,
  colorText: `#262626`,
  svgBackground: `transparent`,
}

const INFOGRAPHIC_DARK_COLORS = {
  theme: `dark` as const,
  colorBg: `#1f1f1f`,
  colorText: `#ffffff`,
  svgBackground: `#1f1f1f`,
}

function resolveInfographicTheme(options?: InfographicOptions) {
  const palette = options?.themeMode === `dark` ? INFOGRAPHIC_DARK_COLORS : INFOGRAPHIC_LIGHT_COLORS

  let colorPrimary: string | undefined
  if (typeof window !== `undefined`) {
    colorPrimary = getComputedStyle(document.documentElement)
      .getPropertyValue(`--md-primary-color`)
      .trim() || undefined
  }

  return {
    theme: palette.theme,
    svgBackground: palette.svgBackground,
    themeConfig: {
      colorPrimary,
      colorBg: palette.colorBg,
      colorText: palette.colorText,
    },
  }
}

function resolveOptions(options?: InfographicOptionsSource): InfographicOptions | undefined {
  return typeof options === `function` ? options() : options
}

function getOffscreenRoot(): HTMLDivElement {
  let root = document.getElementById(OFFSCREEN_ROOT_ID) as HTMLDivElement | null
  if (!root) {
    root = document.createElement(`div`)
    root.id = OFFSCREEN_ROOT_ID
    root.style.cssText = `position:fixed;left:-9999px;top:0;width:${OFFSCREEN_WIDTH};visibility:hidden;pointer-events:none;overflow:hidden;`
    document.body.appendChild(root)
  }
  return root
}

function svgElementToHtml(svg: SVGElement | Node): string {
  const wrapper = document.createElement(`div`)
  wrapper.replaceChildren(svg)
  return wrapper.innerHTML
}

function applySvgByCacheKey(cacheKey: string, svgHtml: string) {
  const el = document.getElementById(`${INFOGRAPHIC_ID_PREFIX}${cacheKey}`)
  if (el)
    el.innerHTML = svgHtml
}

function showInfographicError(containerId: string, error: unknown) {
  const container = document.getElementById(containerId)
  if (!container)
    return

  const message = error instanceof Error ? error.message : String(error)
  container.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red;">Infographic 渲染失败: ${message}</div>`
}

async function renderInfographic(containerId: string, code: string, cacheKey: string, options?: InfographicOptions) {
  if (typeof window === `undefined`)
    return

  pendingMeta.set(cacheKey, { code, options })

  const cached = svgCache.get(cacheKey)
  if (cached) {
    applySvgByCacheKey(cacheKey, cached)
    return
  }

  if (inFlight.has(cacheKey))
    return

  inFlight.add(cacheKey)

  const offscreenContainer = document.createElement(`div`)
  offscreenContainer.style.width = OFFSCREEN_WIDTH
  getOffscreenRoot().appendChild(offscreenContainer)

  try {
    const { Infographic, setDefaultFont, setFontExtendFactor, exportToSVG } = await import('@antv/infographic')

    setFontExtendFactor(1.1)
    setDefaultFont('-apple-system-font, "system-ui", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif')

    const { theme, svgBackground, themeConfig } = resolveInfographicTheme(options)

    await new Promise<void>((resolve, reject) => {
      const instance = new Infographic({
        container: offscreenContainer,
        svg: {
          style: {
            width: `100%`,
            height: `100%`,
            background: svgBackground,
          },
          background: false,
        },
        theme,
        themeConfig,
      })

      instance.on(`loaded`, ({ node }) => {
        exportToSVG(node, { removeIds: true })
          .then((svg) => {
            const svgHtml = svgElementToHtml(svg)
            svgCache.set(cacheKey, svgHtml)
            applySvgByCacheKey(cacheKey, svgHtml)
            resolve()
          })
          .catch(reject)
      })

      try {
        instance.render(code)
      }
      catch (error) {
        reject(error)
      }
    })
  }
  catch (error) {
    console.error(`Failed to render Infographic:`, error)
    showInfographicError(containerId, error)
  }
  finally {
    offscreenContainer.remove()
    inFlight.delete(cacheKey)
  }
}

/** 预览区 DOM 更新后，将缓存 SVG 写入占位节点或重试未完成的渲染 */
export function hydratePendingInfographicDiagrams(root: ParentNode, options?: InfographicOptions) {
  if (typeof window === `undefined`)
    return

  root.querySelectorAll<HTMLElement>(`.infographic-diagram`).forEach((el) => {
    if (el.querySelector(`svg, img`))
      return

    const text = el.textContent ?? ``
    if (text.includes(`渲染失败`))
      return

    const id = el.id
    if (!id?.startsWith(INFOGRAPHIC_ID_PREFIX))
      return

    const cacheKey = id.slice(INFOGRAPHIC_ID_PREFIX.length)
    const cached = svgCache.get(cacheKey)
    if (cached) {
      el.innerHTML = cached
      return
    }

    const meta = pendingMeta.get(cacheKey)
    if (meta)
      void renderInfographic(id, meta.code, cacheKey, options ?? meta.options)
  })
}

export function markedInfographic(options?: InfographicOptionsSource): MarkedExtension {
  const className = `infographic-diagram`

  return {
    extensions: [
      {
        name: `infographic`,
        level: `block`,
        start(src: string) {
          return src.match(RE_INFOGRAPHIC_START)?.index
        },
        tokenizer(src: string) {
          const match = RE_INFOGRAPHIC_BLOCK.exec(src)
          if (match) {
            return {
              type: `infographic`,
              raw: match[0],
              text: match[1].trim(),
            }
          }
        },
        renderer: asTextTokenRenderer((token: InfographicToken) => {
          const code = token.text
          const currentOptions = resolveOptions(options)
          const cacheKey = simpleHash(`${code}-${currentOptions?.themeMode || `light`}-v2`)

          const cached = svgCache.get(cacheKey)
          if (cached) {
            return `<!--infographic-start--><div class="${className}" style="width: 100%;">${cached}</div><!--infographic-end-->`
          }

          const id = `${INFOGRAPHIC_ID_PREFIX}${cacheKey}`
          void renderInfographic(id, code, cacheKey, currentOptions)

          return `<!--infographic-start--><div id="${id}" class="${className}" style="width: 100%;">正在加载 Infographic...</div><!--infographic-end-->`
        }),
      },
    ],
    walkTokens(token: Token) {
      if (isCodeToken(token) && token.lang === `infographic`) {
        asDiagramToken<InfographicToken>(token, `infographic`)
      }
    },
  }
}
