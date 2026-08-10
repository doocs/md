import type { MarkedExtension, Token } from 'marked'
import type { MarkupHighlightToken, MarkupUnderlineToken, MarkupWavylineToken } from '../types/marked-tokens'
import { asTextTokenRenderer } from '../types/marked-tokens'

// ASCII-only on purpose: `C++`/`x==1`/`v1~2` must stay literal, while CJK
// intraword usage like `把++重点++标出` should keep rendering.
const WORD_CHAR = /[A-Z0-9]/i

// Inline tokenizers only see `src` from the candidate position on, so the left
// boundary is recovered from the already-tokenized inline tokens instead.
function prevInlineChar(tokens: Token[] | undefined): string {
  const last = tokens?.[tokens.length - 1]
  if (!last) {
    return ``
  }
  const nested = (last as { tokens?: Token[] }).tokens
  if (Array.isArray(nested) && nested.length > 0) {
    return prevInlineChar(nested)
  }
  const text = (last as { text?: string }).text ?? last.raw ?? ``
  return text.charAt(text.length - 1)
}

/** Opening delimiter must not directly follow a word char (blocks `C++`). */
function followsWordChar(tokens: Token[] | undefined): boolean {
  return WORD_CHAR.test(prevInlineChar(tokens))
}

/** Extended markup: ==highlight==, ++underline++, ~wavyline~ */
export function markedMarkup(): MarkedExtension {
  return {
    extensions: [
      {
        name: `markup_highlight`,
        level: `inline`,
        start(src: string) {
          return src.match(/(?<![A-Z0-9])==(?!=)/i)?.index
        },
        tokenizer(src: string, tokens: Token[]) {
          if (followsWordChar(tokens)) {
            return
          }
          const rule = /^==(?=\S)((?:[^=]|=(?!=))+)(?<=\S)==/
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
          return src.match(/(?<![A-Z0-9])\+\+(?!\+)/i)?.index
        },
        tokenizer(src: string, tokens: Token[]) {
          if (followsWordChar(tokens)) {
            return
          }
          const rule = /^\+\+(?=\S)((?:[^+]|\+(?!\+))+)(?<=\S)\+\+/
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
          return src.match(/(?<![A-Z0-9])~(?!~)/i)?.index
        },
        tokenizer(src: string, tokens: Token[]) {
          if (followsWordChar(tokens)) {
            return
          }
          const rule = /^~(?=\S)([^~\n]+)(?<=\S)~(?!~)/
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
