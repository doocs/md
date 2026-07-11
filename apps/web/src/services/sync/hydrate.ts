import { storeToRefs } from 'pinia'
import { isAppLocale } from '@/i18n/constants'
import { store } from '@/storage/manager'
import { addPrefix } from '@/storage/prefix'
import { parseStoredValue } from '@/storage/quota'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useCustomComponentStore } from '@/stores/customComponent'
import { useEditorStore } from '@/stores/editor'
import { useLocaleStore } from '@/stores/locale'
import { usePostStore } from '@/stores/post'
import { useQuickCommandsStore } from '@/stores/quickCommands'
import { useRenderStore } from '@/stores/render'
import { useTemplateStore } from '@/stores/template'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const PREVIEW_REFRESH_KEYS = new Set([
  addPrefix(`theme`),
  addPrefix(`themeSettings`),
  addPrefix(`use_indent`),
  addPrefix(`use_justify`),
  `isCiteStatus`,
  `isCountStatus`,
  `legend`,
  `previewWidth`,
  addPrefix(`css_content_config`),
  addPrefix(`custom_components`),
])

function hydrateRef<T>(key: string, keys: Set<string>, ref: { value: T }): void {
  if (!keys.has(key))
    return
  const raw = store.getSync(key)
  if (raw === null)
    return
  ref.value = parseStoredValue(raw, ref.value)
}

async function refreshPreview(keys: Set<string>): Promise<void> {
  if (![...PREVIEW_REFRESH_KEYS].some(key => keys.has(key)))
    return

  const themeStore = useThemeStore()
  const editorStore = useEditorStore()
  const renderStore = useRenderStore()

  themeStore.updateCodeTheme()
  await themeStore.applyCurrentTheme()
  renderStore.render(editorStore.getContent())
}

/** Hydrate Pinia stores from remote settings already written to local storage (no full reload). */
export async function hydrateSyncedSettings(appliedKeys: string[]): Promise<void> {
  if (!appliedKeys.length)
    return

  const keys = new Set(appliedKeys)
  const themeStore = useThemeStore()
  const uiStore = useUIStore()
  const postStore = usePostStore()
  const aiConfigStore = useAIConfigStore()
  const cssEditorStore = useCssEditorStore()
  const templateStore = useTemplateStore()
  const customComponentStore = useCustomComponentStore()
  const quickCommandsStore = useQuickCommandsStore()

  const theme = storeToRefs(themeStore)
  const ui = storeToRefs(uiStore)
  const post = storeToRefs(postStore)
  const aiConfig = storeToRefs(aiConfigStore)
  const cssEditor = storeToRefs(cssEditorStore)
  const template = storeToRefs(templateStore)
  const customComponent = storeToRefs(customComponentStore)

  hydrateRef(addPrefix(`theme`), keys, theme.theme)
  hydrateRef(addPrefix(`themeSettings`), keys, theme.themeSettings)
  hydrateRef(addPrefix(`use_indent`), keys, theme.isUseIndent)
  hydrateRef(addPrefix(`use_justify`), keys, theme.isUseJustify)
  hydrateRef(`isCiteStatus`, keys, theme.isCiteStatus)
  hydrateRef(`isCountStatus`, keys, theme.isCountStatus)
  hydrateRef(`legend`, keys, theme.legend)
  hydrateRef(`previewWidth`, keys, theme.previewWidth)

  hydrateRef(`showAIToolbox`, keys, ui.showAIToolbox)
  hydrateRef(`viewMode`, keys, ui.viewMode)
  hydrateRef(`previewDevice`, keys, ui.previewDevice)
  hydrateRef(addPrefix(`enableImageReupload`), keys, ui.enableImageReupload)
  hydrateRef(addPrefix(`enableScrollSync`), keys, ui.enableScrollSync)
  hydrateRef(addPrefix(`copyMode`), keys, ui.copyMode)

  if (keys.has(`locale`)) {
    const raw = store.getSync(`locale`)
    if (isAppLocale(raw))
      useLocaleStore().setLocale(raw)
  }

  hydrateRef(`openai_type`, keys, aiConfig.type)
  hydrateRef(`openai_temperature`, keys, aiConfig.temperature)
  hydrateRef(`openai_max_token`, keys, aiConfig.maxToken)

  hydrateRef(addPrefix(`css_content_config`), keys, cssEditor.cssContentConfig)
  hydrateRef(addPrefix(`templates`), keys, template.templates)
  hydrateRef(addPrefix(`custom_components`), keys, customComponent.userComponents)
  hydrateRef(addPrefix(`sort_mode`), keys, post.sortMode)

  if (keys.has(`quick_commands`))
    await quickCommandsStore.reloadFromStorage()

  await refreshPreview(keys)
}
