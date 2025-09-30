import type { EditorView } from '@codemirror/view'
import { redo, undo } from '@codemirror/commands'
import { altKey, ctrlKey, shiftKey } from '@/configs/shortcut-key'
import { formatDoc } from '@/utils'

interface ToggleFormatOptions {
  prefix: string
  suffix: string
  check?: (selected: string) => boolean
  afterInsertCursorOffset?: number
}

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

export function applyHeading(view: EditorView, level: number) {
  const ranges = view.state.selection.ranges
  const changes: Array<{ from: number, to: number, insert: string }> = []

  ranges.forEach((range) => {
    const fromLine = view.state.doc.lineAt(range.from)
    const toLine = view.state.doc.lineAt(range.to)

    for (let lineNum = fromLine.number; lineNum <= toLine.number; lineNum++) {
      const line = view.state.doc.line(lineNum)
      const text = view.state.doc.sliceString(line.from, line.to)
      // 去掉已有的 # 前缀（1~6 个）+ 空格
      const cleaned = text.replace(/^#{1,6}\s+/, ``).trimStart()
      const heading = `${`#`.repeat(level)} ${cleaned}`

      changes.push({
        from: line.from,
        to: line.to,
        insert: heading,
      })
    }
  })

  if (changes.length > 0) {
    view.dispatch({ changes })
  }
}

// v6 大小写敏感
export function createExtraKeys(openSearchWithSelection: (view: EditorView) => void): Record<string, (view: EditorView) => boolean> {
  return {
    [`${shiftKey}-${altKey}-f`]: function autoFormat(view: EditorView): boolean {
      const value = view.state.doc.toString()
      formatDoc(value).then((doc: string) => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: doc },
        })
      })
      return true
    },

    [`${ctrlKey}-z`]: function undoAction(view: EditorView): boolean {
      return undo(view)
    },

    [`${ctrlKey}-y`]: function redoAction(view: EditorView): boolean {
      return redo(view)
    },

    [`${ctrlKey}-b`]: function bold(view: EditorView): boolean {
      toggleFormat(view, {
        prefix: `**`,
        suffix: `**`,
        check: s => s.startsWith(`**`) && s.endsWith(`**`),
      })
      return true
    },

    [`${ctrlKey}-i`]: function italic(view: EditorView): boolean {
      toggleFormat(view, {
        prefix: `*`,
        suffix: `*`,
        check: s => s.startsWith(`*`) && s.endsWith(`*`),
      })
      return true
    },

    [`${ctrlKey}-d`]: function del(view: EditorView): boolean {
      toggleFormat(view, {
        prefix: `~~`,
        suffix: `~~`,
        check: s => s.startsWith(`~~`) && s.endsWith(`~~`),
      })
      return true
    },

    [`${ctrlKey}-k`]: function link(view: EditorView): boolean {
      toggleFormat(view, {
        prefix: `[`,
        suffix: `]()`,
        check: s => s.startsWith(`[`) && s.endsWith(`]()`),
        afterInsertCursorOffset: -1,
      })
      return true
    },

    [`${ctrlKey}-e`]: function code(view: EditorView): boolean {
      toggleFormat(view, {
        prefix: `\``,
        suffix: `\``,
        check: s => s.startsWith(`\``) && s.endsWith(`\``),
      })
      return true
    },

    [`${ctrlKey}-h`]: (view: EditorView): boolean => {
      applyHeading(view, 1)
      return true
    },

    [`${ctrlKey}-1`]: (view: EditorView): boolean => {
      applyHeading(view, 1)
      return true
    },
    [`${ctrlKey}-2`]: (view: EditorView): boolean => {
      applyHeading(view, 2)
      return true
    },
    [`${ctrlKey}-3`]: (view: EditorView): boolean => {
      applyHeading(view, 3)
      return true
    },
    [`${ctrlKey}-4`]: (view: EditorView): boolean => {
      applyHeading(view, 4)
      return true
    },
    [`${ctrlKey}-5`]: (view: EditorView): boolean => {
      applyHeading(view, 5)
      return true
    },
    [`${ctrlKey}-6`]: (view: EditorView): boolean => {
      applyHeading(view, 6)
      return true
    },

    [`${ctrlKey}-u`]: function unorderedList(view: EditorView): boolean {
      const selection = view.state.selection.main
      const selected = view.state.doc.sliceString(selection.from, selection.to)
      const lines = selected.split(`\n`)
      const isList = lines.every(line => line.trim().startsWith(`- `))
      const updated = isList
        ? lines.map(line => line.replace(/^- +/, ``)).join(`\n`)
        : lines.map(line => `- ${line}`).join(`\n`)
      view.dispatch(view.state.replaceSelection(updated))
      return true
    },

    [`${ctrlKey}-o`]: function orderedList(view: EditorView): boolean {
      const selection = view.state.selection.main
      const selected = view.state.doc.sliceString(selection.from, selection.to)
      const lines = selected.split(`\n`)
      const isList = lines.every(line => /^\d+\.\s/.test(line.trim()))
      const updated = isList
        ? lines.map(line => line.replace(/^\d+\.\s+/, ``)).join(`\n`)
        : lines.map((line, i) => `${i + 1}. ${line}`).join(`\n`)
      view.dispatch(view.state.replaceSelection(updated))
      return true
    },
    [`${ctrlKey}-f`]: (view: EditorView): boolean => {
      openSearchWithSelection(view)
      return true
    },
    [`${ctrlKey}-g`]: function search(): boolean {
      // use this to avoid CodeMirror's built-in search functionality
      return true
    },
  }
}

// 便于组件使用的格式化函数
export function formatBold(view: EditorView) {
  toggleFormat(view, {
    prefix: `**`,
    suffix: `**`,
    check: s => s.startsWith(`**`) && s.endsWith(`**`),
  })
}

export function formatItalic(view: EditorView) {
  toggleFormat(view, {
    prefix: `*`,
    suffix: `*`,
    check: s => s.startsWith(`*`) && s.endsWith(`*`),
  })
}

export function formatStrikethrough(view: EditorView) {
  toggleFormat(view, {
    prefix: `~~`,
    suffix: `~~`,
    check: s => s.startsWith(`~~`) && s.endsWith(`~~`),
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
