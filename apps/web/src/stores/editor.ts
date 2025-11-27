import type { EditorView } from '@codemirror/view'
import { formatDoc } from '@/utils'

/**
 * 编辑器 Store
 * 负责管理 CodeMirror 编辑器实例和基础操作
 */
export const useEditorStore = defineStore(`editor`, () => {
  // 内容编辑器实例
  const editor = ref<EditorView | null>(null)

  // 格式化文档
  const formatContent = async () => {
    if (!editor.value)
      return

    const doc = await formatDoc(editor.value.state.doc.toString())
    editor.value.dispatch({
      changes: { from: 0, to: editor.value.state.doc.length, insert: doc },
    })
    return doc
  }

  // 导入默认文档
  const importContent = (content: string) => {
    if (!editor.value)
      return

    editor.value.dispatch({
      changes: { from: 0, to: editor.value.state.doc.length, insert: content },
    })
  }

  // 清空内容
  const clearContent = () => {
    if (!editor.value)
      return

    editor.value.dispatch({
      changes: { from: 0, to: editor.value.state.doc.length, insert: `` },
    })
    toast.success(`内容已清空`)
  }

  // 获取当前内容
  const getContent = () => {
    return editor.value?.state.doc.toString() ?? ``
  }

  // 获取选中的文本
  const getSelection = () => {
    if (!editor.value)
      return ``

    const selection = editor.value.state.selection.main
    return editor.value.state.doc.sliceString(selection.from, selection.to)
  }

  // 替换选中的文本
  const replaceSelection = (text: string) => {
    if (!editor.value)
      return

    editor.value.dispatch(editor.value.state.replaceSelection(text))
  }

  // 在光标位置插入文本
  const insertAtCursor = (text: string) => {
    if (!editor.value)
      return

    const selection = editor.value.state.selection.main
    editor.value.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + text.length },
    })
    editor.value.focus()
  }

  return {
    editor,
    formatContent,
    importContent,
    clearContent,
    getContent,
    getSelection,
    replaceSelection,
    insertAtCursor,
  }
})
