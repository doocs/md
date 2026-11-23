import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { findLiteralMatches } from './findLiteralMatches'

describe(`findLiteralMatches`, () => {
  it(`keeps matches inside a selection that starts and ends mid-line`, () => {
    const text = `intro\ncat outside: CAT cat\ncat | cat outside`
    const state = EditorState.create({ doc: text })
    const matches = findLiteralMatches(state, `cat`, text.indexOf(`CAT`), text.indexOf(` |`), false)

    expect(matches).toEqual([
      [{ line: 1, ch: 13 }, { line: 1, ch: 16 }],
      [{ line: 1, ch: 17 }, { line: 1, ch: 20 }],
      [{ line: 2, ch: 0 }, { line: 2, ch: 3 }],
    ])
  })

  it(`keeps whole-document matches case-sensitive and non-overlapping`, () => {
    const state = EditorState.create({ doc: `Aa aaa` })
    expect(findLiteralMatches(state, `aa`, 0, state.doc.length, true)).toEqual([
      [{ line: 0, ch: 3 }, { line: 0, ch: 5 }],
    ])
  })

  it(`returns original columns when lowercasing changes the length`, () => {
    const state = EditorState.create({ doc: `xİcatZ\nxi\u0307Z` })
    expect(findLiteralMatches(state, `cat`, 1, 5, false)).toEqual([
      [{ line: 0, ch: 2 }, { line: 0, ch: 5 }],
    ])
    const second = state.doc.line(2)
    expect(findLiteralMatches(state, `İ`, second.from + 1, second.to - 1, false)).toEqual([
      [{ line: 1, ch: 1 }, { line: 1, ch: 3 }],
    ])
  })

  it(`does not match the same original character twice after lowercasing`, () => {
    const state = EditorState.create({ doc: `xİİİZ` })
    expect(findLiteralMatches(state, `\u0307i`, 1, 4, false)).toEqual([
      [{ line: 0, ch: 1 }, { line: 0, ch: 3 }],
    ])
  })
})
