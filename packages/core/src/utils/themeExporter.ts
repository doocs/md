/**
 * 主题导出工具
 * 导出合并后的主题CSS
 */

import type { CSSVariableConfig } from './cssVariables'
import { downloadFile } from '@md/shared/utils'
import { extractCSSVariables, resolveCSSVariables } from './cssVariableResolver'
import { generateCSSVariables } from './cssVariables'

/**
 * 导出合并后的主题CSS
 * @param customCSS - 用户自定义的CSS内容
 * @param baseThemeCSS - 基础主题CSS
 * @param config - 配置项
 * @param fileName - 导出文件名
 */
export function exportMergedTheme(
  customCSS: string,
  baseThemeCSS: string,
  config: CSSVariableConfig,
  fileName: string,
) {
  // 1. 生成 CSS 变量
  const variablesCSS = generateCSSVariables(config)

  // 2. 拼接完整 CSS
  const mergedCSS = [
    `/**`,
    ` * Markdown Pretty 主题导出`,
    ` * 导出时间: ${new Date().toLocaleString()}`,
    ` * 说明: 该文件包含完整的主题样式，可直接使用`,
    ` */`,
    ``,
    variablesCSS,
    ``,
    baseThemeCSS,
    ``,
    customCSS,
  ].filter(Boolean).join(`\n`)

  // 3. 提取变量映射
  const variablesMap = extractCSSVariables(variablesCSS)

  // 4. 解析变量（将 CSS 变量替换为实际值）
  const resolvedCSS = resolveCSSVariables(mergedCSS, variablesMap)

  // 5. 下载文件
  downloadFile(resolvedCSS, `text/css`, `${fileName}.css`)

  return resolvedCSS
}

/**
 * 导出带变量的主题（推荐）
 * @param customCSS - 用户自定义的CSS内容
 * @param baseThemeCSS - 基础主题CSS
 * @param config - 配置项
 * @param fileName - 导出文件名
 */
export function exportThemeWithVariables(
  customCSS: string,
  baseThemeCSS: string,
  config: CSSVariableConfig,
  fileName: string,
) {
  const variablesCSS = generateCSSVariables(config)

  const mergedCSS = [
    `/**`,
    ` * Markdown Pretty 主题导出（包含 CSS 变量）`,
    ` * 导出时间: ${new Date().toLocaleString()}`,
    ` * 说明: 该文件使用 CSS 变量，可通过修改 :root 中的变量值来调整主题`,
    ` */`,
    ``,
    variablesCSS,
    ``,
    baseThemeCSS,
    ``,
    `/* 自定义样式 */`,
    customCSS,
  ].filter(Boolean).join(`\n`)

  downloadFile(mergedCSS, `text/css`, `${fileName}.css`)

  return mergedCSS
}
