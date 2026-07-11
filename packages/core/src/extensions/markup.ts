import type { MarkedExtension } from 'marked'
import type { MarkupHighlightToken, MarkupUnderlineToken, MarkupWavylineToken } from '../types/marked-tokens'
import { asTextTokenRenderer } from '../types/marked-tokens'

/** Extended markup: ==highlight==, ++underline++, ~wavyline~ */
export function markedMarkup(): MarkedExtension {
  return {
    extensions: [
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
