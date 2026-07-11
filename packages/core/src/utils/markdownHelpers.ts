import type { RendererAPI } from '@md/shared/types'
import type { ReadTimeResults } from '@md/shared/utils/readingTime'
import DOMPurify from 'isomorphic-dompurify'
import { stripBreakBeforeInlineKatex } from './mathDetection'

const INFOGRAPHIC_PLACEHOLDER_REGEX = /<!--infographic-start-->[\s\S]*?<!--infographic-end-->/g
const MERMAID_PLACEHOLDER_REGEX = /<!--mermaid-start-->[\s\S]*?<!--mermaid-end-->/g
const PROTECTED_SPAN_REGEX = /<span data-md-protected="(\d+)"><\/span>/g

/**
 * DOMPurify v3.1.7+ strips foreignObject content.
 * https://github.com/kkomelin/isomorphic-dompurify/pull/290
 * https://github.com/cure53/DOMPurify/issues/1152
 * Use placeholders: protect before sanitize, restore after.
 * HTML comments are removed by DOMPurify, so span placeholders are used instead.
 */
export function sanitizeHtml(html: string): string {
  const protectedContents: string[] = []

  // Protect infographic blocks (comment delimiters avoid nested-div issues)
  html = html.replace(
    INFOGRAPHIC_PLACEHOLDER_REGEX,
    (match) => {
      protectedContents.push(match)
      return `<span data-md-protected="${protectedContents.length - 1}"></span>`
    },
  )

  // Protect mermaid blocks (comment delimiters avoid nested-div issues)
  html = html.replace(
    MERMAID_PLACEHOLDER_REGEX,
    (match) => {
      protectedContents.push(match)
      return `<span data-md-protected="${protectedContents.length - 1}"></span>`
    },
  )

  html = DOMPurify.sanitize(html, { ADD_TAGS: [`mp-common-profile`] })

  html = html.replace(
    PROTECTED_SPAN_REGEX,
    (_, i) => protectedContents[Number(i)],
  )

  return html
}

export function renderMarkdown(raw: string, renderer: RendererAPI) {
  const { markdownContent, readingTime }
    = renderer.parseFrontMatterAndContent(raw)

  // marked -> html
  let html = renderer.renderMarkdownToHtml(markdownContent)
  html = stripBreakBeforeInlineKatex(html)
  html = sanitizeHtml(html)
  return { html, readingTime }
}

export function postProcessHtml(baseHtml: string, reading: ReadTimeResults, renderer: RendererAPI): string {
  let html = baseHtml
  html = renderer.buildReadingTime(reading) + html
  html += renderer.buildFootnotes()
  html += renderer.buildAddition()
  html += `
    <style>
      .hljs.code__pre > .mac-sign {
        display: ${renderer.getOpts().isMacCodeBlock ? `flex` : `none`};
      }
    </style>
  `
  html += `
    <style>
      h2 strong {
        color: inherit !important;
      }
    </style>
  `
  return renderer.createContainer(html)
}

export function modifyHtmlContent(content: string, renderer: RendererAPI): string {
  const {
    markdownContent,
    readingTime: readingTimeResult,
  } = renderer.parseFrontMatterAndContent(content)

  let html = renderer.renderMarkdownToHtml(markdownContent)
  html = stripBreakBeforeInlineKatex(html)
  html = sanitizeHtml(html)
  return postProcessHtml(html, readingTimeResult, renderer)
}
