import { css } from '@codemirror/lang-css'
import { EditorView, keymap } from '@codemirror/view'
import { basicSetup } from './basicSetup'

async function formatCSS(view: EditorView) {
  const content = view.state.doc.toString()
  const { formatDoc } = await import('../utils/formatDoc')
  const formatted = await formatDoc(content, `css`)
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: formatted },
  })
}

/** CSS editor extensions. Import theme() from './themes' for theming. See basicSetup.ts for included features. */
export function cssSetup() {
  return [
    basicSetup,
    css(),
    EditorView.lineWrapping,
    keymap.of([
      { key: `Shift-Alt-f`, run: (view: EditorView) => { formatCSS(view); return true } },
    ]),
  ]
}
