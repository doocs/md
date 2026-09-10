import type { GitHubEmoji } from '@md/core/extensions'
import type { EmojiFile, EmojiPack } from '@md/shared/types/emoji'
import { GITHUB_EMOJI_LIST } from '@md/core/extensions'
import { pinyin } from 'pinyin-pro'
import { EMOJI_ZH_ALIASES } from '@/lib/emoji/aliases'

const HAS_HAN = /[\u4E00-\u9FFF]/

export interface IndexedGitHubEmoji {
  emoji: GitHubEmoji
  aliases: string[]
  haystack: string
}

function compact(value: string): string {
  return value.toLowerCase().replace(/[\s_:\-]+/g, ``)
}

function pinyinTokens(text: string): string[] {
  if (!HAS_HAN.test(text))
    return []
  const full = pinyin(text, { toneType: `none`, separator: ``, v: true }).toLowerCase()
  const first = pinyin(text, { pattern: `first`, toneType: `none`, separator: ``, v: true }).toLowerCase()
  const words = pinyin(text, { toneType: `none`, type: `array`, v: true }).map(part => part.toLowerCase())
  return [full, first, ...words]
}

function buildHaystack(parts: string[]): string {
  const tokens = new Set<string>()
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed)
      continue
    tokens.add(trimmed.toLowerCase())
    tokens.add(compact(trimmed))
    for (const token of pinyinTokens(trimmed)) {
      if (token)
        tokens.add(token)
    }
  }
  return [...tokens].join(` `)
}

let builtInIndex: IndexedGitHubEmoji[] | null = null

export function getBuiltInEmojiIndex(): IndexedGitHubEmoji[] {
  if (!builtInIndex) {
    builtInIndex = GITHUB_EMOJI_LIST.map((emoji) => {
      const aliases = (EMOJI_ZH_ALIASES[emoji.name] ?? ``).split(/\s+/).filter(Boolean)
      return {
        emoji,
        aliases,
        haystack: buildHaystack([
          emoji.name,
          emoji.name.replace(/_/g, ` `),
          emoji.char,
          ...aliases,
        ]),
      }
    })
  }
  return builtInIndex
}

export function normalizeEmojiQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/^:+|:+$/g, ``)
}

export function matchesEmojiHaystack(haystack: string, query: string): boolean {
  if (!query)
    return true
  if (haystack.includes(query))
    return true
  const compactQuery = compact(query)
  return compactQuery.length > 0 && compact(haystack).includes(compactQuery)
}

export function filterBuiltInEmojis(query: string): GitHubEmoji[] {
  const normalized = normalizeEmojiQuery(query)
  if (!normalized)
    return GITHUB_EMOJI_LIST
  return getBuiltInEmojiIndex()
    .filter(entry => matchesEmojiHaystack(entry.haystack, normalized))
    .map(entry => entry.emoji)
}

const cloudHaystackCache = new Map<string, string>()

export function cloudEmojiHaystack(file: EmojiFile, pack: EmojiPack): string {
  const cacheKey = `${pack.id}:${file.id}:${file.name}:${pack.name}`
  const cached = cloudHaystackCache.get(cacheKey)
  if (cached)
    return cached
  const haystack = buildHaystack([file.name, file.id, pack.name, pack.source])
  cloudHaystackCache.set(cacheKey, haystack)
  return haystack
}

export function filterCloudEmojis(files: EmojiFile[], pack: EmojiPack, query: string): EmojiFile[] {
  const normalized = normalizeEmojiQuery(query)
  if (!normalized)
    return files
  return files.filter(file => matchesEmojiHaystack(cloudEmojiHaystack(file, pack), normalized))
}

export function builtInEmojiTitle(name: string): string {
  const aliases = (EMOJI_ZH_ALIASES[name] ?? ``).split(/\s+/).filter(Boolean)
  return aliases.length ? `:${name}: ${aliases[0]}` : `:${name}:`
}
