import type { HLJSApi, LanguageFn } from 'highlight.js'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import plaintext from 'highlight.js/lib/languages/plaintext'
import python from 'highlight.js/lib/languages/python'
import shell from 'highlight.js/lib/languages/shell'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

/**
 * Languages bundled with the renderer. Everything else loads from CDN on first use
 * via {@link loadAndRegisterLanguage} / {@link highlightPendingBlocks}.
 */
export const COMMON_LANGUAGES: Record<string, LanguageFn> = {
  bash,
  css,
  javascript,
  json,
  markdown,
  plaintext,
  python,
  shell,
  typescript,
  xml,
}

const HLJS_VERSION = `11.11.1`
const HLJS_CDN_BASE = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/${HLJS_VERSION}`

const loadingLanguages = new Map<string, Promise<void>>()

function grammarUrlFor(language: string): string {
  return `${HLJS_CDN_BASE}/es/languages/${language}.min.js`
}

/** Dynamically load and register a highlight.js language grammar from CDN. */
export async function loadAndRegisterLanguage(language: string, hljs: HLJSApi): Promise<void> {
  if (hljs.getLanguage(language)) {
    return
  }

  if (loadingLanguages.has(language)) {
    await loadingLanguages.get(language)
    return
  }

  const loadPromise = (async () => {
    try {
      const module = await import(/* webpackIgnore: true */ /* @vite-ignore */ grammarUrlFor(language))
      hljs.registerLanguage(language, module.default)
    }
    catch (error) {
      console.warn(`Failed to load language: ${language}`, error)
      throw error
    }
    finally {
      loadingLanguages.delete(language)
    }
  })()

  loadingLanguages.set(language, loadPromise)
  await loadPromise
}

function formatHighlightedCode(html: string, preserveNewlines = false): string {
  let formatted = html
  // Move whitespace between adjacent spans inside the preceding span
  formatted = formatted.replace(/(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g, (_: string, span1: string, spaces: string, span2: string) => span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`))
  formatted = formatted.replace(/(\s+)(<span[^>]*>)/g, (_: string, spaces: string, span: string) => span.replace(/^(<span[^>]*>)/, `$1${spaces}`))
  formatted = formatted.replace(/\t/g, `    `)

  if (preserveNewlines) {
    formatted = formatted.replace(/\r\n/g, `<br/>`).replace(/\n/g, `<br/>`).replace(/(>[^<]+)|(^[^<]+)/g, (str: string) => str.replace(/\s/g, `&nbsp;`))
  }
  else {
    formatted = formatted.replace(/(>[^<]+)|(^[^<]+)/g, (str: string) => str.replace(/\s/g, `&nbsp;`))
  }

  return formatted
}

/**
 * Split highlighted HTML into lines while preserving open <span> context.
 * highlight.js never splits a span across lines, but newlines may appear inside a span.
 */
function splitHighlightedHtmlByLines(html: string): string[] {
  const lines: string[] = []
  let currentLine = ``
  const openTags: string[] = []

  let i = 0
  while (i < html.length) {
    if (html[i] === `<`) {
      let tag = `<`
      i++
      while (i < html.length && html[i] !== `>`) {
        tag += html[i]
        i++
      }
      if (i < html.length) {
        tag += `>`
        i++
      }

      currentLine += tag

      if (tag.startsWith(`</span`)) {
        openTags.pop()
      }
      else if (tag.startsWith(`<span`)) {
        openTags.push(tag)
      }
    }
    else if (html[i] === `\n`) {
      const closingTags = `</span>`.repeat(openTags.length)
      lines.push(currentLine + closingTags)
      currentLine = openTags.join(``)
      i++
    }
    else {
      currentLine += html[i]
      i++
    }
  }

  lines.push(currentLine)
  return lines
}

/** Highlight code and format for display, optionally with line numbers. */
export function highlightAndFormatCode(text: string, language: string, hljs: HLJSApi, showLineNumber: boolean): string {
  let highlighted = ``

  if (showLineNumber) {
    const normalizedText = text.replace(/\r\n/g, `\n`)
    const fullHighlighted = hljs.highlight(normalizedText, { language }).value

    const highlightedLines = splitHighlightedHtmlByLines(fullHighlighted).map((lineHtml) => {
      const formatted = formatHighlightedCode(lineHtml, false)
      return formatted === `` ? `&nbsp;` : formatted
    })

    const lineNumbersHtml = highlightedLines.map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`).join(``)
    const codeInnerHtml = highlightedLines.join(`<br/>`)
    const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`
    const lineNumberColumnStyles = `text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);`

    highlighted = `
      <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
        <section class="line-numbers" style="${lineNumberColumnStyles}">${lineNumbersHtml}</section>
        <section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
      </section>
    `
  }
  else {
    const rawHighlighted = hljs.highlight(text, { language }).value
    const formatted = formatHighlightedCode(rawHighlighted, true)
    // Wrap in one block child: code uses legacy -webkit-box flex; without a single flex item,
    // some Chromium builds (e.g. Edge) lay out span/<br> siblings horizontally and break line order.
    // One child keeps <br> line breaks while preserving -webkit-box for WeChat horizontal scroll.
    highlighted = `<span class="code-block__inner" style="display:block">${formatted}</span>`
  }

  return highlighted
}

export function highlightCodeBlock(codeBlock: Element, language: string, hljs: HLJSApi): void {
  const rawCode = codeBlock.getAttribute(`data-raw-code`)
  const showLineNumber = codeBlock.getAttribute(`data-show-line-number`) === `true`

  if (!rawCode)
    return

  const text = rawCode.replace(/&quot;/g, `"`)

  const highlighted = highlightAndFormatCode(text, language, hljs, showLineNumber)

  codeBlock.innerHTML = highlighted
  codeBlock.removeAttribute(`data-language-pending`)
  codeBlock.removeAttribute(`data-raw-code`)
  codeBlock.removeAttribute(`data-show-line-number`)
}

/** Highlight code blocks marked with data-language-pending after loading their grammar. */
export function highlightPendingBlocks(hljs: HLJSApi, container: Document | Element = document): void {
  const pendingBlocks = container.querySelectorAll(`code[data-language-pending]`)

  pendingBlocks.forEach((codeBlock) => {
    const language = codeBlock.getAttribute(`data-language-pending`)
    if (!language)
      return

    if (hljs.getLanguage(language)) {
      highlightCodeBlock(codeBlock, language, hljs)
    }
    else {
      loadAndRegisterLanguage(language, hljs).then(() => {
        highlightCodeBlock(codeBlock, language, hljs)
      }).catch(() => {
        codeBlock.removeAttribute(`data-language-pending`)
        codeBlock.removeAttribute(`data-raw-code`)
        codeBlock.removeAttribute(`data-show-line-number`)
      })
    }
  })
}
