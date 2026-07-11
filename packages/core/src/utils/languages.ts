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

// highlight.js CDN 配置
const HLJS_VERSION = `11.11.1`
const HLJS_CDN_BASE = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/${HLJS_VERSION}`

// 缓存正在加载的语言
const loadingLanguages = new Map<string, Promise<void>>()

/**
 * 生成语言包的 CDN URL
 */
function grammarUrlFor(language: string): string {
  return `${HLJS_CDN_BASE}/es/languages/${language}.min.js`
}

/**
 * 动态加载并注册语言
 * @param language 语言名称
 * @param hljs highlight.js 实例
 */
export async function loadAndRegisterLanguage(language: string, hljs: HLJSApi): Promise<void> {
  // 如果已经注册，直接返回
  if (hljs.getLanguage(language)) {
    return
  }

  // 如果正在加载，等待加载完成
  if (loadingLanguages.has(language)) {
    await loadingLanguages.get(language)
    return
  }

  // 开始加载
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

/**
 * 格式化高亮后的代码，处理空格和制表符
 */
function formatHighlightedCode(html: string, preserveNewlines = false): string {
  let formatted = html
  // 将 span 之间的空格移到 span 内部
  formatted = formatted.replace(/(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g, (_: string, span1: string, spaces: string, span2: string) => span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`))
  formatted = formatted.replace(/(\s+)(<span[^>]*>)/g, (_: string, spaces: string, span: string) => span.replace(/^(<span[^>]*>)/, `$1${spaces}`))
  // 替换制表符为4个空格
  formatted = formatted.replace(/\t/g, `    `)

  if (preserveNewlines) {
    // 替换换行符为 <br/>，并将空格转换为 &nbsp;
    formatted = formatted.replace(/\r\n/g, `<br/>`).replace(/\n/g, `<br/>`).replace(/(>[^<]+)|(^[^<]+)/g, (str: string) => str.replace(/\s/g, `&nbsp;`))
  }
  else {
    // 只将空格转换为 &nbsp;
    formatted = formatted.replace(/(>[^<]+)|(^[^<]+)/g, (str: string) => str.replace(/\s/g, `&nbsp;`))
  }

  return formatted
}

/**
 * 分割高亮后的 HTML 为多行，保持 span 上下文
 * highlight.js 输出的 HTML 中，span 标签不会跨行，但换行符可能在 span 内部
 * 此函数将 HTML 按换行符分割，并在每行前后添加必要的开闭标签
 */
function splitHighlightedHtmlByLines(html: string): string[] {
  const lines: string[] = []
  let currentLine = ``
  const openTags: string[] = [] // 记录打开的标签，如 '<span class="...">'

  let i = 0
  while (i < html.length) {
    if (html[i] === `<`) {
      // 读取完整标签
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

      // 只跟踪 highlight.js 产出的 <span> 标签
      if (tag.startsWith(`</span`)) {
        // 关闭 span，从栈中移除
        openTags.pop()
      }
      else if (tag.startsWith(`<span`)) {
        // 打开 span，加入栈
        openTags.push(tag)
      }
    }
    else if (html[i] === `\n`) {
      // 为当前行补齐所有闭合标签
      const closingTags = `</span>`.repeat(openTags.length)
      lines.push(currentLine + closingTags)
      // 下一行重新打开这些标签
      currentLine = openTags.join(``)
      i++
    }
    else {
      currentLine += html[i]
      i++
    }
  }

  // 最后一行
  lines.push(currentLine)
  return lines
}

/**
 * 高亮代码并格式化（支持行号）
 * @param text 原始代码文本
 * @param language 语言名称
 * @param hljs highlight.js 实例
 * @param showLineNumber 是否显示行号
 * @returns 格式化后的 HTML
 */
export function highlightAndFormatCode(text: string, language: string, hljs: HLJSApi, showLineNumber: boolean): string {
  let highlighted = ``

  if (showLineNumber) {
    // 先归一化换行符，确保分割逻辑一致
    const normalizedText = text.replace(/\r\n/g, `\n`)
    // 对整个代码块进行高亮，保持跨行上下文
    const fullHighlighted = hljs.highlight(normalizedText, { language }).value

    // 分割为多行，保持 span 上下文
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
    // 用单个块级容器包裹高亮内容：code 上的 display:-webkit-box 是老式弹性盒，
    // 若直接平铺多个 span/<br>，不同 Chromium 版本（如部分 Edge）会把子节点按横向盒重排导致代码行错位。
    // 只保留一个 flex 子项即可让内部 <br> 正常换行，同时保留 -webkit-box 以维持微信端横向滚动。
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

/**
 * 高亮 DOM 中待处理的代码块
 * 查找带有 data-language-pending 属性的代码块，动态加载语言后重新高亮
 * @param hljs highlight.js 实例
 * @param container 容器元素（可选，默认为 document）
 */
export function highlightPendingBlocks(hljs: HLJSApi, container: Document | Element = document): void {
  const pendingBlocks = container.querySelectorAll(`code[data-language-pending]`)

  pendingBlocks.forEach((codeBlock) => {
    const language = codeBlock.getAttribute(`data-language-pending`)
    if (!language)
      return

    if (hljs.getLanguage(language)) {
      // 语言已加载，直接高亮
      highlightCodeBlock(codeBlock, language, hljs)
    }
    else {
      // 动态加载语言后重新高亮
      loadAndRegisterLanguage(language, hljs).then(() => {
        highlightCodeBlock(codeBlock, language, hljs)
      }).catch(() => {
        // 加载失败，移除标记
        codeBlock.removeAttribute(`data-language-pending`)
        codeBlock.removeAttribute(`data-raw-code`)
        codeBlock.removeAttribute(`data-show-line-number`)
      })
    }
  })
}
