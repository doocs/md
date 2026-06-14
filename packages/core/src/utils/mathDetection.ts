export const inlineRule = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1(?=[\s?!.,:？！。，：]|$)/
export const inlineRuleNonStandard = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1/
export const blockRule = /^\s{0,3}(\${1,2})[ \t]*\n([\s\S]+?)\n\s{0,3}\1[ \t]*(?:\n|$)/
const blockRuleDetect = /^\s{0,3}(\${1,2})[ \t]*\n[\s\S]+?\n\s{0,3}\1[ \t]*(?:\n|$)/m
export const inlineLatexRule = /^\\\(([^\\]*(?:\\.[^\\]*)*?)\\\)/
export const blockLatexRule = /^\\\[([^\\]*(?:\\.[^\\]*)*?)\\\]/

const blockLatexAnywhere = /\\\[[^\\]*(?:\\.[^\\]*)*?\\\]/
const inlineLatexAnywhere = /\\\([^\\]*(?:\\.[^\\]*)*?\\\)/

function isAmountDollarSign(src: string, index: number): boolean {
  if (index <= 0)
    return false
  const prev = src.charAt(index - 1)
  if (/[\d,.]/.test(prev))
    return true
  return prev === ` ` && index >= 2 && /\d/.test(src.charAt(index - 2))
}

function isInlineKatexStart(src: string, index: number, nonStandard: boolean): boolean {
  if (nonStandard)
    return !isAmountDollarSign(src, index)
  return index === 0 || src.charAt(index - 1) === ` `
}

export function findInlineKatexStart(src: string, nonStandard: boolean, ruleReg: RegExp): number | undefined {
  let indexSrc = src
  let offset = 0

  while (indexSrc) {
    const index = indexSrc.indexOf(`$`)
    if (index === -1)
      return

    if (isInlineKatexStart(indexSrc, index, nonStandard)) {
      const possibleKatex = indexSrc.substring(index)
      if (possibleKatex.match(ruleReg))
        return offset + index
    }

    const next = indexSrc.substring(index + 1).replace(/^\$+/, ``)
    offset += indexSrc.length - next.length
    indexSrc = next
  }
}

/**
 * 检测 Markdown 是否包含会被 MDKatex 识别的公式。
 * 默认 nonStandard=true，与 renderer-impl 配置一致。
 */
export function contentHasMath(content: string, nonStandard = true): boolean {
  if (blockRuleDetect.test(content))
    return true
  if (blockLatexAnywhere.test(content))
    return true
  if (inlineLatexAnywhere.test(content))
    return true

  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule
  return findInlineKatexStart(content, nonStandard, ruleReg) !== undefined
}
