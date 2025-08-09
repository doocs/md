export function useImportMarkdownContent() {
  const store = useStore()
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
      store.editor!.setValue(event.target!.result as string)
      toast.success(`文档导入成功`)
    }
  })

  // 导入 Markdown 文档
  return () => {
    reset()
    open()
  }
}
