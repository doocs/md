import { describe, expect, it } from 'vitest'
import {
  blockRuleMultiline,
  blockRuleSingleLine,
  contentHasMath,
  inlineRuleNonStandard,
  matchBlockKatex,
} from './mathDetection'

const singleLineFormula = `$$ITE_{i}=Y_{i,1}-Y_{i,0} \\tag{1}$$`
const multilineFormula = `$$\nITE_{i}=Y_{i,1}-Y_{i,0} \\tag{1}\n$$`

describe('mathDetection block rules', () => {
  it('matches multiline block formula', () => {
    expect(blockRuleMultiline.test(multilineFormula)).toBe(true)
    expect(blockRuleSingleLine.test(multilineFormula)).toBe(false)
  })

  it('matches single-line block formula', () => {
    expect(blockRuleSingleLine.test(singleLineFormula)).toBe(true)
    expect(blockRuleMultiline.test(singleLineFormula)).toBe(false)
  })

  it('matchBlockKatex extracts latex from single-line block formula', () => {
    const match = matchBlockKatex(singleLineFormula)
    expect(match?.[2]?.trim()).toBe(`ITE_{i}=Y_{i,1}-Y_{i,0} \\tag{1}`)
  })

  it('detects math in single-line block formula', () => {
    expect(contentHasMath(singleLineFormula)).toBe(true)
  })

  it('inline rule still matches single-line formula when used directly', () => {
    expect(singleLineFormula.match(inlineRuleNonStandard)?.[2]?.trim())
      .toBe(`ITE_{i}=Y_{i,1}-Y_{i,0} \\tag{1}`)
  })

  it('does not match single-dollar formula at line start (#1743)', () => {
    expect(matchBlockKatex(`$y_1 = y_2$`)).toBeNull()
    expect(matchBlockKatex(`  $y_1 = y_2$`)).toBeNull()
  })

  it('does not match single-dollar formula after newline in block scan', () => {
    const src = `取\n$y_1 = y_2 = \\cdots = y_n = -y$，就退化为二元的情形`
    const lineStart = src.indexOf(`$`)
    expect(matchBlockKatex(src.slice(lineStart))).toBeNull()
  })
})
