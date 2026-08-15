import { describe, expect, it } from 'vitest'
import { liftTrailingEmojiParagraphs } from './markdownHelpers'

const EMOJI_ID = `3741d9bef6aae2c15e8e15403f2cec84a4f1673348851f064861fcd3f31d6986`
const IMG = `<img class="md-emoji" data-emoji-id="${EMOJI_ID}" src="about:blank" alt=":${EMOJI_ID}:" />`

describe(`liftTrailingEmojiParagraphs`, () => {
  it(`lifts an emoji-only paragraph into the preceding text paragraph`, () => {
    const input = `<p class="p">既简单又强大。</p>\n<p class="p">${IMG}</p>`
    const out = liftTrailingEmojiParagraphs(input)
    expect(out).toBe(`<p class="p">既简单又强大。${IMG}</p>`)
  })

  it(`collapses consecutive emoji-only paragraphs into the preceding paragraph`, () => {
    const input = `<p class="p">既简单又强大。</p>\n<p class="p">${IMG}</p>\n<p class="p">${IMG}</p>`
    const out = liftTrailingEmojiParagraphs(input)
    expect(out).toBe(`<p class="p">既简单又强大。${IMG}${IMG}</p>`)
  })

  it(`leaves a leading emoji-only paragraph alone (no preceding paragraph)`, () => {
    const input = `<p class="p">${IMG}</p>\n<p class="p">after</p>`
    const out = liftTrailingEmojiParagraphs(input)
    expect(out).toBe(input)
  })

  it(`keeps text paragraphs separated when no emoji is involved`, () => {
    const input = `<p class="p">one</p>\n<p class="p">two</p>`
    const out = liftTrailingEmojiParagraphs(input)
    expect(out).toBe(input)
  })

  it(`does not lift an emoji when the preceding block is a heading`, () => {
    const input = `<h2>title</h2>\n<p class="p">${IMG}</p>`
    const out = liftTrailingEmojiParagraphs(input)
    expect(out).toBe(input)
  })

  it(`handles multiple emoji images inside a single paragraph`, () => {
    const input = `<p class="p">text</p>\n<p class="p">${IMG}${IMG}</p>`
    const out = liftTrailingEmojiParagraphs(input)
    expect(out).toBe(`<p class="p">text${IMG}${IMG}</p>`)
  })
})
