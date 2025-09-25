import type { Block, Inline, Theme } from '@md/shared'
import { selectorComments } from '@md/shared'

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
