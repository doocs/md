import type { RendererAPI } from '@md/shared/types'
import type { ReadTimeResults } from 'reading-time'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'

/**
 * DOMPurify v3.1.7+ 会强制移除 foreignObject 内容
 * https://github.com/kkomelin/isomorphic-dompurify/pull/290
 * https://github.com/cure53/DOMPurify/issues/1152
 * 使用占位符方案：在 sanitize 前保护特定内容，sanitize 后还原
 * 注意：HTML 注释会被 DOMPurify 移除，所以使用 span 元素作为占位符
 */
function sanitizeHtml(html: string): string {
  const protectedContents: string[] = []

  // 保护 infographic-diagram（使用注释标记定界，避免嵌套 div 问题）
  html = html.replace(
    /<!--infographic-start-->[\s\S]*?<!--infographic-end-->/g,
    (match) => {
      protectedContents.push(match)
      return `<span data-md-protected="${protectedContents.length - 1}"></span>`
    },
  )

  // 保护 mermaid-diagram（使用注释标记定界，避免嵌套 div 问题）
  html = html.replace(
    /<!--mermaid-start-->[\s\S]*?<!--mermaid-end-->/g,
    (match) => {
      protectedContents.push(match)
      return `<span data-md-protected="${protectedContents.length - 1}"></span>`
    },
  )

  // XSS 处理
  html = DOMPurify.sanitize(html, { ADD_TAGS: [`mp-common-profile`] })

  // 还原被保护的内容
  html = html.replace(
    /<span data-md-protected="(\d+)"><\/span>/g,
    (_, i) => protectedContents[Number(i)],
  )

  return html
}

/**
 * 渲染 Markdown 内容
 * @param raw - 原始 markdown 字符串
 * @param renderer - 渲染器 API
 * @returns 渲染结果，包含 HTML 和阅读时间
 */
export function renderMarkdown(raw: string, renderer: RendererAPI) {
  // 解析 front-matter 和正文
  const { markdownContent, readingTime }
    = renderer.parseFrontMatterAndContent(raw)

  // marked -> html
  let html = marked.parse(markdownContent) as string
  html = sanitizeHtml(html)
  return { html, readingTime }
}

/**
 * 后处理 HTML 内容
 * @param baseHtml - 基础 HTML 字符串
 * @param reading - 阅读时间结果
 * @param renderer - 渲染器 API
 * @returns 处理后的 HTML 字符串
 */
export function postProcessHtml(baseHtml: string, reading: ReadTimeResults, renderer: RendererAPI): string {
  // 阅读时间及字数统计
  let html = baseHtml
  html = renderer.buildReadingTime(reading) + html
  // 新主题系统：通过 CSS 去除第一行的 margin-top
  // html = html.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
  // 引用脚注
  html += renderer.buildFootnotes()
  // 附加的一些 style
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
  // 包裹 HTML
  return renderer.createContainer(html)
}

/**
 * 修改 HTML 内容
 * @param content - 原始内容
 * @param renderer - 渲染器 API
 * @returns 修改后的 HTML 字符串
 */
export function modifyHtmlContent(content: string, renderer: RendererAPI): string {
  const {
    markdownContent,
    readingTime: readingTimeResult,
  } = renderer.parseFrontMatterAndContent(content)

  let html = marked.parse(markdownContent) as string
  html = sanitizeHtml(html)
  return postProcessHtml(html, readingTimeResult, renderer)
}
