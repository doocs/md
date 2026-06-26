import type { DiagramMessages } from '@md/shared/types'
import type { MarkedExtension, Token } from 'marked'
import type { MermaidToken } from '../types/marked-tokens'
import type { DiagramThemeMode } from './diagram-theme'
import { asDiagramToken, asTextTokenRenderer, isCodeToken } from '../types/marked-tokens'
import {
  diagramStateAttr,
  formatDiagramMessage,
  MD_DIAGRAM_STATE,
  MD_DIAGRAM_STATE_ATTR,
  resolveDiagramMessages,
} from '../utils/asyncDiagramState'
import { simpleHash } from '../utils/basicHelpers'
import { createSVGCache } from '../utils/svgCache'
import { diagramCacheThemeSuffix, getMermaidThemeConfig } from './diagram-theme'

let initPromise: Promise<typeof import('mermaid')['default']> | null = null

interface MermaidOptions {
  themeMode?: DiagramThemeMode
  diagramMessages?: DiagramMessages
}

type MermaidOptionsSource = MermaidOptions | (() => MermaidOptions | undefined)

let optionsSource: MermaidOptionsSource | undefined

function resolveOptions(): MermaidOptions | undefined {
  return typeof optionsSource === `function` ? optionsSource() : optionsSource
}

function getDiagramMessages(): DiagramMessages {
  return resolveDiagramMessages(resolveOptions()?.diagramMessages)
}

export async function initializeMermaid() {
  return getMermaid()
}

function getMermaid() {
  if (!initPromise) {
    initPromise = import('mermaid').then((m) => {
      m.default.initialize(getMermaidThemeConfig())
      return m.default
    })
  }
  return initPromise
}

function buildCacheKey(code: string, themeMode?: DiagramThemeMode): string {
  return simpleHash(`${code}-${diagramCacheThemeSuffix(themeMode)}`)
}

// key -> svg（LRU 缓存，上限 50 条）
const svgCache = createSVGCache(50)

async function renderMermaidSvg(code: string, themeMode?: DiagramThemeMode): Promise<string> {
  const cacheKey = buildCacheKey(code, themeMode)
  const cached = svgCache.get(cacheKey)
  if (cached)
    return cached

  const mermaid = await getMermaid()
  mermaid.initialize(getMermaidThemeConfig(themeMode))
  const result = await mermaid.render(`mermaid-svg-${cacheKey}`, code)
  svgCache.set(cacheKey, result.svg)
  return result.svg
}

function renderMermaid(id: string, code: string, cacheKey: string, themeMode?: DiagramThemeMode) {
  if (typeof window === `undefined`)
    return

  const handleResult = (svg: string) => {
    svgCache.set(cacheKey, svg)

    const el = document.getElementById(id)
    if (el) {
      el.innerHTML = svg
      el.setAttribute(MD_DIAGRAM_STATE_ATTR, MD_DIAGRAM_STATE.ready)
    }
  }

  const handleError = (error: unknown) => {
    console.error('Failed to render Mermaid:', error)
    const el = document.getElementById(id)
    if (el) {
      const detail = error instanceof Error ? error.message : String(error)
      const messages = getDiagramMessages()
      el.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red;">${formatDiagramMessage(messages.mermaidError, detail)}</div>`
      el.setAttribute(MD_DIAGRAM_STATE_ATTR, MD_DIAGRAM_STATE.error)
    }
  }

  void renderMermaidSvg(code, themeMode)
    .then(handleResult)
    .catch(handleError)
}

export function markedMermaid(options?: MermaidOptionsSource): MarkedExtension {
  optionsSource = options
  const className = 'mermaid-diagram'

  return {
    extensions: [
      {
        name: 'mermaid',
        level: 'block',
        start(src: string) {
          return src.match(/^```mermaid/m)?.index
        },
        tokenizer(src: string) {
          const match = /^```mermaid\r?\n([\s\S]*?)\r?\n```/.exec(src)
          if (match) {
            return {
              type: 'mermaid',
              raw: match[0],
              text: match[1].trim(),
            }
          }
        },
        renderer: asTextTokenRenderer((token: MermaidToken) => {
          const code = token.text
          const currentOptions = resolveOptions()
          const themeMode = currentOptions?.themeMode
          const cacheKey = buildCacheKey(code, themeMode)

          const cached = svgCache.get(cacheKey)
          if (cached) {
            return `<!--mermaid-start--><div class="${className}">${cached}</div><!--mermaid-end-->`
          }

          const id = `mermaid-${cacheKey}`
          renderMermaid(id, code, cacheKey, themeMode)

          const messages = getDiagramMessages()
          return `<!--mermaid-start--><div id="${id}" class="${className}" ${diagramStateAttr(MD_DIAGRAM_STATE.loading)}>${messages.mermaidLoading}</div><!--mermaid-end-->`
        }),
      },
    ],
    walkTokens(token: Token) {
      if (isCodeToken(token) && token.lang === 'mermaid') {
        asDiagramToken<MermaidToken>(token, 'mermaid')
      }
    },
  }
}
