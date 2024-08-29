import type { PropertiesHyphen } from 'csstype'

type Block = `h1` | `h2` | `h3` | `h4` | `p` | `blockquote` | `blockquote_p` | `code_pre` | `code` | `image` | `ol` | `ul` | `footnotes` | `figure` | `hr`
type Inline = `listitem` | `codespan` | `link` | `wx_link` | `strong` | `table` | `thead` | `td` | `footnote` | `figcaption`

export interface Theme {
  base: PropertiesHyphen & { [`--md-primary-color`]?: string }
  block: Record<Block, PropertiesHyphen>
  inline: Record<Inline, PropertiesHyphen>
}

export interface IConfigOption {
  label: string
  value: string
  desc: string
}
