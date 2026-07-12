import type { EditorView } from '@codemirror/view'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView as CMEditorView } from '@codemirror/view'
import { cssSetup, theme as editorTheme, getDefaultCustomTheme } from '@md/shared'
import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'
import { getLocale, t } from '@/i18n/translate'
import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'

function getDefaultCssContent() {
  return getDefaultCustomTheme(getLocale())
}

/** CSS editor tab configuration. */
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
  selectedIds?: string[]
  isSelectMode?: boolean
}

/** Manages the custom CSS editor and its tab configuration. */
export const useCssEditorStore = defineStore(`cssEditor`, () => {
  const isDark = useDark()

  const cssEditor = ref<EditorView | null>(null)
  const cssEditorThemeCompartment = ref<Compartment | null>(null)

  const cssContentConfig = store.reactive<CssContentConfig>(addPrefix(`css_content_config`), {
    active: ``,
    tabs: [],
  })

  // Backfill missing id / timestamps; migrate active from name to id
  onBeforeMount(() => {
    const now = new Date()

    if (cssContentConfig.value.tabs.length === 0) {
      const defaultId = crypto.randomUUID()
      cssContentConfig.value.tabs = [{
        id: defaultId,
        title: t('store.cssEditor.schemeDefault'),
        name: t('store.cssEditor.schemeDefault'),
        content: getDefaultCssContent(),
        createDatetime: now,
        updateDatetime: now,
      }]
      cssContentConfig.value.active = defaultId
      return
    }

    cssContentConfig.value.tabs = cssContentConfig.value.tabs.map((tab, index) => ({
      ...tab,
      id: tab.id ?? crypto.randomUUID(),
      createDatetime: tab.createDatetime ?? new Date(now.getTime() + index),
      updateDatetime: tab.updateDatetime ?? new Date(now.getTime() + index),
    }))

    const activeById = cssContentConfig.value.tabs.find(t => t.id === cssContentConfig.value.active)
    if (!activeById) {
      // Legacy data stored active as tab name; resolve to id
      const activeByName = cssContentConfig.value.tabs.find(t => t.name === cssContentConfig.value.active)
      cssContentConfig.value.active = activeByName?.id ?? cssContentConfig.value.tabs[0].id
    }
  })

  const getCurrentTab = () => {
    const tab = cssContentConfig.value.tabs.find(tab => tab.id === cssContentConfig.value.active)
    if (!tab) {
      // Fallback: if tabs are empty or corrupted, create a default tab
      if (cssContentConfig.value.tabs.length === 0) {
        const defaultId = crypto.randomUUID()
        const now = new Date()
        cssContentConfig.value.tabs = [{
          id: defaultId,
          title: t('store.cssEditor.schemeDefault'),
          name: t('store.cssEditor.schemeDefault'),
          content: getDefaultCssContent(),
          createDatetime: now,
          updateDatetime: now,
        }]
        cssContentConfig.value.active = defaultId
        return cssContentConfig.value.tabs[0]
      }
      cssContentConfig.value.active = cssContentConfig.value.tabs[0].id
      return cssContentConfig.value.tabs[0]
    }
    return tab
  }

  const getCurrentTabContent = () => {
    return getCurrentTab().content
  }

  const setCssEditorValue = (content: string) => {
    if (cssEditor.value) {
      cssEditor.value.dispatch({
        changes: { from: 0, to: cssEditor.value.state.doc.length, insert: content },
      })
    }
  }

  /** External callback to refresh preview when the active CSS tab changes. */
  let onTabChangedCallback: ((content: string) => void) | null = null

  const setOnTabChangedCallback = (callback: (content: string) => void) => {
    onTabChangedCallback = callback
  }

  const tabChanged = (id: string) => {
    cssContentConfig.value.active = id
    const tab = cssContentConfig.value.tabs.find(tab => tab.id === id)
    if (!tab)
      return
    setCssEditorValue(tab.content)

    if (onTabChangedCallback) {
      onTabChangedCallback(tab.content)
    }
  }

  const renameTab = (name: string) => {
    const tab = getCurrentTab()
    tab.title = name
    tab.name = name
  }

  const addCssContentTab = (name: string, initialContent?: string) => {
    const content = initialContent ?? getDefaultCssContent()
    const now = new Date()
    cssContentConfig.value.tabs.push({
      id: crypto.randomUUID(),
      name,
      title: name,
      content,
      createDatetime: now,
      updateDatetime: now,
    })
    const newTab = cssContentConfig.value.tabs[cssContentConfig.value.tabs.length - 1]
    cssContentConfig.value.active = newTab.id
    setCssEditorValue(content)

    if (onTabChangedCallback) {
      onTabChangedCallback(content)
    }
  }

  const resetCssConfig = () => {
    const defaultContent = getDefaultCssContent()
    const defaultId = crypto.randomUUID()
    cssContentConfig.value = {
      active: defaultId,
      tabs: [
        {
          id: defaultId,
          title: t('store.cssEditor.schemeDefaultSpaced'),
          name: t('store.cssEditor.schemeDefaultSpaced'),
          content: defaultContent,
          createDatetime: new Date(),
          updateDatetime: new Date(),
        },
      ],
    }

    if (cssEditor.value) {
      cssEditor.value.dispatch({
        changes: { from: 0, to: cssEditor.value.state.doc.length, insert: defaultContent },
      })
    }
  }

  const initCssEditor = (onUpdate: (content: string) => void) => {
    const cssEditorDom = document.querySelector<HTMLTextAreaElement>(`#cssEditor`)
    if (!cssEditorDom)
      return

    cssEditorDom.value = getCurrentTab().content

    const cssContainer = document.createElement(`div`)
    cssContainer.className = 'w-full h-full'
    cssEditorDom.parentNode?.replaceChild(cssContainer, cssEditorDom)

    cssEditorThemeCompartment.value = new Compartment()

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

  watch(isDark, () => {
    if (cssEditor.value && cssEditorThemeCompartment.value) {
      cssEditor.value.dispatch({
        effects: cssEditorThemeCompartment.value.reconfigure(editorTheme(isDark.value)),
      })
    }
  })

  const scrollToHeading = (level: string) => {
    if (!cssEditor.value)
      return

    const doc = cssEditor.value.state.doc.toString()
    const pattern = new RegExp(`^${level}\\s*\\{`, `m`)
    const match = doc.match(pattern)

    if (match && match.index !== undefined) {
      const startPos = match.index
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

      cssEditor.value.dispatch({
        selection: { anchor: startPos, head: endPos },
        scrollIntoView: true,
      })

      cssEditor.value.focus()
    }
  }

  const toggleSelectMode = () => {
    cssContentConfig.value.isSelectMode = !(cssContentConfig.value.isSelectMode ?? false)
    if (!cssContentConfig.value.isSelectMode) {
      cssContentConfig.value.selectedIds = []
    }
  }

  const toggleSelectTab = (id: string) => {
    const selectedIds = cssContentConfig.value.selectedIds ?? []
    const idx = selectedIds.indexOf(id)
    if (idx === -1) {
      cssContentConfig.value.selectedIds = [...selectedIds, id]
    }
    else {
      cssContentConfig.value.selectedIds = selectedIds.filter(i => i !== id)
    }
  }

  const selectAllTabs = () => {
    cssContentConfig.value.selectedIds = cssContentConfig.value.tabs.map(t => t.id)
  }

  const clearSelection = () => {
    cssContentConfig.value.selectedIds = []
  }

  const batchDeleteTabs = () => {
    const selectedIds = cssContentConfig.value.selectedIds ?? []
    if (selectedIds.length === 0)
      return

    if (selectedIds.length >= cssContentConfig.value.tabs.length) {
      toast.warning(t('store.cssEditor.keepAtLeastOne'))
      return
    }

    const tabs = cssContentConfig.value.tabs.filter(tab => !selectedIds.includes(tab.id))

    if (selectedIds.includes(cssContentConfig.value.active)) {
      cssContentConfig.value.active = tabs[0].id
      setCssEditorValue(tabs[0].content)
      if (onTabChangedCallback) {
        onTabChangedCallback(tabs[0].content)
      }
    }

    cssContentConfig.value.tabs = tabs
    cssContentConfig.value.selectedIds = []
    cssContentConfig.value.isSelectMode = false
    toast.success(t('store.cssEditor.batchDeleted', { count: selectedIds.length }))
  }

  const batchExportTabs = async () => {
    const selectedIds = cssContentConfig.value.selectedIds ?? []
    if (selectedIds.length === 0)
      return

    if (selectedIds.length === 1) {
      const tab = cssContentConfig.value.tabs.find(t => t.id === selectedIds[0])
      if (tab) {
        downloadFile(`data:text/css;charset=utf-8,${encodeURIComponent(tab.content)}`, `${sanitizeTitle(tab.title)}.css`)
      }
    }
    else {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      selectedIds.forEach((id) => {
        const tab = cssContentConfig.value.tabs.find(t => t.id === id)
        if (tab) {
          zip.file(`${sanitizeTitle(tab.title)}.css`, tab.content)
        }
      })
      const blob = await zip.generateAsync({ type: `blob` })
      const url = URL.createObjectURL(blob)
      downloadFile(url, `css-schemes.zip`)
      URL.revokeObjectURL(url)
    }

    cssContentConfig.value.selectedIds = []
    cssContentConfig.value.isSelectMode = false
    toast.success(t('store.cssEditor.batchExported', { count: selectedIds.length }))
  }

  const exportSingleTab = (id: string) => {
    const tab = cssContentConfig.value.tabs.find(t => t.id === id)
    if (tab) {
      downloadFile(`data:text/css;charset=utf-8,${encodeURIComponent(tab.content)}`, `${sanitizeTitle(tab.title)}.css`)
      toast.success(t('store.cssEditor.singleExported', { name: tab.title }))
    }
  }

  return {
    // State
    cssEditor,
    cssContentConfig,
    isSelectMode: computed(() => cssContentConfig.value.isSelectMode ?? false),
    selectedIds: computed(() => cssContentConfig.value.selectedIds ?? []),

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

    // Batch Actions
    toggleSelectMode,
    toggleSelectTab,
    selectAllTabs,
    clearSelection,
    batchDeleteTabs,
    batchExportTabs,
    exportSingleTab,
  }
})
