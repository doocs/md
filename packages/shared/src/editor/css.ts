import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { basicSetup } from './basicSetup'

// GitHub 风格的浅色主题
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: `#ffffff`,
  },
  '.cm-content': {
    fontFamily: `Consolas, Monaco, "Courier New", monospace`,
    fontSize: `14px`,
  },
  '.cm-lineNumbers': {
    fontSize: `12px`,
    color: `#656d76`,
    backgroundColor: `#f6f8fa`,
    paddingLeft: `8px`,
    minWidth: `40px`,
  },
  '.cm-gutters': {
    backgroundColor: `#f6f8fa`,
    borderRight: `1px solid #e1e4e8`,
  },
  '.cm-activeLineGutter': {
    backgroundColor: `#e3f2fd`,
    color: `#1976d2`,
  },
}, { dark: false })

// GitHub 风格的暗色主题
const darkTheme = EditorView.theme({
  '.cm-lineNumbers': {
    fontSize: `12px`,
    color: `#7d8590`,
    backgroundColor: `#161b22`,
    paddingLeft: `8px`,
    minWidth: `40px`,
  },
  '.cm-gutters': {
    backgroundColor: `#161b22`,
    borderRight: `1px solid #30363d`,
  },
  '.cm-activeLineGutter': {
    backgroundColor: `#1c2128`,
    color: `#58a6ff`,
  },
}, { dark: true })

/**
 * CSS 编辑器的基础扩展集合
 *
 * 包含：
 * - basicSetup（行号、代码折叠、自动补全、括号匹配等完整功能）
 * - CSS 语言支持
 *
 * basicSetup 包含的功能详见 ./basicSetup.ts
 */
export function cssSetup() {
  return [
    basicSetup,
    css(),
  ]
}

/**
 * CSS 浅色主题扩展
 */
export function cssLightTheme() {
  return lightTheme
}

/**
 * CSS 暗色主题扩展
 */
export function cssDarkTheme() {
  return [oneDark, darkTheme]
}

/**
 * 根据主题模式获取主题扩展
 */
export function cssTheme(isDark: boolean) {
  return isDark ? cssDarkTheme() : cssLightTheme()
}
