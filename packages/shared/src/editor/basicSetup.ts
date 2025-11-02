import type { Extension } from '@codemirror/state'
import { acceptCompletion, autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import { crosshairCursor, drawSelection, dropCursor, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, rectangularSelection } from '@codemirror/view'
import { indentationMarkers } from '@replit/codemirror-indentation-markers'

// (The superfluous function calls around the list of extensions work
// around current limitations in tree-shaking software.)

/// This is an extension value that just pulls together a number of
/// extensions that you might want in a basic editor. It is meant as a
/// convenient helper to quickly set up CodeMirror without installing
/// and importing a lot of separate packages.
///
/// Specifically, it includes...
///
///  - [the default command bindings](#commands.defaultKeymap)
///  - [line numbers](#view.lineNumbers)
///  - [special character highlighting](#view.highlightSpecialChars)
///  - [the undo history](#commands.history)
///  - [a fold gutter](#language.foldGutter)
///  - [custom selection drawing](#view.drawSelection)
///  - [drop cursor](#view.dropCursor)
///  - [multiple selections](#state.EditorState^allowMultipleSelections)
///  - [reindentation on input](#language.indentOnInput)
///  - [the default highlight style](#language.defaultHighlightStyle) (as fallback)
///  - [bracket matching](#language.bracketMatching)
///  - [bracket closing](#autocomplete.closeBrackets)
///  - [autocompletion](#autocomplete.autocompletion)
///  - [rectangular selection](#view.rectangularSelection) and [crosshair cursor](#view.crosshairCursor)
///  - [active line highlighting](#view.highlightActiveLine)
///  - [active line gutter highlighting](#view.highlightActiveLineGutter)
///  - [selection match highlighting](#search.highlightSelectionMatches)
///  - [search](#search.searchKeymap)
///  - [linting](#lint.lintKeymap)
///
/// (You'll probably want to add some language package to your setup
/// too.)
///
/// This extension does not allow customization. The idea is that,
/// once you decide you want to configure your editor more precisely,
/// you take this package's source (which is just a bunch of imports
/// and an array literal), copy it into your own code, and adjust it
/// as desired.
export const basicSetup: Extension = (() => [
  // lineNumbers(), // 移除行号显示
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  indentationMarkers(), // 添加缩进标记
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
    { key: `Tab`, run: acceptCompletion }, // use tab to completion
    indentWithTab,
  ]),
])()

/// A minimal set of extensions to create a functional editor. Only
/// includes [the default keymap](#commands.defaultKeymap), [undo
/// history](#commands.history), [special character
/// highlighting](#view.highlightSpecialChars), [custom selection
/// drawing](#view.drawSelection), and [default highlight
/// style](#language.defaultHighlightStyle).
export const minimalSetup: Extension = (() => [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
  ]),
])()

export { EditorView } from '@codemirror/view'
