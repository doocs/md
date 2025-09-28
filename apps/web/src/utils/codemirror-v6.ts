import type { Extension } from '@codemirror/state'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState, Prec } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { tags } from '@lezer/highlight'

// 自定义浅色主题
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
  '.cm-editor': {
    fontSize: `14px`,
  },
  '.cm-scroller': {
    'fontFamily': `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    // 隐藏滚动条
    '&::-webkit-scrollbar': {
      display: `none`,
    },
    'scrollbarWidth': `none`, // Firefox
    'msOverflowStyle': `none`, // IE and Edge
  },
  '.cm-searchMatch': {
    backgroundColor: `#ffff00`,
    color: `#000`,
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: `#ff6600`,
    color: `#fff`,
  },
  // 代码块样式
  '.cm-line': {
    '& .cm-foldable': {
      backgroundColor: `#f8fafc`,
      border: `1px solid #e2e8f0`,
      borderRadius: `6px`,
      padding: `8px 12px`,
      margin: `8px 0`,
      fontFamily: `Consolas, Monaco, "Courier New", monospace`,
      fontSize: `13px`,
      lineHeight: `1.5`,
    },
  },
}, { dark: false })

// 自定义暗色主题（基于 oneDark，添加代码块样式）
const darkTheme = EditorView.theme({
  '.cm-scroller': {
    // 隐藏滚动条
    '&::-webkit-scrollbar': {
      display: `none`,
    },
    'scrollbarWidth': `none`, // Firefox
    'msOverflowStyle': `none`, // IE and Edge
  },
  // 代码块样式
  '.cm-line': {
    '& .cm-foldable': {
      backgroundColor: `#1f2937`,
      border: `1px solid #374151`,
      borderRadius: `6px`,
      padding: `8px 12px`,
      margin: `8px 0`,
      fontFamily: `Consolas, Monaco, "Courier New", monospace`,
      fontSize: `13px`,
      lineHeight: `1.5`,
      color: `#f3f4f6`,
    },
  },
}, { dark: true })

// 自定义语法高亮
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
  { tag: tags.punctuation, color: `inherit`, backgroundColor: `transparent`, border: `none` },
  { tag: tags.character, color: `inherit`, backgroundColor: `transparent`, border: `none` },
  { tag: tags.operator, color: `inherit`, backgroundColor: `transparent`, border: `none` },
  { tag: tags.url, color: `#2563eb` },
  { tag: tags.quote, color: `#6b7280`, fontStyle: `italic`, borderLeft: `4px solid #d1d5db`, paddingLeft: `10px`, marginLeft: `0` },
  { tag: tags.list, color: `#059669` },
])

const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontSize: `1.6em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading2, fontSize: `1.4em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading3, fontSize: `1.2em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading4, fontSize: `1.1em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading5, fontSize: `1em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.heading6, fontSize: `1.6em`, fontWeight: `bold`, color: `#60a5fa` },
  { tag: tags.strong, fontWeight: `bold` },
  { tag: tags.emphasis, fontStyle: `italic`, color: `#a78bfa` },
  { tag: tags.strikethrough, textDecoration: `line-through`, color: `#9ca3af` },
  { tag: tags.link, color: `#60a5fa`, textDecoration: `underline` },
  { tag: tags.monospace, fontFamily: `Consolas, Monaco, "Courier New", monospace`, color: `#fbbf24`, fontSize: `0.9em` },
  { tag: tags.punctuation, color: `inherit`, backgroundColor: `transparent`, border: `none` },
  { tag: tags.character, color: `inherit`, backgroundColor: `transparent`, border: `none` },
  { tag: tags.operator, color: `inherit`, backgroundColor: `transparent`, border: `none` },
  { tag: tags.url, color: `#60a5fa` },
  { tag: tags.quote, color: `#9ca3af`, fontStyle: `italic`, borderLeft: `4px solid #4b5563`, paddingLeft: `10px`, marginLeft: `0` },
  { tag: tags.list, color: `#10b981` },
])

// CodeMirror v6 原生接口定义
export interface CodeMirrorV6Editor {
  // EditorView 实例
  view: EditorView
  // 主题切换方法
  updateTheme: (isDark: boolean) => void
  // 销毁编辑器
  destroy: () => void
}

// 创建编辑器扩展
export function createEditorExtensions(extraKeyHandlers: Record<string, (view: EditorView) => boolean> = {}): Extension[] {
  // 转换键盘处理器到 v6 keymap
  const convertedKeymap = Object.entries(extraKeyHandlers).map(([key, handler]) => ({
    key: convertKeyBinding(key),
    run: (view: EditorView, event?: Event) => {
      // 阻止浏览器默认行为
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }

      try {
        return handler(view)
      }
      catch (error) {
        console.error(`Error in keymap handler for ${key}:`, error)
        return false
      }
    },
    preventDefault: true,
  }))

  const extensions: Extension[] = [
    // 基础功能
    history(),
    search({ top: true }), // 使用 v6 内置搜索
    highlightSelectionMatches(),
    closeBrackets(),

    // 语言支持
    markdown(),

    // 快捷键
    Prec.high(keymap.of(convertedKeymap)), // 自定义快捷键，高优先级
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...closeBracketsKeymap,
    ]),

    // 编辑器配置
    EditorView.lineWrapping,
    EditorState.allowMultipleSelections.of(true),

    // 占位符
    placeholder(`开始写作...`),
  ]

  return extensions
}

// 转换键绑定格式
function convertKeyBinding(key: string): string {
  return key
    .replace(/Ctrl/g, `Mod`)
    .replace(/Alt/g, `Alt`)
    .replace(/Shift/g, `Shift`)
    .replace(/-/g, `-`)
}

// 动态主题切换的 Compartment
let themeCompartment: Compartment | null = null

// 创建编辑器实例
export function createCodeMirrorV6(
  parent: HTMLElement,
  initialValue: string = ``,
  isDark: boolean = false,
  extraKeyHandlers: Record<string, (view: EditorView) => boolean> = {},
  onChange?: (value: string) => void,
): CodeMirrorV6Editor {
  // 创建 Compartment 用于动态主题切换
  themeCompartment = new Compartment()

  const extensions = createEditorExtensions(extraKeyHandlers)

  // 单独添加主题扩展到 compartment 中
  extensions.push(
    themeCompartment.of(isDark ? [oneDark, darkTheme] : lightTheme),
    syntaxHighlighting(isDark ? darkHighlightStyle : lightHighlightStyle),
  )

  // 添加变化监听器
  if (onChange) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
    )
  }

  const state = EditorState.create({
    doc: initialValue,
    extensions,
  })

  const view = new EditorView({
    state,
    parent,
  })

  // 主题切换方法
  const updateTheme = (isDark: boolean) => {
    if (themeCompartment) {
      view.dispatch({
        effects: themeCompartment.reconfigure(
          [
            isDark ? [oneDark, darkTheme] : lightTheme,
            syntaxHighlighting(isDark ? darkHighlightStyle : lightHighlightStyle),
          ],
        ),
      })
    }
  }

  // 销毁方法
  const destroy = () => {
    view.destroy()
    themeCompartment = null
  }

  return {
    view,
    updateTheme,
    destroy,
  }
}
