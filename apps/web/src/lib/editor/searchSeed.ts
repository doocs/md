import type { EditorView } from '@codemirror/view'

export interface SearchSeed {
  word: string
  findInSelection: boolean
}

/**
 * A single-line selection is the query. A multi-line selection is the range
 * to search inside, not the query itself.
 */
export function readSearchSeed(view: EditorView): SearchSeed {
  const selection = view.state.selection.main
  if (selection.empty)
    return { word: ``, findInSelection: false }

  const text = view.state.doc.sliceString(selection.from, selection.to)
  if (text.includes(`\n`))
    return { word: ``, findInSelection: true }

  return { word: text.trim(), findInSelection: false }
}
