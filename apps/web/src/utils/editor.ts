import type CodeMirror from 'codemirror'
import { altKey, ctrlKey, shiftKey } from '@/configs/shortcut-key'
import { formatDoc } from '@/utils'

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

function applyHeading(editor: CodeMirror.Editor, level: number) {
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

export function createExtraKeys(openSearchWithSelection: (cm: CodeMirror.Editor) => void): CodeMirror.KeyMap {
  return {
    [`${shiftKey}-${altKey}-F`]: function autoFormat(editor) {
      const value = editor.getValue()
      formatDoc(value).then((doc: string) => {
        editor.setValue(doc)
      })
    },

    [`${ctrlKey}-Z`]: function undo(editor) {
      editor.undo()
    },

    [`${ctrlKey}-Y`]: function redo(editor) {
      editor.redo()
    },

    [`${ctrlKey}-B`]: function bold(editor) {
      toggleFormat(editor, {
        prefix: `**`,
        suffix: `**`,
        check: s => s.startsWith(`**`) && s.endsWith(`**`),
      })
    },

    [`${ctrlKey}-I`]: function italic(editor) {
      toggleFormat(editor, {
        prefix: `*`,
        suffix: `*`,
        check: s => s.startsWith(`*`) && s.endsWith(`*`),
      })
    },

    [`${ctrlKey}-D`]: function del(editor) {
      toggleFormat(editor, {
        prefix: `~~`,
        suffix: `~~`,
        check: s => s.startsWith(`~~`) && s.endsWith(`~~`),
      })
    },

    [`${ctrlKey}-K`]: function link(editor) {
      toggleFormat(editor, {
        prefix: `[`,
        suffix: `]()`,
        check: s => s.startsWith(`[`) && s.endsWith(`]()`),
        afterInsertCursorOffset: -1,
      })
    },

    [`${ctrlKey}-E`]: function code(editor) {
      toggleFormat(editor, {
        prefix: `\``,
        suffix: `\``,
        check: s => s.startsWith(`\``) && s.endsWith(`\``),
      })
    },

    [`${ctrlKey}-1`]: (ed: CodeMirror.Editor) => applyHeading(ed, 1),
    [`${ctrlKey}-2`]: (ed: CodeMirror.Editor) => applyHeading(ed, 2),
    [`${ctrlKey}-3`]: (ed: CodeMirror.Editor) => applyHeading(ed, 3),
    [`${ctrlKey}-4`]: (ed: CodeMirror.Editor) => applyHeading(ed, 4),
    [`${ctrlKey}-5`]: (ed: CodeMirror.Editor) => applyHeading(ed, 5),
    [`${ctrlKey}-6`]: (ed: CodeMirror.Editor) => applyHeading(ed, 6),

    [`${ctrlKey}-U`]: function unorderedList(editor) {
      const selected = editor.getSelection()
      const lines = selected.split(`\n`)
      const isList = lines.every(line => line.trim().startsWith(`- `))
      const updated = isList
        ? lines.map(line => line.replace(/^- +/, ``)).join(`\n`)
        : lines.map(line => `- ${line}`).join(`\n`)
      editor.replaceSelection(updated)
    },

    [`${ctrlKey}-O`]: function orderedList(editor) {
      const selected = editor.getSelection()
      const lines = selected.split(`\n`)
      const isList = lines.every(line => /^\d+\.\s/.test(line.trim()))
      const updated = isList
        ? lines.map(line => line.replace(/^\d+\.\s+/, ``)).join(`\n`)
        : lines.map((line, i) => `${i + 1}. ${line}`).join(`\n`)
      editor.replaceSelection(updated)
    },
    [`${ctrlKey}-F`]: (cm: CodeMirror.Editor) => {
      openSearchWithSelection(cm)
    },
    [`${ctrlKey}-G`]: function search() {
      // use this to avoid CodeMirror's built-in search functionality
    },
  }
}
