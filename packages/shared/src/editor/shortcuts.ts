import type { MonacoEditor } from './monaco'
import { monaco } from './monaco'

// 格式化辅助函数
export function toggleFormat(
  editor: MonacoEditor.IStandaloneCodeEditor,
  { prefix, suffix, afterOffset = 0 }: { prefix: string, suffix: string, afterOffset?: number },
) {
  const selection = editor.getSelection()
  const model = editor.getModel()
  if (!model || !selection)
    return

  const selected = model.getValueInRange(selection)
  const isFormatted = selected.startsWith(prefix) && selected.endsWith(suffix)

  let newText: string
  if (isFormatted) {
    newText = selected.slice(prefix.length, selected.length - suffix.length)
  }
  else {
    newText = `${prefix}${selected}${suffix}`
  }

  editor.executeEdits(`format`, [{
    range: selection,
    text: newText,
  }])

  if (afterOffset !== 0 && !isFormatted) {
    const position = editor.getPosition()
    if (position) {
      editor.setPosition({
        lineNumber: position.lineNumber,
        column: position.column + afterOffset,
      })
    }
  }
}

// 应用标题格式
export function applyHeading(editor: MonacoEditor.IStandaloneCodeEditor, level: number) {
  const selection = editor.getSelection()
  const model = editor.getModel()
  if (!model || !selection)
    return

  const selected = model.getValueInRange(selection)
  const lines = selected.split(`\n`)

  const updated = lines.map((line) => {
    const cleaned = line.replace(/^#{1,6}\s+/, ``).trimStart()
    return `${`#`.repeat(level)} ${cleaned}`
  }).join(`\n`)

  editor.executeEdits(`heading`, [{
    range: selection,
    text: updated,
  }])
}

// 切换列表格式
export function toggleList(editor: MonacoEditor.IStandaloneCodeEditor, type: `ordered` | `unordered`) {
  const selection = editor.getSelection()
  const model = editor.getModel()
  if (!model || !selection)
    return

  const selected = model.getValueInRange(selection)
  const lines = selected.split(`\n`)

  let updated: string
  if (type === `unordered`) {
    const isList = lines.every(line => line.trim().startsWith(`- `))
    updated = isList
      ? lines.map(line => line.replace(/^- +/, ``)).join(`\n`)
      : lines.map(line => `- ${line}`).join(`\n`)
  }
  else {
    const isList = lines.every(line => /^\d+\.\s/.test(line.trim()))
    updated = isList
      ? lines.map(line => line.replace(/^\d+\.\s+/, ``)).join(`\n`)
      : lines.map((line, i) => `${i + 1}. ${line}`).join(`\n`)
  }

  editor.executeEdits(`list`, [{
    range: selection,
    text: updated,
  }])
}

// 快捷键配置接口
export interface ShortcutHandlers {
  onFormat?: () => Promise<void>
  onSearch?: () => void
}

// 注册 Monaco Editor 快捷键
export function registerShortcuts(
  editor: MonacoEditor.IStandaloneCodeEditor,
  handlers?: ShortcutHandlers,
) {
  // 格式化快捷键：Shift + Alt + F
  if (handlers?.onFormat) {
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      handlers.onFormat?.()
    })
  }

  // 撤销：Ctrl/Cmd + Z
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
    editor.trigger(`keyboard`, `undo`, {})
  })

  // 重做：Ctrl/Cmd + Y
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY, () => {
    editor.trigger(`keyboard`, `redo`, {})
  })

  // 粗体：Ctrl/Cmd + B
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
    toggleFormat(editor, { prefix: `**`, suffix: `**`, afterOffset: -2 })
  })

  // 斜体：Ctrl/Cmd + I
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
    toggleFormat(editor, { prefix: `*`, suffix: `*`, afterOffset: -1 })
  })

  // 删除线：Ctrl/Cmd + D
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
    toggleFormat(editor, { prefix: `~~`, suffix: `~~`, afterOffset: -2 })
  })

  // 链接：Ctrl/Cmd + K
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
    toggleFormat(editor, { prefix: `[`, suffix: `]()`, afterOffset: -1 })
  })

  // 代码：Ctrl/Cmd + E
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => {
    toggleFormat(editor, { prefix: `\``, suffix: `\``, afterOffset: -1 })
  })

  // 标题 1-6：Ctrl/Cmd + 1-6
  const digitKeys = [
    monaco.KeyCode.Digit1,
    monaco.KeyCode.Digit2,
    monaco.KeyCode.Digit3,
    monaco.KeyCode.Digit4,
    monaco.KeyCode.Digit5,
    monaco.KeyCode.Digit6,
  ]
  digitKeys.forEach((keyCode, index) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | keyCode, () => {
      applyHeading(editor, index + 1)
    })
  })

  // 无序列表：Ctrl/Cmd + U
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU, () => {
    toggleList(editor, `unordered`)
  })

  // 有序列表：Ctrl/Cmd + O
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, () => {
    toggleList(editor, `ordered`)
  })

  // 搜索：Ctrl/Cmd + F，内置搜索
}
