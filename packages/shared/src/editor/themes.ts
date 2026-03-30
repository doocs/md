import { EditorView } from '@codemirror/view'
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark'
import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light'

const customStyles = EditorView.theme({
  // 装订线：垂直居中、无背景无边框无内边距
  '.cm-gutterElement': {
    display: `flex`,
    justifyContent: `right`,
    alignItems: `center`,
  },
  '&.cm-editor .cm-gutters': {
    backgroundColor: `transparent !important`,
    borderRight: `none !important`,
    padding: `0 !important`,
  },

  // 折叠装订线：固定宽度，无内边距
  '.cm-foldGutter': {
    width: `10px !important`,
    overflow: `hidden`,
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: `0 !important`,
    width: `10px !important`,
    minWidth: `unset !important`,
  },

  // 折叠图标：默认隐藏，hover 装订线时显示
  '.cm-foldGutter .cm-gutterElement span': {
    opacity: `0`,
    transition: `opacity 0.15s ease`,
  },
  '&.cm-editor .cm-gutters:hover .cm-foldGutter .cm-gutterElement span': {
    opacity: `1`,
  },
})

export function lightTheme() {
  return [vsCodeLight, customStyles]
}

export function darkTheme() {
  return [vsCodeDark, customStyles]
}

// 根据主题模式获取主题扩展
export function theme(isDark: boolean) {
  return isDark ? darkTheme() : lightTheme()
}
