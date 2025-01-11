import type { PropertiesHyphen } from 'csstype'

import type { Token } from 'marked'

type GFMBlock = `blockquote_note` | `blockquote_tip` | `blockquote_important` | `blockquote_warning` | `blockquote_caution` | `blockquote_title` | `blockquote_title_note` | `blockquote_title_tip` | `blockquote_title_important` | `blockquote_title_warning` | `blockquote_title_caution` | `blockquote_p` | `blockquote_p_note` | `blockquote_p_tip` | `blockquote_p_important` | `blockquote_p_warning` | `blockquote_p_caution`
export type Block = `container` | `h1` | `h2` | `h3` | `h4` | `h5` | `h6` | `p` | `blockquote` | `blockquote_p` | `code_pre` | `code` | `image` | `ol` | `ul` | `footnotes` | `figure` | `hr` | GFMBlock
export type Inline = `listitem` | `codespan` | `link` | `wx_link` | `strong` | `table` | `thead` | `td` | `footnote` | `figcaption` | `em`

interface CustomCSSProperties {
  [`--md-primary-color`]?: string
  [key: `--${string}`]: string | undefined
}

export type ExtendedProperties = PropertiesHyphen & CustomCSSProperties

export interface Theme {
  base: ExtendedProperties
  block: Record<Block, ExtendedProperties>
  inline: Record<Inline, ExtendedProperties>
}

export interface IOpts {
  theme: Theme
  fonts: string
  size: string
  isUseIndent: boolean
  legend?: string
  citeStatus?: boolean
  countStatus?: boolean
}

export type ThemeStyles = Record<Block | Inline, ExtendedProperties>

export interface IConfigOption<VT = string> {
  label: string
  value: VT
  desc: string
}

/**
 * Options for the `markedAlert` extension.
 */
export interface AlertOptions {
  className?: string
  variants?: AlertVariantItem[]
  styles?: ThemeStyles
}

/**
 * Configuration for an alert type.
 */
export interface AlertVariantItem {
  type: string
  icon: string
  title?: string
  titleClassName?: string
}

/**
 * Represents an alert token.
 */
export interface Alert {
  type: `alert`
  meta: {
    className: string
    variant: string
    icon: string
    title: string
    titleClassName: string
  }
  raw: string
  text: string
  tokens: Token[]
}

export interface PostAccount {
  avatar: string
  displayName: string
  home: string
  icon: string
  supportTypes: string[]
  title: string
  type: string
  uid: string
  checked: boolean
  status?: string
  error?: string
}

export interface Post {
  title: string
  desc: string
  thumb: string
  content: string
  markdown: string
  accounts: PostAccount[]
}
