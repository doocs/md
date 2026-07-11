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
  /** Locale-aware loading placeholder; falls back to English */
  getKatexLoadingMessage?: () => string | undefined
}

const DEFAULT_KATEX_LOADING = `Loading formula…`

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

function createRenderer(
  defaultDisplay: boolean,
  withStyle: boolean = true,
  getKatexLoadingMessage?: () => string | undefined,
): KatexRenderFn {
  return (token: KatexToken) => {
    const display = token.displayMode ?? defaultDisplay
    const rawAttr = escapeHtml(token.raw ?? token.text)

    if (typeof window === `undefined` || !isMathJaxReady()) {
      requestMathJaxLoad()

      if (display) {
        const loading = getKatexLoadingMessage?.() || DEFAULT_KATEX_LOADING
        return `<section class="katex-block katex-pending" data-math-display="true" data-math-raw="${rawAttr}"><span>${escapeHtml(loading)}</span></section>`
      }

      return `<span class="katex-inline katex-pending" data-math-display="false" data-math-raw="${rawAttr}"><span>…</span></span>`
    }

    window.MathJax.texReset()
    const mjxContainer = window.MathJax.tex2svg(token.text, { display })
    const svg = mjxContainer.firstChild
    const width = svg.style[`min-width`] || svg.getAttribute(`width`)
    svg.removeAttribute(`width`)

    // Inline math vertical align: https://groups.google.com/g/mathjax-users/c/zThKffrrCvE?pli=1
    // Set properties individually; assigning style overwrites MathJax defaults

    if (withStyle) {
      svg.style.display = `initial`
      svg.style.setProperty(`max-width`, `300vw`, `important`)
      svg.style.flexShrink = `0`
      svg.style.width = width || ``
    }

    const firstG = svg.querySelector(`g`)
    if (firstG) {
      firstG.style.fill = `currentColor`
      firstG.style.stroke = `currentColor`
    }

    if (!display) {
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
      const index = src.search(/^\s{0,3}\$\$/m)
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
  const getLoading = options?.getKatexLoadingMessage
  return {
    extensions: [
      inlineKatex(options, createRenderer(false, withStyle, getLoading)),
      blockKatex(options, createRenderer(true, withStyle, getLoading)),
      inlineLatexKatex(options, createRenderer(false, withStyle, getLoading)),
      blockLatexKatex(options, createRenderer(true, withStyle, getLoading)),
    ],
  }
}
