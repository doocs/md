interface Theme {
  BASE: Record<string, string | number>
  block: Record<string, Record<string, string | number>>
  inline: Record<string, Record<string, string | number>>
}

const baseColor = `#3f3f3f`
const baseBorderColor = `rgba(215, 16, 166, 0.8)`

function mergeTheme(defaultTheme: Theme, newTheme: Theme) {
  const res: Theme = {
    BASE: {
      ...defaultTheme.BASE,
      ...newTheme.BASE,
    },
    block: {},
    inline: {},
  }
  for (const el in defaultTheme.block) {
    res.block[el] = {
      ...defaultTheme.block[el],
      ...newTheme.block[el],
    }
  }
  for (const el in defaultTheme.inline) {
    res.inline[el] = {
      ...defaultTheme.inline[el],
      ...newTheme.inline[el],
    }
  }
  return res
}

const defaultTheme = {
  BASE: {
    'text-align': `left`,
    'line-height': `1.75`,
  },
  block: {
    // 一级标题样式
    h1: {
      'font-size': `1.2em`,
      'text-align': `center`,
      'font-weight': `bold`,
      'display': `table`,
      'margin': `2em auto 1em`,
      'padding': `0 1em`,
      'border-bottom': `2px solid rgba(0, 152, 116, 0.9)`,
      'color': `var(--el-text-color-regular)`,
    },

    // 二级标题样式
    h2: {
      'font-size': `1.2em`,
      'text-align': `center`,
      'font-weight': `bold`,
      'display': `table`,
      'margin': `4em auto 2em`,
      'padding': `0 0.2em`,
      'background': `rgba(0, 152, 116, 0.9)`,
      'color': `#fff`,
    },

    // 三级标题样式
    h3: {
      'font-weight': `bold`,
      'font-size': `1.1em`,
      'margin': `2em 8px 0.75em 0`,
      'line-height': `1.2`,
      'padding-left': `8px`,
      'border-left': `3px solid rgba(0, 152, 116, 0.9)`,
      'color': `var(--el-text-color-regular)`,
    },

    // 四级标题样式
    h4: {
      'font-weight': `bold`,
      'font-size': `1em`,
      'margin': `2em 8px 0.5em`,
      'color': `rgba(66, 185, 131, 0.9)`,
    },

    // 段落样式
    p: {
      'margin': `1.5em 8px`,
      'letter-spacing': `0.1em`,
      'color': `var(--el-text-color-regular)`,
      'text-align': `justify`,
    },

    // 引用样式
    blockquote: {
      'font-style': `normal`,
      'border-left': `none`,
      'padding': `1em`,
      'border-radius': `8px`,
      'color': `rgba(0,0,0,0.5)`,
      'background': `#f7f7f7`,
      'margin': `2em 8px`,
    },

    blockquote_p: {
      'letter-spacing': `0.1em`,
      'color': `rgb(80, 80, 80)`,
      'font-size': `1em`,
      'display': `block`,
    },
    code_pre: {
      'font-size': `14px`,
      'overflow-x': `auto`,
      'border-radius': `8px`,
      'padding': `1em`,
      'line-height': `1.5`,
      'margin': `10px 8px`,
    },
    code: {
      'margin': 0,
      'white-space': `nowrap`,
      'font-family': `Menlo, Operator Mono, Consolas, Monaco, monospace`,
    },

    image: {
      'border-radius': `4px`,
      'display': `block`,
      'margin': `0.1em auto 0.5em`,
      'width': `100% !important`,
    },

    ol: {
      'margin-left': `0`,
      'padding-left': `1em`,
      'color': `var(--el-text-color-regular)`,
    },

    ul: {
      'margin-left': `0`,
      'padding-left': `1em`,
      'list-style': `circle`,
      'color': `var(--el-text-color-regular)`,
    },

    footnotes: {
      'margin': `0.5em 8px`,
      'font-size': `80%`,
      'color': `var(--el-text-color-regular)`,
    },

    figure: {
      margin: `1.5em 8px`,
      color: `var(--el-text-color-regular)`,
    },
    hr: {
      'border-style': `solid`,
      'border-width': `1px 0 0`,
      'border-color': `rgba(0,0,0,0.1)`,
      '-webkit-transform-origin': `0 0`,
      '-webkit-transform': `scale(1, 0.5)`,
      'transform-origin': `0 0`,
      'transform': `scale(1, 0.5)`,
    },
  },
  inline: {
    listitem: {
      'text-indent': `-1em`,
      'display': `block`,
      'margin': `0.2em 8px`,
      'color': `var(--el-text-color-regular)`,
    },

    codespan: {
      'font-size': `90%`,
      'color': `#d14`,
      'background': `rgba(27,31,35,.05)`,
      'padding': `3px 5px`,
      'border-radius': `4px`,
      // 'word-break': `break-all`,
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
      'color': `rgba(15, 76, 129, 0.9)`,
      'font-weight': `bold`,
    },

    table: {
      'border-collapse': `collapse`,
      'text-align': `center`,
      'margin': `1em 8px`,
      'color': `var(--el-text-color-regular)`,
    },

    thead: {
      'background': `rgba(0, 0, 0, 0.05)`,
      'font-weight': `bold`,
      'color': `var(--el-text-color-regular)`,
    },

    td: {
      border: `1px solid #dfdfdf`,
      padding: `0.25em 0.5em`,
      color: baseColor,
    },

    footnote: {
      'font-size': `12px`,
      'color': `var(--el-text-color-regular)`,
    },

    figcaption: {
      'text-align': `center`,
      'color': `#888`,
      'font-size': `0.8em`,
    },
  },
}

const graceTheme = mergeTheme(defaultTheme, {
  BASE: {
    'text-align': `left`,
    'line-height': `1.75`,
  },
  block: {
    h1: {
      'font-size': `1.4em`,
      'text-align': `center`,
      'font-weight': `bold`,
      'display': `table`,
      'margin': `2em auto 1em`,
      'padding': `0.5em 1em`,
      'border-bottom': `2px solid ${baseBorderColor}`,
      'color': `var(--el-text-color-regular)`,
      'text-shadow': `2px 2px 4px rgba(0,0,0,0.1)`,
    },

    h2: {
      'font-size': `1.3em`,
      'text-align': `center`,
      'font-weight': `bold`,
      'display': `table`,
      'margin': `4em auto 2em`,
      'padding': `0.3em 1em`,
      'background': `${baseBorderColor}`,
      'color': `#fff`,
      'border-radius': `8px`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.1)`,
    },

    h3: {
      'font-weight': `bold`,
      'font-size': `1.2em`,
      'margin': `2em 8px 0.75em 0`,
      'line-height': `1.2`,
      'padding-left': `12px`,
      'border-left': `4px solid ${baseBorderColor}`,
      'border-bottom': `1px solid ${baseBorderColor}`,
      'color': `var(--el-text-color-regular)`,
    },

    h4: {
      'font-weight': `bold`,
      'font-size': `1.1em`,
      'margin': `2em 8px 0.5em`,
      'color': `rgba(66, 185, 131, 0.9)`,
    },

    p: {
      'margin': `1.5em 8px`,
      'letter-spacing': `0.1em`,
      'color': `var(--el-text-color-regular)`,
      'text-align': `justify`,
    },

    blockquote: {
      'font-style': `italic`,
      'border-left': `4px solid ${baseBorderColor}`,
      'padding': `1em 1em 1em 2em`,
      'border-radius': `6px`,
      'color': `rgba(0,0,0,0.6)`,
      'background': `linear-gradient(to right, #f7f7f7, #ffffff)`,
      'margin': `2em 8px`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.05)`,
    },

    blockquote_p: {
      'letter-spacing': `0.1em`,
      'color': `rgb(80, 80, 80)`,
      'font-size': `1em`,
      'display': `block`,
    },

    code_pre: {
      'font-size': `14px`,
      'overflow-x': `auto`,
      'border-radius': `8px`,
      'padding': `1em`,
      'line-height': `1.5`,
      'margin': `10px 8px`,
      'box-shadow': `inset 0 0 10px rgba(0,0,0,0.05)`,
    },

    code: {
      'margin': 0,
      'white-space': `pre-wrap`,
      'font-family': `'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace`,
    },

    image: {
      'border-radius': `8px`,
      'display': `block`,
      'margin': `0.1em auto 0.5em`,
      'width': `100% !important`,
      'box-shadow': `0 4px 8px rgba(0,0,0,0.1)`,
    },

    ol: {
      'margin-left': `0`,
      'padding-left': `1.5em`,
      'color': `var(--el-text-color-regular)`,
    },

    ul: {
      'margin-left': `0`,
      'padding-left': `1.5em`,
      'list-style': `none`,
      'color': `var(--el-text-color-regular)`,
    },

    hr: {
      border: `none`,
      height: `1px`,
      background: `linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,0))`,
      margin: `2em 0`,
    },
  },
  inline: {
    listitem: {
      'text-indent': `-1em`,
      'display': `block`,
      'margin': `0.5em 8px`,
      'color': `var(--el-text-color-regular)`,
    },

    codespan: {
      'font-size': `90%`,
      'color': `#d14`,
      'background': `rgba(27,31,35,.05)`,
      'padding': `3px 5px`,
      'border-radius': `4px`,
    },

    link: {
      color: `#576b95`,
    },

    wx_link: {
    },

    strong: {
      'color': `rgba(15, 76, 129, 0.9)`,
      'font-weight': `bold`,
    },

    table: {
      'border-collapse': `separate`,
      'border-spacing': `0`,
      'text-align': `center`,
      'margin': `1em 8px`,
      'color': `var(--el-text-color-regular)`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.1)`,
      'border-radius': `8px`,
      'overflow': `hidden`,
    },

    thead: {
      'background': `linear-gradient(45deg, rgba(0, 152, 116, 0.9), rgba(0, 192, 146, 0.9))`,
      'color': `#fff`,
      'font-weight': `bold`,
    },

    td: {
      border: `1px solid #dfdfdf`,
      padding: `0.5em 1em`,
      color: baseColor,
    },

    footnote: {
      'font-size': `12px`,
      'color': `rgba(0,0,0,0.5)`,
    },
  },
})

export const themeOptions = [
  {
    label: `经典`,
    value: `default`,
    desc: ``,
  },
  {
    label: `优雅`,
    value: `grace`,
    desc: ``,
  },
]

export const themeMap = {
  default: defaultTheme,
  grace: graceTheme,
}
