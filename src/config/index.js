export const prefix = `MD`

export const fontFamilyOptions = [
  {
    label: `无衬线`,
    value: `-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif`,
    desc: `字体123Abc`,
  },
  {
    label: `衬线`,
    value: `Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif`,
    desc: `字体123Abc`,
  },
  {
    label: `等宽`,
    value: `Menlo, Monaco, 'Courier New', monospace`,
    desc: `字体123Abc`,
  },
]

export const fontSizeOptions = [
  {
    label: `12px`,
    value: `12px`,
    desc: `更小`,
  },
  {
    label: `13px`,
    value: `13px`,
    desc: `稍小`,
  },
  {
    label: `14px`,
    value: `14px`,
    desc: `推荐`,
  },
  {
    label: `15px`,
    value: `15px`,
    desc: `稍大`,
  },
  {
    label: `16px`,
    value: `16px`,
    desc: `更大`,
  },
]

export const colorOptions = [
  {
    label: `经典蓝`,
    value: `rgba(15, 76, 129, 1)`,
    desc: `最新流行`,
  },
  {
    label: `翡翠绿`,
    value: `rgba(0, 152, 116, 1)`,
    desc: `优雅清新`,
  },
  {
    label: `活力橘`,
    value: `rgba(250, 81, 81, 1)`,
    desc: `热情活泼`,
  },
  // { label: `微信绿`, value: `rgb(26, 173, 25,1)`, desc: `经典微信绿` },
]

export const codeBlockThemeOptions = [
  {
    label: `github`,
    value: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlight.js@11.5.1/styles/github.min.css`,
    desc: `light`,
  },
  {
    label: `solarized-light`,
    value: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlight.js@11.5.1/styles/solarized-light.min.css`,
    desc: `light`,
  },
  {
    label: `atom-one-dark`,
    value: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlight.js@11.5.1/styles/atom-one-dark.min.css`,
    desc: `dark`,
  },
  {
    label: `obsidian`,
    value: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlight.js@11.5.1/styles/obsidian.min.css`,
    desc: `dark`,
  },
  {
    label: `vs2015`,
    value: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlight.js@11.5.1/styles/vs2015.min.css`,
    desc: `dark`,
  },
]

export const legendOptions = [
  {
    label: `title 优先`,
    value: `title-alt`,
    desc: ``,
  },
  {
    label: `alt 优先`,
    value: `alt-title`,
    desc: ``,
  },
  {
    label: `只显示 title`,
    value: `title`,
    desc: ``,
  },
  {
    label: `只显示 alt`,
    value: `alt`,
    desc: ``,
  },
  {
    label: `不显示`,
    value: `none`,
    desc: ``,
  },
]

export const githubConfig = {
  username: `filess`,
  repoList: Array.from(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    e => `img${e}`,
  ),
  branch: `main`,
  accessTokenList: [
    `7715d7ca67b5d3837cfdoocsmde8c38421815aa423510af`,
    `c411415bf95dbe39625doocsmd5047ba9b7a2a6c9642abe`,
    `2821cd8819fa345c053doocsmdca86ac653f8bc20db1f1b`,
    `445f0dae46ef1f2a4d6doocsmdc797301e94797b4750a4c`,
    `cc1d0c1426d0fd0902bdoocsmdd2d7184b14da61b86ec46`,
    `b67e9d15cb6f910492fdoocsmdac6b44d379c953bb19eff`,
    `618c4dc2244ccbbc088doocsmd125d17fd31b7d06a50cf3`,
    `a4b581732e1c1507458doocsmdc5b223b27dae5e2e16a55`,
    `77904db41aee57ad79bdoocsmd760f848201dac9c96fd5e`,
    `02f251cb14ac62ab100doocsmdddbfc8527d773f1f04ce1`,
    `eb321079a95ba7028d9doocsmde2e84c502dac70de7cf08`,
    `22f74fcfb071a961fa2doocsmde28dabc746f0503a15e5d`,
    `85124c2bfe7abba0938doocsmd0af7f67918b99d085a5fd`,
    `0a561b4d4bbecb2de7edoocsmdd9ba3833d11dbc5e430f5`,
    `e8a01491188d8d5a097doocsmd03ede0aad1fe9e3af24e9`,
    `36e1f420d7e5bdebd67doocsmd65463562f5f25b20b8377`,
  ],
}

export const giteeConfig = {
  username: `filesss`,
  repoList: Array.from(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    e => `img${e}`,
  ),
  branch: `main`,
  accessTokenList: [
    `ed5fc9866bd6c2fdoocsmddd433f806fd2f399c`,
    `5448ffebbbf1151doocsmdc4e337cf814fc8a62`,
    `25b05efd2557ca2doocsmd75b5c0835e3395911`,
    `11628c7a5aef015doocsmd2eeff9fb9566f0458`,
    `cb2f5145ed938dedoocsmdbd063b4ed244eecf8`,
    `d8c0b57500672c1doocsmd55f48b866b5ebcd98`,
    `78c56eadb88e453doocsmd43ddd95753351771a`,
    `03e1a688003948fdoocsmda16fcf41e6f03f1f0`,
    `c49121cf4d191fbdoocsmdd6a7877ed537e474a`,
    `adfeb2fadcdc4aadoocsmdfe1ee869ac9c968ff`,
    `116c94549ca4a0ddoocsmd192653af5c0694616`,
    `ecf30ed7f2eb184doocsmd51ea4ec8300371d9e`,
    `5837cf2bd5afd93doocsmd73904bed31934949e`,
    `b5b7e1c7d57e01fdoocsmd5266f552574297d78`,
    `684d55564ffbd0bdoocsmd7d747e5cc23aed6d6`,
    `3fc04a9d272ab71doocsmd010c56cb57d88d2ba`,
  ],
}

const baseColor = `#3f3f3f`

export const defaultTheme = {
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
