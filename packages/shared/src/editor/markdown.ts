import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { highlightSelectionMatches } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'

/**
 * Markdown 编辑器的基础扩展集合
 * 包含语言支持、历史记录、括号匹配等基础功能
 *
 * 主题请使用统一的 theme() 函数，从 './themes' 导入
 */
export function markdownSetup() {
  return [
    // 基础功能
    history(),
    highlightSelectionMatches(),
    closeBrackets(),

    // 语言支持
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
      addKeymap: true,
    }),

    // 快捷键（原生支持 Mod-，会自动映射为 macOS 的 Cmd 或 Windows/Linux 的 Ctrl）
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...closeBracketsKeymap,
    ]),

    // 编辑器配置
    EditorView.lineWrapping,
    EditorState.allowMultipleSelections.of(true),

    placeholder(`开始写作...`),
  ]
}
