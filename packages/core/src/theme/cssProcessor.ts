/**
 * CSS 运行时处理工具
 * 使用 PostCSS 在运行时处理动态注入的 CSS
 */

import postcss from 'postcss'
import postcssCalc from 'postcss-calc'
import postcssCustomProperties from 'postcss-custom-properties'

/**
 * 使用 PostCSS 处理 CSS 字符串
 * 处理步骤：
 * 1. 使用 postcss-custom-properties 替换 CSS 变量为实际值
 * 2. 使用 postcss-calc 处理 calc() 表达式，简化可计算的表达式
 *
 * @param css - 原始 CSS 字符串
 * @returns 处理后的 CSS 字符串
 */
export async function processCSS(css: string): Promise<string> {
  try {
    const result = await postcss([
      postcssCustomProperties({
        preserve: false, // 不保留原始 CSS 变量定义
      }),
      postcssCalc({
        preserve: false, // 不保留 calc()，尽可能简化
        mediaQueries: false, // 不处理媒体查询中的 calc()
        selectors: false, // 不处理选择器中的 calc()
      }),
    ]).process(css, {
      from: undefined, // 不指定源文件
    })

    return result.css
  }
  catch (error) {
    console.warn(`[processCSS] CSS 处理失败，使用原始 CSS:`, error)
    return css
  }
}
