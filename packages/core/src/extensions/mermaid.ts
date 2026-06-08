import type { MarkedExtension } from 'marked'
import { simpleHash } from '../utils/basicHelpers'
import { createSVGCache } from '../utils/svgCache'

let initPromise: Promise<typeof import('mermaid')['default']> | null = null

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
    }
  }

  const handleError = (error: unknown) => {
    console.error('Failed to render Mermaid:', error)
    const el = document.getElementById(id)
    if (el) {
      el.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red;">Mermaid 渲染失败: ${error instanceof Error ? error.message : String(error)}</div>`
    }
  }

  getMermaid()
    .then(mermaid => mermaid.render(`mermaid-svg-${cacheKey}`, code))
    .then((result: { svg: string }) => handleResult(result.svg))
    .catch(handleError)
}

export function markedMermaid(): MarkedExtension {
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
        renderer(token: any) {
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

          return `<!--mermaid-start--><div id="${id}" class="${className}">正在加载 Mermaid...</div><!--mermaid-end-->`
        },
      },
    ],
    walkTokens(token: any) {
      if (token.type === 'code' && token.lang === 'mermaid') {
        token.type = 'mermaid'
      }
    },
  }
}
