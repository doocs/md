import type { Block, IConfigOption, Inline, Theme } from '../types'
import { toMerged } from 'es-toolkit'

const defaultTheme: Theme = {
  base: {
    '--md-primary-color': `#000000`,
    'text-align': `left`,
    'line-height': `1.75`,
  },
  block: {
    container: {},
    // 一级标题
    h1: {
      'display': `table`,
      'padding': `0 1em`,
      'border-bottom': `2px solid var(--md-primary-color)`,
      'margin': `2em auto 1em`,
      'color': `hsl(var(--foreground))`,
      'font-size': `1.2em`,
      'font-weight': `bold`,
      'text-align': `center`,
    },

    // 二级标题
    h2: {
      'display': `table`,
      'padding': `0 0.2em`,
      'margin': `4em auto 2em`,
      'color': `#fff`,
      'background': `var(--md-primary-color)`,
      'font-size': `1.2em`,
      'font-weight': `bold`,
      'text-align': `center`,
    },

    // 三级标题
    h3: {
      'padding-left': `8px`,
      'border-left': `3px solid var(--md-primary-color)`,
      'margin': `2em 8px 0.75em 0`,
      'color': `hsl(var(--foreground))`,
      'font-size': `1.1em`,
      'font-weight': `bold`,
      'line-height': `1.2`,
    },

    // 四级标题
    h4: {
      'margin': `2em 8px 0.5em`,
      'color': `var(--md-primary-color)`,
      'font-size': `1em`,
      'font-weight': `bold`,
    },

    // 五级标题
    h5: {
      'margin': `1.5em 8px 0.5em`,
      'color': `var(--md-primary-color)`,
      'font-size': `1em`,
      'font-weight': `bold`,
    },

    // 六级标题
    h6: {
      'margin': `1.5em 8px 0.5em`,
      'font-size': `1em`,
      'color': `var(--md-primary-color)`,
    },

    // 段落
    p: {
      'margin': `1.5em 8px`,
      'letter-spacing': `0.1em`,
      'color': `hsl(var(--foreground))`,
    },

    // 引用
    blockquote: {
      'font-style': `normal`,
      'padding': `1em`,
      'border-left': `4px solid var(--md-primary-color)`,
      'border-radius': `6px`,
      'color': `rgba(0,0,0,0.5)`,
      'background': `var(--blockquote-background)`,
      'margin-bottom': `1em`,
    },

    // 引用内容
    blockquote_p: {
      'display': `block`,
      'font-size': `1em`,
      'letter-spacing': `0.1em`,
      'color': `hsl(var(--foreground))`,
    },

    blockquote_note: {
    },

    blockquote_tip: {
    },

    blockquote_info: {
    },

    blockquote_important: {
    },

    blockquote_warning: {
    },

    blockquote_caution: {
    },

    // GFM 警告块标题
    blockquote_title: {
      'display': `flex`,
      'align-items': `center`,
      'gap': `0.5em`,
      'margin-bottom': `0.5em`,
    },

    blockquote_title_note: {
      color: `#478be6`,
    },

    blockquote_title_tip: {
      color: `#57ab5a`,
    },

    blockquote_title_info: {
      color: `#93c5fd`,
    },

    blockquote_title_important: {
      color: `#986ee2`,
    },

    blockquote_title_warning: {
      color: `#c69026`,
    },

    blockquote_title_caution: {
      color: `#e5534b`,
    },

    blockquote_p_note: {
    },

    blockquote_p_tip: {
    },

    blockquote_p_info: {
    },

    blockquote_p_important: {
    },

    blockquote_p_warning: {
    },

    blockquote_p_caution: {
    },

    // 代码块
    code_pre: {
      'font-size': `90%`,
      'overflow-x': `auto`,
      'border-radius': `8px`,
      'padding': `1em`,
      'line-height': `1.5`,
      'margin': `10px 8px`,
    },

    // 行内代码
    code: {
      'margin': 0,
      'white-space': `nowrap`,
      'font-size': `90%`,
      'font-family': `Menlo, Operator Mono, Consolas, Monaco, monospace`,
    },

    // 图片
    image: {
      'display': `block`,
      'max-width': `100%`,
      'margin': `0.1em auto 0.5em`,
      'border-radius': `4px`,
    },

    // 有序列表
    ol: {
      'padding-left': `1em`,
      'margin-left': `0`,
      'color': `hsl(var(--foreground))`,
    },

    // 无序列表
    ul: {
      'list-style': `circle`,
      'padding-left': `1em`,
      'margin-left': `0`,
      'color': `hsl(var(--foreground))`,
    },

    footnotes: {
      'margin': `0.5em 8px`,
      'font-size': `80%`,
      'color': `hsl(var(--foreground))`,
    },

    figure: {
      margin: `1.5em 8px`,
      color: `hsl(var(--foreground))`,
    },

    hr: {
      'border-style': `solid`,
      'border-width': `2px 0 0`,
      'border-color': `rgba(0,0,0,0.1)`,
      '-webkit-transform-origin': `0 0`,
      '-webkit-transform': `scale(1, 0.5)`,
      'transform-origin': `0 0`,
      'transform': `scale(1, 0.5)`,
      'height': `0.4em`,
      'margin': `1.5em 0`,
    },

    block_katex: {
      'max-width': `100%`,
      'overflow-x': `auto`,
      '-webkit-overflow-scrolling': `touch`,
      'padding': `0.5em 0`,
    },
  },
  inline: {
    listitem: {
      display: `block`,
      margin: `0.2em 8px`,
      color: `hsl(var(--foreground))`,
    },

    codespan: {
      'font-size': `90%`,
      'color': `#d14`,
      'background': `rgba(27,31,35,.05)`,
      'padding': `3px 5px`,
      'border-radius': `4px`,
      // 'word-break': `break-all`,
    },

    em: {
      'font-style': `italic`,
      'font-size': `inherit`,
    },

    link: {
      color: `#576b95`,
    },

    wx_link: {
      'color': `#576b95`,
      'text-decoration': `none`,
    },

    // 字体加粗样式
    strong: {
      'color': `var(--md-primary-color)`,
      'font-weight': `bold`,
      'font-size': `inherit`,
    },

    table: {
      color: `hsl(var(--foreground))`,
    },

    thead: {
      'font-weight': `bold`,
      'color': `hsl(var(--foreground))`,
    },

    th: {
      'border': `1px solid #dfdfdf`,
      'padding': `0.25em 0.5em`,
      'color': `hsl(var(--foreground))`,
      'word-break': `keep-all`,
      'background': `rgba(0, 0, 0, 0.05)`,
    },

    td: {
      'border': `1px solid #dfdfdf`,
      'padding': `0.25em 0.5em`,
      'color': `hsl(var(--foreground))`,
      'word-break': `keep-all`,
    },

    footnote: {
      'font-size': `12px`,
      'color': `hsl(var(--foreground))`,
    },

    figcaption: {
      'text-align': `center`,
      'color': `#888`,
      'font-size': `0.8em`,
    },

    inline_katex: {
      'max-width': `100%`,
      'overflow-x': `auto`,
    },

    markup_highlight: {
      'background-color': `var(--md-primary-color)`,
      'padding': `2px 4px`,
      'border-radius': `2px`,
      'color': `#fff`,
    },
    markup_underline: {
      'text-decoration': `underline`,
      'text-decoration-color': `var(--md-primary-color)`,
    },
    markup_wavyline: {
      'text-decoration': `underline wavy`,
      'text-decoration-color': `var(--md-primary-color)`,
      'text-decoration-thickness': `2px`,
    },

  },
}

const graceTheme = toMerged(defaultTheme, {
  base: {
  },
  block: {
    'container': {},
    'h1': {
      'padding': `0.5em 1em`,
      'border-bottom': `2px solid var(--md-primary-color)`,
      'font-size': `1.4em`,
      'text-shadow': `2px 2px 4px rgba(0,0,0,0.1)`,
    },

    'h2': {
      'padding': `0.3em 1em`,
      'border-radius': `8px`,
      'font-size': `1.3em`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.1)`,
    },

    'h3': {
      'padding-left': `12px`,
      'font-size': `1.2em`,
      'border-left': `4px solid var(--md-primary-color)`,
      'border-bottom': `1px dashed var(--md-primary-color)`,
    },

    'h4': {
      'font-size': `1.1em`,
    },

    'h5': {
      'font-size': `1em`,
    },

    'h6': {
      'font-size': `1em`,
    },

    'p': {
    },

    'blockquote': {
      'font-style': `italic`,
      'padding': `1em 1em 1em 2em`,
      'border-left': `4px solid var(--md-primary-color)`,
      'border-radius': `6px`,
      'color': `rgba(0,0,0,0.6)`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.05)`,
      'margin-bottom': `1em`,
    },

    'blockquote_p': {
    },

    'markdown-alert': {
      'font-style': `italic`,
    },

    'code_pre': {
      'box-shadow': `inset 0 0 10px rgba(0,0,0,0.05)`,
    },

    'code': {
      'font-family': `'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace`,
    },

    'image': {
      'border-radius': `8px`,
      'box-shadow': `0 4px 8px rgba(0,0,0,0.1)`,
    },

    'ol': {
      'padding-left': `1.5em`,
    },

    'ul': {
      'list-style': `none`,
      'padding-left': `1.5em`,
    },

    'footnotes': {

    },

    'figure': {

    },

    'hr': {
      height: `1px`,
      border: `none`,
      margin: `2em 0`,
      background: `linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,0))`,
    },
  },
  inline: {
    listitem: {
      margin: `0.5em 8px`,
    },

    codespan: {
    },

    em: {
    },

    link: {
    },

    wx_link: {
    },

    strong: {
    },

    table: {
      'border-collapse': `separate`,
      'border-spacing': `0`,
      'border-radius': `8px`,
      'margin': `1em 8px`,
      'color': `hsl(var(--foreground))`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.1)`,
      'overflow': `hidden`,
    },

    thead: {
      color: `#fff`,
    },

    td: {
      padding: `0.5em 1em`,
    },

    footnote: {
      color: `rgba(0,0,0,0.5)`,
    },

    figcaption: {

    },
  },
})

const simpleTheme = toMerged(defaultTheme, {
  base: {
  },
  block: {
    container: {},
    h1: {
      'padding': `0.5em 1em`,
      'font-size': `1.4em`,
      'text-shadow': `1px 1px 3px rgba(0,0,0,0.05)`,
    },

    h2: {
      'padding': `0.3em 1.2em`,
      'font-size': `1.3em`,
      'border-radius': `8px 24px 8px 24px`,
      'box-shadow': `0 2px 6px rgba(0,0,0,0.06)`,
    },

    h3: {
      'padding-left': `12px`,
      'font-size': `1.2em`,
      'border-radius': `6px`,
      'line-height': `2.4em`,
      'border-left': `4px solid var(--md-primary-color)`,
      'border-right': `1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent)`,
      'border-bottom': `1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent)`,
      'border-top': `1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent)`,
      'background': `color-mix(in srgb, var(--md-primary-color) 8%, transparent)`,
    },

    h4: {
      'font-size': `1.1em`,
      'border-radius': `6px`,
    },

    h5: {
      'border-radius': `6px`,
    },

    h6: {
      'border-radius': `6px`,
    },

    blockquote: {
      'font-style': `italic`,
      'padding': `1em 1em 1em 2em`,
      'color': `rgba(0,0,0,0.6)`,
      'border-bottom': `0.2px solid rgba(0, 0, 0, 0.04)`,
      'border-top': `0.2px solid rgba(0, 0, 0, 0.04)`,
      'border-right': `0.2px solid rgba(0, 0, 0, 0.04)`,
    },

    blockquote_note: {
      'font-style': `italic`,
    },

    blockquote_tip: {
      'font-style': `italic`,
    },

    blockquote_info: {
      'font-style': `italic`,
    },

    blockquote_important: {
      'font-style': `italic`,
    },

    blockquote_warning: {
      'font-style': `italic`,
    },

    blockquote_caution: {
      'font-style': `italic`,
    },

    blockquote_title: {
    },

    blockquote_title_note: {

    },

    blockquote_title_tip: {
    },

    blockquote_title_info: {
    },

    blockquote_title_important: {
    },

    blockquote_title_warning: {
    },

    blockquote_title_caution: {
    },

    blockquote_p_note: {
    },

    blockquote_p_tip: {
    },

    blockquote_p_info: {
    },

    blockquote_p_important: {
    },

    blockquote_p_warning: {
    },

    blockquote_p_caution: {
    },

    code_pre: {
      border: `1px solid rgba(0, 0, 0, 0.04)`,
    },

    code: {
      'font-family': `'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace`,
    },

    image: {
      'border-radius': `8px`,
      'border': `1px solid rgba(0, 0, 0, 0.04)`,
    },

    ol: {
      'padding-left': `1.5em`,
    },

    ul: {
      'list-style': `none`,
      'padding-left': `1.5em`,
    },

    hr: {
      height: `1px`,
      border: `none`,
      margin: `2em 0`,
      background: `linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,0))`,
    },
  },
  inline: {
    listitem: {
      margin: `0.5em 8px`,
    },
  },
})

export const themeMap = {
  default: defaultTheme,
  grace: graceTheme,
  simple: simpleTheme,
}

// 导出 CSS 主题
export { baseCSSContent, themeMapCSS, type ThemeNameCSS } from './theme-css'

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
}

export const themeOptions: IConfigOption<keyof typeof themeMap>[] = [
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
]

/**
 * 选择器注释
 * 自定义 CSS 编辑器中使用
 */
export const selectorComments: Record<Block | Inline, string> = {
  container: `顶层容器样式`,
  h1: `一级标题样式`,
  h2: `二级标题样式`,
  h3: `三级标题样式`,
  h4: `四级标题样式`,
  h5: `五级标题样式`,
  h6: `六级标题样式`,
  image: `图片样式`,
  blockquote: `引用样式`,
  blockquote_p: `引用段落样式`,
  p: `段落样式`,
  hr: `分割线样式`,
  codespan: `行内代码样式`,
  em: `斜体样式`,
  strong: `粗体样式`,
  link: `链接样式`,
  wx_link: `微信链接样式`,
  ol: `有序列表样式`,
  ul: `无序列表样式`,
  listitem: `列表项样式`,
  code: `代码块样式`,
  code_pre: `代码块外层样式`,
  inline_katex: `行内公式样式`,
  block_katex: `公式块样式`,
  table: `表格样式`,
  thead: `表头样式`,
  th: `表头单元格样式`,
  td: `表格单元格样式`,
  footnotes: `脚注样式`,
  figure: `图表样式`,
  figcaption: `图表标题样式`,
  footnote: `脚注引用样式`,
  blockquote_note: `GFM note 样式`,
  blockquote_tip: `GFM tip 样式`,
  blockquote_info: `GFM info 样式`,
  blockquote_important: `GFM important 样式`,
  blockquote_warning: `GFM warning 样式`,
  blockquote_caution: `GFM caution 样式`,
  blockquote_title: `GFM 通用标题`,
  blockquote_title_note: `GFM note 标题`,
  blockquote_title_tip: `GFM tip 标题`,
  blockquote_title_info: `GFM info 标题`,
  blockquote_title_important: `GFM important 标题`,
  blockquote_title_warning: `GFM warning 标题`,
  blockquote_title_caution: `GFM caution 标题`,
  blockquote_p_note: `GFM note 段落样式`,
  blockquote_p_tip: `GFM tip 段落样式`,
  blockquote_p_info: `GFM info 段落样式`,
  blockquote_p_important: `GFM important 段落样式`,
  blockquote_p_warning: `GFM warning 段落样式`,
  blockquote_p_caution: `GFM caution 段落样式`,
  markup_highlight: `高亮标记样式`,
  markup_underline: `下划线标记样式`,
  markup_wavyline: `波浪线标记样式`,
}
