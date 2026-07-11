import type { DiagramMessages } from '@md/shared/types'
import type { MarkedExtension, Token } from 'marked'
import type { PlantUMLToken } from '../types/marked-tokens'
import type { DiagramThemeMode } from './diagram-theme'
import { deflateSync } from 'fflate'
import { asDiagramToken, asTextTokenRenderer, isCodeToken } from '../types/marked-tokens'
import {
  diagramStateAttr,
  isSvgMarkup,
  MD_DIAGRAM_STATE,
  resolveDiagramMessages,
} from '../utils/asyncDiagramState'
import { simpleHash } from '../utils/basicHelpers'
import { createSVGCache } from '../utils/svgCache'
import { diagramCacheThemeSuffix, injectPlantUmlTheme } from './diagram-theme'

const svgCache = createSVGCache(50)

export interface PlantUMLOptions {
  /** @default 'https://www.plantuml.com/plantuml' */
  serverUrl?: string
  /** @default 'svg' */
  format?: `svg` | `png`
  /** @default 'plantuml-diagram' */
  className?: string
  /** Inline SVG for WeChat and other environments that block external images. @default false */
  inlineSvg?: boolean
  /**
   * Custom styles
   */
  styles?: {
    container?: Record<string, string | number>
  }
  /** Async diagram messages (Web injects per locale) */
  getDiagramMessages?: () => DiagramMessages | undefined
  /** Diagram light/dark theme (same as Infographic) */
  getThemeMode?: () => DiagramThemeMode | undefined
}

/** PlantUML 6-bit encoding per https://plantuml.com/text-encoding */
function encode6bit(b: number): string {
  if (b < 10) {
    return String.fromCharCode(48 + b)
  }
  b -= 10
  if (b < 26) {
    return String.fromCharCode(65 + b)
  }
  b -= 26
  if (b < 26) {
    return String.fromCharCode(97 + b)
  }
  b -= 26
  if (b === 0) {
    return `-`
  }
  if (b === 1) {
    return `_`
  }
  return `?`
}

/** Append 3 bytes to the encoded string (PlantUML text encoding). */
function append3bytes(b1: number, b2: number, b3: number): string {
  const c1 = b1 >> 2
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
  const c4 = b3 & 0x3F
  let r = ``
  r += encode6bit(c1 & 0x3F)
  r += encode6bit(c2 & 0x3F)
  r += encode6bit(c3 & 0x3F)
  r += encode6bit(c4 & 0x3F)
  return r
}

/** PlantUML custom base64 encoding per https://plantuml.com/text-encoding */
function encode64(data: string): string {
  let r = ``
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0)
    }
    else if (i + 1 === data.length) {
      r += append3bytes(data.charCodeAt(i), 0, 0)
    }
    else {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2))
    }
  }
  return r
}

/** Deflate compress per PlantUML spec (fflate, level 9). */
function performDeflate(input: string): string {
  try {
    const inputBytes = new TextEncoder().encode(input)

    const compressed = deflateSync(inputBytes, { level: 9 })

    return String.fromCharCode(...compressed)
  }
  catch (error) {
    console.warn(`Deflate compression failed:`, error)
    return input
  }
}

/** Encode PlantUML: UTF-8 → Deflate → PlantUML base64 */
function encodePlantUML(plantumlCode: string): string {
  try {
    const deflated = performDeflate(plantumlCode)

    return encode64(deflated)
  }
  catch (error) {
    console.warn(`PlantUML encoding failed, using fallback:`, error)
    const utf8Bytes = new TextEncoder().encode(plantumlCode)
    const base64 = btoa(String.fromCharCode(...utf8Bytes))
    return `~1${base64.replace(/\+/g, `-`).replace(/\//g, `_`).replace(/=/g, ``)}`
  }
}

type ResolvedPlantUMLOptions = Required<Omit<PlantUMLOptions, 'getDiagramMessages' | 'getThemeMode'>> & Pick<PlantUMLOptions, 'getDiagramMessages' | 'getThemeMode'>

function generatePlantUMLUrl(code: string, options: Pick<ResolvedPlantUMLOptions, 'serverUrl' | 'format'>): string {
  const encoded = encodePlantUML(code)
  const formatPath = options.format === `svg` ? `svg` : `png`
  return `${options.serverUrl}/${formatPath}/${encoded}`
}

/**
 * Render PlantUML diagram
 */
function resolvePlantUmlCode(code: string, themeMode?: DiagramThemeMode): string {
  return injectPlantUmlTheme(code, themeMode)
}

function buildPlantUmlCacheKey(code: string, themeMode?: DiagramThemeMode): string {
  return simpleHash(`${code}-${diagramCacheThemeSuffix(themeMode)}`)
}

function wrapPlantUmlSvgHtml(svgContent: string, options: ResolvedPlantUMLOptions, isError = false): string {
  return createPlantUMLHTML(``, options, svgContent, isError)
}

function readPlantUmlCachedHtml(cacheKey: string, options: ResolvedPlantUMLOptions): string | null {
  const cached = svgCache.get(cacheKey)
  if (!cached)
    return null
  if (isSvgMarkup(cached))
    return wrapPlantUmlSvgHtml(cached, options)
  return cached
}

function renderPlantUMLDiagram(
  token: Pick<PlantUMLToken, 'text'>,
  options: ResolvedPlantUMLOptions,
  cacheKey: string,
): string {
  const { text: code } = token
  const messages = resolveDiagramMessages(options.getDiagramMessages?.())
  const themeMode = options.getThemeMode?.()
  const finalCode = resolvePlantUmlCode(code, themeMode)
  const imageUrl = generatePlantUMLUrl(finalCode, options)

  if (options.inlineSvg && options.format === `svg`) {
    const placeholder = `plantuml-${cacheKey}`

    fetchSvgContent(imageUrl, messages.plantumlError).then((svgContent) => {
      const placeholderElement = document.querySelector(`[data-placeholder="${placeholder}"]`) as HTMLElement
      if (placeholderElement) {
        const isError = !isSvgMarkup(svgContent)
        if (!isError)
          svgCache.set(cacheKey, svgContent)
        placeholderElement.outerHTML = wrapPlantUmlSvgHtml(svgContent, options, isError)
      }
    })

    const containerStyles = options.styles.container
      ? Object.entries(options.styles.container)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, `-$1`).toLowerCase()}: ${value}`)
          .join(`; `)
      : ``

    return `<div class="${options.className}" style="${containerStyles}" data-placeholder="${placeholder}" ${diagramStateAttr(MD_DIAGRAM_STATE.loading)}>
      <div style="color: #666; font-style: italic;">${messages.plantumlLoading}</div>
    </div>`
  }

  return createPlantUMLHTML(imageUrl, options)
}

async function fetchSvgContent(svgUrl: string, errorMessage: string): Promise<string> {
  try {
    const response = await fetch(svgUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const svgContent = await response.text()
    // Drop fixed SVG dimensions for responsive layout
    return svgContent
      .replace(/(<svg[^>]*)\swidth="[^"]*"/g, `$1`)
      .replace(/(<svg[^>]*)\sheight="[^"]*"/g, `$1`)
      .replace(/(<svg[^>]*style="[^"]*?)width:[^;]*;?/g, `$1`)
      .replace(/(<svg[^>]*style="[^"]*?)height:[^;]*;?/g, `$1`)
      // "none" squashes diagrams when only one axis is constrained in preview / WeChat
      .replace(/preserveAspectRatio="none"/g, `preserveAspectRatio="xMidYMid meet"`)
  }
  catch (error) {
    console.warn(`Failed to fetch SVG content from ${svgUrl}:`, error)
    return `<div style="color: #666; font-style: italic;">${errorMessage}</div>`
  }
}

function createPlantUMLHTML(
  imageUrl: string,
  options: ResolvedPlantUMLOptions,
  svgContent?: string,
  isError = false,
): string {
  const containerStyles = options.styles.container
    ? Object.entries(options.styles.container)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, `-$1`).toLowerCase()}: ${value}`)
        .join(`; `)
    : ``

  if (svgContent) {
    const state = isError ? MD_DIAGRAM_STATE.error : MD_DIAGRAM_STATE.ready
    return `<div class="${options.className}" style="${containerStyles}" ${diagramStateAttr(state)}>
      ${svgContent}
    </div>`
  }

  return `<div class="${options.className}" style="${containerStyles}" ${diagramStateAttr(MD_DIAGRAM_STATE.ready)}>
    <img src="${imageUrl}" alt="PlantUML Diagram" style="max-width: 100%; height: auto;" />
  </div>`
}

/** PlantUML marked extension */
export function markedPlantUML(options: PlantUMLOptions = {}): MarkedExtension {
  const resolvedOptions: ResolvedPlantUMLOptions = {
    serverUrl: options.serverUrl || `https://www.plantuml.com/plantuml`,
    format: options.format || `svg`,
    className: options.className || `plantuml-diagram`,
    inlineSvg: options.inlineSvg || false,
    getDiagramMessages: options.getDiagramMessages,
    styles: {
      container: {
        textAlign: `center`,
        margin: `16px 8px`,
        overflowX: `auto`,
        ...options.styles?.container,
      },
    },
  }

  return {
    extensions: [
      {
        name: `plantuml`,
        level: `block`,
        start(src: string) {
          return src.match(/^```plantuml/m)?.index
        },
        tokenizer(src: string) {
          const match = /^```plantuml\r?\n([\s\S]*?)\r?\n```/.exec(src)

          if (match) {
            const [raw, code] = match
            return {
              type: `plantuml`,
              raw,
              text: code.trim(),
            }
          }
        },
        renderer: asTextTokenRenderer((token: PlantUMLToken) => {
          const themeMode = resolvedOptions.getThemeMode?.()
          const cacheKey = buildPlantUmlCacheKey(token.text, themeMode)

          const cached = readPlantUmlCachedHtml(cacheKey, resolvedOptions)
          if (cached)
            return cached

          return renderPlantUMLDiagram(token, resolvedOptions, cacheKey)
        }),
      },
    ],
    walkTokens(token: Token) {
      if (isCodeToken(token) && token.lang === `plantuml`) {
        asDiagramToken<PlantUMLToken>(token, `plantuml`)
      }
    },
  }
}
