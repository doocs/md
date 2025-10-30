/**
 * CSS 主题导出
 * 将 CSS 文件作为字符串导出供 JavaScript 使用
 */

// @ts-expect-error shared 包没有声明，导出后 vite 可以正确处理
import baseCSS from './base.css?raw'
// @ts-expect-error shared 包没有声明，导出后 vite 可以正确处理
import defaultCSS from './default.css?raw'
// @ts-expect-error shared 包没有声明，导出后 vite 可以正确处理
import graceCSS from './grace.css?raw'
// @ts-expect-error shared 包没有声明，导出后 vite 可以正确处理
import simpleCSS from './simple.css?raw'

/**
 * 基础样式 CSS
 */
export const baseCSSContent = baseCSS

/**
 * CSS 主题映射表
 */
export const themeMapCSS = {
  default: defaultCSS,
  grace: graceCSS,
  simple: simpleCSS,
} as const

export type ThemeNameCSS = keyof typeof themeMapCSS
