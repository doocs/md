import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark'
import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light'

// 浅色主题
export function lightTheme() {
  return vsCodeLight
}

// 暗色主题
export function darkTheme() {
  return vsCodeDark
}

// 根据主题模式获取主题扩展
export function theme(isDark: boolean) {
  return isDark ? darkTheme() : lightTheme()
}
