import type { MarkedExtension } from 'marked'
import type { EmojiToken } from '../types/marked-tokens'
import { asTextTokenRenderer } from '../types/marked-tokens'

const EMOJI_REGEX = /^\{\{emoji:([\w-]+)\}\}/
const EMOJI_START_REGEX = /\{\{emoji:/

export interface MarkedEmojiOptions {
  /** Resolve an emoji id to a URL. Called at render time. */
  resolveUrl?: (id: string) => string
}

/**
 * Inline emoji extension.
 *
 * Syntax: `{{emoji:<id>}}` — renders as a small inline `<img class="md-emoji">`
 * whose `src` is whatever `resolveUrl(id)` returns (a `blob:` URL on Web).
 *
 * The `data-emoji-id` attribute is also emitted so the Web preview can
 * re-attach the resolved URL after the marked pass (parser does not have
 * access to runtime blob URLs at parse time).
 */
export function markedEmoji(options: MarkedEmojiOptions = {}): MarkedExtension {
  const resolveUrl = options.resolveUrl ?? (() => `about:blank`)

  return {
    extensions: [
      {
        name: `emoji`,
        level: `inline`,
        start(src: string) {
          return src.match(EMOJI_START_REGEX)?.index
        },
        tokenizer(src: string) {
          const match = EMOJI_REGEX.exec(src)
          if (match) {
            return {
              type: `emoji`,
              raw: match[0],
              id: match[1],
              text: match[0],
            } as EmojiToken
          }
          return undefined
        },
        renderer: asTextTokenRenderer((token: EmojiToken) => {
          const url = resolveUrl(token.id)
          const alt = `:${token.id}:`
          return `<img class="md-emoji" data-emoji-id="${token.id}" src="${url}" alt="${alt}" />`
        }),
      },
    ],
  }
}
