import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../utils/markdownHelpers'
import { initRenderer } from './renderer-impl'

describe('inline katex rendering', () => {
  it('renders inline formula in Chinese text without block wrapper or line break', () => {
    const renderer = initRenderer({})
    const md = `取$y_1 = y_2 = \\cdots = y_n = -y$，就退化为二元的情形`
    const { html } = renderMarkdown(md, renderer)

    expect(html).toContain(`katex-inline`)
    expect(html).not.toContain(`katex-block`)
    expect(html).not.toMatch(/<p[^>]*>[\s\S]*?<section class="katex-block"/)
    // Inline formula should stay in the same paragraph as surrounding text
    expect(html).toMatch(/取[\s\S]*katex-inline[\s\S]*就退化为二元的情形/)
  })

  it('does not treat inline formula on its own as block when mixed with text on same line', () => {
    const renderer = initRenderer({})
    const md = `before $x+y$ after`
    const { html } = renderMarkdown(md, renderer)

    expect(html).toContain(`katex-inline`)
    expect(html).not.toContain(`katex-block`)
  })

  it('keeps inline formula inline after soft line break in paragraph (#1743)', () => {
    const renderer = initRenderer({})
    const md = `取
$y_1 = y_2 = \\cdots = y_n = -y$，就退化为二元的情形`
    const { html } = renderMarkdown(md, renderer)

    expect(html).toContain(`katex-inline`)
    expect(html).not.toContain(`katex-block`)
    expect(html).not.toContain(`<br>`)
    expect(html).toMatch(/取[\s\S]*katex-inline[\s\S]*就退化为二元的情形/)
  })

  it('does not render line-start single-dollar formula as block katex', () => {
    const renderer = initRenderer({})
    const md = `$y_1 = y_2 = \\cdots = y_n = -y$`
    const { html } = renderMarkdown(md, renderer)

    expect(html).toContain(`katex-inline`)
    expect(html).not.toContain(`katex-block`)
  })

  it('keeps inline formula in list item without block wrapper', () => {
    const renderer = initRenderer({})
    const md = `- 取$y_1 = y_2 = \\cdots = y_n = -y$，就退化为二元的情形`
    const { html } = renderMarkdown(md, renderer)

    expect(html).toContain(`katex-inline`)
    expect(html).not.toContain(`katex-block`)
  })
})
