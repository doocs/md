import type { EditorState, Transaction, TransactionSpec } from '@codemirror/state'

export interface EditorLike {
  state: EditorState
  dispatch: {
    (tr: Transaction): void
    (trs: readonly Transaction[]): void
    (...specs: TransactionSpec[]): void
  }
  focus: () => void
}
