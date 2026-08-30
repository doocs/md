export const inlineRule = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1(?=[\s?!.,:？！。，：]|$)/
export const inlineRuleNonStandard = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1/
/** Block math: multiline `$$\n...\n$$` */
export const blockRuleMultiline = /^\s{0,3}(\${1,2})[ \t]*\n([\s\S]+?)\n\s{0,3}\1[ \t]*(?:\n|$)/
/** Block math: single-line `$$...$$` (line-only, double dollars) */
export const blockRuleSingleLine = /^\s{0,3}(\$\$)([^\n]+)\1[ \t]*(?:\n|$)/

export function matchBlockKatex(src: string): RegExpMatchArray | null {
  return src.match(blockRuleMultiline) ?? src.match(blockRuleSingleLine)
}

/**
 * Sticky twin of an `^`-anchored rule, so a position can be tested in place
 * instead of slicing the source first. Keyed by rule identity; the rules are
 * module constants, so this holds a couple of entries.
 */
const stickyRules = new Map<RegExp, RegExp>()

function stickyRuleFor(rule: RegExp): RegExp {
  let sticky = stickyRules.get(rule)
  if (!sticky) {
    sticky = new RegExp(rule.source.replace(/^\^/, ``), `${rule.flags.replace(/[gy]/g, ``)}y`)
    stickyRules.set(rule, sticky)
  }
  return sticky
}

function matchesAt(rule: RegExp, src: string, index: number): boolean {
  const sticky = stickyRuleFor(rule)
  sticky.lastIndex = index
  return sticky.test(src)
}

function contentHasBlockKatex(content: string): boolean {
  if (!content.includes(`$`))
    return false

  let lineStart = 0
  for (;;) {
    if (matchesAt(blockRuleMultiline, content, lineStart) || matchesAt(blockRuleSingleLine, content, lineStart))
      return true

    const next = content.indexOf(`\n`, lineStart)
    if (next === -1)
      return false
    lineStart = next + 1
  }
}

export const inlineLatexRule = /^\\\(([^\\]*(?:\\.[^\\]*)*?)\\\)/
export const blockLatexRule = /^\\\[([^\\]*(?:\\.[^\\]*)*?)\\\]/

const blockLatexAnywhere = /\\\[[^\\]*(?:\\.[^\\]*)*?\\\]/
const inlineLatexAnywhere = /\\\([^\\]*(?:\\.[^\\]*)*?\\\)/

const DOLLAR = 36

/**
 * `offset` is where the current scan region begins. The original implementation
 * re-sliced the source after every `$`, so the "is this the region start" checks
 * below stay relative to that region rather than to the absolute index.
 */
function isAmountDollarSign(src: string, index: number, offset: number): boolean {
  if (index <= offset)
    return false
  const prev = src.charAt(index - 1)
  if (/[\d,.]/.test(prev))
    return true
  return prev === ` ` && index - offset >= 2 && /\d/.test(src.charAt(index - 2))
}

function isInlineKatexStart(src: string, index: number, offset: number, nonStandard: boolean): boolean {
  if (nonStandard)
    return !isAmountDollarSign(src, index, offset)
  return index === offset || src.charAt(index - 1) === ` `
}

export function findInlineKatexStart(src: string, nonStandard: boolean, ruleReg: RegExp): number | undefined {
  let offset = 0

  while (offset < src.length) {
    const index = src.indexOf(`$`, offset)
    if (index === -1)
      return undefined

    if (isInlineKatexStart(src, index, offset, nonStandard) && matchesAt(ruleReg, src, index))
      return index

    // Skip the delimiter plus any immediately adjacent `$`, matching the
    // original `substring(index + 1).replace(/^\$+/, '')` step.
    let next = index + 1
    while (next < src.length && src.charCodeAt(next) === DOLLAR)
      next++
    offset = next
  }

  return undefined
}

/** Whether content contains math recognized by MDKatex (default nonStandard=true, same as renderer-impl). */
export function contentHasMath(content: string, nonStandard = true): boolean {
  if (contentHasBlockKatex(content))
    return true
  if (blockLatexAnywhere.test(content))
    return true
  if (inlineLatexAnywhere.test(content))
    return true

  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule
  return findInlineKatexStart(content, nonStandard, ruleReg) !== undefined
}

/** Strip extra <br> before inline katex caused by marked breaks */
export function stripBreakBeforeInlineKatex(html: string): string {
  return html.replace(/<br\s*\/?>\s*(?=<span class="katex-inline)/gi, ``)
}
