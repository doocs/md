import type { MarkedExtension, Token } from 'marked'
import type { MarkupHighlightToken, MarkupSuperscriptToken, MarkupUnderlineToken, MarkupWavylineToken } from '../types/marked-tokens'
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

// Regex lookbehind throws at parse time in JS engines without support (older
// WebViews) and would take down the whole renderer, so boundaries are enforced
// with plain scans/character classes instead of `(?<!...)`/`(?<=...)`.
//
// `start()` runs for every inline scan position, so the delimiter search uses
// indexOf rather than a per-call `new RegExp`.
function boundaryStart(src: string, delimiter: string): number | undefined {
  let from = 0
  for (;;) {
    const index = src.indexOf(delimiter, from)
    if (index === -1)
      return undefined

    // `==(?!=)` / `++(?!+)` / `~(?!~)`: the delimiter run must stop here.
    // A failed lookahead only advances the scan by one, same as the regex engine.
    if (src[index + delimiter.length] === delimiter[0]) {
      from = index + 1
      continue
    }

    if (!WORD_CHAR.test(src.charAt(index - 1)))
      return index

    // Match consumed but rejected by the boundary rule: resume past it.
    from = index + delimiter.length
  }
}

/** Extended markup: ==highlight==, ++underline++, ~wavyline~, ^superscript^ */
export function markedMarkup(): MarkedExtension {
  return {
    extensions: [
      {
        name: `markup_highlight`,
        level: `inline`,
        start(src: string) {
          return boundaryStart(src, `==`)
        },
        tokenizer(src: string, tokens: Token[]) {
          if (followsWordChar(tokens)) {
            return
          }
          const rule = /^==(?=\S)((?:[^=]|=(?!=))*[^\s=])==/
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
          return boundaryStart(src, `++`)
        },
        tokenizer(src: string, tokens: Token[]) {
          if (followsWordChar(tokens)) {
            return
          }
          const rule = /^\+\+(?=\S)((?:[^+]|\+(?!\+))*[^\s+])\+\+/
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
          return boundaryStart(src, `~`)
        },
        tokenizer(src: string, tokens: Token[]) {
          if (followsWordChar(tokens)) {
            return
          }
          const rule = /^~(?=\S)([^~\n]*[^\s~])~(?!~)/
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

      {
        name: `markup_superscript`,
        level: `inline`,
        start(src: string) {
          // Superscript is the one delimiter meant to sit right after a word
          // char (`x^2^`), so the shared word-boundary filtering is skipped.
          const index = src.indexOf(`^`)
          return index === -1 ? undefined : index
        },
        tokenizer(src: string) {
          // Content must be whitespace-free, so prose like `a ^ b` and dangling
          // carets such as `2^10` stay literal.
          const rule = /^\^([^\s^]+)\^/
          const match = rule.exec(src)
          if (match) {
            return {
              type: `markup_superscript`,
              raw: match[0],
              text: match[1],
            }
          }
        },
        renderer: asTextTokenRenderer((token: MarkupSuperscriptToken) => {
          return `<sup class="markup-superscript">${token.text}</sup>`
        }),
      },
    ],
  }
}
