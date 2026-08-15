import { Marked } from 'marked'
import { describe, expect, it } from 'vitest'
import { markedEmoji } from './emoji'

const EMOJI_ID = `3741d9bef6aae2c15e8e15403f2cec84a4f1673348851f064861fcd3f31d6986`
const EMOJI_TOKEN = `{{emoji:${EMOJI_ID}}}`
const IMG_TAG = `<img class="md-emoji" data-emoji-id="${EMOJI_ID}" src="about:blank" alt=":${EMOJI_ID}:" />`

function parse(input: string): string {
  const md = new Marked()
  md.setOptions({ breaks: true })
  md.use(markedEmoji({ resolveUrl: () => `about:blank` }))
  return md.parse(input) as string
}

function imgCount(html: string): number {
  return (html.match(/<img\b/g) || []).length
}

describe(`markedEmoji`, () => {
  it(`renders a single inline emoji (no surrounding text)`, () => {
    const out = parse(EMOJI_TOKEN)
    expect(out).toContain(IMG_TAG)
    expect(out).not.toContain(EMOJI_TOKEN)
    expect(imgCount(out)).toBe(1)
  })

  it(`renders an inline emoji surrounded by text without leaking source`, () => {
    const out = parse(`Markdown test 既简单又强大。${EMOJI_TOKEN} `)
    expect(out).toContain(IMG_TAG)
    expect(out).not.toMatch(/\}\}/)
    expect(imgCount(out)).toBe(1)
  })

  it(`renders an emoji after a blank line as its own paragraph before lifting`, () => {
    const out = parse(`Markdown test 既简单又强大。\n\n${EMOJI_TOKEN}`)
    expect(out).toContain(`<p>Markdown test 既简单又强大。</p>`)
    expect(out).toContain(IMG_TAG)
    expect(imgCount(out)).toBe(1)
  })

  it(`does not duplicate the emoji image when its own line has a trailing space`, () => {
    const out = parse(`Markdown test 既简单又强大。\n\n${EMOJI_TOKEN} `)
    expect(imgCount(out)).toBe(1)
    expect(out).toContain(IMG_TAG)
  })

  it(`does not duplicate when multiple emojis follow each other inline`, () => {
    const out = parse(`${EMOJI_TOKEN}${EMOJI_TOKEN}${EMOJI_TOKEN}`)
    expect(imgCount(out)).toBe(3)
  })

  it(`does not duplicate when multiple emojis are on their own lines`, () => {
    const out = parse(`Markdown test 既简单又强大。\n\n${EMOJI_TOKEN}\n\n${EMOJI_TOKEN}\n\n${EMOJI_TOKEN}`)
    expect(imgCount(out)).toBe(3)
  })

  it(`does not duplicate when emoji appears mid-paragraph with surrounding text`, () => {
    const out = parse(`start ${EMOJI_TOKEN} mid ${EMOJI_TOKEN} end`)
    expect(imgCount(out)).toBe(2)
  })
})
