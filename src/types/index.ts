import type { PropertiesHyphen } from 'csstype'

export type Block = `h1` | `h2` | `h3` | `h4` | `h5` | `h6` | `p` | `blockquote` | `blockquote_p` | `code_pre` | `code` | `image` | `ol` | `ul` | `footnotes` | `figure` | `hr`
export type Inline = `listitem` | `codespan` | `link` | `wx_link` | `strong` | `table` | `thead` | `td` | `footnote` | `figcaption` | `em`

interface CustomCSSProperties {
  [`--md-primary-color`]?: string
  [key: `--${string}`]: string | undefined
}

export type ExtendedProperties = PropertiesHyphen & CustomCSSProperties

export interface Theme {
  base: ExtendedProperties
  block: Record<Block, PropertiesHyphen>
  inline: Record<Inline, PropertiesHyphen>
}

export interface IOpts {
  theme: Theme
  fonts: string
  size: string
  isUseIndent: boolean
  legend?: string
  status?: boolean
}

export type ThemeStyles = Record<Block | Inline, ExtendedProperties>

export interface IConfigOption<VT = string> {
  label: string
  value: VT
  desc: string
}
