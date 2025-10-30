/**
 * CSS 变量生成工具
 * 根据配置动态生成 CSS 变量样式
 */

export interface CSSVariableConfig {
  primaryColor: string
  fontFamily: string
  fontSize: string
  isUseIndent?: boolean
  isUseJustify?: boolean
}

/**
 * 生成 CSS 变量样式
 * @param config - 配置对象
 * @returns CSS 变量字符串
 */
export function generateCSSVariables(config: CSSVariableConfig): string {
  const fontSizeNum = Number.parseFloat(config.fontSize)

  return `
:root {
  /* 动态配置变量 */
  --md-primary-color: ${config.primaryColor};
  --md-font-family: ${config.fontFamily};
  --md-font-size: ${config.fontSize};

  /* 标题大小（绝对值，与旧系统行为一致） */
  --md-h1-size: ${fontSizeNum * 1.2}px;
  --md-h2-size: ${fontSizeNum * 1.2}px;
  --md-h3-size: ${fontSizeNum * 1.1}px;
  --md-h4-size: ${fontSizeNum}px;
  --md-h5-size: ${fontSizeNum}px;
  --md-h6-size: ${fontSizeNum}px;
}

/* 段落缩进和对齐 */
#output p {
  ${config.isUseIndent ? 'text-indent: 2em;' : ''}
  ${config.isUseJustify ? 'text-align: justify;' : ''}
}
  `.trim()
}
