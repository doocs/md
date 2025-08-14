import type { Block, ExtendedProperties, Inline, Theme } from '@md/shared/types'
import type { PropertiesHyphen } from 'csstype'

/**
 * 自定义主题
 * @param theme - 基础主题
 * @param options - 自定义选项
 * @param options.fontSize - 字体大小倍数
 * @param options.color - 主色调
 * @returns 自定义后的主题
 */
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

/**
 * 使用模板自定义 CSS
 * @param jsonString - 部分 CSS 样式配置
 * @param color - 主色调
 * @param theme - 基础主题
 * @returns 合并后的主题
 */
export function customCssWithTemplate(jsonString: Partial<Record<Block | Inline, PropertiesHyphen>>, color: string, theme: Theme) {
  const newTheme = customizeTheme(theme, { color })

  const mergeProperties = <T extends Block | Inline = Block>(target: Record<T, PropertiesHyphen>, source: Partial<Record<Block | Inline, PropertiesHyphen>>, keys: T[]) => {
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

/**
 * 将样式对象转换为 CSS 字符串
 * @param style - 样式对象
 * @returns CSS 字符串
 */
export function getStyleString(style: ExtendedProperties): string {
  return Object.entries(style ?? {}).map(([key, value]) => `${key}: ${value}`).join(`; `)
}
