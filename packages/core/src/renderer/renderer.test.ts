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
    const { markdownContent, readingTime, yamlData } = renderer.parseFrontMatterAndContent(
      `---\ntitle: Test\n---\n\n# Body`,
    )

    expect(yamlData).toEqual({ title: `Test` })
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

  it('renders task list items with a styled checkbox instead of an input', () => {
    const renderer = initRenderer({})
    const { html } = renderMarkdown(`- [x] done\n- [ ] todo`, renderer)

    expect(html).not.toContain(`<input`)
    expect(html).toContain(`class="task-checkbox task-checkbox-checked"`)
    expect(html).toContain(`class="task-checkbox"`)
  })

  it('omits the bullet prefix on task list items but keeps it on plain items', () => {
    const renderer = initRenderer({})
    const { html } = renderMarkdown(`- [ ] todo\n- plain`, renderer)

    expect(html).toContain(`<li class="listitem"><span class="task-checkbox"`)
    expect(html).toContain(`<li class="listitem">• plain</li>`)
  })

  it('keeps the number prefix on ordered task list items', () => {
    const renderer = initRenderer({})
    const { html } = renderMarkdown(`1. [x] first\n2. [ ] second`, renderer)

    expect(html).toContain(`<li class="listitem">1. <span class="task-checkbox task-checkbox-checked"`)
    expect(html).toContain(`<li class="listitem">2. <span class="task-checkbox"`)
  })

  it('renders checkboxes in nested task lists', () => {
    const renderer = initRenderer({})
    const { html } = renderMarkdown(`- [ ] parent\n  - [x] child`, renderer)

    expect(html).not.toContain(`<input`)
    expect(html.match(/class="task-checkbox/g)).toHaveLength(2)
    expect(html).toContain(`task-checkbox-checked`)
  })

  it('renders checkboxes in loose task lists', () => {
    const renderer = initRenderer({})
    const { html } = renderMarkdown(`- [x] first\n\n- [ ] second`, renderer)

    expect(html).not.toContain(`<input`)
    expect(html.match(/class="task-checkbox/g)).toHaveLength(2)
  })

  it('collects headings in document order with plain text', () => {
    const renderer = initRenderer({})
    renderMarkdown(`# Title\n\n## Sub \`code\` & **bold**\n\nBody\n\n### Third`, renderer)

    expect(renderer.getHeadings()).toEqual([
      { level: 1, text: `Title` },
      { level: 2, text: `Sub code & bold` },
      { level: 3, text: `Third` },
    ])
  })

  it('decodes named and numeric entities in heading text like textContent', () => {
    const renderer = initRenderer({})
    renderMarkdown(`# Fish &amp; Chips &mdash; &#x2026; &nbsp;end`, renderer)

    expect(renderer.getHeadings()).toEqual([
      { level: 1, text: `Fish & Chips — … \u00A0end` },
    ])
  })

  it('includes the footnote title after postProcessHtml', () => {
    const renderer = initRenderer({
      citeStatus: true,
      renderMessages: { footnoteTitle: `脚注`, unknownComponent: ``, katexLoading: `` },
    })
    const { html, readingTime } = renderMarkdown(`# Doc\n\n[link](https://example.com)`, renderer)
    postProcessHtml(html, readingTime, renderer)

    const headings = renderer.getHeadings()
    expect(headings[0]).toEqual({ level: 1, text: `Doc` })
    expect(headings[headings.length - 1]).toEqual({ level: 4, text: `脚注` })
  })

  it('clears collected headings on reset', () => {
    const renderer = initRenderer({})
    renderMarkdown(`# Old`, renderer)
    expect(renderer.getHeadings()).toHaveLength(1)

    renderer.reset({})
    expect(renderer.getHeadings()).toHaveLength(0)

    renderMarkdown(`## New`, renderer)
    expect(renderer.getHeadings()).toEqual([{ level: 2, text: `New` }])
  })
})
