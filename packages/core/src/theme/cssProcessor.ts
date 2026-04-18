/**
 * CSS 运行时处理工具（浏览器原生实现）
 * 不依赖 PostCSS，直接在浏览器中解析 CSS 自定义属性（var()）
 */

/**
 * 从 CSS 字符串中提取所有 CSS 自定义属性定义
 */
function extractCSSVariables(css: string): Map<string, string> {
  const vars = new Map<string, string>()
  const regex = /--([\w-]+)\s*:\s*([^;}\n]+)/g
  for (const match of css.matchAll(regex)) {
    vars.set(`--${match[1]}`, match[2].trim())
  }
  return vars
}

/**
 * 使用浏览器原生方式处理 CSS 字符串
 * 将所有 var(--xxx) 替换为实际值（支持 fallback 和嵌套变量）
 *
 * @param css - 原始 CSS 字符串
 * @returns 处理后的 CSS 字符串
 */
export function processCSS(css: string): string {
  // 1. 从 CSS 字符串本身提取变量定义
  const vars = extractCSSVariables(css)

  // 2. 用文档上的计算值覆盖（更准确，处理跨文件或动态设置的变量）
  if (typeof document !== `undefined`) {
    const computed = getComputedStyle(document.documentElement)
    vars.forEach((_, key) => {
      const val = computed.getPropertyValue(key).trim()
      if (val)
        vars.set(key, val)
    })
  }

  // 3. 迭代替换 var() 引用，直到没有可解析的为止（处理嵌套变量）
  const varRegex = /var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/g
  let result = css
  let prev = ``
  let iterations = 0
  while (result !== prev && iterations < 10) {
    prev = result
    result = result.replace(varRegex, (_, varName: string, fallback?: string) => {
      const val = vars.get(varName)
      if (val !== undefined)
        return val
      return fallback ? fallback.trim() : `var(${varName})`
    })
    iterations++
  }

  // 4. 化简 calc() 表达式（由内而外，迭代处理嵌套）
  const calcRegex = /calc\(([^()]+)\)/g
  prev = ``
  iterations = 0
  while (result !== prev && iterations < 10) {
    prev = result
    result = result.replace(calcRegex, (_, inner: string) => evaluateCalcInner(inner.trim()))
    iterations++
  }

  return result
}

const UNITS = `px|em|rem|vw|vh|vmin|vmax|%|pt|pc|cm|mm|in|ex|ch`
const NUM = `(-?[\\d.]+)`
const UNIT_VAL = `(-?[\\d.]+)(${UNITS})?`

/**
 * 对 calc() 内部表达式求值（不含外层 calc()）
 * 支持：加减（同单位）、乘除（一个操作数无单位）
 */
function evaluateCalcInner(expr: string): string {
  // 乘法：Xunit * N 或 N * Xunit
  const mul = expr.match(new RegExp(`^${UNIT_VAL}\\s*\\*\\s*${UNIT_VAL}$`))
  if (mul) {
    const [, a, ua, b, ub] = mul
    // 有且仅有一侧有单位
    if (!ua !== !ub) {
      const unit = ua || ub
      const result = round(Number.parseFloat(a) * Number.parseFloat(b))
      return `${result}${unit}`
    }
  }

  // 除法：Xunit / N
  const div = expr.match(new RegExp(`^${UNIT_VAL}\\s*/\\s*${NUM}$`))
  if (div) {
    const [, a, unit,, b] = div
    const result = round(Number.parseFloat(a) / Number.parseFloat(b))
    return `${result}${unit ?? ``}`
  }

  // 加减：同单位
  const addSub = expr.match(new RegExp(`^${UNIT_VAL}\\s*([+-])\\s*${UNIT_VAL}$`))
  if (addSub) {
    const [, a, ua, op, b, ub] = addSub
    if (ua === ub) {
      const result = round(op === `+` ? Number.parseFloat(a) + Number.parseFloat(b) : Number.parseFloat(a) - Number.parseFloat(b))
      return `${result}${ua ?? ``}`
    }
  }

  // 无法化简，保留 calc()
  return `calc(${expr})`
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000
}
