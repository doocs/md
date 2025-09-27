import type { Extension } from '@codemirror/state'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { highlightSelectionMatches } from '@codemirror/search'
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

// 创建编辑器扩展
export function createEditorExtensions(_isDark: boolean, extraKeys: Record<string, any> = {}): Extension[] {
  // 转换 v5 的 extraKeys 到 v6 的 keymap
  const convertedKeymap = Object.entries(extraKeys).map(([key, handler]) => ({
    key: convertKeyBinding(key),
    run: (view: EditorView, event?: Event) => {
      // 阻止浏览器默认行为
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }

      // 创建一个兼容 v5 API 的编辑器对象
      const compatibleEditor = createV5CompatibleEditor(view)
      if (typeof handler === `function`) {
        try {
          handler(compatibleEditor)
          return true // 阻止默认行为
        }
        catch (error) {
          console.error(`Error in keymap handler for ${key}:`, error)
          return false
        }
      }
      return true
    },
    preventDefault: true, // 确保阻止浏览器默认行为
  }))

  const extensions: Extension[] = [
    // 基础功能
    history(),
    // search({ top: true }), // 移除 v6 内置搜索，使用自定义搜索功能
    highlightSelectionMatches(),
    closeBrackets(),

    // 语言支持
    markdown(),

    // 快捷键 - 使用高优先级确保自定义快捷键覆盖默认行为
    Prec.highest(keymap.of([
      // 专门处理 Ctrl+F 确保覆盖浏览器默认搜索
      {
        key: `Mod-f`,
        run: (view: EditorView, event?: Event) => {
          if (event) {
            event.preventDefault()
            event.stopPropagation()
          }
          // 查找自定义搜索处理函数
          const ctrlFHandler = convertedKeymap.find(k => k.key === `Mod-f`)
          if (ctrlFHandler) {
            return ctrlFHandler.run(view, event)
          }
          return true
        },
        preventDefault: true,
      },
    ])),
    Prec.high(keymap.of(convertedKeymap)), // 自定义快捷键，高优先级
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      // 移除 searchKeymap，使用自定义搜索功能
      // ...searchKeymap,
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

// 转换 v5 的键绑定格式到 v6 格式
function convertKeyBinding(v5Key: string): string {
  return v5Key
    .replace(/Ctrl/g, `Mod`)
    .replace(/Alt/g, `Alt`)
    .replace(/Shift/g, `Shift`)
    .replace(/-/g, `-`)
}

// 创建与 v5 API 兼容的编辑器对象
function createV5CompatibleEditor(view: EditorView) {
  return {
    getValue: () => view.state.doc.toString(),
    setValue: (content: string) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
      })
    },
    getSelection: () => {
      const selection = view.state.selection.main
      return view.state.doc.sliceString(selection.from, selection.to)
    },
    replaceSelection: (text: string, _cursor?: any) => {
      view.dispatch(view.state.replaceSelection(text))
    },
    getCursor: (which?: string) => {
      const selection = view.state.selection.main
      const pos = which === `from` ? selection.from : selection.to
      const line = view.state.doc.lineAt(pos)
      return {
        line: line.number - 1, // v5 使用 0 基准的行号
        ch: pos - line.from,
      }
    },
    setCursor: (line: number | { line: number, ch: number }, ch?: number) => {
      let pos: number
      if (typeof line === `object`) {
        const docLine = view.state.doc.line(line.line + 1) // v6 使用 1 基准的行号
        pos = docLine.from + line.ch
      }
      else {
        const docLine = view.state.doc.line(line + 1)
        pos = docLine.from + (ch || 0)
      }
      view.dispatch({ selection: { anchor: pos } })
    },
    setSelection: (from: { line: number, ch: number }, to: { line: number, ch: number }) => {
      const fromLine = view.state.doc.line(from.line + 1)
      const toLine = view.state.doc.line(to.line + 1)
      const fromPos = fromLine.from + from.ch
      const toPos = toLine.from + to.ch
      view.dispatch({ selection: { anchor: fromPos, head: toPos } })
    },
    getLine: (line: number) => {
      const docLine = view.state.doc.line(line + 1)
      return view.state.doc.sliceString(docLine.from, docLine.to)
    },
    replaceRange: (
      text: string,
      from: { line: number, ch: number },
      to: { line: number, ch: number },
    ) => {
      const fromLine = view.state.doc.line(from.line + 1)
      const toLine = view.state.doc.line(to.line + 1)
      const fromPos = fromLine.from + from.ch
      const toPos = toLine.from + to.ch
      view.dispatch({
        changes: { from: fromPos, to: toPos, insert: text },
      })
    },
    listSelections: () => {
      return view.state.selection.ranges.map((range: any) => ({
        from: () => {
          const line = view.state.doc.lineAt(range.from)
          return { line: line.number - 1, ch: range.from - line.from }
        },
        to: () => {
          const line = view.state.doc.lineAt(range.to)
          return { line: line.number - 1, ch: range.to - line.from }
        },
      }))
    },
    operation: (fn: () => void) => {
      // v6 中事务是自动批处理的，所以直接执行函数
      fn()
    },
    undo: () => {
      // 会被键盘快捷键处理
    },
    redo: () => {
      // 会被键盘快捷键处理
    },
    focus: () => {
      view.focus()
    },
    getWrapperElement: () => view.dom,
    on: (event: string, handler: (...args: any[]) => void) => {
      // v6 使用不同的事件系统，这里提供基础兼容
      switch (event) {
        case `change`:
          // 监听文档变化 - 这个已经通过 onChange 回调处理
          break
        case `changes`:
          // 监听文档变化 (v5 兼容)
          break
        case `cursorActivity`:
          // 监听光标活动
          break
        case `mousedown`:
        case `mouseup`:
          view.dom.addEventListener(event, handler as EventListener)
          break
        case `keydown`:
          // 键盘事件需要特殊处理以保持 v5 兼容性
          view.dom.addEventListener(event, (e: Event) => {
            // v5 的事件处理函数期望 (editor, event) 参数
            // 我们传递当前的兼容编辑器实例（避免循环调用）
            const compatEditor = (view as any).compatibleEditor || createV5CompatibleEditor(view)
            handler(compatEditor, e)
          }, { capture: true }) // 使用捕获阶段，确保在全局事件之前处理
          break
        case `scroll`: {
          // 滚动事件
          const scrollEl = view.dom.querySelector(`.cm-scroller`) || view.dom
          scrollEl.addEventListener(`scroll`, handler as EventListener)
          break
        }
      }
    },
    off: (event: string, handler?: (...args: any[]) => void) => {
      // 移除事件监听器
      if (handler) {
        switch (event) {
          case `scroll`: {
            const scrollEl = view.dom.querySelector(`.cm-scroller`) || view.dom
            scrollEl.removeEventListener(`scroll`, handler as EventListener)
            break
          }
          default:
            view.dom.removeEventListener(event, handler as EventListener)
            break
        }
      }
    },
    refresh: () => {
      // v6 不需要手动刷新
      console.log(`refresh() is not needed in CodeMirror 6`)
    },
    setOption: (option: string, _value: any) => {
      // v6 不使用 setOption，需要重新配置编辑器
      console.warn(`setOption is not supported in CodeMirror 6. Option: ${option}`)
    },
    // 搜索相关方法的基础实现
    getAllMarks: () => {
      console.warn(`getAllMarks is not fully implemented for CodeMirror 6`)
      return []
    },
    markText: (_from: any, _to: any, _options: any) => {
      console.warn(`markText is not fully implemented for CodeMirror 6`)
      return { clear: () => {} }
    },
    scrollIntoView: (_pos: any) => {
      console.warn(`scrollIntoView is not fully implemented for CodeMirror 6`)
    },
    getSearchCursor: (_query: string, _start?: any, _caseFold?: boolean) => {
      console.warn(`getSearchCursor is not fully implemented for CodeMirror 6`)
      return {
        findNext: () => false,
        from: () => ({ line: 0, ch: 0 }),
        to: () => ({ line: 0, ch: 0 }),
      }
    },
  }
}

// 动态主题切换的 Compartment
let themeCompartment: any = null

// 创建编辑器实例
export function createCodeMirrorV6(
  parent: HTMLElement,
  initialValue: string = ``,
  isDark: boolean = false,
  extraKeys: Record<string, any> = {},
  onChange?: (value: string) => void,
): EditorView & { compatibleEditor: any, updateTheme: (isDark: boolean) => void } {
  // 创建 Compartment 用于动态主题切换
  themeCompartment = new Compartment()

  const extensions = createEditorExtensions(false, extraKeys) // 先不包含主题

  // 单独添加主题扩展到 compartment 中
  extensions.push(
    themeCompartment.of(isDark ? [oneDark, darkTheme] : lightTheme),
    syntaxHighlighting(isDark ? darkHighlightStyle : lightHighlightStyle),
  )

  // 添加变化监听器
  if (onChange) {
    extensions.push(
      EditorView.updateListener.of((update: any) => {
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
  }) as EditorView & { compatibleEditor: any, updateTheme: (isDark: boolean) => void }

  // 添加主题切换方法
  view.updateTheme = (isDark: boolean) => {
    view.dispatch({
      effects: themeCompartment.reconfigure(
        [
          isDark ? [oneDark, darkTheme] : lightTheme,
          syntaxHighlighting(isDark ? darkHighlightStyle : lightHighlightStyle),
        ],
      ),
    })
  }

  // 添加兼容层
  view.compatibleEditor = createV5CompatibleEditor(view)

  // 为兼容层添加 setOption 支持
  const originalSetOption = view.compatibleEditor.setOption
  view.compatibleEditor.setOption = (option: string, value: any) => {
    if (option === `theme`) {
      const isDarkTheme = value === `darcula`
      view.updateTheme(isDarkTheme)
    }
    else {
      originalSetOption(option, value)
    }
  }

  return view
}
