import type { RendererObject } from 'marked'
import { Marked } from 'marked'
import { describe, expect, it } from 'vitest'
import { markedImageSizeSuffix } from './image-size-suffix'

// Mirror the image renderer used in the full pipeline (packages/core/src/renderer/renderer-impl.ts).
// Only the {N%} / |WxH part is relevant here — the extension's job is to put
// the suffix in the right place for that renderer to pick up.
function sizeSuffixImageRenderer(): RendererObject {
  return {
    image({ href, title, text }) {
      let widthAttr = ``
      let heightAttr = ``
      let styleAttr = ``
      let altText = text
      const sizeMatch = text.match(/(?:\|(\d+)(?:x(\d+))?|\{(\d+)%\})$/)
      if (sizeMatch) {
        altText = text.replace(/(?:\|(\d+)(?:x(\d+))?|\{(\d+)%\})$/, ``)
        if (sizeMatch[3]) {
          styleAttr = ` style="width:${sizeMatch[3]}%"`
        }
        else {
          widthAttr = sizeMatch[1] ? ` width="${sizeMatch[1]}"` : ``
          heightAttr = sizeMatch[2] ? ` height="${sizeMatch[2]}"` : ``
        }
      }
      const titleAttr = title ? ` title="${title}"` : ``
      return `<img src="${href}"${titleAttr}${widthAttr}${heightAttr}${styleAttr} alt="${altText}"/>`
    },
  }
}

function parse(input: string): string {
  const md = new Marked()
  md.setOptions({ breaks: true })
  md.use(markedImageSizeSuffix())
  md.use({ renderer: sizeSuffixImageRenderer() })
  return md.parse(input) as string
}

function imgCount(html: string): number {
  return (html.match(/<img\b/g) || []).length
}

describe(`markedImageSizeSuffix`, () => {
  it(`consumes a trailing {N%} width suffix and applies it as inline CSS width`, () => {
    const out = parse(`![10002.gif](asset://abc){20%}`)
    // The size becomes a CSS percentage on the <img>; alt text is preserved
    // (with a trailing space, mirroring the existing sizeMatch regex).
    expect(out).toMatch(/<img[^>]*src="asset:\/\/abc"/)
    expect(out).toMatch(/style="width:20%"/)
    expect(out).toMatch(/alt="10002\.gif\s*"/)
    // The {20%} source text must not leak into the rendered output.
    expect(out).not.toContain(`{20%}`)
  })

  it(`handles {N%} when the alt text is empty`, () => {
    const out = parse(`![](asset://abc){35%}`)
    expect(out).toMatch(/<img[^>]*src="asset:\/\/abc"/)
    expect(out).toMatch(/style="width:35%"/)
    expect(out).not.toContain(`{35%}`)
  })

  it(`does not consume a plain image without the trailing {N%}`, () => {
    const out = parse(`![name](https://example.com/x.png)`)
    expect(out).toMatch(/<img[^>]*src="https:\/\/example.com\/x.png"/)
    expect(out).not.toMatch(/style=/)
  })

  it(`works when the image is preceded and followed by inline text`, () => {
    const out = parse(`see ![10002.gif](asset://abc){50%} end`)
    expect(out).toMatch(/<img[^>]*style="width:50%"/)
    // Inline text on both sides must be preserved in the same paragraph.
    expect(out).toContain(`see `)
    expect(out).toContain(` end`)
    expect(out).not.toContain(`{50%}`)
  })

  it(`does not interfere with consecutive images that lack the suffix`, () => {
    const out = parse(`![a](https://x/a.png) ![b](https://x/b.png)`)
    expect(imgCount(out)).toBe(2)
    expect(out).not.toMatch(/style=/)
  })

  it(`supports the single-slash asset: scheme as well as asset://`, () => {
    const out1 = parse(`![a](asset:abc){10%}`)
    expect(out1).toMatch(/<img[^>]*style="width:10%"/)
    const out2 = parse(`![a](asset://abc){10%}`)
    expect(out2).toMatch(/<img[^>]*style="width:10%"/)
  })

  it(`does not match when the suffix is on plain text (not an image)`, () => {
    const out = parse(`hello {20%} world`)
    expect(out).not.toMatch(/<img/)
    // The literal {20%} should still be preserved as text since this isn't
    // an image — the extension only rewrites image syntax.
    expect(out).toContain(`{20%}`)
  })

  it(`handles multiple images with suffixes in the same paragraph`, () => {
    const out = parse(`![a](x.png){10%} mid ![b](y.png){20%} end`)
    expect(imgCount(out)).toBe(2)
    expect(out).toMatch(/<img[^>]*style="width:10%"/)
    expect(out).toMatch(/<img[^>]*style="width:20%"/)
    expect(out).not.toMatch(/\{10%\}/)
    expect(out).not.toMatch(/\{20%\}/)
  })

  it(`rewrites markdown before marked parses it (no stray {N%} tokens emitted)`, () => {
    const out = parse(`![name](url){15%}`)
    // The preprocessed markdown is `![name {15%}](url)`, which produces one
    // <img>. If the suffix had been left as text we'd see "{15%}" in the
    // output and exactly one <img>.
    expect(imgCount(out)).toBe(1)
    expect(out).not.toContain(`{15%}`)
  })
})
