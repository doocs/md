import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'

// @ts-expect-error
globalThis.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === `css` || label === `scss` || label === `less`) {
      return new CssWorker()
    }
    if (label === `typescript` || label === `javascript`) {
      return new TsWorker()
    }
    return new EditorWorker()
  },
}

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
