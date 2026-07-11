import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { foldGutter, foldKeymap } from '@codemirror/language'
import { highlightSelectionMatches } from '@codemirror/search'
import { EditorSelection, EditorState, Prec } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
import { codeLanguages } from './codeLanguages'
import { applyHeading, formatBold, formatCode, formatItalic, formatLink, formatOrderedList, formatStrikethrough, formatUnorderedList, redoAction, undoAction } from './format'

async function formatMarkdown(view: EditorView) {
  const content = view.state.doc.toString()
  const { formatDoc } = await import('../utils/formatDoc')
  const formatted = await formatDoc(content, `markdown`)
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: formatted },
  })
}

function insertTabAtCursor(view: EditorView): boolean {
  const spaces = `  `
  const changes = view.state.changeByRange(range => ({
    changes: { from: range.from, to: range.to, insert: spaces },
    range: EditorSelection.range(range.from + spaces.length, range.from + spaces.length),
  }))
  view.dispatch(changes)
  return true
}

interface MarkdownKeymapOptions {
  onSearch?: (view: EditorView) => void
  onReplace?: (view: EditorView) => void
  onGoToLine?: (view: EditorView) => void
  placeholder?: string
  /** When true, omit history(); caller manages undo via Compartment (e.g. clear stack on doc switch) */
  withoutHistory?: boolean
}

export function markdownKeymap(options?: MarkdownKeymapOptions) {
  const { onSearch, onReplace, onGoToLine } = options || {}

  return keymap.of([
    { key: `Tab`, run: insertTabAtCursor },

    { key: `Mod-z`, run: undoAction },
    { key: `Mod-y`, run: redoAction },

    { key: `Mod-b`, run: (view) => { formatBold(view); return true } },
    { key: `Mod-i`, run: (view) => { formatItalic(view); return true } },
    { key: `Mod-d`, run: (view) => { formatStrikethrough(view); return true } },
    { key: `Mod-k`, run: (view) => { formatLink(view); return true } },
    { key: `Mod-e`, run: (view) => { formatCode(view); return true } },

    { key: `Mod-1`, run: (view) => { applyHeading(view, 1); return true } },
    { key: `Mod-2`, run: (view) => { applyHeading(view, 2); return true } },
    { key: `Mod-3`, run: (view) => { applyHeading(view, 3); return true } },
    { key: `Mod-4`, run: (view) => { applyHeading(view, 4); return true } },
    { key: `Mod-5`, run: (view) => { applyHeading(view, 5); return true } },
    { key: `Mod-6`, run: (view) => { applyHeading(view, 6); return true } },

    { key: `Mod-u`, run: (view) => { formatUnorderedList(view); return true } },
    { key: `Mod-o`, run: (view) => { formatOrderedList(view); return true } },

    ...(onSearch ? [{ key: `Mod-f`, run: (view: EditorView) => { onSearch(view); return true } }] : []),
    ...(onReplace ? [{ key: `Mod-h`, run: (view: EditorView) => { onReplace(view); return true } }] : []),

    { key: `Shift-Alt-f`, run: (view: EditorView) => { formatMarkdown(view); return true } },

    ...(onGoToLine
      ? [{ key: `Mod-g`, run: (view: EditorView) => { onGoToLine(view); return true } }]
      : [{ key: `Mod-g`, run: () => true }]),
  ])
}

/** Markdown editor extensions. Import theme() from './themes' for theming. */
export function markdownSetup(options?: MarkdownKeymapOptions) {
  const { placeholder: placeholderText, withoutHistory } = options || {}

  return [
    ...(withoutHistory ? [] : [history()]),
    highlightSelectionMatches(),
    closeBrackets(),

    indentationMarkers(),

    markdown({
      base: markdownLanguage,
      codeLanguages,
      addKeymap: true,
    }),

    // Higher priority than default keymap
    Prec.high(markdownKeymap(options)),

    foldGutter(),

    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...closeBracketsKeymap,
      ...foldKeymap,
    ]),

    EditorView.lineWrapping,
    EditorState.allowMultipleSelections.of(true),

    ...(placeholderText ? [placeholder(placeholderText)] : []),
  ]
}
