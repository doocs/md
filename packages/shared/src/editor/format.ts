import type { EditorView } from '@codemirror/view'
import { redo, undo } from '@codemirror/commands'

interface ToggleFormatOptions {
  prefix: string
  suffix: string
  check?: (selected: string) => boolean
  afterInsertCursorOffset?: number
}

/**
 * 切换格式（加粗、斜体、删除线等）
 */
export function toggleFormat(
  view: EditorView,
  {
    prefix,
    suffix,
    check,
    afterInsertCursorOffset = 0,
  }: ToggleFormatOptions,
): void {
  const selection = view.state.selection.main
  const selected = view.state.doc.sliceString(selection.from, selection.to)
  const isFormatted = check?.(selected) ?? false

  let newText: string

  if (isFormatted) {
    // Remove formatting (e.g. **abc** -> abc)
    newText = selected.slice(prefix.length, selected.length - suffix.length)
    view.dispatch(view.state.replaceSelection(newText))
  }
  else {
    // Apply formatting
    newText = `${prefix}${selected}${suffix}`
    view.dispatch(view.state.replaceSelection(newText))

    // Optional cursor shift (e.g. for `]()` links)
    if (afterInsertCursorOffset !== 0) {
      const newSelection = view.state.selection.main
      const newPos = newSelection.head + afterInsertCursorOffset
      view.dispatch({ selection: { anchor: newPos } })
    }
  }
}

/**
 * 应用标题级别
 */
export function applyHeading(view: EditorView, level: number) {
  const ranges = view.state.selection.ranges
  const changes: Array<{ from: number, to: number, insert: string }> = []
  const headingPrefix = `${`#`.repeat(level)} `

  ranges.forEach((range) => {
    const fromLine = view.state.doc.lineAt(range.from)
    const toLine = view.state.doc.lineAt(range.to)

    for (let lineNum = fromLine.number; lineNum <= toLine.number; lineNum++) {
      const line = view.state.doc.line(lineNum)
      const text = view.state.doc.sliceString(line.from, line.to)
      // 去掉已有的 # 前缀（1~6 个）+ 空格
      const cleaned = text.replace(/^#{1,6}\s+/, ``).trimStart()
      const heading = headingPrefix + cleaned

      changes.push({
        from: line.from,
        to: line.to,
        insert: heading,
      })
    }
  })

  if (changes.length > 0) {
    const firstLine = view.state.doc.lineAt(ranges[0].from)
    // 计算光标应该在的位置：行首 + 标题前缀长度（如 "# " = 2）
    const newCursorPos = firstLine.from + headingPrefix.length

    view.dispatch({
      changes,
      selection: { anchor: newCursorPos },
    })
  }
}

/**
 * 便捷格式化函数
 */
export function formatBold(view: EditorView) {
  toggleFormat(view, {
    prefix: `**`,
    suffix: `**`,
    check: s => s.startsWith(`**`) && s.endsWith(`**`),
    afterInsertCursorOffset: -2,
  })
}

export function formatItalic(view: EditorView) {
  toggleFormat(view, {
    prefix: `*`,
    suffix: `*`,
    check: s => s.startsWith(`*`) && s.endsWith(`*`),
    afterInsertCursorOffset: -1,
  })
}

export function formatStrikethrough(view: EditorView) {
  toggleFormat(view, {
    prefix: `~~`,
    suffix: `~~`,
    check: s => s.startsWith(`~~`) && s.endsWith(`~~`),
    afterInsertCursorOffset: -2,
  })
}

export function formatLink(view: EditorView) {
  toggleFormat(view, {
    prefix: `[`,
    suffix: `]()`,
    check: s => s.startsWith(`[`) && s.endsWith(`]()`),
    afterInsertCursorOffset: -1,
  })
}

export function formatCode(view: EditorView) {
  toggleFormat(view, {
    prefix: `\``,
    suffix: `\``,
    check: s => s.startsWith(`\``) && s.endsWith(`\``),
    afterInsertCursorOffset: -1,
  })
}

export function formatUnorderedList(view: EditorView) {
  const selection = view.state.selection.main
  const selected = view.state.doc.sliceString(selection.from, selection.to)
  const lines = selected.split(`\n`)
  const isList = lines.every(line => line.trim().startsWith(`- `))
  const updated = isList
    ? lines.map(line => line.replace(/^- +/, ``)).join(`\n`)
    : lines.map(line => `- ${line}`).join(`\n`)
  view.dispatch(view.state.replaceSelection(updated))
}

export function formatOrderedList(view: EditorView) {
  const selection = view.state.selection.main
  const selected = view.state.doc.sliceString(selection.from, selection.to)
  const lines = selected.split(`\n`)
  const isList = lines.every(line => /^\d+\.\s/.test(line.trim()))
  const updated = isList
    ? lines.map(line => line.replace(/^\d+\.\s+/, ``)).join(`\n`)
    : lines.map((line, i) => `${i + 1}. ${line}`).join(`\n`)
  view.dispatch(view.state.replaceSelection(updated))
}

/**
 * 撤销/重做
 */
export function undoAction(view: EditorView): boolean {
  return undo(view)
}

export function redoAction(view: EditorView): boolean {
  return redo(view)
}
