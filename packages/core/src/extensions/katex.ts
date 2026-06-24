/// <reference path="../mathjax.d.ts" />
import type { MarkedExtension } from 'marked'
import type { KatexRenderFn, KatexToken } from '../types/marked-tokens'
import { asKatexRenderer } from '../types/marked-tokens'
import { escapeHtml } from '../utils/basicHelpers'
import {
  blockLatexRule,
  findInlineKatexStart,
  inlineLatexRule,
  inlineRule,
  inlineRuleNonStandard,
  matchBlockKatex,
} from '../utils/mathDetection'
import { ensureMathJaxLoaded, isMathJaxReady } from '../utils/mathjax'

export interface MarkedKatexOptions {
  nonStandard?: boolean
}

let mathJaxLoadRequested = false

function requestMathJaxLoad() {
  if (isMathJaxReady())
    return
  if (mathJaxLoadRequested)
    return

  mathJaxLoadRequested = true
  ensureMathJaxLoaded()
    .catch((error) => {
      mathJaxLoadRequested = false
      console.error(error)
    })
}

function createRenderer(defaultDisplay: boolean, withStyle: boolean = true): KatexRenderFn {
  return (token: KatexToken) => {
    const display = token.displayMode ?? defaultDisplay
    const rawAttr = escapeHtml(token.raw ?? token.text)

    if (typeof window === `undefined` || !isMathJaxReady()) {
      requestMathJaxLoad()

      if (display) {
        return `<section class="katex-block katex-pending" data-math-display="true" data-math-raw="${rawAttr}"><span>正在加载公式…</span></section>`
      }

      return `<span class="katex-inline katex-pending" data-math-display="false" data-math-raw="${rawAttr}"><span>…</span></span>`
    }

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
    start(src: string) {
      const index = src.search(/^\s{0,3}\${1,2}/m)
      return index === -1 ? undefined : index
    },
    tokenizer(src: string) {
      const match = matchBlockKatex(src)
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
