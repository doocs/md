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
  // 去掉侧边栏底色和边框
  '&.cm-editor .cm-gutters': {
    backgroundColor: `transparent !important`,
    borderRight: `none !important`,
  },
  // 折叠图标默认隐藏，hover 侧边栏时才显示
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
