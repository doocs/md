import type { EditorView } from '@codemirror/view'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView as CMEditorView } from '@codemirror/view'
import { cssSetup, DEFAULT_CUSTOM_THEME, theme as editorTheme } from '@md/shared'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

const DEFAULT_CSS_CONTENT = DEFAULT_CUSTOM_THEME

/**
 * CSS 编辑器配置接口
 */
export interface CssContentConfig {
  active: string
  tabs: {
    title: string
    name: string
    content: string
  }[]
}

/**
 * CSS 编辑器 Store
 * 负责管理自定义 CSS 编辑器及其配置
 */
export const useCssEditorStore = defineStore(`cssEditor`, () => {
  const isDark = useDark()

  // CSS 编辑器实例
  const cssEditor = ref<EditorView | null>(null)
  const cssEditorThemeCompartment = ref<Compartment | null>(null)

  /**
   * 自定义 CSS 内容
   * @deprecated 在后续版本中将会移除
   */
  const cssContent = store.reactive(`__css_content`, DEFAULT_CSS_CONTENT)

  // CSS 内容配置
  const cssContentConfig = store.reactive<CssContentConfig>(addPrefix(`css_content_config`), {
    active: `方案1`,
    tabs: [
      {
        title: `方案1`,
        name: `方案1`,
        content: cssContent.value || DEFAULT_CSS_CONTENT,
      },
    ],
  })

  // 获取当前激活的 Tab
  const getCurrentTab = () => {
    return cssContentConfig.value.tabs.find((tab) => {
      return tab.name === cssContentConfig.value.active
    })!
  }

  // 获取当前 Tab 的内容
  const getCurrentTabContent = () => {
    return getCurrentTab().content
  }

  // 设置编辑器内容
  const setCssEditorValue = (content: string) => {
    if (cssEditor.value) {
      cssEditor.value.dispatch({
        changes: { from: 0, to: cssEditor.value.state.doc.length, insert: content },
      })
    }
  }

  // 切换 Tab 的回调（由外部传入，用于触发渲染刷新）
  let onTabChangedCallback: ((content: string) => void) | null = null

  // 设置切换 Tab 的回调
  const setOnTabChangedCallback = (callback: (content: string) => void) => {
    onTabChangedCallback = callback
  }

  // 切换 Tab
  const tabChanged = (name: string) => {
    console.log(`tabChanged`, name)
    cssContentConfig.value.active = name
    const content = cssContentConfig.value.tabs.find((tab) => {
      return tab.name === name
    })!.content
    setCssEditorValue(content)

    // 触发回调以刷新渲染
    if (onTabChangedCallback) {
      onTabChangedCallback(content)
    }
  }

  // 重命名 Tab
  const renameTab = (name: string) => {
    const tab = getCurrentTab()
    tab.title = name
    tab.name = name
    cssContentConfig.value.active = name
  }

  // 添加 CSS 方案
  const addCssContentTab = (name: string, initialContent?: string) => {
    const content = initialContent || DEFAULT_CSS_CONTENT
    cssContentConfig.value.tabs.push({
      name,
      title: name,
      content,
    })
    cssContentConfig.value.active = name
    console.log(`addCssContentTab`, name)
    setCssEditorValue(content)

    // 触发回调以刷新渲染（使用新方案的 CSS）
    if (onTabChangedCallback) {
      onTabChangedCallback(content)
    }
  }

  // 验证 Tab 名称
  const validatorTabName = (val: string) => {
    return cssContentConfig.value.tabs.every(({ name }) => name !== val)
  }

  // 重置 CSS 配置
  const resetCssConfig = () => {
    cssContentConfig.value = {
      active: `方案 1`,
      tabs: [
        {
          title: `方案 1`,
          name: `方案 1`,
          content: DEFAULT_CSS_CONTENT,
        },
      ],
    }

    if (cssEditor.value) {
      cssEditor.value.dispatch({
        changes: { from: 0, to: cssEditor.value.state.doc.length, insert: DEFAULT_CSS_CONTENT },
      })
    }
  }

  // 初始化 CSS 编辑器
  const initCssEditor = (onUpdate: (content: string) => void) => {
    const cssEditorDom = document.querySelector<HTMLTextAreaElement>(`#cssEditor`)
    if (!cssEditorDom)
      return

    cssEditorDom.value = getCurrentTab().content

    // 创建 CSS 编辑器的容器
    const cssContainer = document.createElement(`div`)
    cssContainer.className = 'w-full h-full'
    cssEditorDom.parentNode?.replaceChild(cssContainer, cssEditorDom)

    // 创建主题 Compartment 用于动态切换
    cssEditorThemeCompartment.value = new Compartment()

    // 创建 CSS 编辑器
    const state = EditorState.create({
      doc: getCurrentTab().content,
      extensions: [
        cssSetup(),
        cssEditorThemeCompartment.value.of(editorTheme(isDark.value)),
        CMEditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const content = update.state.doc.toString()
            getCurrentTab().content = content
            onUpdate(content)
          }
        }),
      ],
    })

    cssEditor.value = markRaw(new CMEditorView({
      state,
      parent: cssContainer,
    }))
  }

  // 监听深色模式变化
  watch(isDark, () => {
    if (cssEditor.value && cssEditorThemeCompartment.value) {
      cssEditor.value.dispatch({
        effects: cssEditorThemeCompartment.value.reconfigure(editorTheme(isDark.value)),
      })
    }
  })

  // 清空过往历史记录
  onMounted(() => {
    cssContent.value = ``
  })

  return {
    // State
    cssEditor,
    cssContentConfig,

    // Getters
    getCurrentTab,
    getCurrentTabContent,

    // Actions
    setCssEditorValue,
    setOnTabChangedCallback,
    tabChanged,
    renameTab,
    addCssContentTab,
    validatorTabName,
    resetCssConfig,
    initCssEditor,
  }
})
