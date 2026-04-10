import type { EditorView } from '@codemirror/view'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView as CMEditorView } from '@codemirror/view'
import { theme as editorTheme, htmlSetup } from '@md/shared/editor'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

const DEFAULT_HTML_CONTENT = `<h1>欢迎使用 HTML 编辑器</h1>
<p>在这里可以直接编辑 HTML 代码，预览效果会实时显示在右侧。</p>
<p>示例：</p>
<ul>
  <li>无序列表项 1</li>
  <li>无序列表项 2</li>
</ul>
<p style="color: #1890ff;">蓝色文字</p>`

/**
 * HTML 编辑器 Store
 * 负责管理 HTML 编辑器实例和内容
 */
export const useHtmlEditorStore = defineStore(`htmlEditor`, () => {
  const isDark = useDark()

  // HTML 编辑器实例
  const htmlEditor = ref<EditorView | null>(null)
  const htmlEditorThemeCompartment = ref<Compartment | null>(null)

  // HTML 内容
  const htmlContent = store.reactive(addPrefix(`html_content`), DEFAULT_HTML_CONTENT)

  // 设置编辑器内容
  const setHtmlEditorValue = (content: string) => {
    if (htmlEditor.value) {
      htmlEditor.value.dispatch({
        changes: { from: 0, to: htmlEditor.value.state.doc.length, insert: content },
      })
    }
    htmlContent.value = content
  }

  // 导入 HTML 内容
  const importHtmlContent = (content: string) => {
    if (!htmlEditor.value)
      return

    htmlEditor.value.dispatch({
      changes: { from: 0, to: htmlEditor.value.state.doc.length, insert: content },
    })
  }

  // 清空内容
  const clearHtmlContent = () => {
    if (!htmlEditor.value)
      return

    htmlEditor.value.dispatch({
      changes: { from: 0, to: htmlEditor.value.state.doc.length, insert: `` },
    })
    toast.success(`HTML 内容已清空`)
  }

  // 获取当前内容
  const getHtmlContent = () => {
    return htmlEditor.value?.state.doc.toString() ?? htmlContent.value
  }

  // 获取选中的文本
  const getHtmlSelection = () => {
    if (!htmlEditor.value)
      return ``

    const selection = htmlEditor.value.state.selection.main
    return htmlEditor.value.state.doc.sliceString(selection.from, selection.to)
  }

  // 替换选中的文本
  const replaceHtmlSelection = (text: string) => {
    if (!htmlEditor.value)
      return

    htmlEditor.value.dispatch(htmlEditor.value.state.replaceSelection(text))
  }

  // 在光标位置插入文本
  const insertHtmlAtCursor = (text: string) => {
    if (!htmlEditor.value)
      return

    const selection = htmlEditor.value.state.selection.main
    htmlEditor.value.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + text.length },
    })
    htmlEditor.value.focus()
  }

  // 初始化 HTML 编辑器
  const initHtmlEditor = (onUpdate: (content: string) => void) => {
    const htmlEditorDom = document.querySelector<HTMLElement>(`#htmlEditor`)
    if (!htmlEditorDom || htmlEditor.value)
      return

    htmlEditorDom.innerHTML = ``

    // 创建主题 Compartment 用于动态切换
    htmlEditorThemeCompartment.value = new Compartment()

    // 创建 HTML 编辑器
    const state = EditorState.create({
      doc: htmlContent.value,
      extensions: [
        htmlSetup(),
        htmlEditorThemeCompartment.value.of(editorTheme(isDark.value)),
        CMEditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const content = update.state.doc.toString()
            htmlContent.value = content
            onUpdate(content)
          }
        }),
      ],
    })

    htmlEditor.value = markRaw(new CMEditorView({
      state,
      parent: htmlEditorDom,
    }))
  }

  // 监听深色模式变化
  watch(isDark, () => {
    if (htmlEditor.value && htmlEditorThemeCompartment.value) {
      htmlEditor.value.dispatch({
        effects: htmlEditorThemeCompartment.value.reconfigure(editorTheme(isDark.value)),
      })
    }
  })

  return {
    // State
    htmlEditor,
    htmlContent,

    // Actions
    setHtmlEditorValue,
    importHtmlContent,
    clearHtmlContent,
    getHtmlContent,
    getHtmlSelection,
    replaceHtmlSelection,
    insertHtmlAtCursor,
    initHtmlEditor,
  }
})
