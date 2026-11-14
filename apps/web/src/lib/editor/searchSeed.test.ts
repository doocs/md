import type { EditorView } from '@codemirror/view'
import { EditorSelection, EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { readSearchSeed } from './searchSeed'

function viewWithSelection(doc: string, from: number, to: number) {
  const state = EditorState.create({
    doc,
    selection: EditorSelection.range(from, to),
  })
  return { state } as EditorView
}

describe(`readSearchSeed`, () => {
  it(`leaves the query empty when nothing is selected`, () => {
    expect(readSearchSeed(viewWithSelection(`hello`, 0, 0))).toEqual({ word: ``, findInSelection: false })
  })

  it(`uses a single-line selection as the query`, () => {
    expect(readSearchSeed(viewWithSelection(`hello world`, 0, 5))).toEqual({ word: `hello`, findInSelection: false })
  })

  it(`searches inside a multi-line selection instead of using it as the query`, () => {
    const doc = `one\ntwo`
    expect(readSearchSeed(viewWithSelection(doc, 0, doc.length))).toEqual({ word: ``, findInSelection: true })
  })
})
