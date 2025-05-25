import type CodeMirror from 'codemirror'

interface ToggleFormatOptions {
  prefix: string
  suffix: string
  check?: (selected: string) => boolean
  afterInsertCursorOffset?: number
}

export function toggleFormat(
  editor: CodeMirror.Editor,
  {
    prefix,
    suffix,
    check,
    afterInsertCursorOffset = 0,
  }: ToggleFormatOptions,
): void {
  const selected = editor.getSelection()
  const from = editor.getCursor(`from`)
  const to = editor.getCursor(`to`)
  const isFormatted = check?.(selected) ?? false

  let newText: string
  let newFrom = { ...from }
  let newTo = { ...to }

  if (isFormatted) {
    // Remove formatting (e.g. **abc** -> abc)
    newText = selected.slice(prefix.length, selected.length - suffix.length)
    editor.replaceSelection(newText)

    // Adjust selection to original
    newTo.ch = newFrom.ch + newText.length
    editor.setSelection(newFrom, newTo)
  }
  else {
    // Apply formatting
    newText = `${prefix}${selected}${suffix}`
    editor.replaceSelection(newText)

    // Select the whole formatted string (**abc**)
    newFrom = { ...from }
    newTo = {
      line: to.line,
      ch: to.ch + prefix.length + suffix.length,
    }
    editor.setSelection(newFrom, newTo)

    // Optional cursor shift (e.g. for `]()` links)
    if (afterInsertCursorOffset !== 0) {
      const { line, ch } = editor.getCursor()
      editor.setCursor({ line, ch: ch + afterInsertCursorOffset })
    }
  }
}
