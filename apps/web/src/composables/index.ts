import { useEditorStore } from '@/stores/editor'

export function useImportMarkdownContent() {
  const editorStore = useEditorStore()
  const { open, reset, onChange } = useFileDialog({
    accept: `.md`,
  })

  onChange((files) => {
    if (files == null || files.length === 0) {
      return
    }

    const file = files[0]
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = (event) => {
      // 清空编辑器
      editorStore.editor!.dispatch({
        changes: { from: 0, to: editorStore.editor!.state.doc.length, insert: `` },
      })

      requestAnimationFrame(() => {
        editorStore.editor!.dispatch({
          changes: { from: 0, to: editorStore.editor!.state.doc.length, insert: event.target!.result as string },
        })
      })
      toast.success(`文档导入成功`)
    }
  })

  // 导入 Markdown 文档
  return () => {
    reset()
    open()
  }
}
