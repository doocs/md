import { javascript } from '@codemirror/lang-javascript'
import { basicSetup } from './basicSetup'

/**
 * JavaScript 编辑器的基础扩展集合
 *
 * 包含：
 * - basicSetup（行号、代码折叠、自动补全、括号匹配等完整功能）
 * - JavaScript 语言支持
 *
 * basicSetup 包含的功能详见 ./basicSetup.ts
 *
 * 主题请使用统一的 theme() 函数，从 './themes' 导入
 */
export function javascriptSetup() {
  return [
    basicSetup,
    javascript(),
  ]
}
