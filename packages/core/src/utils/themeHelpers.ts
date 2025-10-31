import type { Block, ExtendedProperties, Inline, Theme } from '@md/shared/types'

import type { PropertiesHyphen } from 'csstype'

import { selectorComments } from '@md/shared'
import { css2json, downloadFile } from '@md/shared/utils'

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
    `blockquote_info`,
    `blockquote_important`,
    `blockquote_warning`,
    `blockquote_caution`,
    `blockquote_p`,
    `blockquote_p_note`,
    `blockquote_p_tip`,
    `blockquote_p_info`,
    `blockquote_p_important`,
    `blockquote_p_warning`,
    `blockquote_p_caution`,
    `blockquote_title`,
    `blockquote_title_note`,
    `blockquote_title_tip`,
    `blockquote_title_info`,
    `blockquote_title_important`,
    `blockquote_title_warning`,
    `blockquote_title_caution`,
    `image`,
    `ul`,
    `ol`,
    `footnotes`,
    `figure`,
    `block_katex`,
  ]
  const inlineKeys: Inline[] = [`listitem`, `codespan`, `link`, `wx_link`, `strong`, `table`, `thead`, `th`, `td`, `footnote`, `figcaption`, `em`, `inline_katex`, `markup_highlight`, `markup_underline`, `markup_wavyline`]

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

export function generateThemeCSS(theme: Theme): string {
  const cssLines: string[] = []

  // 添加注释说明
  cssLines.push(`/**`)
  cssLines.push(` * 按 Alt/Option + Shift + F 可格式化`)
  cssLines.push(` * 如需使用主题色，请使用 var(--md-primary-color) 代替颜色值`)
  cssLines.push(` * 如：color: var(--md-primary-color);`)
  cssLines.push(` */`)
  cssLines.push(``)

  // 生成基础样式（顶层容器）
  cssLines.push(`/* 顶层容器样式 */`)
  cssLines.push(`container {`)
  cssLines.push(`}`)
  cssLines.push(``)

  // 生成块级元素样式
  Object.entries(theme.block).forEach(([selector, styles]) => {
    if (selector !== `container`) {
      const comment = selectorComments[selector as Block | Inline] || `${selector}样式`
      cssLines.push(`/* ${comment} */`)
      cssLines.push(`${selector} {`)
      Object.entries(styles).forEach(([property, value]) => {
        if (value) {
          cssLines.push(`  ${property}: ${value};`)
        }
      })
      cssLines.push(`}`)
      cssLines.push(``)
    }
  })

  // 生成内联元素样式
  Object.entries(theme.inline).forEach(([selector, styles]) => {
    const comment = selectorComments[selector as Block | Inline] || `${selector}样式`
    cssLines.push(`/* ${comment} */`)
    cssLines.push(`${selector} {`)
    Object.entries(styles).forEach(([property, value]) => {
      if (value) {
        cssLines.push(`  ${property}: ${value};`)
      }
    })
    cssLines.push(`}`)
    cssLines.push(``)
  })

  return cssLines.join(`\n`)
}

/**
 * 导出合并后的主题CSS（旧版本，已废弃）
 * @param customCSS - 用户自定义的CSS内容
 * @param baseTheme - 基础主题
 * @param primaryColor - 主色调
 * @param fontSize - 字体大小
 * @param fileName - 导出文件名
 * @deprecated 使用新的 exportMergedTheme from './themeExporter' 替代
 */
export function exportMergedThemeLegacy(
  customCSS: string,
  baseTheme: Theme,
  primaryColor: string,
  fontSize: number,
  fileName: string = `merged-theme`,
): void {
  // 将自定义CSS转换为JSON格式
  const customThemeJson = css2json(customCSS)

  // 使用基础主题和自定义样式合并
  const customizedTheme = customizeTheme(baseTheme, {
    fontSize,
    color: primaryColor,
  })

  // 使用模板合并自定义CSS
  const mergedTheme = customCssWithTemplate(
    customThemeJson,
    primaryColor,
    customizedTheme,
  )

  // 生成最终的CSS内容
  const finalCSS = generateMergedThemeCSS(mergedTheme)

  // 下载文件
  downloadFile(finalCSS, `${fileName}.css`, `text/css`)
}

/**
 * 生成合并后主题的完整CSS
 * @param theme - 合并后的主题对象
 * @returns CSS字符串
 */
function generateMergedThemeCSS(theme: Theme): string {
  const cssLines: string[] = []

  // 添加文件头注释
  cssLines.push(`/**`)
  cssLines.push(` * 导出的合并主题CSS`)
  cssLines.push(` * 包含内置主题和自定义样式的完整合并版本`)
  cssLines.push(` * 生成时间: ${new Date().toLocaleString(`zh-CN`)}`)
  cssLines.push(` */`)
  cssLines.push(``)

  // 添加CSS变量定义
  cssLines.push(`:root {`)
  Object.entries(theme.base).forEach(([property, value]) => {
    cssLines.push(`  ${property}: ${value};`)
  })
  cssLines.push(`}`)
  cssLines.push(``)

  // 生成块级元素样式
  Object.entries(theme.block).forEach(([selector, styles]) => {
    if (Object.keys(styles).length > 0) {
      const comment = selectorComments[selector as Block | Inline] || `${selector}样式`
      cssLines.push(`/* ${comment} */`)
      cssLines.push(`${selector} {`)
      Object.entries(styles).forEach(([property, value]) => {
        if (value) {
          cssLines.push(`  ${property}: ${value};`)
        }
      })
      cssLines.push(`}`)
      cssLines.push(``)
    }
  })

  // 生成内联元素样式
  Object.entries(theme.inline).forEach(([selector, styles]) => {
    if (Object.keys(styles).length > 0) {
      const comment = selectorComments[selector as Block | Inline] || `${selector}样式`
      cssLines.push(`/* ${comment} */`)
      cssLines.push(`${selector} {`)
      Object.entries(styles).forEach(([property, value]) => {
        if (value) {
          cssLines.push(`  ${property}: ${value};`)
        }
      })
      cssLines.push(`}`)
      cssLines.push(``)
    }
  })

  return cssLines.join(`\n`)
}
