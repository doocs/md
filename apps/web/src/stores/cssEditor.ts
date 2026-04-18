import type { EditorView } from '@codemirror/view'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView as CMEditorView } from '@codemirror/view'
import { cssSetup, DEFAULT_CUSTOM_THEME, theme as editorTheme } from '@md/shared'
import { v4 as uuid } from 'uuid'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

const DEFAULT_CSS_CONTENT = DEFAULT_CUSTOM_THEME

/**
 * CSS 编辑器配置接口
 */
export interface CssContentConfig {
  active: string
  tabs: {
    id: string
    title: string
    name: string
    content: string
    createDatetime: Date
    updateDatetime: Date
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

  // CSS 内容配置
  const cssContentConfig = store.reactive<CssContentConfig>(addPrefix(`css_content_config`), {
    active: ``,
    tabs: [],
  })

  // 兼容旧数据：补齐缺失的 id / createDatetime / updateDatetime，并将 active 迁移为 id
  onBeforeMount(() => {
    const now = new Date()

    // 如果没有任何 tab，初始化默认方案
    if (cssContentConfig.value.tabs.length === 0) {
      const defaultId = uuid()
      cssContentConfig.value.tabs = [{
        id: defaultId,
        title: `方案1`,
        name: `方案1`,
        content: DEFAULT_CSS_CONTENT,
        createDatetime: now,
        updateDatetime: now,
      }]
      cssContentConfig.value.active = defaultId
      return
    }

    cssContentConfig.value.tabs = cssContentConfig.value.tabs.map((tab, index) => ({
      ...tab,
      id: tab.id ?? uuid(),
      createDatetime: tab.createDatetime ?? new Date(now.getTime() + index),
      updateDatetime: tab.updateDatetime ?? new Date(now.getTime() + index),
    }))

    // 将旧的 active（name）迁移为 id
    const activeById = cssContentConfig.value.tabs.find(t => t.id === cssContentConfig.value.active)
    if (!activeById) {
      // 旧数据中 active 存的是 name，找到对应 tab 再存 id
      const activeByName = cssContentConfig.value.tabs.find(t => t.name === cssContentConfig.value.active)
      cssContentConfig.value.active = activeByName?.id ?? cssContentConfig.value.tabs[0].id
    }
  })

  // 获取当前激活的 Tab
  const getCurrentTab = () => {
    return cssContentConfig.value.tabs.find(tab => tab.id === cssContentConfig.value.active)!
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
  const tabChanged = (id: string) => {
    cssContentConfig.value.active = id
    const content = cssContentConfig.value.tabs.find(tab => tab.id === id)!.content
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
    // active 存的是 id，重命名不需要更新 active
  }

  // 添加 CSS 方案
  const addCssContentTab = (name: string, initialContent?: string) => {
    const content = initialContent || DEFAULT_CSS_CONTENT
    const now = new Date()
    cssContentConfig.value.tabs.push({
      id: uuid(),
      name,
      title: name,
      content,
      createDatetime: now,
      updateDatetime: now,
    })
    const newTab = cssContentConfig.value.tabs[cssContentConfig.value.tabs.length - 1]
    cssContentConfig.value.active = newTab.id
    setCssEditorValue(content)

    // 触发回调以刷新渲染（使用新方案的 CSS）
    if (onTabChangedCallback) {
      onTabChangedCallback(content)
    }
  }

  // 重置 CSS 配置
  const resetCssConfig = () => {
    const defaultId = uuid()
    cssContentConfig.value = {
      active: defaultId,
      tabs: [
        {
          id: defaultId,
          title: `方案 1`,
          name: `方案 1`,
          content: DEFAULT_CSS_CONTENT,
          createDatetime: new Date(),
          updateDatetime: new Date(),
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
            const tab = getCurrentTab()
            tab.content = content
            tab.updateDatetime = new Date()
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

  // 滚动到指定标题级别的 CSS 区域并选中
  const scrollToHeading = (level: string) => {
    if (!cssEditor.value)
      return

    const doc = cssEditor.value.state.doc.toString()
    // 匹配 h1 { 或 h2 { 等模式（支持换行和空格）
    const pattern = new RegExp(`^${level}\\s*\\{`, `m`)
    const match = doc.match(pattern)

    if (match && match.index !== undefined) {
      const startPos = match.index
      // 查找对应的结束括号
      let braceCount = 0
      let endPos = startPos
      let foundStart = false

      for (let i = startPos; i < doc.length; i++) {
        if (doc[i] === `{`) {
          braceCount++
          foundStart = true
        }
        else if (doc[i] === `}`) {
          braceCount--
          if (foundStart && braceCount === 0) {
            endPos = i + 1
            break
          }
        }
      }

      // 滚动到位置并选中该区域
      cssEditor.value.dispatch({
        selection: { anchor: startPos, head: endPos },
        scrollIntoView: true,
      })

      // 聚焦编辑器
      cssEditor.value.focus()
    }
  }

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
    resetCssConfig,
    initCssEditor,
    scrollToHeading,
  }
})
