const inlineRule = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1(?=[\s?!.,:？！。，：]|$)/
const inlineRuleNonStandard = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1/ // Non-standard, even if there are no spaces before and after $ or $$, try to parse

const blockRule = /^\s{0,3}(\${1,2})[ \t]*\n([\s\S]+?)\n\s{0,3}\1[ \t]*(?:\n|$)/

function createRenderer(display, inlineStyle, blockStyle) {
  return (token) => {
    window.MathJax.texReset()
    const mjxContainer = window.MathJax.tex2svg(token.text, { display })
    const svg = mjxContainer.firstChild
    const width = svg.style[`min-width`] || svg.getAttribute(`width`)
    svg.removeAttribute(`width`)

    svg.style = `max-width: 300vw !important; display: initial; flex-shrink: 0;`
    svg.style.width = width

    if (!display) {
      return `<span ${inlineStyle}>${svg.outerHTML}</span>`
    }

    return `<section ${blockStyle}>${svg.outerHTML}</section>`
  }
}

function inlineKatex(options, renderer) {
  const nonStandard = options && options.nonStandard
  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule
  return {
    name: `inlineKatex`,
    level: `inline`,
    start(src) {
      let index
      let indexSrc = src

      while (indexSrc) {
        index = indexSrc.indexOf(`$`)
        if (index === -1) {
          return
        }
        const f = nonStandard ? index > -1 : index === 0 || indexSrc.charAt(index - 1) === ` `
        if (f) {
          const possibleKatex = indexSrc.substring(index)

          if (possibleKatex.match(ruleReg)) {
            return index
          }
        }

        indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, ``)
      }
    },
    tokenizer(src) {
      const match = src.match(ruleReg)
      if (match) {
        return {
          type: `inlineKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2,
        }
      }
    },
    renderer,
  }
}

function blockKatex(options, renderer) {
  return {
    name: `blockKatex`,
    level: `block`,
    tokenizer(src) {
      const match = src.match(blockRule)
      if (match) {
        return {
          type: `blockKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2,
        }
      }
    },
    renderer,
  }
}

export function MDKatex(options, inlineStyle, blockStyle) {
  return {
    extensions: [
      inlineKatex(options, createRenderer(false, inlineStyle, blockStyle)),
      blockKatex(options, createRenderer(true, inlineStyle, blockStyle)),
    ],
  }
}
