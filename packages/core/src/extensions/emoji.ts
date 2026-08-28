import type { MarkedExtension } from 'marked'
import type { EmojiToken } from '../types/marked-tokens'
import { asTextTokenRenderer } from '../types/marked-tokens'
import { EMOJI_SHORTCODES } from './emoji-data'

// Shortcode names are lowercase with digits, underscores and the +1/-1 aliases.
const SHORTCODE_RULE = /^:([a-z0-9_+-]+):/

/**
 * GitHub-style emoji shortcodes: `:smile:` becomes 😄.
 *
 * Only names present in EMOJI_SHORTCODES are consumed, so incidental colon
 * pairs in prose (`ratio 3:4:5`) and unknown names stay literal instead of
 * disappearing.
 */
export function markedEmoji(): MarkedExtension {
  return {
    extensions: [
      {
        name: `emoji`,
        level: `inline`,
        start(src: string) {
          const index = src.indexOf(`:`)
          return index === -1 ? undefined : index
        },
        tokenizer(src: string) {
          const match = SHORTCODE_RULE.exec(src)
          if (!match) {
            return
          }

          const emoji = EMOJI_SHORTCODES[match[1]]
          if (!emoji) {
            return
          }

          return {
            type: `emoji`,
            raw: match[0],
            text: emoji,
          }
        },
        // Emitted as a bare character: no wrapper element means nothing for
        // WeChat's sanitizer to strip and no theme CSS to keep in sync.
        renderer: asTextTokenRenderer((token: EmojiToken) => token.text),
      },
    ],
  }
}
