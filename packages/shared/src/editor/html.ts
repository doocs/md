import { html } from '@codemirror/lang-html'
import { EditorView } from '@codemirror/view'
import { basicSetup } from './basicSetup'

/**
 * HTML 编辑器的基础扩展集合
 *
 * 包含：
 * - basicSetup（无行号、代码折叠、自动补全、括号匹配等完整功能）
 * - 自动换行（无横向滚动）
 * - HTML 语言支持
 *
 * basicSetup 包含的功能详见 ./basicSetup.ts
 *
 * 主题请使用统一的 theme() 函数，从 './themes' 导入
 */
export function htmlSetup() {
  return [
    basicSetup,
    html(),
    // 自动换行，禁用横向滚动
    EditorView.lineWrapping,
  ]
}
