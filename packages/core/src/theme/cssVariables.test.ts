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

describe(`link colour`, () => {
  it(`emits the configured colour`, () => {
    expect(generateCSSVariables({ ...baseConfig, linkColor: `inherit` }))
      .toContain(`--md-link-color: inherit;`)
  })

  it(`defaults to the WeChat blue every theme used to hard-code`, () => {
    expect(generateCSSVariables(baseConfig)).toContain(`--md-link-color: #576b95;`)
  })

  it(`resolves a var() reference down to the primary colour`, () => {
    const variables = generateCSSVariables({ ...baseConfig, linkColor: `var(--md-primary-color)` })
    const css = processCSS(`${variables}\n\na { color: var(--md-link-color); }`)

    expect(css).toContain(`color: #0F4C81;`)
    expect(css).not.toContain(`var(--md-link-color)`)
  })
})

describe(`blockquote background`, () => {
  const rule = `blockquote { background: var(--md-blockquote-background, var(--blockquote-background)); }`

  it(`is left undeclared for the theme default`, () => {
    expect(generateCSSVariables({ ...baseConfig, blockquoteBackground: `default` }))
      .not
      .toContain(`--md-blockquote-background`)
  })

  it(`falls through to the theme's own background when undeclared`, () => {
    // The web shell and VSCode preview both define --blockquote-background per
    // colour mode, so the fall-through has to survive processCSS untouched.
    const css = processCSS(`${generateCSSVariables(baseConfig)}\n\n${rule}`)

    expect(css).toContain(`background: var(--blockquote-background);`)
  })

  it(`overrides the theme background when set`, () => {
    const variables = generateCSSVariables({ ...baseConfig, blockquoteBackground: `transparent` })
    const css = processCSS(`${variables}\n\n${rule}`)

    expect(css).toContain(`background: transparent;`)
  })

  it(`resolves a nested primary colour inside color-mix`, () => {
    const variables = generateCSSVariables({
      ...baseConfig,
      blockquoteBackground: `color-mix(in srgb, var(--md-primary-color) 8%, transparent)`,
    })
    const css = processCSS(`${variables}\n\n${rule}`)

    expect(css).toContain(`background: color-mix(in srgb, #0F4C81 8%, transparent);`)
  })

  it(`keeps the background-free themes background-free by default`, () => {
    const css = processCSS(
      `${generateCSSVariables(baseConfig)}\n\nblockquote { background: var(--md-blockquote-background, transparent); }`,
    )

    expect(css).toContain(`background: transparent;`)
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
