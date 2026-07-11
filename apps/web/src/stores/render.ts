import { initRenderer } from '@md/core'
import { postProcessHtml, renderMarkdown } from '@md/core/utils'
import { t } from '@/i18n/translate'
import { useCustomComponentStore } from './customComponent'
import { useThemeStore } from './theme'
import { useUIStore } from './ui'

export interface RenderOptions {
  themeMode?: 'light' | 'dark'
  /** Bypass fingerprint skip (export / clipboard / forced refresh) */
  force?: boolean
}

/** Markdown rendering, HTML output, and heading extraction. */
export const useRenderStore = defineStore(`render`, () => {
  const output = ref(``)

  const readingTime = reactive({
    chars: 0,
    words: 0,
    minutes: 0,
  })

  const titleList = ref<{
    url: string
    title: string
    level: number
  }[]>([])

  let renderer: ReturnType<typeof initRenderer> | null = null
  let lastOptionsFingerprint = ``
  let lastContent = ``

  /** Init renderer; theme CSS is injected via useThemeStore().applyCurrentTheme(). */
  const initRendererInstance = (options?: {
    isMacCodeBlock?: boolean
    isShowLineNumber?: boolean
  }) => {
    renderer = initRenderer(options || {})
    lastOptionsFingerprint = ``
    lastContent = ``
    return renderer
  }

  const getRenderer = () => renderer

  const buildDiagramMessages = () => ({
    mermaidLoading: t(`store.diagram.mermaidLoading`),
    mermaidError: t(`store.diagram.mermaidError`),
    plantumlLoading: t(`store.diagram.plantumlLoading`),
    plantumlError: t(`store.diagram.plantumlError`),
    infographicLoading: t(`store.diagram.infographicLoading`),
    infographicError: t(`store.diagram.infographicError`),
  })

  const buildCountMessages = () => ({
    // Keep placeholders; core replaces them with actual counts.
    summary: t(`store.count.summary`, {
      words: `{words}`,
      minutes: `{minutes}`,
    }),
  })

  const buildRenderMessages = () => ({
    footnoteTitle: t(`store.render.footnoteTitle`),
    unknownComponent: t(`store.render.unknownComponent`),
    katexLoading: t(`store.render.katexLoading`),
  })

  function buildComponentFingerprint(
    componentStore: ReturnType<typeof useCustomComponentStore>,
  ): string {
    return Object.keys(componentStore.registry)
      .sort()
      .map((name) => {
        const def = componentStore.registry[name]
        return [
          name,
          def.updatedAt ?? 0,
          def.template,
          JSON.stringify(def.props ?? []),
        ].join(`\u0002`)
      })
      .join(`\u0001`)
  }

  /** Fingerprint of render options only — content is compared by reference/equality separately. */
  function buildOptionsFingerprint(
    themeMode: 'light' | 'dark',
    themeStore: ReturnType<typeof useThemeStore>,
    componentStore: ReturnType<typeof useCustomComponentStore>,
  ): string {
    return [
      themeMode,
      themeStore.isCiteStatus ? `1` : `0`,
      themeStore.legend,
      themeStore.isCountStatus ? `1` : `0`,
      themeStore.isMacCodeBlock ? `1` : `0`,
      themeStore.isShowLineNumber ? `1` : `0`,
      buildComponentFingerprint(componentStore),
      t(`store.count.summary`, { words: `{words}`, minutes: `{minutes}` }),
      t(`store.render.footnoteTitle`),
      t(`store.render.unknownComponent`),
      t(`store.render.katexLoading`),
      t(`store.diagram.mermaidLoading`),
    ].join(`\u0001`)
  }

  const extractTitles = () => {
    const div = document.createElement(`div`)
    div.innerHTML = output.value
    const list = div.querySelectorAll<HTMLElement>(`[data-heading]`)

    titleList.value = []
    let i = 0
    for (const item of list) {
      item.setAttribute(`id`, `${i}`)
      titleList.value.push({
        url: `#${i}`,
        title: `${item.textContent}`,
        level: Number(item.tagName.slice(1)),
      })
      i++
    }
    output.value = div.innerHTML
  }

  const render = (content: string, options?: RenderOptions) => {
    if (!renderer) {
      throw new Error(`Renderer not initialized. Call initRendererInstance first.`)
    }

    const themeStore = useThemeStore()
    const uiStore = useUIStore()
    const componentStore = useCustomComponentStore()
    const themeMode = options?.themeMode ?? (uiStore.isDark ? `dark` : `light`)
    const optionsFingerprint = buildOptionsFingerprint(themeMode, themeStore, componentStore)

    if (!options?.force && content === lastContent && optionsFingerprint === lastOptionsFingerprint)
      return output.value

    // isUseIndent / isUseJustify are applied via CSS variables, not renderer options
    renderer.reset({
      citeStatus: themeStore.isCiteStatus,
      legend: themeStore.legend,
      countStatus: themeStore.isCountStatus,
      isMacCodeBlock: themeStore.isMacCodeBlock,
      isShowLineNumber: themeStore.isShowLineNumber,
      themeMode,
      components: componentStore.registry,
      diagramMessages: buildDiagramMessages(),
      countMessages: buildCountMessages(),
      renderMessages: buildRenderMessages(),
    })

    const { html: baseHtml, readingTime: readingTimeResult } = renderMarkdown(content, renderer)

    readingTime.chars = content.length
    readingTime.words = readingTimeResult.words
    readingTime.minutes = Math.ceil(readingTimeResult.minutes)

    output.value = postProcessHtml(baseHtml, readingTimeResult, renderer)

    extractTitles()
    lastContent = content
    lastOptionsFingerprint = optionsFingerprint

    return output.value
  }

  return {
    // State
    output,
    readingTime,
    titleList,

    // Actions
    initRendererInstance,
    getRenderer,
    render,
    extractTitles,
  }
})
