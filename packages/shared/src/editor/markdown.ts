import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { highlightSelectionMatches } from '@codemirror/search'
import { EditorSelection, EditorState, Prec } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
import { formatDoc } from '../utils/fileHelpers'
import { applyHeading, formatBold, formatCode, formatItalic, formatLink, formatOrderedList, formatStrikethrough, formatUnorderedList, redoAction, undoAction } from './format'

/**
 * Markdown 格式化处理函数
 */
async function formatMarkdown(view: EditorView) {
  const content = view.state.doc.toString()
  const formatted = await formatDoc(content, `markdown`)
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: formatted },
  })
}

/**
 * 在光标位置插入缩进（空格）
 */
function insertTabAtCursor(view: EditorView): boolean {
  const spaces = `  ` // 2 个空格作为缩进
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
}

/**
 * Markdown 编辑器的快捷键映射
 *
 * @param options - 配置选项
 * @param options.onSearch - 搜索回调（可选）
 */
export function markdownKeymap(options?: MarkdownKeymapOptions) {
  const { onSearch, onReplace } = options || {}

  return keymap.of([
    // Tab 键在光标位置插入缩进
    { key: `Tab`, run: insertTabAtCursor },

    // 撤销/重做
    { key: `Mod-z`, run: undoAction },
    { key: `Mod-y`, run: redoAction },

    // 文本格式
    { key: `Mod-b`, run: (view) => { formatBold(view); return true } },
    { key: `Mod-i`, run: (view) => { formatItalic(view); return true } },
    { key: `Mod-d`, run: (view) => { formatStrikethrough(view); return true } },
    { key: `Mod-k`, run: (view) => { formatLink(view); return true } },
    { key: `Mod-e`, run: (view) => { formatCode(view); return true } },

    // 标题（使用 Mod-1 到 Mod-6）
    { key: `Mod-1`, run: (view) => { applyHeading(view, 1); return true } },
    { key: `Mod-2`, run: (view) => { applyHeading(view, 2); return true } },
    { key: `Mod-3`, run: (view) => { applyHeading(view, 3); return true } },
    { key: `Mod-4`, run: (view) => { applyHeading(view, 4); return true } },
    { key: `Mod-5`, run: (view) => { applyHeading(view, 5); return true } },
    { key: `Mod-6`, run: (view) => { applyHeading(view, 6); return true } },

    // 列表
    { key: `Mod-u`, run: (view) => { formatUnorderedList(view); return true } },
    { key: `Mod-o`, run: (view) => { formatOrderedList(view); return true } },

    // 搜索和替换（可选）
    ...(onSearch ? [{ key: `Mod-f`, run: (view: EditorView) => { onSearch(view); return true } }] : []),
    ...(onReplace ? [{ key: `Mod-h`, run: (view: EditorView) => { onReplace(view); return true } }] : []),

    // 格式化
    { key: `Shift-Alt-f`, run: (view: EditorView) => { formatMarkdown(view); return true } },

    // 阻止 Mod-g（避免触发 CodeMirror 内置搜索）
    { key: `Mod-g`, run: () => true },
  ])
}

/**
 * Markdown 编辑器的基础扩展集合
 * 包含语言支持、历史记录、括号匹配等基础功能
 *
 * 主题请使用统一的 theme() 函数，从 './themes' 导入
 *
 * @param options - 配置选项（可选）
 * @param options.onSearch - 搜索回调，触发快捷键 Mod-f
 *
 */
export function markdownSetup(options?: MarkdownKeymapOptions) {
  return [
    // 基础功能
    history(),
    highlightSelectionMatches(),
    closeBrackets(),

    // 缩进标记
    indentationMarkers(),

    // 语言支持
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
      addKeymap: true,
    }),

    // Markdown 快捷键（高优先级，优先于默认快捷键）
    Prec.high(markdownKeymap(options)),

    // 默认快捷键
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
