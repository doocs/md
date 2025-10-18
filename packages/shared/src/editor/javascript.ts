import type { EditorView } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { keymap } from '@codemirror/view'
import { formatDoc } from '../utils/fileHelpers'
import { basicSetup } from './basicSetup'

/**
 * JavaScript 格式化处理函数
 */
async function formatJavaScript(view: EditorView) {
  const content = view.state.doc.toString()
  const formatted = await formatDoc(content, `javascript`)
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: formatted },
  })
}

/**
 * JavaScript 编辑器的基础扩展集合
 *
 * 包含：
 * - basicSetup（行号、代码折叠、自动补全、括号匹配等完整功能）
 * - JavaScript 语言支持
 * - 格式化功能（Shift-Alt-f）
 *
 * basicSetup 包含的功能详见 ./basicSetup.ts
 *
 * 主题请使用统一的 theme() 函数，从 './themes' 导入
 */
export function javascriptSetup() {
  return [
    basicSetup,
    javascript(),
    // 格式化快捷键
    keymap.of([
      { key: `Shift-Alt-f`, run: (view: EditorView) => { formatJavaScript(view); return true } },
    ]),
  ]
}
