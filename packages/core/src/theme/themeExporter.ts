/** Export merged theme CSS to a downloadable file */

import type { CSSVariableConfig } from './cssVariables'
import { downloadFile } from '@md/shared/utils'
import { generateCSSVariables } from './cssVariables'

export function exportMergedTheme(
  customCSS: string,
  baseThemeCSS: string,
  config: CSSVariableConfig,
  fileName: string,
) {
  const variablesCSS = generateCSSVariables(config)

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
