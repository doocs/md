import type { Compartment } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { history } from '@codemirror/commands'
import { Transaction } from '@codemirror/state'

export { history }

export function replaceDocumentWithoutHistory(view: EditorView, content: string) {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: content },
    annotations: Transaction.addToHistory.of(false),
  })
}

export function resetEditorHistory(view: EditorView, historyCompartment: Compartment) {
  view.dispatch({ effects: historyCompartment.reconfigure([]) })
  view.dispatch({ effects: historyCompartment.reconfigure(history()) })
}
