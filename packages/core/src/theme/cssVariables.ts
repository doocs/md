/** Dynamic CSS variable generation from editor config */

import type { HeadingLevel, HeadingStyles, HeadingStyleType } from '@md/shared/configs'

export interface CSSVariableConfig {
  primaryColor: string
  fontFamily: string
  fontSize: string
  /** Body line height, unitless. */
  lineHeight?: string
  /** Multiplier for the vertical block margins defined by the theme. */
  blockSpacing?: string
  isUseIndent?: boolean
  isUseJustify?: boolean
  headingStyles?: HeadingStyles
}

/** Kept in sync with defaultStyleConfig; optional so existing callers (VSCode preview, theme export) need no change. */
const DEFAULT_LINE_HEIGHT = `1.75`
const DEFAULT_BLOCK_SPACING = `1`

export function generateCSSVariables(config: CSSVariableConfig): string {
  return `
:root {
  /* Theme config */
  --md-primary-color: ${config.primaryColor};
  --md-font-family: ${config.fontFamily};
  --md-font-size: ${config.fontSize};
  --md-line-height: ${config.lineHeight || DEFAULT_LINE_HEIGHT};
  --md-block-spacing: ${config.blockSpacing || DEFAULT_BLOCK_SPACING};
}

/* Paragraph indent & justify */
#output p {
  ${config.isUseIndent ? 'text-indent: 2em;' : ''}
  ${config.isUseJustify ? 'text-align: justify;' : ''}
}
  `.trim()
}

/** Heading preset CSS (apply after theme CSS) */
export function generateHeadingStyles(config: CSSVariableConfig): string {
  return generateHeadingStylesCSS(config.headingStyles)
}

function generateHeadingStylesCSS(headingStyles?: HeadingStyles): string {
  if (!headingStyles)
    return ``

  const levels: HeadingLevel[] = [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`]
  const cssRules: string[] = []

  for (const level of levels) {
    const style = headingStyles[level]
    // Custom styles are edited in CSS editor; only preset types here
    if (style && style !== `default` && style !== `custom`) {
      cssRules.push(generateHeadingCSS(level, style))
    }
  }

  return cssRules.join(`\n\n`)
}

function generateHeadingCSS(level: HeadingLevel, style: HeadingStyleType): string {
  const baseStyles = `
  display: block;
  text-align: left;
  background: transparent;`

  switch (style) {
    case `color-only`:
      return `#output ${level} {
  color: var(--md-primary-color);
  background: transparent;
}`

    case `border-bottom`:
      return `#output ${level} {${baseStyles}
  padding-bottom: 0.3em;
  border-bottom: 2px solid var(--md-primary-color);
  color: var(--md-primary-color);
}`

    case `border-left`:
      return `#output ${level} {${baseStyles}
  margin-left: 0;
  padding-left: 10px;
  border-left: 4px solid var(--md-primary-color);
  color: var(--md-primary-color);
}`

    default:
      return ``
  }
}
