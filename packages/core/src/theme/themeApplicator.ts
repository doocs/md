/** Apply merged theme styles to the page */

import type { ThemeName } from '@md/shared/configs'
import type { CSSVariableConfig } from './cssVariables'
import { baseCSSContent, themeMap } from '@md/shared/configs'
import { processCSS } from './cssProcessor'
import { wrapCSSWithScope } from './cssScopeWrapper'
import { generateCSSVariables, generateHeadingStyles } from './cssVariables'
import { getThemeInjector } from './themeInjector'

export interface ThemeConfig {
  themeName: string
  customCSS?: string
  variables: CSSVariableConfig
}

export async function applyTheme(config: ThemeConfig): Promise<void> {
  const variablesCSS = generateCSSVariables(config.variables)

  let themeCSS = themeMap.default

  if (config.themeName !== `default`) {
    const specificThemeCSS = themeMap[config.themeName as ThemeName]
    if (specificThemeCSS) {
      themeCSS = `${themeCSS}\n\n${specificThemeCSS}`
    }
  }

  const scopedThemeCSS = wrapCSSWithScope(themeCSS, `#output`)

  const headingStylesCSS = generateHeadingStyles(config.variables)

  const scopedCustomCSS = config.customCSS
    ? wrapCSSWithScope(config.customCSS, `#output`)
    : ``

  let mergedCSS = [
    variablesCSS,
    baseCSSContent,
    scopedThemeCSS,
    headingStylesCSS,
    scopedCustomCSS,
  ].filter(Boolean).join(`\n\n`)

  mergedCSS = processCSS(mergedCSS)

  const injector = getThemeInjector()
  injector.inject(mergedCSS)
}
