/**
 * CSS 变量解析工具
 * 将 CSS 变量替换为实际值
 */

/**
 * 解析 CSS 变量为实际值
 * @param css - 包含 CSS 变量的样式字符串
 * @param variables - 变量映射表
 * @returns 解析后的 CSS
 */
export function resolveCSSVariables(
  css: string,
  variables: Record<string, string>,
): string {
  let resolved = css

  // 替换所有 var(--variable-name) 为实际值
  for (const [name, value] of Object.entries(variables)) {
    const varPattern = new RegExp(`var\\(${escapeRegExp(name)}\\)`, `g`)
    resolved = resolved.replace(varPattern, value)
  }

  return resolved
}

/**
 * 从 CSS 变量声明中提取变量映射
 * @param variablesCSS - CSS 变量声明字符串
 * @returns 变量映射表
 */
export function extractCSSVariables(variablesCSS: string): Record<string, string> {
  const variables: Record<string, string> = {}
  const lines = variablesCSS.split(`\n`)

  for (const line of lines) {
    const match = line.match(/^\s*(--[\w-]+):\s*(\S[^;]*);/)
    if (match) {
      const [, name, value] = match
      variables[name] = value.trim()
    }
  }

  return variables
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)
}
