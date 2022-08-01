import prettier from 'prettier/standalone'
import prettierCss from 'prettier/parser-postcss'
import prettierMarkdown from 'prettier/parser-markdown'
import defaultTheme from './themes/default-theme'

const createCustomTheme = (theme, color) => {
  const customTheme = JSON.parse(JSON.stringify(theme))
  customTheme.block.h1[`border-bottom`] = `2px solid ${color}`
  customTheme.block.h2[`background`] = color
  customTheme.block.h3[`border-left`] = `3px solid ${color}`
  customTheme.block.h4[`color`] = color
  customTheme.inline.strong[`color`] = color
  return customTheme
}

// 设置自定义颜色
export function setColorWithTemplate(theme) {
  return (color) => {
    return createCustomTheme(theme, color)
  }
}

export function setColorWithCustomTemplate(theme, color) {
  return createCustomTheme(theme, color)
}

// 设置自定义字体大小
export function setFontSizeWithTemplate(template) {
  return function (fontSize) {
    const customTheme = JSON.parse(JSON.stringify(template))
    customTheme.block.h1[`font-size`] = `${fontSize * 1.14}px`
    customTheme.block.h2[`font-size`] = `${fontSize * 1.1}px`
    customTheme.block.h3[`font-size`] = `${fontSize}px`
    customTheme.block.h4[`font-size`] = `${fontSize}px`
    return customTheme
  }
}

export const setColor = setColorWithTemplate(defaultTheme)
export const setFontSize = setFontSizeWithTemplate(defaultTheme)

export function customCssWithTemplate(jsonString, color, theme) {
  // block
  const customTheme = createCustomTheme(theme, color)

  customTheme.block.h1 = Object.assign(customTheme.block.h1, jsonString.h1)
  customTheme.block.h2 = Object.assign(customTheme.block.h2, jsonString.h2)
  customTheme.block.h3 = Object.assign(customTheme.block.h3, jsonString.h3)
  customTheme.block.h4 = Object.assign(customTheme.block.h4, jsonString.h4)
  customTheme.block.code = Object.assign(
    customTheme.block.code,
    jsonString.code
  )
  customTheme.block.p = Object.assign(customTheme.block.p, jsonString.p)
  customTheme.block.hr = Object.assign(customTheme.block.hr, jsonString.hr)
  customTheme.block.blockquote = Object.assign(
    customTheme.block.blockquote,
    jsonString.blockquote
  )
  customTheme.block.blockquote_p = Object.assign(
    customTheme.block.blockquote_p,
    jsonString.blockquote_p
  )
  customTheme.block.image = Object.assign(
    customTheme.block.image,
    jsonString.image
  )

  // inline
  customTheme.inline.strong = Object.assign(
    customTheme.inline.strong,
    jsonString.strong
  )
  customTheme.inline.codespan = Object.assign(
    customTheme.inline.codespan,
    jsonString.codespan
  )
  customTheme.inline.link = Object.assign(
    customTheme.inline.link,
    jsonString.link
  )
  customTheme.inline.wx_link = Object.assign(
    customTheme.inline.wx_link,
    jsonString.wx_link
  )
  customTheme.block.ul = Object.assign(customTheme.block.ul, jsonString.ul)
  customTheme.block.ol = Object.assign(customTheme.block.ol, jsonString.ol)
  customTheme.inline.listitem = Object.assign(
    customTheme.inline.listitem,
    jsonString.li
  )
  return customTheme
}

/**
 * 将CSS形式的字符串转换为JSON
 *
 * @param {string} css - css字符串
 */
export function css2json(css) {
  // 移除CSS所有注释
  let open, close
  while (
    (open = css.indexOf(`/*`)) !== -1 &&
    (close = css.indexOf(`*/`)) !== -1
  ) {
    css = css.substring(0, open) + css.substring(close + 2)
  }

  // 初始化返回值
  let json = {}

  while (css.length > 0 && css.indexOf(`{`) !== -1 && css.indexOf(`}`) !== -1) {
    // 存储第一个左/右花括号的下标
    const lbracket = css.indexOf(`{`)
    const rbracket = css.indexOf(`}`)

    // 第一步：将声明转换为Object，如：
    // `font: 'Times New Roman' 1em; color: #ff0000; margin-top: 1em;`
    //  ==>
    // `{"font": "'Times New Roman' 1em", "color": "#ff0000", "margin-top": "1em"}`

    // 辅助方法：将array转为object
    // eslint-disable-next-line no-inner-declarations
    function toObject(array) {
      let ret = {}
      array.forEach((e) => {
        const index = e.indexOf(`:`)
        const property = e.substring(0, index).trim()
        ret[property] = e.substring(index + 1).trim()
      })
      return ret
    }

    // 切割声明块并移除空白符，然后放入数组中
    let declarations = css
      .substring(lbracket + 1, rbracket)
      .split(`;`)
      .map((e) => e.trim())
      .filter((e) => e.length > 0) // 移除所有""空值

    // 转为Object对象
    declarations = toObject(declarations)

    // 第二步：选择器处理，每个选择器会与它对应的声明相关联，如：
    // `h1, p#bar {color: red}`
    // ==>
    // {"h1": {color: red}, "p#bar": {color: red}}

    let selectors = css
      .substring(0, lbracket)
      // 以,切割，并移除空格：`"h1, p#bar, span.foo"` => ["h1", "p#bar", "span.foo"]
      .split(`,`)
      .map((selector) => selector.trim())

    // 迭代赋值
    selectors.forEach((selector) => {
      // 若不存在，则先初始化
      if (!json[selector]) json[selector] = {}
      // 赋值到JSON
      Object.keys(declarations).forEach((key) => {
        json[selector][key] = declarations[key]
      })
    })

    // 继续下个声明块
    css = css.slice(rbracket + 1).trim()
  }

  // 返回JSON形式的结果串
  return json
}

/**
 * 将编辑器内容保存到 LocalStorage
 * @param {*} editor
 * @param {*} name
 */
export function saveEditorContent(editor, name) {
  const content = editor.getValue(0)
  if (content) {
    localStorage.setItem(name, content)
  } else {
    localStorage.removeItem(name)
  }
}

/**
 * 格式化文档
 * @param {string} content - 文档内容
 */
export function formatDoc(content) {
  return prettier.format(content, {
    parser: `markdown`,
    plugins: [prettierMarkdown],
  })
}

/**
 * 格式化css
 * @param {string} content - css内容
 */
export function formatCss(content) {
  return prettier.format(content, {
    parser: `css`,
    plugins: [prettierCss],
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
  let blob = new Blob([
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
          ([key]) => styles.getPropertyValue(key) && !excludes.includes(key)
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
      Array.from(element.children).forEach((child) => setStyles(child))
    }

    // 判断是否是包裹代码块的 pre 元素
    function isPre(element) {
      return (
        element.tagName === `PRE` &&
        Array.from(element.classList).includes(`code__pre`)
      )
    }

    // 判断是否是包裹代码块的 code 元素
    function isCode(element) {
      return (
        element.tagName === `CODE` &&
        Array.from(element.classList).includes(`prettyprint`)
      )
    }

    // 判断是否是包裹代码字符的 span 元素
    function isSpan(element) {
      return (
        element.tagName === `SPAN` &&
        (isCode(element.parentElement) ||
          isCode(element.parentElement.parentElement))
      )
    }
  }
}

/**
 * 生成列表字符串
 * @param {*} data 对应内容集合
 * @param {*} rows 行
 * @param {*} cols 列
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
    reader.onerror = (error) => reject(error)
  })
}

export function checkImage(file) {
  // check filename suffix
  const isValidSuffix = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name)
  if (!isValidSuffix) {
    return {
      ok: false,
      msg: `请上传 JPG/PNG/GIF 格式的图片`,
    }
  }

  // check file size
  const maxSize = 10
  const valid = file.size / 1024 / 1024 <= maxSize
  if (!valid) {
    return {
      ok: false,
      msg: `由于公众号限制，图片大小不能超过 ${maxSize}M`,
    }
  }
  return { ok: true }
}

/**
 * 移除左边多余空格
 * @param {*} str
 * @returns
 */
export function removeLeft(str) {
  const lines = str.split(`\n`)
  // 获取应该删除的空白符数量
  const minSpaceNum = lines
    .filter((item) => item.trim())
    .map((item) => item.match(/(^\s+)?/)[0].length)
    .sort((a, b) => a - b)[0]
  // 删除空白符
  return lines.map((item) => item.slice(minSpaceNum)).join(`\n`)
}
