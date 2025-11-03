/**
 * CSS 主题导出
 * 将 CSS 文件作为字符串导出供 JavaScript 使用
 */

import baseCSS from './base.css?raw'
import defaultCSS from './default.css?raw'
import graceCSS from './grace.css?raw'
import simpleCSS from './simple.css?raw'

/**
 * 基础样式 CSS
 */
export const baseCSSContent = baseCSS

/**
 * CSS 主题映射表
 */
export const themeMap = {
  default: defaultCSS,
  grace: graceCSS,
  simple: simpleCSS,
} as const

export type ThemeName = keyof typeof themeMap
