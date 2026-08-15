import { initRenderer } from '@md/core'
import { postProcessHtml, renderMarkdown } from '@md/core/utils'
import { t } from '@/i18n/translate'
import { resolveAssetUrl } from '@/services/emoji/urlResolver'
import { useCustomComponentStore } from './customComponent'
import { useFolderSourceStore } from './folderSource'
import { usePostStore } from './post'
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
        ].join(``)
      })
      .join(``)
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
    ].join(``)
  }

  /**
   * Inject heading anchor ids (`#0`, `#1`, …) used by outline navigation and
   * fill the title list from headings collected during render. Pure string
   * work — no DOM parse/serialize round-trip per render.
   */
  const extractTitles = (html: string): string => {
    const headings = renderer!.getHeadings()
    titleList.value = headings.map((heading, i) => ({
      url: `#${i}`,
      title: heading.text,
      level: heading.level,
    }))

    let i = 0
    return html.replace(/data-heading="true"/g, () => `data-heading="true" id="${i++}"`)
  }

  const render = (content: string, options?: RenderOptions) => {
    if (!renderer) {
      throw new Error(`Renderer not initialized. Call initRendererInstance first.`)
    }

    const themeStore = useThemeStore()
    const uiStore = useUIStore()
    const componentStore = useCustomComponentStore()
    const folderSourceStore = useFolderSourceStore()
    const postStore = usePostStore()
    const themeMode = options?.themeMode ?? (uiStore.isDark ? `dark` : `light`)
    const optionsFingerprint = buildOptionsFingerprint(themeMode, themeStore, componentStore)

    // The current post is sourced from a local folder iff it carries a
    // `sourceFilePath`. The renderer reads this to decide whether to treat
    // relative image srcs as folder images; absent → fall through to default.
    const mdFilePath = postStore.currentPost?.sourceFilePath ?? ``

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
      assetResolver: resolveAssetUrl,
      folderSourcePath: mdFilePath,
      folderImageResolver: (sourcePath: string, relPath: string) =>
        folderSourceStore.resolveFolderImageSync(sourcePath, relPath),
    })

    const { html: baseHtml, readingTime: readingTimeResult } = renderMarkdown(content, renderer)

    readingTime.chars = content.length
    readingTime.words = readingTimeResult.words
    readingTime.minutes = Math.ceil(readingTimeResult.minutes)

    output.value = extractTitles(postProcessHtml(baseHtml, readingTimeResult, renderer))

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
  }
})
