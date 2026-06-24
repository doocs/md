import type { DiagramMessages } from '@md/shared/types'
import type { MarkedExtension, Token } from 'marked'
import type { MermaidToken } from '../types/marked-tokens'
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

let initPromise: Promise<typeof import('mermaid')['default']> | null = null
type DiagramMessagesSource = DiagramMessages | (() => DiagramMessages | undefined)

let diagramMessagesSource: DiagramMessagesSource | undefined

function getDiagramMessages(): DiagramMessages {
  const resolved = typeof diagramMessagesSource === `function`
    ? diagramMessagesSource()
    : diagramMessagesSource
  return resolveDiagramMessages(resolved)
}

export async function initializeMermaid() {
  return getMermaid()
}

function getMermaid() {
  if (!initPromise) {
    initPromise = import('mermaid').then((m) => {
      m.default.initialize({ startOnLoad: false })
      return m.default
    })
  }
  return initPromise
}

// key -> svg（LRU 缓存，上限 50 条）
const svgCache = createSVGCache(50)

function renderMermaid(id: string, code: string, cacheKey: string) {
  if (typeof window === 'undefined')
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

  getMermaid()
    .then(mermaid => mermaid.render(`mermaid-svg-${cacheKey}`, code))
    .then((result: { svg: string }) => handleResult(result.svg))
    .catch(handleError)
}

export function markedMermaid(messagesSource?: DiagramMessagesSource): MarkedExtension {
  diagramMessagesSource = messagesSource
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
          const cacheKey = simpleHash(code)

          // 有缓存直接返回
          const cached = svgCache.get(cacheKey)
          if (cached) {
            return `<!--mermaid-start--><div class="${className}">${cached}</div><!--mermaid-end-->`
          }

          // 没有缓存，触发渲染
          const id = `mermaid-${cacheKey}`
          renderMermaid(id, code, cacheKey)

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
