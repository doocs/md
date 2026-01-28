import { markedAlert, MDKatex } from '@md/core'
import { prefix } from '@md/shared/configs'
// 直接导入供本文件内部使用
import {
  checkImage,
  createTable,
  downloadFile,
  formatDoc,
  removeLeft,
  sanitizeTitle,
  toBase64,
} from '@md/shared/utils'

import { Marked } from 'marked'

export {
  LocalStorageEngine as LocalEngine,
  RestfulStorageEngine as RestfulEngine,
  type StorageEngine,
} from './storage'

// 重新导出供外部使用
export {
  checkImage,
  createTable,
  downloadFile,
  formatDoc,
  removeLeft,
  sanitizeTitle,
  toBase64,
}

// 导出新主题系统需要的函数
export {
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
 * 获取 HTML 内容
 * @returns {string} HTML 字符串
 */
export function getHtmlContent(): string {
  const element = document.querySelector(`#output`)!
  return element.innerHTML
}

/**
 * 导出 HTML 生成内容
 */
export async function exportHTML(title: string = `untitled`) {
  const htmlStr = getHtmlContent()
  const stylesToAdd = await getStylesToAdd()

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${sanitizeTitle(title)}</title>
  ${stylesToAdd}
</head>
<body>
  <div style="width: 750px; margin: auto; padding: 20px;">
    ${htmlStr}
  </div>
</body>
</html>`

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
 * 导出 PDF 文档（新主题系统）
 * @param {string} title - 文档标题
 */
export async function exportPDF(title: string = `untitled`) {
  const htmlStr = getHtmlContent()
  const stylesToAdd = await getStylesToAdd()
  const safeTitle = sanitizeTitle(title)

  // 创建新窗口用于打印
  const printWindow = window.open(``, `_blank`)
  if (!printWindow) {
    console.error(`无法打开打印窗口`)
    return
  }

  // 写入HTML内容，包含主题样式和自定义页眉页脚
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${safeTitle}</title>
      ${stylesToAdd}
      <style>
        /* 强制打印背景颜色和图片 */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* 打印页面设置 */
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

function getThemeStyles(): string {
  const themeStyle = document.querySelector(`#md-theme`) as HTMLStyleElement

  if (!themeStyle || !themeStyle.textContent) {
    console.warn('[getThemeStyles] 未找到主题样式')
    return ``
  }

  // 移除 #output 作用域前缀，因为复制后的 HTML 不在 #output 容器中
  let cssContent = themeStyle.textContent

  // 处理 #output {} 为 body {}，避免出现 {} 无效样式
  cssContent = cssContent.replace(/#output\s*\{/g, 'body {')

  // 将 "#output h1" 替换为 "h1"，"#output .class" 替换为 ".class" 等
  // 同时处理换行和多个空格的情况
  cssContent = cssContent.replace(/#output\s+/g, '')
  // 处理选择器开头的 #output（如果没有后续内容）
  cssContent = cssContent.replace(/^#output\s*/gm, '')

  const styleContent = `<style>${cssContent}</style>`
  return styleContent
}

/**
 * 使用浏览器原生 API 内联 CSS 样式
 * 由于 juice 11.1.0 依赖 Node.js 专有模块 (undici)，无法在浏览器中运行
 * 此函数使用 DOM API 直接内联样式
 */
function mergeCss(html: string): string {
  // 创建临时容器解析 HTML
  const tempContainer = document.createElement(`div`)
  tempContainer.innerHTML = html

  // 提取所有 style 标签
  const styleTags = Array.from(tempContainer.querySelectorAll(`style`))
  const cssRules: CSSStyleRule[] = []
  const preservedRules: string[] = [] // 保存 @keyframes, @font-face 等规则

  // 收集所有 CSS 规则
  styleTags.forEach((styleTag, index) => {
    try {
      const cssText = styleTag.textContent || ``
      if (!cssText.trim())
        return

      // 创建临时样式表来解析 CSS
      const tempStyle = document.createElement(`style`)
      tempStyle.textContent = cssText
      document.head.appendChild(tempStyle)

      const sheet = tempStyle.sheet as CSSStyleSheet
      if (sheet && sheet.cssRules) {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            cssRules.push(rule)
          }
          else if (rule instanceof CSSKeyframesRule || rule instanceof CSSFontFaceRule) {
            // 保留 @keyframes 和 @font-face 规则
            preservedRules.push(rule.cssText)
          }
        })
      }

      document.head.removeChild(tempStyle)
    }
    catch (error) {
      console.warn(`Failed to parse CSS from style tag ${index}:`, error)
    }
  })

  // 将 CSS 规则按照源顺序应用到匹配的元素
  // 注意：这是一个简化实现，没有完全考虑 CSS 特异性
  // 但对于微信编辑器的使用场景已经足够
  cssRules.forEach((rule) => {
    try {
      const elements = tempContainer.querySelectorAll(rule.selectorText)
      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          // 将 CSS 规则中的样式应用到元素的内联样式
          const styles = rule.style
          for (let i = 0; i < styles.length; i++) {
            const propertyName = styles[i]
            const propertyValue = styles.getPropertyValue(propertyName)
            const priority = styles.getPropertyPriority(propertyName)

            // 获取现有内联样式
            const existingValue = element.style.getPropertyValue(propertyName)
            const existingPriority = element.style.getPropertyPriority(propertyName)

            // 应用样式的优先级规则：
            // 1. 如果当前元素没有这个属性，直接设置
            // 2. 如果新规则是 !important 且现有规则不是，覆盖
            // 3. 如果两者都是 !important，后来的覆盖（CSS 源顺序）
            const shouldApply = !existingValue
              || (priority === `important` && existingPriority !== `important`)
              || (priority === `important` && existingPriority === `important`)

            if (shouldApply) {
              element.style.setProperty(propertyName, propertyValue, priority)
            }
          }
        }
      })
    }
    catch (error) {
      // 忽略无效的选择器（如伪元素）
    }
  })

  // 移除所有 style 标签
  tempContainer.querySelectorAll(`style`).forEach(style => style.remove())

  // 如果有需要保留的规则（@keyframes, @font-face 等），添加回去
  if (preservedRules.length > 0) {
    const styleTag = document.createElement(`style`)
    styleTag.textContent = preservedRules.join(`\n`)
    tempContainer.insertBefore(styleTag, tempContainer.firstChild)
  }

  return tempContainer.innerHTML
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

/**
 * 获取需要添加的样式
 * @returns {Promise<string>} 样式字符串
 */
async function getStylesToAdd(): Promise<string> {
  const themeStyles = getThemeStyles()
  const hljsStyles = await getHljsStyles()
  return [themeStyles, hljsStyles].filter(Boolean).join(``)
}

export async function processClipboardContent(primaryColor: string) {
  const clipboardDiv = document.getElementById(`output`)!

  const stylesToAdd = await getStylesToAdd()

  if (stylesToAdd) {
    clipboardDiv.innerHTML = stylesToAdd + clipboardDiv.innerHTML
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
    .replace(/--md-font-family:.+?;/g, ``)
    .replace(/--md-font-size:.+?;/g, ``)
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

  // fix: antv infographic 复制到微信公众平台时 <text></text> 被自动转为 <text><tspan></tspan></text> 导致在 Safari 浏览器中文字异常的问题
  clipboardDiv.querySelectorAll('.infographic-diagram').forEach((diagram) => {
    diagram.querySelectorAll('text').forEach((textElem) => {
      // 如果有 dominant-baseline 属性，替换为 dy
      const dominantBaseline = textElem.getAttribute('dominant-baseline')
      const variantMap = {
        'alphabetic': '',
        'central': '0.35em',
        'middle': '0.35em',
        'hanging': '-0.55em',
        'ideographic': '0.18em',
        'text-before-edge': '-0.85em',
        'text-after-edge': '0.15em',
      }
      if (dominantBaseline) {
        textElem.removeAttribute('dominant-baseline')
        const dy = variantMap[dominantBaseline as keyof typeof variantMap]
        if (dy) {
          textElem.setAttribute('dy', dy)
        }
      }
    })
  })
}
