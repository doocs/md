let baseColor = `#3f3f3f`
let baseBorderColor = `rgba(215, 16, 166, 0.8)`

export default {
  BASE: {
    'text-align': `left`,
    'line-height': `1.75`,
  },
  block: {
    h1: {
      'font-size': `1.4em`,
      'text-align': `center`,
      'font-weight': `bold`,
      display: `table`,
      margin: `2em auto 1em`,
      padding: `0.5em 1em`,
      'border-bottom': `2px solid ${baseBorderColor}`,
      color: baseColor,
      'text-shadow': `2px 2px 4px rgba(0,0,0,0.1)`,
      transition: `all 0.3s ease`,
      '&:hover': {
        transform: `translateY(-3px)`,
        'box-shadow': `0 10px 20px rgba(0,0,0,0.1)`,
      },
    },

    h2: {
      'font-size': `1.3em`,
      'text-align': `center`,
      'font-weight': `bold`,
      display: `table`,
      margin: `4em auto 2em`,
      padding: `0.3em 1em`,
      background: `${baseBorderColor}`,
      color: `#fff`,
      'border-radius': `8px`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.1)`,
      transition: `all 0.3s ease`,
      '&:hover': {
        transform: `scale(1.05)`,
        'box-shadow': `0 6px 8px rgba(0,0,0,0.15)`,
      },
    },

    h3: {
      'font-weight': `bold`,
      'font-size': `1.2em`,
      margin: `2em 8px 0.75em 0`,
      'line-height': `1.2`,
      'padding-left': `12px`,
      'border-left': `4px solid ${baseBorderColor}`,
      'border-bottom': `1px solid ${baseBorderColor}`,
      color: baseColor,
      transition: `all 0.3s ease`,
      '&:hover': {
        'padding-left': `16px`,
        'border-left-width': `6px`,
      },
    },

    h4: {
      'font-weight': `bold`,
      'font-size': `1.1em`,
      margin: `2em 8px 0.5em`,
      color: `rgba(66, 185, 131, 0.9)`,
      transition: `color 0.3s ease`,
      '&:hover': {
        color: `rgba(66, 185, 131, 1)`,
      },
    },

    p: {
      margin: `1.5em 8px`,
      'letter-spacing': `0.1em`,
      color: baseColor,
      'text-align': `justify`,
      transition: `all 0.3s ease`,
      '&:hover': {
        transform: `translateX(3px)`,
      },
    },

    blockquote: {
      'font-style': `italic`,
      'border-left': `4px solid ${baseBorderColor}`,
      padding: `1em 1em 1em 2em`,
      'border-radius': `6px`,
      color: `rgba(0,0,0,0.6)`,
      background: `linear-gradient(to right, #f7f7f7, #ffffff)`,
      margin: `2em 8px`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.05)`,
      transition: `all 0.3s ease`,
      '&:hover': {
        transform: `translateY(-3px)`,
        'box-shadow': `0 6px 8px rgba(0,0,0,0.1)`,
      },
    },

    blockquote_p: {
      'letter-spacing': `0.1em`,
      color: `rgb(80, 80, 80)`,
      'font-size': `1em`,
      display: `block`,
    },

    code_pre: {
      'font-size': `14px`,
      'overflow-x': `auto`,
      'border-radius': `8px`,
      padding: `1em`,
      'line-height': `1.5`,
      margin: `10px 8px`,
      background: `#f4f4f4`,
      'box-shadow': `inset 0 0 10px rgba(0,0,0,0.05)`,
      transition: `all 0.3s ease`,
      '&:hover': {
        'box-shadow': `inset 0 0 15px rgba(0,0,0,0.1)`,
      },
    },

    code: {
      margin: 0,
      'white-space': `pre-wrap`,
      'font-family': `'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace`,
    },

    image: {
      'border-radius': `8px`,
      display: `block`,
      margin: `0.1em auto 0.5em`,
      width: `100% !important`,
      'box-shadow': `0 4px 8px rgba(0,0,0,0.1)`,
      transition: `all 0.3s ease`,
      '&:hover': {
        transform: `scale(1.02)`,
        'box-shadow': `0 6px 12px rgba(0,0,0,0.15)`,
      },
    },

    ol: {
      'margin-left': `0`,
      'padding-left': `1.5em`,
      color: baseColor,
    },

    ul: {
      'margin-left': `0`,
      'padding-left': `1.5em`,
      'list-style': `none`,
      color: baseColor,
    },

    'ul li::before': {
      content: `"•"`,
      color: `rgba(0, 152, 116, 0.9)`,
      'font-weight': `bold`,
      display: `inline-block`,
      width: `1em`,
      'margin-left': `-1em`,
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
      display: `block`,
      margin: `0.5em 8px`,
      color: baseColor,
      transition: `all 0.3s ease`,
      '&:hover': {
        transform: `translateX(5px)`,
      },
    },

    codespan: {
      'font-size': `90%`,
      color: `#d14`,
      background: `rgba(27,31,35,.05)`,
      padding: `3px 5px`,
      'border-radius': `4px`,
      transition: `all 0.3s ease`,
      '&:hover': {
        background: `rgba(27,31,35,.1)`,
      },
    },

    link: {
      color: `#576b95`,
      transition: `all 0.3s ease`,
      '&:hover': {
        color: `#1a3f6f`,
        'text-decoration': `underline`,
      },
    },

    strong: {
      color: `rgba(15, 76, 129, 0.9)`,
      'font-weight': `bold`,
      transition: `all 0.3s ease`,
      '&:hover': {
        color: `rgba(15, 76, 129, 1)`,
        'text-shadow': `1px 1px 2px rgba(15, 76, 129, 0.2)`,
      },
    },

    table: {
      'border-collapse': `separate`,
      'border-spacing': `0`,
      'text-align': `center`,
      margin: `1em 8px`,
      color: baseColor,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.1)`,
      'border-radius': `8px`,
      overflow: `hidden`,
    },

    thead: {
      background: `linear-gradient(45deg, rgba(0, 152, 116, 0.9), rgba(0, 192, 146, 0.9))`,
      color: `#fff`,
      'font-weight': `bold`,
    },

    td: {
      border: `1px solid #dfdfdf`,
      padding: `0.5em 1em`,
      color: baseColor,
      transition: `all 0.3s ease`,
    },

    'tr:hover td': {
      background: `rgba(0, 152, 116, 0.05)`,
    },

    footnote: {
      'font-size': `12px`,
      color: `rgba(0,0,0,0.5)`,
      transition: `all 0.3s ease`,
      '&:hover': {
        color: `rgba(0,0,0,0.7)`,
      },
    },
  },
}
