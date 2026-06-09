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

const RE_INFOGRAPHIC_START = /^```infographic/m
const RE_INFOGRAPHIC_BLOCK = /^```infographic\r?\n([\s\S]*?)\r?\n```/

async function renderInfographic(containerId: string, code: string, cacheKey: string, options?: InfographicOptions) {
  if (typeof window === 'undefined')
    return

  try {
    const { Infographic, setDefaultFont, setFontExtendFactor, exportToSVG } = await import('@antv/infographic')

    setFontExtendFactor(1.1)
    setDefaultFont('-apple-system-font, "system-ui", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif')

    const findContainer = (retries = 5, delay = 100) => {
      const container = document.getElementById(containerId)
      if (container) {
        const isDark = options?.themeMode === 'dark'

        // 从 CSS 变量中读取主题颜色
        const root = document.documentElement
        const computedStyle = getComputedStyle(root)
        const primaryColor = computedStyle.getPropertyValue('--md-primary-color').trim()
        const backgroundColor = computedStyle.getPropertyValue('--background').trim()

        // 转换 HSL 格式
        const toHSLString = (variant: string) => {
          const vars = variant.split(' ')
          if (vars.length === 3)
            return `hsl(${vars.join(', ')})`
          if (vars.length === 4)
            return `hsla(${vars.join(', ')})`
          return ''
        }

        const instance = new Infographic({
          container,
          svg: {
            style: {
              width: '100%',
              height: '100%',
              background: isDark ? '#000' : 'transparent',
            },
            background: false,
          },
          theme: isDark ? 'dark' : 'default',
          themeConfig: {
            colorPrimary: primaryColor || undefined,
            colorBg: toHSLString(backgroundColor) || undefined,
          },
        })

        instance.on('loaded', ({ node }) => {
          exportToSVG(node, { removeIds: true }).then((svg) => {
            container.replaceChildren(svg)
            svgCache.set(cacheKey, container.innerHTML)
          })
        })

        instance.render(code)

        return
      }

      if (retries > 0) {
        setTimeout(findContainer, delay, retries - 1, delay)
      }
    }

    findContainer()
  }
  catch (error) {
    console.error('Failed to render Infographic:', error)
    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red;">Infographic 渲染失败: ${error instanceof Error ? error.message : String(error)}</div>`
    }
  }
}

function resolveOptions(options?: InfographicOptionsSource): InfographicOptions | undefined {
  return typeof options === 'function' ? options() : options
}

export function markedInfographic(options?: InfographicOptionsSource): MarkedExtension {
  const className = 'infographic-diagram'

  return {
    extensions: [
      {
        name: 'infographic',
        level: 'block',
        start(src: string) {
          return src.match(RE_INFOGRAPHIC_START)?.index
        },
        tokenizer(src: string) {
          const match = RE_INFOGRAPHIC_BLOCK.exec(src)
          if (match) {
            return {
              type: 'infographic',
              raw: match[0],
              text: match[1].trim(),
            }
          }
        },
        renderer: asTextTokenRenderer((token: InfographicToken) => {
          const code = token.text
          const currentOptions = resolveOptions(options)
          const cacheKey = simpleHash(`${code}-${currentOptions?.themeMode || 'light'}`)

          // 有缓存直接返回
          const cached = svgCache.get(cacheKey)
          if (cached) {
            return `<!--infographic-start--><div class="${className}" style="width: 100%;">${cached}</div><!--infographic-end-->`
          }

          // 没有缓存，触发渲染
          const id = `infographic-${cacheKey}`
          renderInfographic(id, code, cacheKey, currentOptions)

          return `<!--infographic-start--><div id="${id}" class="${className}" style="width: 100%;">正在加载 Infographic...</div><!--infographic-end-->`
        }),
      },
    ],
    walkTokens(token: Token) {
      if (isCodeToken(token) && token.lang === 'infographic') {
        asDiagramToken<InfographicToken>(token, 'infographic')
      }
    },
  }
}
