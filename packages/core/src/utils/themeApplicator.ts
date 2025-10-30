/**
 * 主题应用工具
 * 负责将主题样式应用到页面
 */

import type { CSSVariableConfig } from './cssVariables'
import { baseCSSContent, themeMapCSS } from '@md/shared/configs'
import { wrapCSSWithScope } from './cssScopeWrapper'
import { generateCSSVariables } from './cssVariables'
import { getThemeInjector } from './themeInjector'

export interface ThemeConfig {
  themeName: string // 主题名称
  customCSS?: string // 用户自定义 CSS
  variables: CSSVariableConfig
}

/**
 * 应用主题
 * @param config - 主题配置
 */
export function applyTheme(config: ThemeConfig): void {
  // 1. 生成 CSS 变量
  const variablesCSS = generateCSSVariables(config.variables)

  // 2. 构建主题 CSS（模拟旧系统的合并行为）
  let themeCSS = themeMapCSS.default // 默认主题作为基础

  // 3. 如果不是 default 主题，叠加主题特定样式
  if (config.themeName !== `default`) {
    const specificThemeCSS = themeMapCSS[config.themeName as keyof typeof themeMapCSS]
    if (specificThemeCSS) {
      themeCSS = `${themeCSS}\n\n${specificThemeCSS}`
    }
  }

  // 4. 添加用户自定义 CSS
  if (config.customCSS) {
    themeCSS = `${themeCSS}\n\n${config.customCSS}`
  }

  // 5. 给主题 CSS 添加作用域（只影响 #output 预览区域）
  const scopedThemeCSS = wrapCSSWithScope(themeCSS, `#output`)

  // 6. 拼接完整 CSS
  const mergedCSS = [
    variablesCSS, // CSS 变量（全局）
    baseCSSContent, // 基础样式（全局）
    scopedThemeCSS, // 主题样式（限制在 #output）
  ].filter(Boolean).join(`\n\n`)

  // 调试日志
  console.log(`[applyTheme] CSS 组成:`, {
    variables: `${variablesCSS.length} 字符`,
    base: `${baseCSSContent.length} 字符`,
    scopedTheme: `${scopedThemeCSS.length} 字符 (已添加 #output 作用域)`,
    total: `${mergedCSS.length} 字符`,
  })

  // 7. 注入到页面
  const injector = getThemeInjector()
  injector.inject(mergedCSS)

  console.log(`[applyTheme] ✅ 主题已注入，作用域限制在 #output 区域`)
}
