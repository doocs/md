/**
 * Runtime CSS processing in the browser (no PostCSS).
 * Resolves var() and nested custom properties.
 */

function extractCSSVariables(css: string): Map<string, string> {
  const vars = new Map<string, string>()
  const regex = /--([\w-]+)\s*:\s*([^;}\n]+)/g
  for (const match of css.matchAll(regex)) {
    vars.set(`--${match[1]}`, match[2].trim())
  }
  return vars
}

/** Replace var(--xxx) with values from the CSS string (fallbacks & nesting supported) */
export function processCSS(css: string): string {
  const vars = extractCSSVariables(css)

  // Do not override from getComputedStyle — stale injected theme would lag one click behind
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

/** Evaluate calc() inner expression (same-unit +/-, scale with unitless operand) */
function evaluateCalcInner(expr: string): string {
  const mul = expr.match(new RegExp(`^${UNIT_VAL}\\s*\\*\\s*${UNIT_VAL}$`))
  if (mul) {
    const [, a, ua, b, ub] = mul
    if (!ua !== !ub) {
      const unit = ua || ub
      const result = round(Number.parseFloat(a) * Number.parseFloat(b))
      return `${result}${unit}`
    }
  }

  const div = expr.match(new RegExp(`^${UNIT_VAL}\\s*/\\s*${NUM}$`))
  if (div) {
    const [, a, unit,, b] = div
    const result = round(Number.parseFloat(a) / Number.parseFloat(b))
    return `${result}${unit ?? ``}`
  }

  const addSub = expr.match(new RegExp(`^${UNIT_VAL}\\s*([+-])\\s*${UNIT_VAL}$`))
  if (addSub) {
    const [, a, ua, op, b, ub] = addSub
    if (ua === ub) {
      const result = round(op === `+` ? Number.parseFloat(a) + Number.parseFloat(b) : Number.parseFloat(a) - Number.parseFloat(b))
      return `${result}${ua ?? ``}`
    }
  }

  return `calc(${expr})`
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000
}
