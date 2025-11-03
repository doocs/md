import { css } from '@codemirror/lang-css'
import { EditorView, keymap } from '@codemirror/view'
import { formatDoc } from '../utils/fileHelpers'
import { basicSetup } from './basicSetup'

/**
 * CSS 格式化处理函数
 */
async function formatCSS(view: EditorView) {
  const content = view.state.doc.toString()
  const formatted = await formatDoc(content, `css`)
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: formatted },
  })
}

/**
 * CSS 编辑器的基础扩展集合
 *
 * 包含：
 * - basicSetup（无行号、代码折叠、自动补全、括号匹配等完整功能）
 * - 自动换行（无横向滚动）
 * - CSS 语言支持
 * - 格式化功能（Shift-Alt-f）
 *
 * basicSetup 包含的功能详见 ./basicSetup.ts
 *
 * 主题请使用统一的 theme() 函数，从 './themes' 导入
 */
export function cssSetup() {
  return [
    basicSetup,
    css(),
    // 自动换行，禁用横向滚动
    EditorView.lineWrapping,
    // 格式化快捷键
    keymap.of([
      { key: `Shift-Alt-f`, run: (view: EditorView) => { formatCSS(view); return true } },
    ]),
  ]
}
