import type { EditorView } from '@codemirror/view'
import { ctrlKey } from '@md/shared/configs'
import {
  applyHeading,
  formatBold,
  formatCode,
  formatItalic,
  formatLink,
  formatOrderedList,
  formatStrikethrough,
  formatUnorderedList,
} from '@md/shared/editor'
import { unref } from 'vue'

/**
 * 编辑器格式化操作 composable
 * 使用泛型和 unref 来支持任意类型的 ref（包括 readonly ref）
 */
export function useEditorFormat<T extends { value: any }>(editor: T) {
  function addFormat(cmd: string) {
    const editorView = unref(editor) as EditorView
    if (!unref(editor))
      return

    switch (cmd) {
      case `${ctrlKey}-B`:
        formatBold(editorView)
        break
      case `${ctrlKey}-I`:
        formatItalic(editorView)
        break
      case `${ctrlKey}-D`:
        formatStrikethrough(editorView)
        break
      case `${ctrlKey}-K`:
        formatLink(editorView)
        break
      case `${ctrlKey}-E`:
        formatCode(editorView)
        break
      case `${ctrlKey}-1`:
        applyHeading(editorView, 1)
        break
      case `${ctrlKey}-2`:
        applyHeading(editorView, 2)
        break
      case `${ctrlKey}-3`:
        applyHeading(editorView, 3)
        break
      case `${ctrlKey}-4`:
        applyHeading(editorView, 4)
        break
      case `${ctrlKey}-5`:
        applyHeading(editorView, 5)
        break
      case `${ctrlKey}-6`:
        applyHeading(editorView, 6)
        break
      case `${ctrlKey}-U`:
        formatUnorderedList(editorView)
        break
      case `${ctrlKey}-O`:
        formatOrderedList(editorView)
        break
    }
  }

  return {
    addFormat,
  }
}
