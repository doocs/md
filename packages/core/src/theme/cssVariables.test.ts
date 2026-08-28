import { describe, expect, it } from 'vitest'
import { processCSS } from './cssProcessor'
import { generateCSSVariables } from './cssVariables'

const baseConfig = {
  primaryColor: `#0F4C81`,
  fontFamily: `sans-serif`,
  fontSize: `16px`,
}

describe(`generateCSSVariables`, () => {
  it(`emits the typography variables`, () => {
    const css = generateCSSVariables({
      ...baseConfig,
      lineHeight: `1.9`,
      blockSpacing: `1.15`,
    })

    expect(css).toContain(`--md-line-height: 1.9;`)
    expect(css).toContain(`--md-block-spacing: 1.15;`)
  })

  it(`falls back to defaults when callers omit the new options`, () => {
    const css = generateCSSVariables(baseConfig)

    expect(css).toContain(`--md-line-height: 1.75;`)
    expect(css).toContain(`--md-block-spacing: 1;`)
  })
})

describe(`block spacing resolution`, () => {
  // WeChat drops calc() and var(), so processCSS has to flatten both before juice
  // inlines the styles. These cases pin that the multiplier survives that pass.
  function resolve(declaration: string, blockSpacing?: string): string {
    const variables = generateCSSVariables({ ...baseConfig, blockSpacing })
    return processCSS(`${variables}\n\np { ${declaration} }`)
  }

  it(`flattens the multiplier into a literal length`, () => {
    expect(resolve(`margin: calc(1.5em * var(--md-block-spacing)) 8px;`, `1.15`))
      .toContain(`margin: 1.725em 8px;`)
  })

  it(`handles px margins and four-value shorthands`, () => {
    expect(resolve(`margin: calc(10px * var(--md-block-spacing)) 8px;`, `0.75`))
      .toContain(`margin: 7.5px 8px;`)
    expect(resolve(`margin: calc(2em * var(--md-block-spacing)) 8px calc(0.75em * var(--md-block-spacing)) 0;`, `0.9`))
      .toContain(`margin: 1.8em 8px 0.675em 0;`)
  })

  it(`leaves lengths unchanged at the default multiplier`, () => {
    expect(resolve(`margin: calc(1.5em * var(--md-block-spacing)) 8px;`))
      .toContain(`margin: 1.5em 8px;`)
  })

  it(`leaves no calc() or var() behind`, () => {
    const css = resolve(`margin: calc(4em * var(--md-block-spacing)) auto;`, `1.35`)

    expect(css).not.toContain(`calc(`)
    expect(css).not.toContain(`var(--md-block-spacing)`)
  })
})
