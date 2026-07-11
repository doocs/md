import { EditorView } from '@codemirror/view'
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark'
import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light'

const customStyles = EditorView.theme({
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

  '.cm-foldGutter': {
    width: `10px !important`,
    overflow: `hidden`,
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: `0 !important`,
    width: `10px !important`,
    minWidth: `unset !important`,
  },

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

export function theme(isDark: boolean) {
  return isDark ? darkTheme() : lightTheme()
}
