import { describe, expect, it } from 'vitest'
import { initRenderer } from '../renderer/renderer-impl'
import { renderMarkdown } from '../utils/markdownHelpers'

function render(md: string): string {
  return renderMarkdown(md, initRenderer({})).html
}

describe(`footnotes extension`, () => {
  it(`renders refs and definitions with bidirectional anchors`, () => {
    const html = render(`Text with a note[^1].\n\n[^1]: Footnote body`)

    expect(html).toContain(`href="#fnDef-1"`)
    expect(html).toContain(`id="fnRef-1"`)
    expect(html).toContain(`Footnote body`)
    expect(html).toContain(`id="fnDef-1"`)
  })

  it(`numbers multiple footnotes in definition order`, () => {
    const html = render(`A[^a] B[^b]\n\n[^a]: first\n[^b]: second`)

    expect(html).toContain(`href="#fnDef-a"`)
    expect(html).toContain(`href="#fnDef-b"`)
    expect(html).toContain(`first`)
    expect(html).toContain(`second`)
  })

  it(`keeps unresolved footnote refs as plain text`, () => {
    const html = render(`Text[^missing] here`)

    expect(html).toContain(`[^missing]`)
    expect(html).not.toContain(`fnRef-missing`)
  })
})

describe(`toc extension`, () => {
  it(`builds a nested toc from headings, skipping h1`, () => {
    const html = render([
      `# Title`,
      ``,
      `[TOC]`,
      ``,
      `## Section A`,
      ``,
      `### Sub A1`,
      ``,
      `## Section B`,
    ].join(`\n`))

    expect(html).toContain(`markdown-toc`)
    expect(html).toContain(`Section A`)
    expect(html).toContain(`Sub A1`)
    // h1 (`# Title`, heading index 0) is excluded from the toc links
    expect(html).toContain(`href="#1"`)
    expect(html).not.toContain(`href="#0"`)
    // nested depth for the h3 entry
    expect(html).toContain(`toc-level-3`)
  })

  it(`renders nothing when the document has no subheadings`, () => {
    const html = render(`# Only Title\n\n[TOC]`)

    expect(html).not.toContain(`markdown-toc`)
  })
})

describe(`ruby extension`, () => {
  it(`renders [text]{ruby} annotations`, () => {
    const html = render(`[漢字]{かんじ}`)

    expect(html).toContain(`<ruby`)
    expect(html).toContain(`<rt>かんじ</rt>`)
    expect(html).toContain(`漢字`)
  })

  it(`supports the ^() syntax variant`, () => {
    const html = render(`[拼音]^(pin-yin)`)

    expect(html).toContain(`<ruby`)
    expect(html).toContain(`data-format="basic-hat"`)
  })

  it(`splits ruby parts across characters with separators`, () => {
    const html = render(`[上海]{shang-hai}`)

    expect((html.match(/<ruby/g) ?? []).length).toBe(2)
    expect(html).toContain(`<rt>shang</rt>`)
    expect(html).toContain(`<rt>hai</rt>`)
  })
})

describe(`markup extension`, () => {
  it(`renders highlight, underline and wavyline spans`, () => {
    const html = render(`==hl== ++ul++ ~wv~`)

    expect(html).toContain(`class="markup-highlight"`)
    expect(html).toContain(`class="markup-underline"`)
    expect(html).toContain(`class="markup-wavyline"`)
    expect(html).toContain(`hl`)
    expect(html).toContain(`ul`)
    expect(html).toContain(`wv`)
  })

  it(`keeps C++ as literal text instead of pairing the pluses`, () => {
    const html = render(`C++是最好的语言，C++是最好的语言`)

    expect(html).not.toContain(`markup-underline`)
    expect(html).toContain(`C++是最好的语言，C++是最好的语言`)
  })

  it(`keeps delimiters attached to word chars as literal text`, () => {
    expect(render(`x==1==y`)).not.toContain(`markup-highlight`)
    expect(render(`v1~2~3`)).not.toContain(`markup-wavyline`)
    expect(render(`C++17`)).toContain(`C++17`)
  })

  it(`keeps delimiters after a word-char token as literal text`, () => {
    const html = render(`**C**++不是下划线++`)

    expect(html).toContain(`<strong class="strong">C</strong>`)
    expect(html).not.toContain(`markup-underline`)
  })

  it(`rejects content wrapped in whitespace`, () => {
    expect(render(`++ 文字 ++`)).not.toContain(`markup-underline`)
    expect(render(`a == b == c`)).not.toContain(`markup-highlight`)
    expect(render(`~ 文字 ~`)).not.toContain(`markup-wavyline`)
  })

  it(`skips over longer delimiter runs and still pairs a later match`, () => {
    expect(render(`前面 === 后面 ==高亮==`)).toContain(`class="markup-highlight"`)
    expect(render(`+++ 然后 ++下划线++`)).toContain(`class="markup-underline"`)
  })

  it(`still renders intraword CJK markup`, () => {
    const html = render(`把++重点++标出==高亮==和~波浪~`)

    expect(html).toContain(`class="markup-underline"`)
    expect(html).toContain(`class="markup-highlight"`)
    expect(html).toContain(`class="markup-wavyline"`)
  })

  it(`renders superscript directly after a word char`, () => {
    const html = render(`x^2^ + y^10^ = z`)

    expect((html.match(/class="markup-superscript"/g) ?? []).length).toBe(2)
    expect(html).toContain(`<sup class="markup-superscript">2</sup>`)
    expect(html).toContain(`<sup class="markup-superscript">10</sup>`)
  })

  it(`keeps carets as literal text when superscript cannot pair`, () => {
    expect(render(`a ^ b ^ c`)).not.toContain(`markup-superscript`)
    expect(render(`2^10 is 1024`)).not.toContain(`markup-superscript`)
    expect(render(`^ leading caret`)).not.toContain(`markup-superscript`)
  })

  it(`leaves ruby hat syntax to the ruby extension`, () => {
    const html = render(`[汉字]^(han-zi)`)

    expect(html).not.toContain(`markup-superscript`)
    expect(html).toContain(`data-format="basic-hat"`)
  })
})

describe(`strikethrough`, () => {
  it(`renders del with a theme class`, () => {
    const html = render(`~~gone~~`)

    expect(html).toContain(`<del class="del">gone</del>`)
  })

  it(`keeps wavyline distinct from strikethrough`, () => {
    const html = render(`~~gone~~ and ~wave~`)

    expect(html).toContain(`<del class="del">gone</del>`)
    expect(html).toContain(`class="markup-wavyline"`)
  })
})

describe(`emoji extension`, () => {
  it(`replaces known shortcodes with emoji characters`, () => {
    const html = render(`Ship it :rocket: :tada:`)

    expect(html).toContain(`🚀`)
    expect(html).toContain(`🎉`)
    expect(html).not.toContain(`:rocket:`)
  })

  it(`supports the +1 and -1 aliases`, () => {
    const html = render(`:+1: and :-1:`)

    expect(html).toContain(`👍`)
    expect(html).toContain(`👎`)
  })

  it(`leaves unknown shortcodes as literal text`, () => {
    const html = render(`:definitely_not_an_emoji:`)

    expect(html).toContain(`:definitely_not_an_emoji:`)
  })

  it(`leaves incidental colon pairs in prose alone`, () => {
    expect(render(`ratio 3:4:5`)).toContain(`3:4:5`)
    expect(render(`meeting at 12:30:45`)).toContain(`12:30:45`)
    expect(render(`key: value`)).toContain(`key: value`)
  })

  it(`does not replace shortcodes inside inline code`, () => {
    const html = render(`use \`:rocket:\` to launch`)

    expect(html).toContain(`:rocket:`)
    expect(html).not.toContain(`🚀`)
  })

  it(`does not replace shortcodes inside fenced code blocks`, () => {
    const html = render(`\`\`\`\n:rocket:\n\`\`\``)

    expect(html).toContain(`:rocket:`)
    expect(html).not.toContain(`🚀`)
  })

  it(`keeps Obsidian callout syntax working`, () => {
    const html = render(`:::tip\nBody\n:::`)

    expect(html).toContain(`markdown-alert`)
    expect(html).toContain(`Body`)
  })
})

describe(`slider extension`, () => {
  it(`renders a horizontal scroll container with all images`, () => {
    const html = render(`<![alt1](https://example.com/1.png),![alt2](https://example.com/2.png)>`)

    expect(html).toContain(`src="https://example.com/1.png"`)
    expect(html).toContain(`src="https://example.com/2.png"`)
    expect(html).toContain(`alt="alt1"`)
    expect(html).toContain(`overflow-x: scroll`)
  })
})

describe(`alert extension`, () => {
  it(`renders builtin variants with class and default title`, () => {
    const html = render(`> [!WARNING]\n> Careful now`)

    expect(html).toContain(`markdown-alert-warning`)
    expect(html).toContain(`Warning`)
    expect(html).toContain(`Careful now`)
  })

  it(`supports custom titles on the marker line`, () => {
    const html = render(`> [!NOTE] 自定义标题\n> body`)

    expect(html).toContain(`自定义标题`)
    expect(html).toContain(`body`)
  })

  it(`supports ::: container syntax`, () => {
    const html = render(`:::tip Pro Tip\nContainer body\n:::`)

    expect(html).toContain(`markdown-alert-tip`)
    expect(html).toContain(`Container body`)
  })

  it(`escapes html in custom titles`, () => {
    const html = render(`> [!NOTE] <b>bold</b>\n> body`)

    expect(html).not.toContain(`<b>bold</b>`)
    expect(html).toContain(`&lt;b&gt;`)
  })
})
