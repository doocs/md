/** Apply merged theme styles to the page */

import type { BuiltinThemeName } from '@md/shared/configs'
import type { CSSVariableConfig } from './cssVariables'
import { baseCSSContent, isBuiltinThemeName, themeMap } from '@md/shared/configs'
import { processCSS } from './cssProcessor'
import { wrapCSSWithScope } from './cssScopeWrapper'
import { generateCSSVariables, generateHeadingStyles } from './cssVariables'
import { getThemeInjector } from './themeInjector'

export interface ThemeConfig {
  themeName: string
  /** Optional raw CSS for marketplace / dynamic themes (replaces themeMap lookup) */
  themeCSS?: string
  customCSS?: string
  variables: CSSVariableConfig
}

function resolveThemeCSS(themeName: string, themeCSS?: string): string {
  if (themeCSS != null && themeCSS.trim()) {
    // Marketplace themes layer on default base styles, same as built-in non-default themes
    return `${themeMap.default}\n\n${themeCSS}`
  }

  let css = themeMap.default
  if (themeName !== `default` && isBuiltinThemeName(themeName)) {
    const specific = themeMap[themeName as BuiltinThemeName]
    if (specific)
      css = `${css}\n\n${specific}`
  }
  return css
}

export async function applyTheme(config: ThemeConfig): Promise<void> {
  const variablesCSS = generateCSSVariables(config.variables)

  const themeCSS = resolveThemeCSS(config.themeName, config.themeCSS)
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
