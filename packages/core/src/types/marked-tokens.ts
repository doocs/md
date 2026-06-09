import type { RendererExtensionFunction, RendererThis, Token, Tokens } from 'marked'

/** Base shape shared by custom block/inline extension tokens. */
export interface TextToken {
  type: string
  raw: string
  text: string
}

export interface MermaidToken extends TextToken {
  type: 'mermaid'
}

export interface InfographicToken extends TextToken {
  type: 'infographic'
}

export interface PlantUMLToken extends TextToken {
  type: 'plantuml'
}

export interface MarkupHighlightToken extends TextToken {
  type: 'markup_highlight'
}

export interface MarkupUnderlineToken extends TextToken {
  type: 'markup_underline'
}

export interface MarkupWavylineToken extends TextToken {
  type: 'markup_wavyline'
}

export interface RubyToken extends TextToken {
  type: 'ruby'
  ruby: string
  format: 'basic' | 'basic-hat'
}

export interface KatexToken extends TextToken {
  type: 'inlineKatex' | 'blockKatex' | 'inlineLatexKatex' | 'blockLatexKatex'
  displayMode?: boolean
}

export type KatexRenderFn = (token: KatexToken) => string

export interface AlertMeta {
  className: string
  variant: string
  icon: string
  title: string
  titleClassName: string
  fromContainer: boolean
}

export interface AlertToken extends Tokens.Generic {
  type: 'alert'
  text: string
  tokens?: Token[]
  meta: AlertMeta
}

export type AlertRendererThis = RendererThis
export type AlertRendererFn = (this: AlertRendererThis, token: AlertToken) => string

/** Adapt a typed renderer to marked's Tokens.Generic signature. */
export function asTextTokenRenderer<T extends TextToken>(
  fn: (token: T) => string,
): RendererExtensionFunction {
  return (token: Tokens.Generic) => fn(token as T)
}

/** Adapt a typed KaTeX renderer to marked's Tokens.Generic signature. */
export function asKatexRenderer(fn: KatexRenderFn): RendererExtensionFunction {
  return (token: Tokens.Generic) => fn(token as KatexToken)
}

/** Adapt a typed alert renderer (uses `this.parser`) to marked's signature. */
export function asAlertRenderer(fn: AlertRendererFn): RendererExtensionFunction {
  return function (this: AlertRendererThis, token: Tokens.Generic) {
    return fn.call(this, token as AlertToken)
  }
}

/** Narrow a marked token to a fenced code block. */
export function isCodeToken(token: Token): token is Tokens.Code {
  return token.type === 'code'
}

/** Re-type a code block token for diagram extensions (mermaid, plantuml, infographic). */
export function asDiagramToken<T extends TextToken>(
  token: Tokens.Code,
  type: T['type'],
): T {
  return Object.assign(token, { type }) as unknown as T
}
