import { Marked } from 'marked'
import { describe, expect, it } from 'vitest'
import { markedComponent } from './component'
import { formatEmojiSnippet, markedEmoji, padEmojiBlock, parseEmojiTag } from './emoji'

const EMOJI_ID = `liulei`
const LEGACY_TOKEN = `{{emoji:${EMOJI_ID}}}`
const TAG = `<Emoji id="${EMOJI_ID}" />`
const SMALL_IMG = `<img class="md-emoji" data-emoji-id="${EMOJI_ID}" src="about:blank" alt=":${EMOJI_ID}:" />`
const SIZED_IMG = `<img class="md-asset-img" data-emoji-id="${EMOJI_ID}" data-asset-id="${EMOJI_ID}" src="about:blank" alt="流泪" style="width:20%" />`

function parse(input: string, resolveUrl: (id: string) => string = () => `about:blank`): string {
  const md = new Marked()
  md.setOptions({ breaks: true })
  md.use(markedEmoji({ resolveUrl }))
  return md.parse(input) as string
}

function parseWithComponents(input: string): string {
  const md = new Marked()
  md.setOptions({ breaks: true })
  md.use(markedComponent())
  md.use(markedEmoji({ resolveUrl: () => `about:blank` }))
  return md.parse(input) as string
}

function imgCount(html: string): number {
  return (html.match(/<img\b/g) || []).length
}

describe(`formatEmojiSnippet`, () => {
  it(`builds a small sticker tag`, () => {
    expect(formatEmojiSnippet({ id: `liulei`, alt: `流泪` })).toBe(`<Emoji id="liulei" alt="流泪" />`)
  })

  it(`adds width for original-size inserts`, () => {
    expect(formatEmojiSnippet({ id: `liulei`, alt: `流泪`, widthPercent: 20 }))
      .toBe(`<Emoji id="liulei" alt="流泪" width="20%" />`)
  })

  it(`clamps original-size width to 1–100`, () => {
    expect(formatEmojiSnippet({ id: `liulei`, widthPercent: 999 }))
      .toBe(`<Emoji id="liulei" width="100%" />`)
    expect(formatEmojiSnippet({ id: `liulei`, widthPercent: 0 }))
      .toBe(`<Emoji id="liulei" width="1%" />`)
  })

  it(`adds align for centered block inserts`, () => {
    expect(formatEmojiSnippet({ id: `liulei`, alt: `流泪`, widthPercent: 20, align: `center` }))
      .toBe(`<Emoji id="liulei" alt="流泪" width="20%" align="center" />`)
  })
})

describe(`padEmojiBlock`, () => {
  it(`adds blank lines when the cursor sits inside text`, () => {
    expect(padEmojiBlock(TAG, `hello`, `world`)).toBe(`\n\n${TAG}\n\n`)
  })

  it(`does not add extra blank lines at document edges`, () => {
    expect(padEmojiBlock(TAG, ``, ``)).toBe(TAG)
  })
})

describe(`parseEmojiTag`, () => {
  it(`reads id, alt, and width in any order`, () => {
    expect(parseEmojiTag(`<Emoji width="20%" id="aida" alt="挨打" />`)).toEqual({
      raw: `<Emoji width="20%" id="aida" alt="挨打" />`,
      id: `aida`,
      alt: `挨打`,
      widthPercent: 20,
      align: undefined,
    })
  })

  it(`reads align`, () => {
    expect(parseEmojiTag(`<Emoji id="aida" align="center" />`)?.align).toBe(`center`)
    expect(parseEmojiTag(`<Emoji id="aida" align="middle" />`)?.align).toBeUndefined()
  })

  it(`accepts an empty paired tag`, () => {
    expect(parseEmojiTag(`<Emoji id="aida"></Emoji>`)?.id).toBe(`aida`)
  })

  it(`rejects a missing id`, () => {
    expect(parseEmojiTag(`<Emoji alt="流泪" />`)).toBeUndefined()
  })

  it(`rejects an unclosed tag`, () => {
    expect(parseEmojiTag(`<Emoji id="aida"`)).toBeUndefined()
  })
})

describe(`markedEmoji <Emoji> tag`, () => {
  it(`renders a single inline sticker`, () => {
    const out = parse(TAG)
    expect(out).toContain(SMALL_IMG)
    expect(out).not.toContain(TAG)
    expect(imgCount(out)).toBe(1)
  })

  it(`renders mid-paragraph without leaking source`, () => {
    const out = parse(`Markdown test 既简单又强大。${TAG} `)
    expect(out).toContain(SMALL_IMG)
    expect(out).not.toContain(`<Emoji`)
    expect(imgCount(out)).toBe(1)
  })

  it(`renders original-size width`, () => {
    const out = parse(`<Emoji id="liulei" alt="流泪" width="20%" />`)
    expect(out).toContain(SIZED_IMG)
    expect(out).not.toContain(`width="20%"`)
    expect(imgCount(out)).toBe(1)
  })

  it(`accepts width without a percent sign`, () => {
    const out = parse(`<Emoji id="liulei" width="30" />`)
    expect(out).toContain(`style="width:30%"`)
  })

  it(`does not duplicate when multiple stickers follow each other`, () => {
    expect(imgCount(parse(`${TAG}${TAG}${TAG}`))).toBe(3)
  })

  it(`does not treat EmojiFoo as a sticker`, () => {
    const out = parse(`<EmojiFoo id="liulei" />`)
    expect(out).not.toContain(`md-emoji`)
  })

  it(`leaves fenced <Emoji> tags as code`, () => {
    const out = parse('```\n<Emoji id="liulei" />\n```')
    expect(out).toContain(`<pre>`)
    expect(out).not.toContain(`md-emoji`)
    expect(imgCount(out)).toBe(0)
  })

  it(`clamps oversized width attributes`, () => {
    const out = parse(`<Emoji id="liulei" width="999%" />`)
    expect(out).toContain(`style="width:100%"`)
  })

  it(`drops javascript: URLs from resolveUrl`, () => {
    const out = parse(TAG, () => `javascript:alert(1)`)
    expect(out).toContain(`src="about:blank"`)
    expect(out).not.toContain(`javascript:`)
  })

  it(`centers a sticker that sits on its own line`, () => {
    const out = parse(`<Emoji id="liulei" width="20%" align="center" />`)
    expect(out).toContain(`<p style="text-align:center">`)
    expect(out).toContain(`style="width:20%"`)
    expect(out).not.toContain(`align="center"`)
  })

  it(`ignores align when the sticker sits mid-paragraph`, () => {
    const out = parse(`hello <Emoji id="liulei" align="center" /> world`)
    expect(out).toContain(SMALL_IMG)
    expect(out).not.toContain(`text-align:center`)
  })
})

describe(`markedEmoji legacy aliases`, () => {
  it(`still renders {{emoji:id}}`, () => {
    const out = parse(LEGACY_TOKEN)
    expect(out).toContain(SMALL_IMG)
    expect(out).not.toContain(LEGACY_TOKEN)
  })

  it(`still renders ![name](asset://id){N%}`, () => {
    const out = parse(`![流泪](asset://${EMOJI_ID}){20%}`)
    expect(out).toContain(`data-asset-id="${EMOJI_ID}"`)
    expect(out).toContain(`style="width:20%"`)
    expect(out).not.toContain(`{20%}`)
    expect(imgCount(out)).toBe(1)
  })

  it(`falls back to a standard image when the {N%} suffix is missing`, () => {
    const out = parse(`![10001.gif](asset:${EMOJI_ID})`)
    expect(out).not.toContain(`md-asset-img`)
    expect(out).toContain(`asset:${EMOJI_ID}`)
  })

  it(`rejects a legacy asset id that would break out of HTML attributes`, () => {
    const out = parse(`![x](asset://foo"onclick=alert(1)){20%}`)
    expect(out).not.toContain(`md-asset-img`)
    expect(out).not.toMatch(/\sonclick\s*=/)
  })
})

describe(`markedEmoji with markedComponent`, () => {
  it(`renders an inline sticker next to text`, () => {
    const out = parseWithComponents(`hello <Emoji id="${EMOJI_ID}" /> world`)
    expect(out).toContain(SMALL_IMG)
    expect(out).not.toContain(`Unknown component`)
    expect(imgCount(out)).toBe(1)
  })

  it(`renders a sticker that sits on its own line`, () => {
    const out = parseWithComponents(TAG)
    expect(out).toContain(SMALL_IMG)
    expect(out).not.toContain(`Unknown component`)
    expect(imgCount(out)).toBe(1)
  })
})
