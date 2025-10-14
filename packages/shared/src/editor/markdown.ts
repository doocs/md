import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { highlightSelectionMatches } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { tags } from '@lezer/highlight'

// 浅色主题
const lightTheme = EditorView.theme({
  '&': {
    color: `#333`,
    backgroundColor: `#fff`,
  },
  '.cm-content': {
    padding: `10px`,
    lineHeight: `1.6`,
    fontSize: `14px`,
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  },
  '.cm-focused': {
    outline: `none`,
  },
  '.cm-scroller': {
    'fontFamily': `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    '&::-webkit-scrollbar': {
      display: `none`,
    },
    'scrollbarWidth': `none`,
    'msOverflowStyle': `none`,
  },
}, { dark: false })

// 暗色主题
const darkTheme = EditorView.theme({
  '.cm-scroller': {
    '&::-webkit-scrollbar': {
      display: `none`,
    },
    'scrollbarWidth': `none`,
    'msOverflowStyle': `none`,
  },
}, { dark: true })

// 浅色语法高亮
const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontSize: `1.6em`, fontWeight: `bold`, color: `#2563eb` },
  { tag: tags.heading2, fontSize: `1.4em`, fontWeight: `bold`, color: `#2563eb` },
  { tag: tags.heading3, fontSize: `1.2em`, fontWeight: `bold`, color: `#2563eb` },
  { tag: tags.heading4, fontSize: `1.1em`, fontWeight: `bold`, color: `#2563eb` },
  { tag: tags.heading5, fontSize: `1em`, fontWeight: `bold`, color: `#2563eb` },
  { tag: tags.heading6, fontSize: `1em`, fontWeight: `bold`, color: `#2563eb` },
  { tag: tags.strong, fontWeight: `bold` },
  { tag: tags.emphasis, fontStyle: `italic`, color: `#7c3aed` },
  { tag: tags.strikethrough, textDecoration: `line-through`, color: `#6b7280` },
  { tag: tags.link, color: `#2563eb`, textDecoration: `underline` },
  { tag: tags.monospace, fontFamily: `Consolas, Monaco, "Courier New", monospace`, color: `#e11d48`, fontSize: `0.9em` },
  { tag: tags.url, color: `#2563eb` },
  { tag: tags.quote, color: `#6b7280`, fontStyle: `italic`, borderLeft: `4px solid #d1d5db`, paddingLeft: `10px`, marginLeft: `0` },
  { tag: tags.list, color: `#059669` },
])

// 暗色语法高亮
const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontSize: `1.6em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading2, fontSize: `1.4em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading3, fontSize: `1.2em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading4, fontSize: `1.1em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading5, fontSize: `1em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading6, fontSize: `1em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.strong, fontWeight: `bold` },
  { tag: tags.emphasis, fontStyle: `italic`, color: `#a78bfa` },
  { tag: tags.strikethrough, textDecoration: `line-through`, color: `#9ca3af` },
  { tag: tags.link, color: `#60a5fa`, textDecoration: `underline` },
  { tag: tags.monospace, fontFamily: `Consolas, Monaco, "Courier New", monospace`, color: `#fbbf24`, fontSize: `0.9em` },
  { tag: tags.url, color: `#60a5fa` },
  { tag: tags.quote, color: `#9ca3af`, fontStyle: `italic`, borderLeft: `4px solid #4b5563`, paddingLeft: `10px`, marginLeft: `0` },
  { tag: tags.list, color: `#10b981` },
])

/**
 * Markdown 编辑器的基础扩展集合
 * 包含语言支持、历史记录、括号匹配等基础功能
 */
export function markdownSetup() {
  return [
    // 基础功能
    history(),
    highlightSelectionMatches(),
    closeBrackets(),

    // 语言支持
    markdown(),

    // 快捷键
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

/**
 * Markdown 浅色主题扩展
 */
export function markdownLightTheme() {
  return [
    lightTheme,
    syntaxHighlighting(lightHighlightStyle),
  ]
}

/**
 * Markdown 暗色主题扩展
 */
export function markdownDarkTheme() {
  return [
    oneDark,
    darkTheme,
    syntaxHighlighting(darkHighlightStyle),
  ]
}

/**
 * 根据主题模式获取主题扩展
 */
export function markdownTheme(isDark: boolean) {
  return isDark ? markdownDarkTheme() : markdownLightTheme()
}
