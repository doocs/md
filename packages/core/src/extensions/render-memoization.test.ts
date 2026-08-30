import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initRenderer } from '../renderer/renderer-impl'
import { clearHighlightCache } from '../utils/languages'
import { clearMathSvgCache } from './katex'

/**
 * The preview re-renders the whole document on every keystroke batch, so
 * formula typesetting and code highlighting must not be repeated for content
 * that did not change.
 */

function makeRenderer() {
  return initRenderer({ legend: `alt`, themeMode: `light` })
}

function render(renderer: ReturnType<typeof makeRenderer>, markdown: string) {
  renderer.reset({})
  const { markdownContent } = renderer.parseFrontMatterAndContent(markdown)
  return renderer.renderMarkdownToHtml(markdownContent)
}

describe(`formula typesetting is memoized`, () => {
  let tex2svgCalls = 0
  const originalMathJax = window.MathJax

  beforeEach(() => {
    tex2svgCalls = 0
    clearMathSvgCache()

    window.MathJax = {
      texReset() {},
      tex2svg(tex: string) {
        tex2svgCalls++
        const container = document.createElement(`div`)
        const svg = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`)
        svg.setAttribute(`width`, `10ex`)
        svg.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`, `g`))
        svg.textContent = tex
        container.appendChild(svg)
        return container as unknown as ReturnType<MathJaxGlobal['tex2svg']>
      },
    }
  })

  afterEach(() => {
    window.MathJax = originalMathJax
    clearMathSvgCache()
  })

  it(`typesets each distinct formula once across repeated renders`, () => {
    const renderer = makeRenderer()
    const markdown = `Cost is $a + b$ and $c^2$ here.\n\n$$\nx = y\n$$\n`

    render(renderer, markdown)
    expect(tex2svgCalls).toBe(3)

    render(renderer, markdown)
    render(renderer, markdown)
    expect(tex2svgCalls).toBe(3)
  })

  it(`typesets a newly added formula only`, () => {
    const renderer = makeRenderer()

    render(renderer, `$a + b$`)
    expect(tex2svgCalls).toBe(1)

    render(renderer, `$a + b$ and $z$`)
    expect(tex2svgCalls).toBe(2)
  })

  it(`still produces identical output on a cache hit`, () => {
    const renderer = makeRenderer()
    const markdown = `inline $a + b$ done`

    const first = render(renderer, markdown)
    const second = render(renderer, markdown)
    expect(second).toBe(first)
  })

  it(`does not cache the pending placeholder emitted before MathJax loads`, () => {
    const renderer = makeRenderer()
    const markdown = `inline $a + b$ done`

    window.MathJax = undefined as unknown as MathJaxGlobal
    const pending = render(renderer, markdown)
    expect(pending).toContain(`katex-pending`)

    window.MathJax = {
      texReset() {},
      tex2svg(tex: string) {
        tex2svgCalls++
        const container = document.createElement(`div`)
        const svg = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`)
        svg.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`, `g`))
        svg.textContent = tex
        container.appendChild(svg)
        return container as unknown as ReturnType<MathJaxGlobal['tex2svg']>
      },
    }

    const settled = render(renderer, markdown)
    expect(settled).not.toContain(`katex-pending`)
  })
})

describe(`code highlighting is memoized`, () => {
  beforeEach(() => {
    clearHighlightCache()
  })

  it(`returns identical markup for an unchanged block`, () => {
    const renderer = makeRenderer()
    const markdown = '```typescript\nconst a: number = 1\n```'

    const first = render(renderer, markdown)
    const second = render(renderer, markdown)

    expect(second).toBe(first)
    expect(first).toContain(`hljs`)
  })

  it(`keys on the line-number option`, () => {
    const renderer = makeRenderer()
    const markdown = '```typescript\nconst a: number = 1\n```'

    renderer.reset({ isShowLineNumber: false })
    const plain = renderer.renderMarkdownToHtml(markdown)

    renderer.reset({ isShowLineNumber: true })
    const numbered = renderer.renderMarkdownToHtml(markdown)

    expect(numbered).not.toBe(plain)
    expect(numbered).toContain(`line-numbers`)
  })
})
