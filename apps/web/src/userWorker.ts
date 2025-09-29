import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker&url'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker&url'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'

// @ts-expect-error
globalThis.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === `css` || label === `scss` || label === `less`) {
      return new Worker(new URL(cssWorker, import.meta.url), { type: `module` })
    }
    if (label === `typescript` || label === `javascript`) {
      return new Worker(new URL(tsWorker, import.meta.url), { type: `module` })
    }
    return new EditorWorker()
  },
}

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
