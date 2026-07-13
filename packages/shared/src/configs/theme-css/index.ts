/** CSS theme strings for JavaScript consumers */

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

/** Built-in theme id, or marketplace theme key (`mp:<uuid>`). */
export type ThemeName = BuiltinThemeName | (string & {})

export function isBuiltinThemeName(name: string): name is BuiltinThemeName {
  return Object.hasOwn(themeMap, name)
}
