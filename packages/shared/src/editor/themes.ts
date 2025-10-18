import { EditorView } from '@codemirror/view'
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark'
import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light'

const customStyles = EditorView.theme({
  // 垂直居中
  '.cm-gutterElement': {
    display: `flex`,
    justifyContent: `right`,
    alignItems: `center`,
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
