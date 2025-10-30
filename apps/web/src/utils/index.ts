import { markedAlert, MDKatex } from '@md/core'
import { prefix } from '@md/shared/configs'
// 直接导入供本文件内部使用
import {
  checkImage,
  createTable,
  css2json,
  downloadFile,
  formatDoc,
  removeLeft,
  sanitizeTitle,
  toBase64,
} from '@md/shared/utils'

import juice from 'juice'
import { Marked } from 'marked'

// 导出新的统一存储 API
export {
  LocalEngine,
  RestfulEngine,
  type StorageEngine,
  store,
} from './storage'

// 重新导出供外部使用
export {
  checkImage,
  createTable,
  css2json,
  downloadFile,
  formatDoc,
  removeLeft,
  sanitizeTitle,
  toBase64,
}

export {
  customCssWithTemplate,
  customizeTheme,
  getStyleString,
  modifyHtmlContent,
  postProcessHtml,
  renderMarkdown,
} from '@md/core/utils'

export function addPrefix(str: string) {
  return `${prefix}__${str}`
}

/**
 * 导出原始 Markdown 文档
 * @param {string} doc - 文档内容
 * @param {string} title - 文档标题
 */
export function downloadMD(doc: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)
  downloadFile(doc, `${safeTitle}.md`, `text/markdown;charset=utf-8`)
}

/**
 * 设置元素样式，确保导出时的样式正确
 * @param {Element} element - 要设置样式的元素
 */
function setStyles(element: Element) {
  /**
   * 获取一个 DOM 元素的所有样式，
   * @param {DOM 元素} element DOM 元素
   * @param {排除的属性} excludes 如果某些属性对结果有不良影响，可以使用这个参数来排除
   * @returns 行内样式拼接结果
   */
  function getElementStyles(element: Element, excludes = [`width`, `height`, `inlineSize`, `webkitLogicalWidth`, `webkitLogicalHeight`]) {
    const styles = getComputedStyle(element, null)
    return Object.entries(styles)
      .filter(
        ([key]) => {
          // 将驼峰转换为短横线格式
          const kebabKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
          return styles.getPropertyValue(kebabKey) && !excludes.includes(key)
        },
      )
      .map(([key, value]) => {
        // 将驼峰转换为短横线格式
        const kebabKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
        return `${kebabKey}:${value};`
      })
      .join(``)
  }

  switch (true) {
    case isPre(element):
    case isCode(element):
    case isSpan(element):
      element.setAttribute(`style`, getElementStyles(element))
  }
  if (element.children.length) {
    Array.from(element.children).forEach(child => setStyles(child))
  }

  // 判断是否是包裹代码块的 pre 元素
  function isPre(element: Element) {
    return (
      element.tagName === `PRE`
      && Array.from(element.classList).includes(`code__pre`)
    )
  }

  // 判断是否是包裹代码块的 code 元素
  function isCode(element: Element | null) {
    if (element == null) {
      return false
    }
    return element.tagName === `CODE`
  }

  // 判断是否是包裹代码字符的 span 元素
  function isSpan(element: Element) {
    return (
      element.tagName === `SPAN`
      && (isCode(element.parentElement)
        || isCode((element.parentElement!).parentElement))
    )
  }
}

/**
 * 处理HTML内容，应用样式和颜色变量
 * @param {string} primaryColor - 主色调
 * @returns {string} 处理后的HTML字符串
 */
export function processHtmlContent(primaryColor: string): string {
  const element = document.querySelector(`#output`)!
  setStyles(element)

  return element.innerHTML
    .replace(/var\(--md-primary-color\)/g, primaryColor)
    .replace(/--md-primary-color:.+?;/g, ``)
}

/**
 * 导出 HTML 生成内容
 */
export function exportHTML(primaryColor: string, title: string = `untitled`) {
  const htmlStr = processHtmlContent(primaryColor)
  const fullHtml = `<html><head><meta charset="utf-8" /></head><body><div style="width: 750px; margin: auto;">${htmlStr}</div></body></html>`

  downloadFile(fullHtml, `${sanitizeTitle(title)}.html`, `text/html`)
}

/**
 * 生成无样式 HTML
 * @param raw - 原始 Markdown 内容
 * @returns string
 */
export async function generatePureHTML(raw: string): Promise<string> {
  const markedInstance = new Marked()
  markedInstance.use(markedAlert({ withoutStyle: true }))
  markedInstance.use(
    MDKatex({ nonStandard: true }, false),
  )
  const pureHtml = await markedInstance.parse(raw)
  return pureHtml
}

/**
 * 导出无样式 HTML 文件
 * @param raw - 原始 Markdown 内容
 * @param title - 文档标题
 */
export async function exportPureHTML(raw: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)

  const pureHtml = await generatePureHTML(raw)

  downloadFile(pureHtml, `${safeTitle}.html`, `text/html`)
}

/**
 * 导出 PDF 文档
 * @param {string} primaryColor - 主色调
 * @param {string} title - 文档标题
 */
export function exportPDF(primaryColor: string, title: string = `untitled`) {
  const htmlStr = processHtmlContent(primaryColor)
  const safeTitle = sanitizeTitle(title)

  // 创建新窗口用于打印
  const printWindow = window.open(``, `_blank`)
  if (!printWindow) {
    console.error(`无法打开打印窗口`)
    return
  }

  // 写入HTML内容，包含自定义页眉页脚
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${safeTitle}</title>
      <style>
        @page {
          @top-center {
            content: "${safeTitle}";
            font-size: 12px;
            color: #666;
          }
          @bottom-left {
            content: "微信 Markdown 编辑器";
            font-size: 10px;
            color: #999;
          }
          @bottom-right {
            content: "第 " counter(page) " 页，共 " counter(pages) " 页";
            font-size: 10px;
            color: #999;
          }
        }

        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div style="width: 100%; max-width: 750px; margin: auto;">
        ${htmlStr}
      </div>
    </body>
    </html>
  `)

  printWindow.document.close()

  // 等待内容加载完成后自动打开打印对话框
  printWindow.onload = () => {
    printWindow.print()
    // 打印完成后关闭窗口
    printWindow.onafterprint = () => {
      printWindow.close()
    }
  }
}

export function solveWeChatImage() {
  const clipboardDiv = document.getElementById(`output`)!
  const images = clipboardDiv.getElementsByTagName(`img`)

  Array.from(images).forEach((image) => {
    const width = image.getAttribute(`width`)
    const height = image.getAttribute(`height`)

    if (width) {
      image.removeAttribute(`width`)
      // 如果是纯数字，添加 px 单位；否则保持原值
      image.style.width = /^\d+$/.test(width) ? `${width}px` : width
    }

    if (height) {
      image.removeAttribute(`height`)
      // 如果是纯数字，添加 px 单位；否则保持原值
      image.style.height = /^\d+$/.test(height) ? `${height}px` : height
    }
  })
}

async function getHljsStyles(): Promise<string> {
  const hljsLink = document.querySelector(`#hljs`) as HTMLLinkElement
  if (!hljsLink)
    return ``

  try {
    const response = await fetch(hljsLink.href)
    const cssText = await response.text()
    return `<style>${cssText}</style>`
  }
  catch (error) {
    console.warn(`Failed to fetch highlight.js styles:`, error)
    return ``
  }
}

function mergeCss(html: string): string {
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
  })
}

function modifyHtmlStructure(htmlString: string): string {
  const tempDiv = document.createElement(`div`)
  tempDiv.innerHTML = htmlString

  // 移动 `li > ul` 和 `li > ol` 到 `li` 后面
  tempDiv.querySelectorAll(`li > ul, li > ol`).forEach((originalItem) => {
    originalItem.parentElement!.insertAdjacentElement(`afterend`, originalItem)
  })

  return tempDiv.innerHTML
}

function createEmptyNode(): HTMLElement {
  const node = document.createElement(`p`)
  node.style.fontSize = `0`
  node.style.lineHeight = `0`
  node.style.margin = `0`
  node.innerHTML = `&nbsp;`
  return node
}

export async function processClipboardContent(primaryColor: string) {
  const clipboardDiv = document.getElementById(`output`)!

  // 获取highlight.js样式并添加到HTML中
  const hljsStyles = await getHljsStyles()
  if (hljsStyles) {
    clipboardDiv.innerHTML = hljsStyles + clipboardDiv.innerHTML
  }

  // 先合并 CSS 和修改 HTML 结构
  clipboardDiv.innerHTML = modifyHtmlStructure(mergeCss(clipboardDiv.innerHTML))

  // 处理样式和颜色变量
  clipboardDiv.innerHTML = clipboardDiv.innerHTML
    .replace(/([^-])top:(.*?)em/g, `$1transform: translateY($2em)`)
    .replace(/hsl\(var\(--foreground\)\)/g, `#3f3f3f`)
    .replace(/var\(--blockquote-background\)/g, `#f7f7f7`)
    .replace(/var\(--md-primary-color\)/g, primaryColor)
    .replace(/--md-primary-color:.+?;/g, ``)
    .replace(
      /<span class="nodeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,
      `<span class="nodeLabel"$1>$2</span>`,
    )
    .replace(
      /<span class="edgeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,
      `<span class="edgeLabel"$1>$2</span>`,
    )

  // 处理图片大小
  solveWeChatImage()

  // 添加空白节点用于兼容 SVG 复制
  const beforeNode = createEmptyNode()
  const afterNode = createEmptyNode()
  clipboardDiv.insertBefore(beforeNode, clipboardDiv.firstChild)
  clipboardDiv.appendChild(afterNode)

  // 兼容 Mermaid
  const nodes = clipboardDiv.querySelectorAll(`.nodeLabel`)
  nodes.forEach((node) => {
    const parent = node.parentElement!
    const xmlns = parent.getAttribute(`xmlns`)!
    const style = parent.getAttribute(`style`)!
    const section = document.createElement(`section`)
    section.setAttribute(`xmlns`, xmlns)
    section.setAttribute(`style`, style)
    section.innerHTML = parent.innerHTML

    const grand = parent.parentElement!
    // 清空父元素
    grand.innerHTML = ``
    grand.appendChild(section)
  })

  // fix: mermaid 部分文本颜色被 stroke 覆盖
  clipboardDiv.innerHTML = clipboardDiv.innerHTML
    .replace(
      /<tspan([^>]*)>/g,
      `<tspan$1 style="fill: #333333 !important; color: #333333 !important; stroke: none !important;">`,
    )
}
