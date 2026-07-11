import type { EditorView } from '@codemirror/view'
import AIPolishPopover from './ToolBoxPopover.vue'

function useAIPolish() {
  // Toolbox moved to sidebar; no position logic needed
  // Keep minimal API for compatibility

  const selectedText = ref(``)

  function getCurrentSelection(editor: EditorView | null): string {
    try {
      if (!editor)
        return ``
      const selection = editor.state.selection.main
      return editor.state.doc.sliceString(selection.from, selection.to).trim()
    }
    catch {
      return ``
    }
  }

  return {
    selectedText,
    getCurrentSelection,
  }
}

export { AIPolishPopover, useAIPolish }
