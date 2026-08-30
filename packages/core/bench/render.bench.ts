import { bench, describe } from 'vitest'
import { initRenderer } from '../src/renderer/renderer-impl'
import { postProcessHtml, renderMarkdown, sanitizeHtml } from '../src/utils/markdownHelpers'
import { CODE_HEAVY_ARTICLE, LARGE_ARTICLE, MATH_HEAVY_ARTICLE } from './fixture'

/**
 * DOMPurify runs on jsdom here, so absolute sanitize timings are far slower than
 * a real browser. Treat these numbers as relative (before/after), not absolute.
 */

function makeRenderer() {
  return initRenderer({
    citeStatus: false,
    legend: `alt`,
    countStatus: true,
    isMacCodeBlock: true,
    isShowLineNumber: false,
    themeMode: `light`,
  })
}

function fullRender(markdown: string, renderer: ReturnType<typeof makeRenderer>) {
  renderer.reset({})
  const { html, readingTime } = renderMarkdown(markdown, renderer)
  return postProcessHtml(html, readingTime, renderer)
}

describe(`full render pipeline`, () => {
  const renderer = makeRenderer()

  bench(`large article (~50k chars, mixed)`, () => {
    fullRender(LARGE_ARTICLE, renderer)
  })

  bench(`code-heavy article`, () => {
    fullRender(CODE_HEAVY_ARTICLE, renderer)
  })

  bench(`math-heavy article`, () => {
    fullRender(MATH_HEAVY_ARTICLE, renderer)
  })
})

describe(`pipeline phases (large article)`, () => {
  const renderer = makeRenderer()

  bench(`marked + highlight only`, () => {
    renderer.reset({})
    const { markdownContent } = renderer.parseFrontMatterAndContent(LARGE_ARTICLE)
    renderer.renderMarkdownToHtml(markdownContent)
  })

  const renderedHtml = (() => {
    renderer.reset({})
    const { markdownContent } = renderer.parseFrontMatterAndContent(LARGE_ARTICLE)
    return renderer.renderMarkdownToHtml(markdownContent)
  })()

  bench(`sanitize only`, () => {
    sanitizeHtml(renderedHtml)
  })
})

describe(`incremental typing (one paragraph edited)`, () => {
  const renderer = makeRenderer()
  let counter = 0

  bench(`re-render after single-character edit`, () => {
    counter++
    const edited = LARGE_ARTICLE.replace(`# 大文档渲染性能基准`, `# 大文档渲染性能基准${counter}`)
    fullRender(edited, renderer)
  })
})
