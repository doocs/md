import type { RendererAPI } from '@md/shared/types'
import type { ReadTimeResults } from '@md/shared/utils/readingTime'
import DOMPurify from 'isomorphic-dompurify'
import { stripBreakBeforeInlineKatex } from './mathDetection'

const INFOGRAPHIC_PLACEHOLDER_REGEX = /<!--infographic-start-->[\s\S]*?<!--infographic-end-->/g
const MERMAID_PLACEHOLDER_REGEX = /<!--mermaid-start-->[\s\S]*?<!--mermaid-end-->/g
const PROTECTED_SPAN_REGEX = /<span data-md-protected="(\d+)"><\/span>/g
// Markdown sources of the form `…paragraph…\n\n{{emoji:id}}` parse as two
// paragraphs. Lift an emoji-only `<p>` into the end of the preceding `<p>`
// so the small emoji flows inline with the preceding text instead of
// landing on its own line at the tail of the article.
const MD_EMOJI_ONLY_PARA_REGEX = /<\/p>\s*<p(?:\s[^>]*)?>\s*((?:<img class="md-emoji"[^>]*>\s*)+)<\/p>/g

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

/**
 * Lift a `<p>` that contains nothing but one or more `<img class="md-emoji">`
 * tags into the end of the immediately preceding `<p>`. Markdown sources of
 * the form `…paragraph…\n\n{{emoji:id}}` parse as two `<p>` blocks (an empty
 * line is a paragraph separator). Without this lift the emoji lands on its
 * own line at the tail of the article; with it, the emoji flows inline with
 * the preceding text.
 *
 * Runs to a fixed point so consecutive emoji paragraphs collapse together.
 * Standalone emoji paragraphs at the very start of the document are left
 * alone — there is no preceding paragraph to lift into.
 */
export function liftTrailingEmojiParagraphs(html: string): string {
  let prev: string
  do {
    prev = html
    html = html.replace(
      MD_EMOJI_ONLY_PARA_REGEX,
      (_, imgs: string) => `${imgs}</p>`,
    )
  } while (html !== prev)
  return html
}

export function renderMarkdown(raw: string, renderer: RendererAPI) {
  const { markdownContent, readingTime }
    = renderer.parseFrontMatterAndContent(raw)

  // marked -> html
  let html = renderer.renderMarkdownToHtml(markdownContent)
  html = stripBreakBeforeInlineKatex(html)
  html = liftTrailingEmojiParagraphs(html)
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
  html = liftTrailingEmojiParagraphs(html)
  html = sanitizeHtml(html)
  return postProcessHtml(html, readingTimeResult, renderer)
}
