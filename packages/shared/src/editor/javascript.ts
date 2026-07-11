import type { EditorView } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { keymap } from '@codemirror/view'
import { basicSetup } from './basicSetup'

async function formatJavaScript(view: EditorView) {
  const content = view.state.doc.toString()
  const { formatDoc } = await import('../utils/formatDoc')
  const formatted = await formatDoc(content, `javascript`)
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: formatted },
  })
}

/** JavaScript editor extensions. Import theme() from './themes' for theming. See basicSetup.ts for included features. */
export function javascriptSetup() {
  return [
    basicSetup,
    javascript(),
    keymap.of([
      { key: `Shift-Alt-f`, run: (view: EditorView) => { formatJavaScript(view); return true } },
    ]),
  ]
}
