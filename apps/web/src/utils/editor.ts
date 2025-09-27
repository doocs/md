import { altKey, ctrlKey, shiftKey } from '@/configs/shortcut-key'
import { formatDoc } from '@/utils'

// 兼容层：为了保持现有代码的兼容性，我们定义一个与 CodeMirror v5 兼容的接口
export interface V5CompatibleEditor {
  getValue: () => string
  setValue: (content: string) => void
  getSelection: () => string
  replaceSelection: (text: string, cursor?: any) => void
  getCursor: (which?: string) => { line: number, ch: number }
  setCursor: (line: number | { line: number, ch: number }, ch?: number) => void
  setSelection: (from: { line: number, ch: number }, to: { line: number, ch: number }) => void
  getLine: (line: number) => string
  replaceRange: (
    text: string,
    from: { line: number, ch: number },
    to: { line: number, ch: number }
  ) => void
  listSelections: () => Array<{
    from: () => { line: number, ch: number }
    to: () => { line: number, ch: number }
  }>
  operation: (fn: () => void) => void
  undo: () => void
  redo: () => void
  focus: () => void
  getWrapperElement: () => HTMLElement
  on: (event: string, handler: (...args: any[]) => void) => void
  off?: (event: string, handler?: (...args: any[]) => void) => void
  refresh?: () => void
  setOption: (option: string, value: any) => void
  // 搜索相关方法（可选，因为不是所有编辑器都需要）
  getAllMarks?: () => any[]
  markText?: (from: any, to: any, options: any) => { clear: () => void }
  scrollIntoView?: (pos: any) => void
  getSearchCursor?: (query: string, start?: any, caseFold?: boolean) => {
    findNext: () => boolean
    from: () => { line: number, ch: number }
    to: () => { line: number, ch: number }
  }
}

interface ToggleFormatOptions {
  prefix: string
  suffix: string
  check?: (selected: string) => boolean
  afterInsertCursorOffset?: number
}

export function toggleFormat(
  editor: V5CompatibleEditor,
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

export function applyHeading(editor: V5CompatibleEditor, level: number) {
  editor.operation(() => {
    const ranges = editor.listSelections()

    ranges.forEach((range) => {
      const from = range.from()
      const to = range.to()

      for (let line = from.line; line <= to.line; line++) {
        const text = editor.getLine(line)
        // 去掉已有的 # 前缀（1~6 个）+ 空格
        const cleaned = text.replace(/^#{1,6}\s+/, ``).trimStart()
        const heading = `${`#`.repeat(level)} ${cleaned}`
        editor.replaceRange(
          heading,
          { line, ch: 0 },
          { line, ch: text.length },
        )
      }
    })
  })
}

export function createExtraKeys(openSearchWithSelection: (cm: V5CompatibleEditor) => void): Record<string, (editor: V5CompatibleEditor) => void> {
  return {
    [`${shiftKey}-${altKey}-F`]: function autoFormat(editor: V5CompatibleEditor) {
      const value = editor.getValue()
      formatDoc(value).then((doc: string) => {
        editor.setValue(doc)
      })
    },

    [`${ctrlKey}-Z`]: function undo(editor: V5CompatibleEditor) {
      editor.undo()
    },

    [`${ctrlKey}-Y`]: function redo(editor: V5CompatibleEditor) {
      editor.redo()
    },

    [`${ctrlKey}-B`]: function bold(editor: V5CompatibleEditor) {
      toggleFormat(editor, {
        prefix: `**`,
        suffix: `**`,
        check: s => s.startsWith(`**`) && s.endsWith(`**`),
      })
    },

    [`${ctrlKey}-I`]: function italic(editor: V5CompatibleEditor) {
      toggleFormat(editor, {
        prefix: `*`,
        suffix: `*`,
        check: s => s.startsWith(`*`) && s.endsWith(`*`),
      })
    },

    [`${ctrlKey}-D`]: function del(editor: V5CompatibleEditor) {
      toggleFormat(editor, {
        prefix: `~~`,
        suffix: `~~`,
        check: s => s.startsWith(`~~`) && s.endsWith(`~~`),
      })
    },

    [`${ctrlKey}-K`]: function link(editor: V5CompatibleEditor) {
      toggleFormat(editor, {
        prefix: `[`,
        suffix: `]()`,
        check: s => s.startsWith(`[`) && s.endsWith(`]()`),
        afterInsertCursorOffset: -1,
      })
    },

    [`${ctrlKey}-E`]: function code(editor: V5CompatibleEditor) {
      toggleFormat(editor, {
        prefix: `\``,
        suffix: `\``,
        check: s => s.startsWith(`\``) && s.endsWith(`\``),
      })
    },

    [`${ctrlKey}-H`]: (ed: V5CompatibleEditor) => applyHeading(ed, 1),

    [`${ctrlKey}-1`]: (ed: V5CompatibleEditor) => applyHeading(ed, 1),
    [`${ctrlKey}-2`]: (ed: V5CompatibleEditor) => applyHeading(ed, 2),
    [`${ctrlKey}-3`]: (ed: V5CompatibleEditor) => applyHeading(ed, 3),
    [`${ctrlKey}-4`]: (ed: V5CompatibleEditor) => applyHeading(ed, 4),
    [`${ctrlKey}-5`]: (ed: V5CompatibleEditor) => applyHeading(ed, 5),
    [`${ctrlKey}-6`]: (ed: V5CompatibleEditor) => applyHeading(ed, 6),

    [`${ctrlKey}-U`]: function unorderedList(editor: V5CompatibleEditor) {
      const selected = editor.getSelection()
      const lines = selected.split(`\n`)
      const isList = lines.every(line => line.trim().startsWith(`- `))
      const updated = isList
        ? lines.map(line => line.replace(/^- +/, ``)).join(`\n`)
        : lines.map(line => `- ${line}`).join(`\n`)
      editor.replaceSelection(updated)
    },

    [`${ctrlKey}-O`]: function orderedList(editor: V5CompatibleEditor) {
      const selected = editor.getSelection()
      const lines = selected.split(`\n`)
      const isList = lines.every(line => /^\d+\.\s/.test(line.trim()))
      const updated = isList
        ? lines.map(line => line.replace(/^\d+\.\s+/, ``)).join(`\n`)
        : lines.map((line, i) => `${i + 1}. ${line}`).join(`\n`)
      editor.replaceSelection(updated)
    },
    [`${ctrlKey}-F`]: (cm: V5CompatibleEditor) => {
      openSearchWithSelection(cm)
    },
    [`${ctrlKey}-G`]: function search() {
      // use this to avoid CodeMirror's built-in search functionality
    },
  }
}

// 便于组件使用的格式化函数
export function formatBold(editor: V5CompatibleEditor) {
  toggleFormat(editor, {
    prefix: `**`,
    suffix: `**`,
    check: s => s.startsWith(`**`) && s.endsWith(`**`),
  })
}

export function formatItalic(editor: V5CompatibleEditor) {
  toggleFormat(editor, {
    prefix: `*`,
    suffix: `*`,
    check: s => s.startsWith(`*`) && s.endsWith(`*`),
  })
}

export function formatStrikethrough(editor: V5CompatibleEditor) {
  toggleFormat(editor, {
    prefix: `~~`,
    suffix: `~~`,
    check: s => s.startsWith(`~~`) && s.endsWith(`~~`),
  })
}

export function formatLink(editor: V5CompatibleEditor) {
  toggleFormat(editor, {
    prefix: `[`,
    suffix: `]()`,
    check: s => s.startsWith(`[`) && s.endsWith(`]()`),
    afterInsertCursorOffset: -1,
  })
}

export function formatCode(editor: V5CompatibleEditor) {
  toggleFormat(editor, {
    prefix: `\``,
    suffix: `\``,
    check: s => s.startsWith(`\``) && s.endsWith(`\``),
  })
}

export function formatUnorderedList(editor: V5CompatibleEditor) {
  const selected = editor.getSelection()
  const lines = selected.split(`\n`)
  const isList = lines.every(line => line.trim().startsWith(`- `))
  const updated = isList
    ? lines.map(line => line.replace(/^- +/, ``)).join(`\n`)
    : lines.map(line => `- ${line}`).join(`\n`)
  editor.replaceSelection(updated)
}

export function formatOrderedList(editor: V5CompatibleEditor) {
  const selected = editor.getSelection()
  const lines = selected.split(`\n`)
  const isList = lines.every(line => /^\d+\.\s/.test(line.trim()))
  const updated = isList
    ? lines.map(line => line.replace(/^\d+\.\s+/, ``)).join(`\n`)
    : lines.map((line, i) => `${i + 1}. ${line}`).join(`\n`)
  editor.replaceSelection(updated)
}
