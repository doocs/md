import juice from 'juice'

import { format } from 'prettier/standalone'
import * as prettierPluginMarkdown from 'prettier/plugins/markdown'
import * as prettierPluginBabel from 'prettier/plugins/babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import * as prettierPluginCss from 'prettier/plugins/postcss'
import { prefix } from '@/config'

export function addPrefix(str) {
  return `${prefix}__${str}`
}

export function customizeTheme(theme, options) {
  const newTheme = JSON.parse(JSON.stringify(theme))
  const { fontSize, color } = options
  if (fontSize) {
    for (let i = 1; i <= 4; i++) {
      const v = newTheme.block[`h${i}`][`font-size`]
      newTheme.block[`h${i}`][`font-size`] = `${fontSize * Number.parseFloat(v)}px`
    }
  }
  if (color) {
    newTheme.base[`--md-primary-color`] = color
  }
  return newTheme
}

export function customCssWithTemplate(jsonString, color, theme) {
  const newTheme = customizeTheme(theme, { color })

  const mergeProperties = (target, source, keys) => {
    keys.forEach((key) => {
      if (source[key]) {
        target[key] = Object.assign(target[key] || {}, source[key])
      }
    })
  }

  const blockKeys = [
    `h1`,
    `h2`,
    `h3`,
    `h4`,
    `code`,
    `p`,
    `hr`,
    `blockquote`,
    `blockquote_p`,
    `image`,
    `ul`,
    `ol`,
  ]
  const inlineKeys = [`strong`, `codespan`, `link`, `wx_link`, `listitem`]

  mergeProperties(newTheme.block, jsonString, blockKeys)
  mergeProperties(newTheme.inline, jsonString, inlineKeys)
  return newTheme
}

/**
 * 将 CSS 字符串转换为 JSON 对象
 *
 * @param {string} css - CSS 字符串
 * @returns {object} - JSON 格式的 CSS
 */
export function css2json(css) {
  // 去除所有 CSS 注释
  css = css.replace(/\/\*[\s\S]*?\*\//g, ``)

  const json = {}

  // 辅助函数：将声明数组转换为对象
  const toObject = array =>
    array.reduce((obj, item) => {
      const [property, value] = item.split(`:`).map(part => part.trim())
      if (property)
        obj[property] = value
      return obj
    }, {})

  while (css.includes(`{`) && css.includes(`}`)) {
    const lbracket = css.indexOf(`{`)
    const rbracket = css.indexOf(`}`)

    // 获取声明块并转换为对象
    const declarations = css.substring(lbracket + 1, rbracket)
      .split(`;`)
      .map(e => e.trim())
      .filter(Boolean)

    // 获取选择器并去除空格
    const selectors = css.substring(0, lbracket)
      .split(`,`)
      .map(selector => selector.trim())

    const declarationObj = toObject(declarations)

    // 将声明对象关联到相应的选择器
    selectors.forEach((selector) => {
      json[selector] = { ...(json[selector] || {}), ...declarationObj }
    })

    // 处理下一个声明块
    css = css.slice(rbracket + 1).trim()
  }

  return json
}

/**
 * 格式化内容
 * @param {string} content - 要格式化的内容
 * @param {'markdown' | 'css'} [type] - 内容类型，决定使用的解析器，默认为'markdown'
 * @returns {Promise<string>} - 格式化后的内容
 */
export async function formatDoc(content, type = `markdown`) {
  const plugins = {
    markdown: [prettierPluginMarkdown, prettierPluginBabel, prettierPluginEstree],
    css: [prettierPluginCss],
  }

  const parser = type in plugins ? type : `markdown`
  return await format(content, {
    parser,
    plugins: plugins[parser],
  })
}

/**
 * 导出原始 Markdown 文档
 * @param {string} doc - 文档内容
 */
export function downloadMD(doc) {
  const downLink = document.createElement(`a`)

  downLink.download = `content.md`
  downLink.style.display = `none`
  const blob = new Blob([doc])

  downLink.href = URL.createObjectURL(blob)
  document.body.appendChild(downLink)
  downLink.click()
  document.body.removeChild(downLink)
}

/**
 * 导出 HTML 生成内容
 */
export function exportHTML() {
  const element = document.querySelector(`#output`)
  setStyles(element)
  const htmlStr = element.innerHTML

  const downLink = document.createElement(`a`)

  downLink.download = `content.html`
  downLink.style.display = `none`
  const blob = new Blob([
    `<html><head><meta charset="utf-8" /></head><body><div style="width: 750px; margin: auto;">${htmlStr}</div></body></html>`,
  ])

  downLink.href = URL.createObjectURL(blob)
  document.body.appendChild(downLink)
  downLink.click()
  document.body.removeChild(downLink)

  function setStyles(element) {
    /**
     * 获取一个 DOM 元素的所有样式，
     * @param {DOM 元素} element DOM 元素
     * @param {排除的属性} excludes 如果某些属性对结果有不良影响，可以使用这个参数来排除
     * @returns 行内样式拼接结果
     */
    function getElementStyles(element, excludes = [`width`, `height`]) {
      const styles = getComputedStyle(element, null)
      return Object.entries(styles)
        .filter(
          ([key]) => styles.getPropertyValue(key) && !excludes.includes(key),
        )
        .map(([key, value]) => `${key}:${value};`)
        .join(``)
    }

    switch (true) {
      case isPre(element):
      case isCode(element):
      case isSpan(element):
        element.setAttribute(`style`, getElementStyles(element))
      // eslint-disable-next-line no-fallthrough
      default:
    }
    if (element.children.length) {
      Array.from(element.children).forEach(child => setStyles(child))
    }

    // 判断是否是包裹代码块的 pre 元素
    function isPre(element) {
      return (
        element.tagName === `PRE`
        && Array.from(element.classList).includes(`code__pre`)
      )
    }

    // 判断是否是包裹代码块的 code 元素
    function isCode(element) {
      return element.tagName === `CODE`
    }

    // 判断是否是包裹代码字符的 span 元素
    function isSpan(element) {
      return (
        element.tagName === `SPAN`
        && (isCode(element.parentElement)
        || isCode(element.parentElement.parentElement))
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
export function createTable({ data, rows, cols }) {
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

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(`,`).pop())
    reader.onerror = error => reject(error)
  })
}

export function checkImage(file) {
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
 * @param {*} str
 * @returns string
 */
export function removeLeft(str) {
  const lines = str.split(`\n`)
  // 获取应该删除的空白符数量
  const minSpaceNum = lines
    .filter(item => item.trim())
    .map(item => item.match(/(^\s+)?/)[0].length)
    .sort((a, b) => a - b)[0]
  // 删除空白符
  return lines.map(item => item.slice(minSpaceNum)).join(`\n`)
}

export function solveWeChatImage() {
  const clipboardDiv = document.getElementById(`output`)
  const images = clipboardDiv.getElementsByTagName(`img`)
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const width = image.getAttribute(`width`)
    const height = image.getAttribute(`height`)
    image.removeAttribute(`width`)
    image.removeAttribute(`height`)
    image.style.width = width
    image.style.height = height
  }
}

export function mergeCss(html) {
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
  })
}
