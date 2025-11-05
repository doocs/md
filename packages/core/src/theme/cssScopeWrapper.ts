/**
 * CSS 作用域包装器
 * 给 CSS 选择器添加作用域前缀，限制样式只在预览区域生效
 */

import { SELECTOR_MAPPING } from './selectorMapping'

/**
 * 给 CSS 添加作用域前缀，并使用映射表转换旧选择器
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
      const trimmedSelectors = selectors.trim()
      if (trimmedSelectors.startsWith(`@`) || trimmedSelectors.startsWith(`:root`)) {
        return match
      }

      // 分割多个选择器（用逗号分隔）
      const wrappedSelectors = selectors
        .split(`,`)
        .map((selector: string) => {
          let trimmed = selector.trim()

          // 跳过已经有作用域前缀的
          if (trimmed.startsWith(scope)) {
            return trimmed
          }

          // 跳过空选择器
          if (!trimmed) {
            return trimmed
          }

          // 获取选择器的第一部分（基础选择器）
          const baseSelector = trimmed.split(/[\s>+~:[]/, 1)[0].trim()

          // 使用映射表转换旧选择器到新类名
          if (baseSelector && SELECTOR_MAPPING[baseSelector]) {
            // 替换基础选择器为新类名
            trimmed = trimmed.replace(baseSelector, `.${SELECTOR_MAPPING[baseSelector]}`)
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
