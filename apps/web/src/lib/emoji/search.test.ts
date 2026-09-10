import { GITHUB_EMOJI_LIST } from '@md/core/extensions'
import { describe, expect, it } from 'vitest'
import {
  builtInEmojiTitle,
  filterBuiltInEmojis,
  filterCloudEmojis,
  matchesEmojiHaystack,
  normalizeEmojiQuery,
} from './search'

const pack = {
  id: `user-1`,
  name: `我的表情`,
  source: `user` as const,
  createdAt: 0,
  files: [],
}

describe(`normalizeEmojiQuery`, () => {
  it(`strips surrounding colons and case`, () => {
    expect(normalizeEmojiQuery(`  :Smile:  `)).toBe(`smile`)
  })
})

describe(`filterBuiltInEmojis`, () => {
  it(`returns the full list for an empty query`, () => {
    expect(filterBuiltInEmojis(``)).toHaveLength(GITHUB_EMOJI_LIST.length)
  })

  it(`matches shortcode, character, Chinese alias, and pinyin`, () => {
    const byShortcode = filterBuiltInEmojis(`smile`).map(item => item.name)
    expect(byShortcode).toContain(`smile`)

    const byChar = filterBuiltInEmojis(`😄`).map(item => item.name)
    expect(byChar).toContain(`smile`)

    const byAlias = filterBuiltInEmojis(`笑`).map(item => item.name)
    expect(byAlias).toContain(`smile`)
    expect(byAlias).toContain(`joy`)

    const byPinyin = filterBuiltInEmojis(`kaixin`).map(item => item.name)
    expect(byPinyin).toContain(`smile`)

    const byInitials = filterBuiltInEmojis(`kx`).map(item => item.name)
    expect(byInitials).toContain(`smile`)
  })

  it(`matches underscore-insensitive shortcodes`, () => {
    expect(filterBuiltInEmojis(`hearteyes`).map(item => item.name)).toContain(`heart_eyes`)
  })
})

describe(`filterCloudEmojis`, () => {
  const files = [
    { id: `liulei`, name: `流泪`, mimeType: `image/png`, size: 1 },
    { id: `doge`, name: `doge`, mimeType: `image/png`, size: 1 },
  ]

  it(`matches filename, pinyin, and pack name`, () => {
    expect(filterCloudEmojis(files, pack, `流`).map(file => file.id)).toEqual([`liulei`])
    expect(filterCloudEmojis(files, pack, `liulei`).map(file => file.id)).toEqual([`liulei`])
    expect(filterCloudEmojis(files, pack, `ll`).map(file => file.id)).toEqual([`liulei`])
    expect(filterCloudEmojis(files, pack, `doge`).map(file => file.id)).toEqual([`doge`])
    expect(filterCloudEmojis(files, pack, `我的`).map(file => file.id)).toEqual([`liulei`, `doge`])
  })
})

describe(`matchesEmojiHaystack`, () => {
  it(`treats empty query as a match`, () => {
    expect(matchesEmojiHaystack(`smile 笑`, ``)).toBe(true)
  })
})

describe(`builtInEmojiTitle`, () => {
  it(`includes the first Chinese alias when present`, () => {
    expect(builtInEmojiTitle(`smile`)).toBe(`:smile: 微笑`)
    expect(builtInEmojiTitle(`not-a-real-emoji`)).toBe(`:not-a-real-emoji:`)
  })
})
