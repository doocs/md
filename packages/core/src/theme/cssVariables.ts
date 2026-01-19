/**
 * CSS 变量生成工具
 * 根据配置动态生成 CSS 变量样式
 */

import type { HeadingLevel, HeadingStyles, HeadingStyleType } from '@md/shared/configs'

export interface CSSVariableConfig {
  primaryColor: string
  fontFamily: string
  fontSize: string
  isUseIndent?: boolean
  isUseJustify?: boolean
  headingStyles?: HeadingStyles
}

/**
 * 生成 CSS 变量样式
 * @param config - 配置对象
 * @returns CSS 变量字符串
 */
export function generateCSSVariables(config: CSSVariableConfig): string {
  return `
:root {
  /* 动态配置变量 */
  --md-primary-color: ${config.primaryColor};
  --md-font-family: ${config.fontFamily};
  --md-font-size: ${config.fontSize};
}

/* 段落缩进和对齐 */
#output p {
  ${config.isUseIndent ? 'text-indent: 2em;' : ''}
  ${config.isUseJustify ? 'text-align: justify;' : ''}
}
  `.trim()
}

/**
 * 生成标题样式 CSS（单独导出，用于在主题 CSS 之后应用）
 */
export function generateHeadingStyles(config: CSSVariableConfig): string {
  return generateHeadingStylesCSS(config.headingStyles)
}

/**
 * 生成标题样式 CSS
 */
function generateHeadingStylesCSS(headingStyles?: HeadingStyles): string {
  if (!headingStyles)
    return ``

  const levels: HeadingLevel[] = [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`]
  const cssRules: string[] = []

  for (const level of levels) {
    const style = headingStyles[level]
    // 自定义样式由用户在 CSS 编辑器中直接编辑，这里只处理预设样式
    if (style && style !== `default` && style !== `custom`) {
      cssRules.push(generateHeadingCSS(level, style))
    }
  }

  return cssRules.join(`\n\n`)
}

/**
 * 生成单个标题级别的样式 CSS
 */
function generateHeadingCSS(level: HeadingLevel, style: HeadingStyleType): string {
  const baseStyles = `
  display: block !important;
  text-align: left !important;
  background: transparent !important;
  margin-left: 8px;
  margin-right: 8px;`

  switch (style) {
    case `color-only`:
      return `#output ${level} {
  color: var(--md-primary-color) !important;
  background: transparent !important;
}`

    case `border-bottom`:
      return `#output ${level} {${baseStyles}
  padding-bottom: 0.3em;
  border-bottom: 2px solid var(--md-primary-color);
  color: var(--md-primary-color);
}`

    case `border-left`:
      return `#output ${level} {${baseStyles}
  padding-left: 10px;
  border-left: 4px solid var(--md-primary-color);
  color: var(--md-primary-color);
}`

    case `tag-line`:
      return `#output section ${level} {
  display: table !important;
  text-align: center !important;
  background: var(--md-primary-color) !important;
  color: #fff !important;
  padding: 0 0.2em !important;
  margin: 4em 8px 2em 8px !important;
  position: static !important;
}
#output section:has(${level}) {
  position: relative !important;
}
#output section ${level}::after {
  content: '' !important;
  display: block !important;
  position: absolute !important;
  left: 8px !important;
  right: 8px !important;
  margin-top: 0 !important;
  height: 2px !important;
  background: var(--md-primary-color) !important;
}`

    case `line-tag`:
      return `#output section ${level} {
  display: table !important;
  text-align: center !important;
  background: var(--md-primary-color) !important;
  color: #fff !important;
  padding: 0 0.2em !important;
  margin: 4em auto 2em auto !important;
  position: static !important;
}
#output section:has(${level}) {
  position: relative !important;
}
#output section ${level}::before {
  content: '' !important;
  display: block !important;
  position: absolute !important;
  left: 8px !important;
  right: 8px !important;
  margin-bottom: 0 !important;
  height: 2px !important;
  background: var(--md-primary-color) !important;
}`

    case `double-line`:
      return `#output section ${level} {
  display: table !important;
  text-align: left !important;
  background: transparent !important;
  color: hsl(var(--foreground)) !important;
  padding: 0 !important;
  margin: 4em 8px 0.8em 8px !important;
  position: static !important;
  border-bottom: 3px solid var(--md-primary-color) !important;
}
#output section:has(${level}) {
  position: relative !important;
}
#output section ${level}::after {
  content: '' !important;
  display: block !important;
  position: absolute !important;
  left: 8px !important;
  right: 8px !important;
  margin-top: 1px !important;
  height: 3px !important;
  background: hsl(var(--foreground) / 0.5) !important;
}`

    default:
      return ``
  }
}
