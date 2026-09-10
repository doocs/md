import type { MarkedExtension } from 'marked'
import type { EmojiToken } from '../types/marked-tokens'
import { asGenericTokenRenderer, asTextTokenRenderer } from '../types/marked-tokens'
import { escapeHtml } from '../utils/basicHelpers'
import { EMOJI_SHORTCODES } from './emoji-data'

// Shortcode names are lowercase with digits, underscores and the +1/-1 aliases.
const SHORTCODE_RULE = /^:([a-z0-9_+-]+):/
// Legacy small-mode insert. Kept so existing articles still render.
const LEGACY_EMOJI_RULE = /^\{\{emoji:([\w-]+)\}\}/
// Legacy original-size insert: `![name](asset://<id>){N%}`.
const ASSET_EMOJI_RULE = /^!\[([^\]]*)\]\(\s*asset:\/*([^\s/)]+)\s*\)\{(\d+)%\}?/

const EMOJI_TAG = `Emoji`
const EMOJI_TAG_OPEN = `<${EMOJI_TAG}`

export interface MarkedEmojiOptions {
  /** Resolve a custom-pack emoji id to a URL. Defaults to `about:blank`. */
  resolveUrl?: (id: string) => string
}

export type EmojiAlign = `left` | `center` | `right`

export interface EmojiSnippetOptions {
  id: string
  alt?: string
  widthPercent?: number
  align?: EmojiAlign
}

interface AssetEmojiToken {
  type: 'assetEmoji'
  raw: string
  id: string
  name: string
  widthPercent: number
}

const SAFE_SRC_RE = /^(?:https?:|blob:|data:image\/|about:blank)/i
const EMOJI_ID_RE = /^[\w-]+$/

function quoteAttr(value: string): string {
  if (value.includes(`"`) && !value.includes(`'`))
    return `'${value}'`
  return `"${value.replace(/"/g, `'`)}"`
}

function safeSrc(url: string): string {
  const trimmed = url.trim()
  if (!SAFE_SRC_RE.test(trimmed))
    return `about:blank`
  return escapeHtml(trimmed)
}

/**
 * Source snippet inserted by the emoji panel.
 * Small: `<Emoji id="liulei" alt="流泪" />`
 * Original: `<Emoji id="liulei" alt="流泪" width="20%" />`
 * Centered block: `<Emoji id="liulei" alt="流泪" width="20%" align="center" />`
 */
export function formatEmojiSnippet(options: EmojiSnippetOptions): string {
  const attrs = [`id=${quoteAttr(options.id)}`]
  const alt = options.alt?.trim()
  if (alt)
    attrs.push(`alt=${quoteAttr(alt)}`)
  const width = options.widthPercent == null
    ? undefined
    : parseWidthPercent(String(options.widthPercent))
  if (width != null)
    attrs.push(`width=${quoteAttr(`${width}%`)}`)
  if (options.align)
    attrs.push(`align=${quoteAttr(options.align)}`)
  return `<${EMOJI_TAG} ${attrs.join(` `)} />`
}

/** Keep a centered / own-line sticker isolated from surrounding text. */
export function padEmojiBlock(snippet: string, before: string, after: string): string {
  const lead = before.endsWith(`\n\n`) || before === ``
    ? ``
    : before.endsWith(`\n`) ? `\n` : `\n\n`
  const trail = after.startsWith(`\n\n`) || after === ``
    ? ``
    : after.startsWith(`\n`) ? `\n` : `\n\n`
  return `${lead}${snippet}${trail}`
}

function parseWidthPercent(raw: string | undefined): number | undefined {
  if (!raw)
    return undefined
  const match = /^(\d+)%?$/.exec(raw.trim())
  if (!match)
    return undefined
  const value = Number(match[1])
  if (!Number.isFinite(value))
    return undefined
  return Math.max(1, Math.min(100, value))
}

function parseAlign(raw: string | undefined): EmojiAlign | undefined {
  const value = raw?.trim().toLowerCase()
  if (value === `left` || value === `center` || value === `right`)
    return value
  return undefined
}

function isNameBoundary(ch: string | undefined): boolean {
  return !ch || !/[\w-]/.test(ch)
}

function skipWs(src: string, from: number): number {
  let i = from
  while (i < src.length && /\s/.test(src[i]))
    i++
  return i
}

function readQuoted(src: string, from: number): { value: string, end: number } | undefined {
  const quote = src[from]
  if (quote !== `"` && quote !== `'`)
    return undefined
  let i = from + 1
  while (i < src.length && src[i] !== quote)
    i++
  if (src[i] !== quote)
    return undefined
  return { value: src.slice(from + 1, i), end: i + 1 }
}

/**
 * Parse a self-closing or empty `<Emoji …>` tag at the start of `src`.
 * Attribute order is free; `id` is required.
 */
export function parseEmojiTag(src: string): { raw: string, id: string, alt?: string, widthPercent?: number, align?: EmojiAlign } | undefined {
  if (!src.startsWith(EMOJI_TAG_OPEN) || !isNameBoundary(src[EMOJI_TAG_OPEN.length]))
    return undefined

  const attrs: Record<string, string> = {}
  let i = skipWs(src, EMOJI_TAG_OPEN.length)
  let closed = false

  while (i < src.length) {
    i = skipWs(src, i)
    if (src.startsWith(`/>`, i)) {
      i += 2
      closed = true
      break
    }
    if (src[i] === `>`) {
      i = skipWs(src, i + 1)
      const close = `</${EMOJI_TAG}>`
      if (!src.startsWith(close, i))
        return undefined
      i += close.length
      closed = true
      break
    }

    const nameStart = i
    while (i < src.length && /[\w-]/.test(src[i]))
      i++
    if (i === nameStart)
      return undefined
    const name = src.slice(nameStart, i)
    i = skipWs(src, i)
    if (src[i] !== `=`)
      return undefined
    i = skipWs(src, i + 1)
    const quoted = readQuoted(src, i)
    if (!quoted)
      return undefined
    attrs[name] = quoted.value
    i = quoted.end
  }

  if (!closed)
    return undefined

  const id = attrs.id?.trim()
  if (!id || !EMOJI_ID_RE.test(id))
    return undefined

  return {
    raw: src.slice(0, i),
    id,
    alt: attrs.alt?.trim() || undefined,
    widthPercent: parseWidthPercent(attrs.width),
    align: parseAlign(attrs.align),
  }
}

function findEmojiTagStart(src: string): number | undefined {
  let from = 0
  for (;;) {
    const index = src.indexOf(EMOJI_TAG_OPEN, from)
    if (index === -1)
      return undefined
    if (isNameBoundary(src[index + EMOJI_TAG_OPEN.length]))
      return index
    from = index + EMOJI_TAG_OPEN.length
  }
}

function renderSticker(
  resolveUrl: (id: string) => string,
  id: string,
  alt: string,
  widthPercent?: number,
): string {
  const safeId = escapeHtml(id)
  const safeAlt = escapeHtml(alt)
  const url = safeSrc(resolveUrl(id))
  const width = widthPercent == null ? undefined : parseWidthPercent(String(widthPercent))
  if (width != null) {
    return `<img class="md-asset-img" data-emoji-id="${safeId}" data-asset-id="${safeId}" src="${url}" alt="${safeAlt}" style="width:${width}%" />`
  }
  return `<img class="md-emoji" data-emoji-id="${safeId}" src="${url}" alt="${safeAlt}" />`
}

/**
 * Inline emoji extension:
 *
 * - GitHub shortcodes: `:smile:` → 😄
 * - System sticker (canonical): `<Emoji id="liulei" />`
 *   Optional `alt` and `width="20%"` (original-size mode).
 * - Legacy aliases: `{{emoji:<id>}}` and `![name](asset://<id>){N%}`
 */
function fenceRunLength(src: string, lineStart: number, lineEnd: number): { char: string, length: number } | null {
  let i = lineStart
  let indent = 0
  while (i < lineEnd && src[i] === ` ` && indent < 3) {
    i++
    indent++
  }
  const char = src[i]
  if (char !== `\`` && char !== `~`)
    return null
  let length = 0
  while (i + length < lineEnd && src[i + length] === char)
    length++
  return length >= 3 ? { char, length } : null
}

function findLineStartEmojiTag(src: string): number | undefined {
  let fenceChar = ``
  let fenceLength = 0
  let lineStart = 0
  while (lineStart <= src.length) {
    const newline = src.indexOf(`\n`, lineStart)
    const lineEnd = newline === -1 ? src.length : newline
    const fence = fenceRunLength(src, lineStart, lineEnd)

    if (fenceChar) {
      if (fence && fence.char === fenceChar && fence.length >= fenceLength) {
        fenceChar = ``
        fenceLength = 0
      }
    }
    else if (fence) {
      fenceChar = fence.char
      fenceLength = fence.length
    }
    else if (
      src.startsWith(EMOJI_TAG_OPEN, lineStart)
      && isNameBoundary(src[lineStart + EMOJI_TAG_OPEN.length])
    ) {
      return lineStart
    }

    if (newline === -1)
      return undefined
    lineStart = newline + 1
  }
  return undefined
}

function consumeFullLineTag(src: string): { tag: NonNullable<ReturnType<typeof parseEmojiTag>>, raw: string } | undefined {
  const tag = parseEmojiTag(src)
  if (!tag)
    return undefined
  const after = src.slice(tag.raw.length)
  const newline = after.indexOf(`\n`)
  const rest = newline === -1 ? after : after.slice(0, newline)
  if (rest.trim() !== ``)
    return undefined
  return {
    tag,
    raw: tag.raw + rest + (newline === -1 ? `` : `\n`),
  }
}

export function markedEmoji(options: MarkedEmojiOptions = {}): MarkedExtension {
  const resolveUrl = options.resolveUrl ?? (() => `about:blank`)

  return {
    extensions: [
      {
        name: `emojiBlock`,
        level: `block`,
        start(src: string) {
          return findLineStartEmojiTag(src)
        },
        tokenizer(src: string) {
          const consumed = consumeFullLineTag(src)
          if (!consumed)
            return undefined
          return {
            type: `emojiBlock`,
            raw: consumed.raw,
            id: consumed.tag.id,
            name: consumed.tag.alt,
            widthPercent: consumed.tag.widthPercent,
            align: consumed.tag.align,
          }
        },
        renderer: asGenericTokenRenderer((token: EmojiToken & { type: `emojiBlock` }) => {
          const sticker = renderSticker(
            resolveUrl,
            token.id!,
            token.name || `:${token.id}:`,
            token.widthPercent,
          )
          if (token.align)
            return `<p style="text-align:${token.align}">${sticker}</p>\n`
          return `<p>${sticker}</p>\n`
        }),
      },
      {
        name: `assetEmoji`,
        level: `inline`,
        start(src: string) {
          const idx = src.indexOf(`![`)
          if (idx === -1)
            return undefined
          const closer = src.indexOf(`](asset:`, idx)
          if (closer === -1)
            return undefined
          return idx
        },
        tokenizer(src: string) {
          const match = ASSET_EMOJI_RULE.exec(src)
          if (!match)
            return undefined
          const id = match[2]
          if (!EMOJI_ID_RE.test(id))
            return undefined
          const widthPercent = parseWidthPercent(match[3])
          if (widthPercent == null)
            return undefined
          return {
            type: `assetEmoji`,
            raw: match[0],
            name: match[1],
            id,
            widthPercent,
          } as AssetEmojiToken
        },
        renderer: asGenericTokenRenderer((token: AssetEmojiToken) => {
          return renderSticker(
            resolveUrl,
            token.id,
            token.name || `:${token.id}:`,
            token.widthPercent,
          )
        }),
      },
      {
        name: `emoji`,
        level: `inline`,
        start(src: string) {
          const shortcode = src.indexOf(`:`)
          const legacy = src.indexOf(`{{emoji:`)
          const tag = findEmojiTagStart(src)
          const candidates = [shortcode, legacy, tag].filter((i): i is number => i !== undefined && i !== -1)
          if (!candidates.length)
            return undefined
          return Math.min(...candidates)
        },
        tokenizer(src: string) {
          const tag = parseEmojiTag(src)
          if (tag) {
            return {
              type: `emoji`,
              raw: tag.raw,
              id: tag.id,
              name: tag.alt,
              widthPercent: tag.widthPercent,
              text: tag.raw,
            } as EmojiToken
          }

          const legacy = LEGACY_EMOJI_RULE.exec(src)
          if (legacy) {
            return {
              type: `emoji`,
              raw: legacy[0],
              id: legacy[1],
              text: legacy[0],
            } as EmojiToken
          }

          const match = SHORTCODE_RULE.exec(src)
          if (!match)
            return
          const emoji = EMOJI_SHORTCODES[match[1]]
          if (!emoji)
            return
          return {
            type: `emoji`,
            raw: match[0],
            text: emoji,
          }
        },
        renderer: asTextTokenRenderer((token: EmojiToken) => {
          if (token.id) {
            return renderSticker(
              resolveUrl,
              token.id,
              token.name || `:${token.id}:`,
              token.widthPercent,
            )
          }
          return token.text
        }),
      },
    ],
  }
}
