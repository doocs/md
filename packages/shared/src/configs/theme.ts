import type { IConfigOption } from '../types'
import type { ThemeName } from './theme-css'

// 导出 CSS 主题（新主题系统）
export { baseCSSContent, themeMap, type ThemeName } from './theme-css'

export const themeOptionsMap = {
  default: {
    label: `经典`,
    value: `default`,
    desc: ``,
  },
  grace: {
    label: `优雅`,
    value: `grace`,
    desc: `@brzhang`,
  },
  simple: {
    label: `简洁`,
    value: `simple`,
    desc: `@okooo5km`,
  },
  ink: {
    label: `黑印`,
    value: `ink`,
    desc: `浓墨重彩，传统印刷`,
  },
  newspaper: {
    label: `报刊`,
    value: `newspaper`,
    desc: `报刊排版，粗黑分明`,
  },
}

export const themeOptions: IConfigOption<ThemeName>[] = [
  {
    label: `经典`,
    value: `default`,
    desc: ``,
  },
  {
    label: `优雅`,
    value: `grace`,
    desc: `@brzhang`,
  },
  {
    label: `简洁`,
    value: `simple`,
    desc: `@okooo5km`,
  },
  {
    label: `黑印`,
    value: `ink`,
    desc: `浓墨重彩，传统印刷`,
  },
  {
    label: `报刊`,
    value: `newspaper`,
    desc: `报刊排版，粗黑分明`,
  },
]
