import type { MarkedExtension } from 'marked'

export interface MarkedKatexOptions {
  nonStandard?: boolean
}

const inlineRule = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1(?=[\s?!.,:？！。，：]|$)/
const inlineRuleNonStandard = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1/ // Non-standard, even if there are no spaces before and after $ or $$, try to parse

const blockRule = /^\s{0,3}(\${1,2})[ \t]*\n([\s\S]+?)\n\s{0,3}\1[ \t]*(?:\n|$)/

function createRenderer(display: boolean, inlineStyle: string, blockStyle: string): (token: any) => string {
  return (token: any) => {
    // @ts-expect-error MathJax is a global variable
    window.MathJax.texReset()
    // @ts-expect-error MathJax is a global variable
    const mjxContainer = window.MathJax.tex2svg(token.text, { display })
    const svg = mjxContainer.firstChild
    const width = svg.style[`min-width`] || svg.getAttribute(`width`)
    svg.removeAttribute(`width`)

    // 行内公式对齐 https://groups.google.com/g/mathjax-users/c/zThKffrrCvE?pli=1
    // 直接覆盖 style 会覆盖 MathJax 的样式，需要手动设置
    // svg.style = `max-width: 300vw !important; display: initial; flex-shrink: 0;`

    svg.style.display = `initial`
    svg.style.maxWidth = `300vw`
    svg.style.flexShrink = `0`
    svg.style.width = width

    if (!display) {
      return `<span ${inlineStyle}>${svg.outerHTML}</span>`
    }

    return `<section ${blockStyle}>${svg.outerHTML}</section>`
  }
}

function inlineKatex(options: MarkedKatexOptions | undefined, renderer: any) {
  const nonStandard = options && options.nonStandard
  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule
  return {
    name: `inlineKatex`,
    level: `inline`,
    start(src: string) {
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
    tokenizer(src: string) {
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

function blockKatex(_options: MarkedKatexOptions | undefined, renderer: any) {
  return {
    name: `blockKatex`,
    level: `block`,
    tokenizer(src: string) {
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

export function MDKatex(options: MarkedKatexOptions | undefined, inlineStyle: string, blockStyle: string): MarkedExtension {
  return {
    extensions: [
      inlineKatex(options, createRenderer(false, inlineStyle, blockStyle)),
      blockKatex(options, createRenderer(true, inlineStyle, blockStyle)),
    ],
  }
}
