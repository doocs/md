import { describe, expect, it } from 'vitest'
import { postProcessHtml, renderMarkdown } from '../utils/markdownHelpers'
import { initRenderer } from './renderer-impl'

describe('initRenderer', () => {
  it('renders headings and paragraphs', () => {
    const renderer = initRenderer({})
    const { html } = renderMarkdown(`# Hello\n\nWorld`, renderer)

    expect(html).toContain(`<h1`)
    expect(html).toContain(`Hello`)
    expect(html).toContain(`World`)
  })

  it('strips script tags during sanitization', () => {
    const renderer = initRenderer({})
    const { html } = renderMarkdown(`<script>alert(1)</script>\n\nSafe text`, renderer)

    expect(html).not.toContain(`<script>`)
    expect(html).toContain(`Safe text`)
  })

  it('renders GFM alert blocks', () => {
    const renderer = initRenderer({})
    const { html } = renderMarkdown(`> [!NOTE]\n> Alert body`, renderer)

    expect(html).toContain(`markdown-alert`)
    expect(html).toContain(`Alert body`)
  })

  it('parses YAML front matter', () => {
    const renderer = initRenderer({})
    const { markdownContent, readingTime } = renderer.parseFrontMatterAndContent(
      `---\ntitle: Test\n---\n\n# Body`,
    )

    expect(markdownContent.trim()).toBe(`# Body`)
    expect(readingTime.words).toBeGreaterThan(0)
  })

  it('includes reading time stats in postProcessHtml output', () => {
    const renderer = initRenderer({ countStatus: true, isMacCodeBlock: false })
    const { html, readingTime } = renderMarkdown(`# Hi`, renderer)
    const output = postProcessHtml(html, readingTime, renderer)

    expect(output).toContain(`words`)
    expect(output).toContain(`Hi`)
  })

  it('uses injected renderMessages for footnotes and unknown components', () => {
    const renderer = initRenderer({
      citeStatus: true,
      renderMessages: {
        footnoteTitle: `引用リンク`,
        unknownComponent: `不明: {name}`,
        katexLoading: `数式読込中`,
      },
    })

    const withCite = renderMarkdown(`[Doocs](https://github.com/doocs)`, renderer)
    const withCiteHtml = postProcessHtml(withCite.html, withCite.readingTime, renderer)
    expect(withCiteHtml).toContain(`引用リンク`)

    const unknown = renderMarkdown(`<FakeWidget foo="1" />`, renderer)
    expect(unknown.html).toContain(`[不明: FakeWidget]`)
  })

  it('uses injected countMessages summary template', () => {
    const renderer = initRenderer({
      countStatus: true,
      countMessages: { summary: `単語 {words} / {minutes} 分` },
    })
    const { html, readingTime } = renderMarkdown(`# Hi`, renderer)
    const output = postProcessHtml(html, readingTime, renderer)
    expect(output).toMatch(/単語 \d+ \/ \d+ 分/)
  })

  it('renders single-line block formula as katex-block without paragraph wrapper', () => {
    const renderer = initRenderer({})
    const formula = `$$ITE_{i}=Y_{i,1}-Y_{i,0} \\tag{1}$$`
    const { html } = renderMarkdown(formula, renderer)

    expect(html).toContain(`katex-block`)
    expect(html).toContain(`data-math-raw`)
    expect(html).not.toMatch(/<p[^>]*>\s*<section class="katex-block"/)
  })

  it('renders list item followed by single-line block formula without paragraph wrapper', () => {
    const renderer = initRenderer({})
    const userMd = `1.比如识别段落之间带有编号的latex公式，如 

$$ITE_{i}=Y_{i,1}-Y_{i,0} \\tag{1}$$`
    const { html } = renderMarkdown(userMd, renderer)

    expect(html).toContain(`data-math-raw`)
    expect(html).toContain(`\\tag{1}`)
    expect(html).not.toMatch(/<p[^>]*>\s*<section class="katex-block"/)
  })
})
