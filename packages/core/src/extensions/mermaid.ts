import type { MarkedExtension } from 'marked'
import { simpleHash } from '../utils/basicHelpers'

// key -> svg
const svgCache = new Map<string, string>()
// 上一次渲染的结果（用于在新渲染完成前显示旧图片）
let lastRenderedSvg: string | null = null

async function renderMermaid(id: string, code: string, cacheKey: string) {
  if (typeof window === 'undefined')
    return

  const el = document.getElementById(id)
  if (!el)
    return

  const startTime = performance.now()

  try {
    let svg: string

    // 优先使用全局 CDN 的 mermaid
    if ((window as any).mermaid) {
      const mermaid = (window as any).mermaid
      const result = await mermaid.render(`mermaid-svg-${cacheKey}`, code)
      svg = result.svg
    }
    else {
      // 回退到动态导入（开发环境）
      const mermaid = await import('mermaid')
      const result = await mermaid.default.render(`mermaid-svg-${cacheKey}`, code)
      svg = result.svg
    }

    const endTime = performance.now()
    console.log(`[Mermaid] 渲染耗时: ${(endTime - startTime).toFixed(2)}ms`)

    // 插入 SVG 并缓存
    el.innerHTML = svg
    svgCache.set(cacheKey, svg)
    lastRenderedSvg = svg
  }
  catch (error) {
    console.error('Failed to render Mermaid:', error)
    el.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red;">Mermaid 渲染失败: ${error instanceof Error ? error.message : String(error)}</div>`
  }
}

export function markedMermaid(): MarkedExtension {
  const className = 'mermaid-diagram'
  let renderTimeout: ReturnType<typeof setTimeout> | null = null

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
          if (renderTimeout)
            clearTimeout(renderTimeout)
          renderTimeout = setTimeout(() => renderMermaid(id, code, cacheKey), 0)

          // 如果有上一次渲染的结果，显示旧图片；否则显示占位符
          if (lastRenderedSvg) {
            return `<!--mermaid-start--><div id="${id}" class="${className}">${lastRenderedSvg}</div><!--mermaid-end-->`
          }

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
