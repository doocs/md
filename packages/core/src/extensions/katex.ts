/// <reference path="../mathjax.d.ts" />
import type { MarkedExtension } from 'marked'
import type { KatexRenderFn, KatexToken } from '../types/marked-tokens'
import { asKatexRenderer } from '../types/marked-tokens'
import { escapeHtml } from '../utils/basicHelpers'

export interface MarkedKatexOptions {
  nonStandard?: boolean
}

const inlineRule = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1(?=[\s?!.,:？！。，：]|$)/
// Non-standard: allow tight `$...$`; amount-like `$` is filtered in findInlineKatexStart
const inlineRuleNonStandard = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1/

/** nonStandard 模式下，跳过更像金额后缀的 `$` */
function isAmountDollarSign(src: string, index: number): boolean {
  if (index <= 0)
    return false
  const prev = src.charAt(index - 1)
  if (/[\d,.]/.test(prev))
    return true
  return prev === ` ` && index >= 2 && /\d/.test(src.charAt(index - 2))
}

function isInlineKatexStart(src: string, index: number, nonStandard: boolean): boolean {
  if (nonStandard)
    return !isAmountDollarSign(src, index)
  return index === 0 || src.charAt(index - 1) === ` `
}

function findInlineKatexStart(src: string, nonStandard: boolean, ruleReg: RegExp): number | undefined {
  let indexSrc = src
  let offset = 0

  while (indexSrc) {
    const index = indexSrc.indexOf(`$`)
    if (index === -1)
      return

    if (isInlineKatexStart(indexSrc, index, nonStandard)) {
      const possibleKatex = indexSrc.substring(index)
      if (possibleKatex.match(ruleReg))
        return offset + index
    }

    const next = indexSrc.substring(index + 1).replace(/^\$+/, ``)
    offset += indexSrc.length - next.length
    indexSrc = next
  }
}

const blockRule = /^\s{0,3}(\${1,2})[ \t]*\n([\s\S]+?)\n\s{0,3}\1[ \t]*(?:\n|$)/

// LaTeX style rules for \( ... \) and \[ ... \]
const inlineLatexRule = /^\\\(([^\\]*(?:\\.[^\\]*)*?)\\\)/
const blockLatexRule = /^\\\[([^\\]*(?:\\.[^\\]*)*?)\\\]/

function createRenderer(defaultDisplay: boolean, withStyle: boolean = true): KatexRenderFn {
  return (token: KatexToken) => {
    const display = token.displayMode ?? defaultDisplay

    window.MathJax.texReset()
    const mjxContainer = window.MathJax.tex2svg(token.text, { display })
    const svg = mjxContainer.firstChild
    const width = svg.style[`min-width`] || svg.getAttribute(`width`)
    svg.removeAttribute(`width`)

    // 行内公式对齐 https://groups.google.com/g/mathjax-users/c/zThKffrrCvE?pli=1
    // 直接覆盖 style 会覆盖 MathJax 的样式，需要逐个属性设置

    if (withStyle) {
      svg.style.display = `initial`
      svg.style.setProperty(`max-width`, `300vw`, `important`)
      svg.style.flexShrink = `0`
      svg.style.width = width || ``
    }

    if (!display) {
      // 新主题系统：使用 class 而非内联样式
      return `<span class="katex-inline" data-math-display="false" data-math-raw="${escapeHtml(token.raw ?? token.text)}">${svg.outerHTML}</span>`
    }

    return `<section class="katex-block" data-math-display="true" data-math-raw="${escapeHtml(token.raw ?? token.text)}">${svg.outerHTML}</section>`
  }
}

function inlineKatex(options: MarkedKatexOptions | undefined, renderer: KatexRenderFn) {
  const nonStandard = options && options.nonStandard
  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule
  return {
    name: `inlineKatex`,
    level: `inline` as const,
    start(src: string) {
      return findInlineKatexStart(src, !!nonStandard, ruleReg)
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
    renderer: asKatexRenderer(renderer),
  }
}

function blockKatex(_options: MarkedKatexOptions | undefined, renderer: KatexRenderFn) {
  return {
    name: `blockKatex`,
    level: `block` as const,
    tokenizer(src: string) {
      const match = src.match(blockRule)
      if (match) {
        return {
          type: `blockKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: true,
        }
      }
    },
    renderer: asKatexRenderer(renderer),
  }
}

function inlineLatexKatex(_options: MarkedKatexOptions | undefined, renderer: KatexRenderFn) {
  return {
    name: `inlineLatexKatex`,
    level: `inline` as const,
    start(src: string) {
      const index = src.indexOf(`\\(`)
      return index !== -1 ? index : undefined
    },
    tokenizer(src: string) {
      const match = src.match(inlineLatexRule)
      if (match) {
        return {
          type: `inlineLatexKatex`,
          raw: match[0],
          text: match[1].trim(),
          displayMode: false,
        }
      }
    },
    renderer: asKatexRenderer(renderer),
  }
}

function blockLatexKatex(_options: MarkedKatexOptions | undefined, renderer: KatexRenderFn) {
  return {
    name: `blockLatexKatex`,
    level: `block` as const,
    start(src: string) {
      const index = src.indexOf(`\\[`)
      return index !== -1 ? index : undefined
    },
    tokenizer(src: string) {
      const match = src.match(blockLatexRule)
      if (match) {
        return {
          type: `blockLatexKatex`,
          raw: match[0],
          text: match[1].trim(),
          displayMode: true,
        }
      }
    },
    renderer: asKatexRenderer(renderer),
  }
}

export function MDKatex(options: MarkedKatexOptions | undefined, withStyle: boolean = true): MarkedExtension {
  return {
    extensions: [
      inlineKatex(options, createRenderer(false, withStyle)),
      blockKatex(options, createRenderer(true, withStyle)),
      inlineLatexKatex(options, createRenderer(false, withStyle)),
      blockLatexKatex(options, createRenderer(true, withStyle)),
    ],
  }
}
