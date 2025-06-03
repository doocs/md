import type { PropertiesHyphen } from 'csstype'
import DOMPurify from 'isomorphic-dompurify'
import type { Block, ExtendedProperties, Inline, Theme } from '@/types'

/**
 * 将 CSS 字符串转换为 JSON 对象
 *
 * @param {string} css - CSS 字符串
 * @returns {object} - JSON 格式的 CSS
 */
export function css2json(css: string): Partial<Record<Block | Inline, PropertiesHyphen>> {
  // 去除所有 CSS 注释
  css = css.replace(/\/\*[\s\S]*?\*\//g, ``)

  const json: Partial<Record<Block | Inline, PropertiesHyphen>> = {}

  // 辅助函数：将声明数组转换为对象
  const toObject = (array: any[]) =>
    array.reduce<{ [k: string]: string }>((obj, item) => {
      const [property, ...value] = item.split(`:`).map((part: string) => part.trim())
      if (property)
        obj[property] = value.join(`:`)
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
      .map(selector => selector.trim()) as (Block | Inline)[]

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
 * 将样式对象转换为 CSS 字符串
 */
export function getStyleString(style: ExtendedProperties): string {
  return Object.entries(style ?? {}).map(([key, value]) => `${key}: ${value}`).join(`; `)
}

export function modifyHtmlContent(outputTemp: string, renderer: any): string {
  const {
    markdownContent,
    readingTime: readingTimeResult,
  } = renderer.parseFrontMatterAndContent(outputTemp)
  let _outputTemp = DOMPurify.sanitize(markdownContent, {
    ADD_TAGS: [`mp-common-profile`],
  })

  // 阅读时间及字数统计
  _outputTemp = renderer.buildReadingTime(readingTimeResult) + _outputTemp

  // 去除第一行的 margin-top
  _outputTemp = _outputTemp.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
  // 引用脚注
  _outputTemp += renderer.buildFootnotes()
  // // 附加的一些 style
  _outputTemp += renderer.buildAddition()

  if (renderer.getOpts().isMacCodeBlock) {
    _outputTemp += `
        <style>
          .hljs.code__pre > .mac-sign {
            display: flex;
          }
        </style>
      `
  }

  _outputTemp += `
      <style>
        .code__pre {
          padding: 0 !important;
        }
  
        .hljs.code__pre code {
          display: -webkit-box;
          padding: 0.5em 1em 1em;
          overflow-x: auto;
          text-indent: 0;
        }
  
        h2 strong {
          color: inherit !important;
        }
      </style>
    `
  return renderer.createContainer(_outputTemp)
}

export function customizeTheme(theme: Theme, options: {
  fontSize?: number
  color?: string
}) {
  const newTheme = JSON.parse(JSON.stringify(theme))
  const { fontSize, color } = options
  if (fontSize) {
    for (let i = 1; i <= 6; i++) {
      const v = newTheme.block[`h${i}`][`font-size`]
      newTheme.block[`h${i}`][`font-size`] = `${fontSize * Number.parseFloat(v)}px`
    }
  }
  if (color) {
    newTheme.base[`--md-primary-color`] = color
  }
  return newTheme as Theme
}

export function customCssWithTemplate(jsonString: Partial<Record<Block | Inline, PropertiesHyphen>>, color: string, theme: Theme) {
  const newTheme = customizeTheme(theme, { color })

  const mergeProperties = <T extends Block | Inline = Block>(target: Record<T, PropertiesHyphen>, source: Partial<Record<Block | Inline | string, PropertiesHyphen>>, keys: T[]) => {
    keys.forEach((key) => {
      if (source[key]) {
        target[key] = Object.assign(target[key] || {}, source[key])
      }
    })
  }

  const blockKeys: Block[] = [
    `container`,
    `h1`,
    `h2`,
    `h3`,
    `h4`,
    `h5`,
    `h6`,
    `code`,
    `code_pre`,
    `p`,
    `hr`,
    `blockquote`,
    `blockquote_note`,
    `blockquote_tip`,
    `blockquote_important`,
    `blockquote_warning`,
    `blockquote_caution`,
    `blockquote_p`,
    `blockquote_p_note`,
    `blockquote_p_tip`,
    `blockquote_p_important`,
    `blockquote_p_warning`,
    `blockquote_p_caution`,
    `blockquote_title`,
    `blockquote_title_note`,
    `blockquote_title_tip`,
    `blockquote_title_important`,
    `blockquote_title_warning`,
    `blockquote_title_caution`,
    `image`,
    `ul`,
    `ol`,
    `block_katex`,
  ]
  const inlineKeys: Inline[] = [`listitem`, `codespan`, `link`, `wx_link`, `strong`, `table`, `thead`, `td`, `footnote`, `figcaption`, `em`, `inline_katex`]

  mergeProperties(newTheme.block, jsonString, blockKeys)
  mergeProperties(newTheme.inline, jsonString, inlineKeys)
  return newTheme
}
