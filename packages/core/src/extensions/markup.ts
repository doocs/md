import type { MarkedExtension } from 'marked'
import type { MarkupHighlightToken, MarkupUnderlineToken, MarkupWavylineToken } from '../types/marked-tokens'
import { asTextTokenRenderer } from '../types/marked-tokens'

/**
 * 扩展标记语法：
 * - 高亮: ==文本==
 * - 下划线: ++文本++
 * - 波浪线: ~文本~
 */
export function markedMarkup(): MarkedExtension {
  return {
    extensions: [
      // 高亮语法 ==文本==
      {
        name: `markup_highlight`,
        level: `inline`,
        start(src: string) {
          return src.match(/==(?!=)/)?.index
        },
        tokenizer(src: string) {
          const rule = /^==((?:[^=]|=(?!=))+)==/
          const match = rule.exec(src)
          if (match) {
            return {
              type: `markup_highlight`,
              raw: match[0],
              text: match[1],
            }
          }
        },
        renderer: asTextTokenRenderer((token: MarkupHighlightToken) => {
          return `<span class="markup-highlight">${token.text}</span>`
        }),
      },

      // 下划线语法 ++文本++
      {
        name: `markup_underline`,
        level: `inline`,
        start(src: string) {
          return src.match(/\+\+(?!\+)/)?.index
        },
        tokenizer(src: string) {
          const rule = /^\+\+((?:[^+]|\+(?!\+))+)\+\+/
          const match = rule.exec(src)
          if (match) {
            return {
              type: `markup_underline`,
              raw: match[0],
              text: match[1],
            }
          }
        },
        renderer: asTextTokenRenderer((token: MarkupUnderlineToken) => {
          return `<span class="markup-underline">${token.text}</span>`
        }),
      },

      // 波浪线语法 ~文本~
      {
        name: `markup_wavyline`,
        level: `inline`,
        start(src: string) {
          return src.match(/~(?!~)/)?.index
        },
        tokenizer(src: string) {
          const rule = /^~([^~\n]+)~(?!~)/
          const match = rule.exec(src)
          if (match) {
            return {
              type: `markup_wavyline`,
              raw: match[0],
              text: match[1],
            }
          }
        },
        renderer: asTextTokenRenderer((token: MarkupWavylineToken) => {
          return `<span class="markup-wavyline">${token.text}</span>`
        }),
      },
    ],
  }
}
