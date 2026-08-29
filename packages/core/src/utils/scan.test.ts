import { describe, expect, it } from 'vitest'
import {
  blockScanLimit,
  findAtLineStart,
  findIndentedLineStart,
  findLineEquals,
  indexOfWithin,
} from './scan'

/**
 * These helpers replaced whole-tail regex scans in extension `start()` hooks, so
 * the cases below pin the anchoring rules of the patterns they stand in for.
 */

describe(`findAtLineStart`, () => {
  const needle = '```mermaid'

  it(`matches at the very start`, () => {
    expect(findAtLineStart('```mermaid\ngraph TD', needle)).toBe(0)
  })

  it(`matches after a newline`, () => {
    const src = 'text\n```mermaid\ngraph TD'
    expect(findAtLineStart(src, needle)).toBe(5)
  })

  it(`ignores occurrences that do not start a line`, () => {
    expect(findAtLineStart('inline ```mermaid stays text', needle)).toBeUndefined()
  })

  it(`skips a mid-line hit and finds the later line-start one`, () => {
    const src = 'see ```mermaid here\n```mermaid\ngraph TD'
    expect(findAtLineStart(src, needle)).toBe(20)
  })

  it(`handles CRLF line endings`, () => {
    expect(findAtLineStart('text\r\n```mermaid', needle)).toBe(6)
  })

  it(`matches the old fence-at-line-start regex behaviour`, () => {
    const samples = [
      '```mermaid\na',
      'x\n```mermaid',
      'x ```mermaid',
      'a\nb\n```mermaid\nc',
      'no fence here',
    ]
    for (const sample of samples)
      expect(findAtLineStart(sample, needle)).toBe(sample.match(/^```mermaid/m)?.index)
  })

  it(`respects the limit`, () => {
    const src = 'para\n\n```mermaid\ngraph TD'
    expect(findAtLineStart(src, needle)).toBe(6)
    expect(findAtLineStart(src, needle, 4)).toBeUndefined()
  })
})

describe(`findIndentedLineStart`, () => {
  it(`returns the line start, not the delimiter position`, () => {
    const src = 'text\n  $$\nx = 1\n$$'
    expect(findIndentedLineStart(src, `$$`, 3)).toBe(5)
  })

  it(`allows up to three spaces of indent`, () => {
    expect(findIndentedLineStart('   $$\na', `$$`, 3)).toBe(0)
  })

  it(`rejects four spaces of indent`, () => {
    expect(findIndentedLineStart('    $$\na', `$$`, 3)).toBeUndefined()
  })

  it(`skips inline dollars and finds a later block`, () => {
    const src = 'cost is $$5 today\n$$\nx\n$$'
    expect(findIndentedLineStart(src, `$$`, 3)).toBe(18)
  })

  it(`matches the old indented-block regex behaviour for space indents`, () => {
    const samples = ['$$\na', ' $$\na', '  $$', 'x\n $$', 'x $$ y', 'nothing']
    for (const sample of samples)
      expect(findIndentedLineStart(sample, `$$`, 3)).toBe(sample.search(/^\s{0,3}\$\$/m) === -1 ? undefined : sample.search(/^\s{0,3}\$\$/m))
  })
})

describe(`findLineEquals`, () => {
  it(`matches a bare marker line`, () => {
    expect(findLineEquals('[TOC]\n# Title', `[TOC]`)).toBe(0)
  })

  it(`allows surrounding spaces`, () => {
    const src = 'intro\n  [TOC]  \n# Title'
    expect(findLineEquals(src, `[TOC]`)).toBe(6)
  })

  it(`ignores markers with other content on the line`, () => {
    expect(findLineEquals('see [TOC] here', `[TOC]`)).toBeUndefined()
  })

  it(`finds a later standalone marker`, () => {
    const src = 'see [TOC] here\n[TOC]\n'
    expect(findLineEquals(src, `[TOC]`)).toBe(15)
  })
})

describe(`blockScanLimit`, () => {
  it(`stops at the first blank line`, () => {
    const src = 'para one\nstill one\n\npara two'
    expect(blockScanLimit(src)).toBe(18)
  })

  it(`treats whitespace-only lines as blank`, () => {
    const src = 'para\n   \nnext'
    expect(blockScanLimit(src)).toBe(4)
  })

  it(`returns the full length when there is no blank line`, () => {
    const src = 'a\nb\nc'
    expect(blockScanLimit(src)).toBe(src.length)
  })

  it(`keeps a directly adjacent fence in range`, () => {
    const src = 'para text\n```mermaid\ngraph TD\n```\n\nafter'
    const limit = blockScanLimit(src)
    expect(findAtLineStart(src, '```mermaid', limit)).toBe(10)
  })
})

describe(`indexOfWithin`, () => {
  it(`finds within the limit`, () => {
    expect(indexOfWithin(`ab<C`, `<`, 0, 10)).toBe(2)
  })

  it(`rejects past the limit`, () => {
    expect(indexOfWithin(`ab<C`, `<`, 0, 1)).toBe(-1)
  })

  it(`matches indexOf when the limit covers the whole source`, () => {
    const src = `alpha <Beta> gamma`
    expect(indexOfWithin(src, `<`, 0, src.length)).toBe(src.indexOf(`<`))
  })
})
