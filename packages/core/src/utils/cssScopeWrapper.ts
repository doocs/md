/**
 * CSS 作用域包装器
 * 给 CSS 选择器添加作用域前缀，限制样式只在预览区域生效
 */

/**
 * 给 CSS 添加作用域前缀
 * @param css - 原始 CSS 字符串
 * @param scope - 作用域选择器，默认为 #output
 * @returns 添加作用域后的 CSS
 */
export function wrapCSSWithScope(css: string, scope: string = `#output`): string {
  // 处理每个 CSS 规则
  return css.replace(
    /([^{}]+)\{([^}]*)\}/g,
    (match, selectors, properties) => {
      // 跳过 @规则（如 @keyframes, @media）和 :root
      if (selectors.trim().startsWith(`@`) || selectors.trim().startsWith(`:root`)) {
        return match
      }

      // 分割多个选择器（用逗号分隔）
      const wrappedSelectors = selectors
        .split(`,`)
        .map((selector: string) => {
          const trimmed = selector.trim()

          // 跳过已经有作用域前缀的
          if (trimmed.startsWith(scope)) {
            return trimmed
          }

          // 跳过空选择器
          if (!trimmed) {
            return trimmed
          }

          // 添加作用域前缀
          return `${scope} ${trimmed}`
        })
        .filter(Boolean)
        .join(`,\n`)

      return `${wrappedSelectors} {${properties}}`
    },
  )
}
