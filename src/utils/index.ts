import juice from 'juice'
import * as prettierPluginBabel from 'prettier/plugins/babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import * as prettierPluginMarkdown from 'prettier/plugins/markdown'
import * as prettierPluginCss from 'prettier/plugins/postcss'
import { format } from 'prettier/standalone'
import { prefix } from '@/config'
import { autoSpace } from '@/utils/autoSpace'

export function addPrefix(str: string) {
  return `${prefix}__${str}`
}

/**
 * 格式化内容
 * @param {string} content - 要格式化的内容
 * @param {'markdown' | 'css'} [type] - 内容类型，决定使用的解析器，默认为'markdown'
 * @returns {Promise<string>} - 格式化后的内容
 */
export async function formatDoc(content: string, type: `markdown` | `css` = `markdown`) {
  const plugins = {
    markdown: [prettierPluginMarkdown, prettierPluginBabel, prettierPluginEstree],
    css: [prettierPluginCss],
  }
  const addSpaceContent = autoSpace(content)

  const parser = type in plugins ? type : `markdown`
  return await format(addSpaceContent, {
    parser,
    plugins: plugins[parser],
  })
}

export function sanitizeTitle(title: string) {
  const MAX_FILENAME_LENGTH = 100

  // Windows 禁止字符，包含所有平台非法字符合集
  const INVALID_CHARS = /[\\/:*?"<>|]/g

  if (!INVALID_CHARS.test(title) && title.length <= MAX_FILENAME_LENGTH) {
    return title.trim() || `untitled`
  }

  const replaced = title.replace(INVALID_CHARS, `_`).trim()
  const safe = replaced.length > MAX_FILENAME_LENGTH
    ? replaced.slice(0, MAX_FILENAME_LENGTH)
    : replaced

  return safe || `untitled`
}

/**
 * 导出原始 Markdown 文档
 * @param {string} doc - 文档内容
 * @param {string} title - 文档标题
 */
export function downloadMD(doc: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)
  const downLink = document.createElement(`a`)

  downLink.download = `${safeTitle}.md`
  downLink.style.display = `none`

  const blob = new Blob([doc], { type: `text/markdown;charset=utf-8` })
  const objectUrl = URL.createObjectURL(blob)
  downLink.href = objectUrl

  document.body.appendChild(downLink)
  downLink.click()
  document.body.removeChild(downLink)

  // 释放 URL 对象，避免内存泄漏
  URL.revokeObjectURL(objectUrl)
}

/**
 * 导出 HTML 生成内容
 */
export function exportHTML(primaryColor: string, title: string = `untitled`) {
  const element = document.querySelector(`#output`)!

  setStyles(element)

  const htmlStr = element.innerHTML
    .replace(/var\(--md-primary-color\)/g, primaryColor)
    .replace(/--md-primary-color:.+?;/g, ``)

  const downLink = document.createElement(`a`)

  downLink.download = `${title}.html`
  downLink.style.display = `none`
  const blob = new Blob([
    `<html><head><meta charset="utf-8" /></head><body><div style="width: 750px; margin: auto;">${htmlStr}</div></body></html>`,
  ])

  downLink.href = URL.createObjectURL(blob)
  document.body.appendChild(downLink)
  downLink.click()
  document.body.removeChild(downLink)

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
}

/**
 * 根据数据生成 Markdown 表格
 *
 * @param {object} options - 选项
 * @param {object} options.data - 表格数据
 * @param {number} options.rows - 行数
 * @param {number} options.cols - 列数
 * @returns {string} 生成的 Markdown 表格
 */
export function createTable({ data, rows, cols }: { data: { [k: string]: string }, rows: number, cols: number }) {
  let table = ``
  for (let i = 0; i < rows + 2; ++i) {
    table += `| `
    const currRow = []
    for (let j = 0; j < cols; ++j) {
      const rowIdx = i > 1 ? i - 1 : i
      currRow.push(i === 1 ? `---` : data[`k_${rowIdx}_${j}`] || `     `)
    }
    table += currRow.join(` | `)
    table += ` |\n`
  }

  return table
}

export function toBase64(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve((reader.result as string).split(`,`).pop()!)
    reader.onerror = error => reject(error)
  })
}

export function checkImage(file: File) {
  // 检查文件名后缀
  const isValidSuffix = /\.(?:gif|jpe?g|png)$/i.test(file.name)
  if (!isValidSuffix) {
    return {
      ok: false,
      msg: `请上传 JPG/PNG/GIF 格式的图片`,
    }
  }

  // 检查文件大小
  const maxSizeMB = 10
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      ok: false,
      msg: `由于公众号限制，图片大小不能超过 ${maxSizeMB}M`,
    }
  }

  return { ok: true }
}

/**
 * 移除左边多余空格
 * @param {string} str
 * @returns string
 */
export function removeLeft(str: string) {
  const lines = str.split(`\n`)
  // 获取应该删除的空白符数量
  const minSpaceNum = lines
    .filter(item => item.trim())
    .map(item => (item.match(/(^\s+)?/)!)[0].length)
    .sort((a, b) => a - b)[0]
  // 删除空白符
  return lines.map(item => item.slice(minSpaceNum)).join(`\n`)
}

export function solveWeChatImage() {
  const clipboardDiv = document.getElementById(`output`)!
  const images = clipboardDiv.getElementsByTagName(`img`)

  Array.from(images).forEach((image) => {
    const width = image.getAttribute(`width`)!
    const height = image.getAttribute(`height`)!
    image.removeAttribute(`width`)
    image.removeAttribute(`height`)
    image.style.width = width
    image.style.height = height
  })
}

export function mergeCss(html: string): string {
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
  })
}

export function createEmptyNode(): HTMLElement {
  const node = document.createElement(`p`)
  node.style.fontSize = `0`
  node.style.lineHeight = `0`
  node.style.margin = `0`
  node.innerHTML = `&nbsp;`
  return node
}

export function modifyHtmlStructure(htmlString: string): string {
  const tempDiv = document.createElement(`div`)
  tempDiv.innerHTML = htmlString

  // 移动 `li > ul` 和 `li > ol` 到 `li` 后面
  tempDiv.querySelectorAll(`li > ul, li > ol`).forEach((originalItem) => {
    originalItem.parentElement!.insertAdjacentElement(`afterend`, originalItem)
  })

  return tempDiv.innerHTML
}

export function processClipboardContent(primaryColor: string) {
  const clipboardDiv = document.getElementById(`output`)!

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
}
