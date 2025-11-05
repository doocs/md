/**
 * 主题导出工具
 * 导出合并后的主题CSS
 */

import type { CSSVariableConfig } from './cssVariables'
import { downloadFile } from '@md/shared/utils'
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
    ` * MD 主题导出`,
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

  downloadFile(mergedCSS, `${fileName}.css`, `text/css`)

  return mergedCSS
}
