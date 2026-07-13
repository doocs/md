/** CSS theme strings for JavaScript consumers */

import type { MarketplaceThemeKey } from '../../types/marketplace'
import baseCSS from './base.css?raw'
import defaultCSS from './default.css?raw'
import graceCSS from './grace.css?raw'
import simpleCSS from './simple.css?raw'

export const baseCSSContent = baseCSS

export const themeMap = {
  default: defaultCSS,
  grace: graceCSS,
  simple: simpleCSS,
} as const

export type BuiltinThemeName = keyof typeof themeMap

/** Built-in theme id, or marketplace theme key (`mp:<id>`). */
export type ThemeName = BuiltinThemeName | MarketplaceThemeKey

export function isBuiltinThemeName(name: string): name is BuiltinThemeName {
  return Object.keys(themeMap).includes(name)
}
