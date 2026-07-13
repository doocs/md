import type {
  CustomComponentDef,
  InstalledMarketplaceComponent,
  InstalledMarketplaceTheme,
  MarketplaceComponentPayload,
  MarketplaceItemDetail,
  MarketplaceItemSummary,
  MarketplaceItemType,
  MarketplaceSort,
  MarketplaceThemeKey,
} from '@md/shared'
import type {
  PublishComponentPayload,
  PublishThemePayload,
  UpdateMarketplacePayload,
} from '@/services/marketplace/types'
import { BUILT_IN_COMPONENTS } from '@md/core'
import {
  isMarketplaceThemeKey,
  marketplaceThemeKey,
} from '@md/shared'
import { t } from '@/i18n/translate'
import { getMarketplaceErrorCode, getMarketplaceErrorMessage, isMarketplaceConfigured, MarketplaceClient } from '@/services/marketplace/client'
import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'
import { useAuthStore } from '@/stores/auth'
import { useCustomComponentStore } from '@/stores/customComponent'
import { useEditorStore } from '@/stores/editor'
import { useNotificationsStore } from '@/stores/notifications'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'

type InstalledThemesMap = Record<string, InstalledMarketplaceTheme>
type InstalledComponentsMap = Record<string, InstalledMarketplaceComponent>

function parseComponentPayload(payload: string): MarketplaceComponentPayload | null {
  try {
    const parsed = JSON.parse(payload) as MarketplaceComponentPayload
    if (!parsed || typeof parsed.name !== `string` || typeof parsed.template !== `string`)
      return null
    if (!Array.isArray(parsed.props))
      return null
    return parsed
  }
  catch {
    return null
  }
}

/**
 * Marketplace catalog, installs, publish, and admin review.
 */
export const useMarketplaceStore = defineStore(`marketplace`, () => {
  const authStore = useAuthStore()
  const client = new MarketplaceClient(() => authStore.token || null)

  const installedThemes = store.reactive<InstalledThemesMap>(
    addPrefix(`marketplace_installed_themes`),
    {},
  )
  const installedComponents = store.reactive<InstalledComponentsMap>(
    addPrefix(`marketplace_installed_components`),
    {},
  )

  const discoverItems = ref<MarketplaceItemSummary[]>([])
  const discoverTotal = ref(0)
  const myItems = ref<MarketplaceItemSummary[]>([])
  const pendingItems = ref<MarketplaceItemDetail[]>([])
  const pendingTotal = ref(0)

  const loading = ref(false)
  const publishing = ref(false)
  const detail = ref<MarketplaceItemDetail | null>(null)

  const isConfigured = computed(() => isMarketplaceConfigured())
  const isAdmin = computed(() => Boolean(authStore.user?.isAdmin))

  function refreshNotifications() {
    if (!authStore.isLoggedIn)
      return
    void useNotificationsStore().fetchOnce()
  }

  function isThemeInstalled(marketplaceId: string): boolean {
    return Boolean(installedThemes.value[marketplaceThemeKey(marketplaceId)])
  }

  function isComponentInstalled(marketplaceId: string): boolean {
    return Boolean(installedComponents.value[marketplaceId])
  }

  function getInstalledThemeCss(themeKey: string): string | undefined {
    return installedThemes.value[themeKey]?.css
  }

  function getInstalledThemeOptions(): { label: string, value: MarketplaceThemeKey, desc: string }[] {
    return Object.values(installedThemes.value).map(theme => ({
      label: theme.name,
      value: marketplaceThemeKey(theme.marketplaceId),
      desc: theme.authorLogin ? `@${theme.authorLogin}` : ``,
    }))
  }

  async function fetchDiscover(
    type: MarketplaceItemType,
    opts: { q?: string, sort?: MarketplaceSort, page?: number } = {},
  ): Promise<void> {
    if (!isConfigured.value)
      return
    loading.value = true
    try {
      const res = type === `theme`
        ? await client.listThemes(opts)
        : await client.listComponents(opts)
      discoverItems.value = res.items
      discoverTotal.value = res.total
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.loadFailed`))
    }
    finally {
      loading.value = false
    }
  }

  async function fetchMine(): Promise<void> {
    if (!authStore.isLoggedIn)
      return
    loading.value = true
    try {
      const res = await client.listMine()
      myItems.value = res.items
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.loadFailed`))
    }
    finally {
      loading.value = false
    }
  }

  async function fetchPending(type?: MarketplaceItemType): Promise<void> {
    if (!isAdmin.value)
      return
    loading.value = true
    try {
      const res = await client.listPending({ type, pageSize: 50 })
      pendingItems.value = res.items as MarketplaceItemDetail[]
      pendingTotal.value = res.total
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.loadFailed`))
    }
    finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: string): Promise<MarketplaceItemDetail | null> {
    try {
      const item = await client.get(id)
      detail.value = item
      return item
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.loadFailed`))
      return null
    }
  }

  async function installItem(id: string, apply = true): Promise<boolean> {
    loading.value = true
    try {
      const item = await client.install(id)
      if (item.type === `theme`) {
        const key = marketplaceThemeKey(item.id)
        installedThemes.value = {
          ...installedThemes.value,
          [key]: {
            marketplaceId: item.id,
            slug: item.slug,
            name: item.name,
            description: item.description,
            version: item.version,
            coverUrl: item.coverUrl,
            primaryColor: item.primaryColor,
            css: item.payload,
            authorLogin: item.author.login,
            installedAt: Date.now(),
          },
        }

        if (apply) {
          const themeStore = useThemeStore()
          themeStore.theme = key
          if (item.primaryColor)
            themeStore.primaryColor = item.primaryColor
          await themeStore.applyCurrentTheme()
          useRenderStore().render(useEditorStore().getContent())
        }

        toast.success(t(`marketplace.installThemeSuccess`, { name: item.name }))
        return true
      }

      const componentPayload = parseComponentPayload(item.payload)
      if (!componentPayload) {
        toast.error(t(`marketplace.invalidComponentPayload`))
        return false
      }

      const builtInNames = new Set(BUILT_IN_COMPONENTS.map(c => c.name))
      if (builtInNames.has(componentPayload.name)) {
        toast.error(t(`marketplace.builtinNameConflict`, { name: componentPayload.name }))
        return false
      }

      const componentStore = useCustomComponentStore()
      const existing = componentStore.userComponents.find(c => c.name === componentPayload.name)
      const now = Date.now()
      const def: CustomComponentDef = {
        id: existing?.id ?? `mp-${item.id}`,
        name: componentPayload.name,
        description: componentPayload.description || item.description,
        template: componentPayload.template,
        props: componentPayload.props,
        example: componentPayload.example,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }

      if (existing) {
        componentStore.updateComponent(existing.id, {
          name: def.name,
          description: def.description,
          template: def.template,
          props: def.props,
        })
        // Keep example in sync without extra toast from updateComponent's success path ??
        // updateComponent already toasts; suppress duplicate by patching example directly
        const idx = componentStore.userComponents.findIndex(c => c.id === existing.id)
        if (idx !== -1 && componentPayload.example) {
          componentStore.userComponents[idx] = {
            ...componentStore.userComponents[idx],
            example: componentPayload.example,
          }
        }
      }
      else {
        componentStore.userComponents.push(def)
      }

      installedComponents.value = {
        ...installedComponents.value,
        [item.id]: {
          marketplaceId: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description,
          version: item.version,
          componentName: componentPayload.name,
          authorLogin: item.author.login,
          installedAt: now,
        },
      }

      useRenderStore().render(useEditorStore().getContent())
      toast.success(t(`marketplace.installComponentSuccess`, { name: item.name }))
      return true
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.installFailed`))
      return false
    }
    finally {
      loading.value = false
    }
  }

  function uninstallTheme(marketplaceId: string): void {
    const key = marketplaceThemeKey(marketplaceId)
    const next = { ...installedThemes.value }
    delete next[key]
    installedThemes.value = next

    const themeStore = useThemeStore()
    if (themeStore.theme === key) {
      themeStore.theme = `default`
      themeStore.applyCurrentTheme().then(() => {
        useRenderStore().render(useEditorStore().getContent())
      })
    }
    toast.success(t(`marketplace.uninstallSuccess`))
  }

  function uninstallComponent(marketplaceId: string): void {
    const meta = installedComponents.value[marketplaceId]
    const next = { ...installedComponents.value }
    delete next[marketplaceId]
    installedComponents.value = next

    if (meta) {
      const componentStore = useCustomComponentStore()
      const existing = componentStore.userComponents.find(
        c => c.id === `mp-${marketplaceId}` || c.name === meta.componentName,
      )
      if (existing)
        componentStore.deleteComponent(existing.id)
    }
    else {
      toast.success(t(`marketplace.uninstallSuccess`))
    }
  }

  async function publishTheme(
    payload: PublishThemePayload,
  ): Promise<{ item: MarketplaceItemDetail | null, errorCode: string | null }> {
    publishing.value = true
    try {
      const item = await client.publishTheme(payload)
      toast.success(t(`marketplace.publishPending`))
      await fetchMine()
      refreshNotifications()
      return { item, errorCode: null }
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.publishFailed`), { duration: 5000 })
      return { item: null, errorCode: getMarketplaceErrorCode(e) }
    }
    finally {
      publishing.value = false
    }
  }

  async function publishComponent(
    payload: PublishComponentPayload,
  ): Promise<{ item: MarketplaceItemDetail | null, errorCode: string | null }> {
    publishing.value = true
    try {
      const item = await client.publishComponent(payload)
      toast.success(t(`marketplace.publishPending`))
      await fetchMine()
      refreshNotifications()
      return { item, errorCode: null }
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.publishFailed`), { duration: 5000 })
      return { item: null, errorCode: getMarketplaceErrorCode(e) }
    }
    finally {
      publishing.value = false
    }
  }

  async function updateItem(id: string, payload: UpdateMarketplacePayload): Promise<boolean> {
    publishing.value = true
    try {
      await client.update(id, payload)
      toast.success(t(`marketplace.updatePending`))
      await fetchMine()
      refreshNotifications()
      return true
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.publishFailed`))
      return false
    }
    finally {
      publishing.value = false
    }
  }

  async function removeItem(id: string): Promise<boolean> {
    try {
      await client.remove(id)
      toast.success(t(`marketplace.removeSuccess`))
      await fetchMine()
      return true
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.removeFailed`))
      return false
    }
  }

  async function approveItem(id: string): Promise<boolean> {
    try {
      await client.approve(id)
      toast.success(t(`marketplace.approveSuccess`))
      await fetchPending()
      refreshNotifications()
      return true
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.reviewFailed`))
      return false
    }
  }

  async function rejectItem(id: string, reason?: string): Promise<boolean> {
    try {
      await client.reject(id, reason)
      toast.success(t(`marketplace.rejectSuccess`))
      await fetchPending()
      refreshNotifications()
      return true
    }
    catch (e) {
      toast.error(getMarketplaceErrorMessage(e, `marketplace.reviewFailed`))
      return false
    }
  }

  return {
    installedThemes,
    installedComponents,
    discoverItems,
    discoverTotal,
    myItems,
    pendingItems,
    pendingTotal,
    loading,
    publishing,
    detail,
    isConfigured,
    isAdmin,
    isThemeInstalled,
    isComponentInstalled,
    getInstalledThemeCss,
    getInstalledThemeOptions,
    isMarketplaceThemeKey,
    marketplaceThemeKey,
    fetchDiscover,
    fetchMine,
    fetchPending,
    fetchDetail,
    installItem,
    uninstallTheme,
    uninstallComponent,
    publishTheme,
    publishComponent,
    updateItem,
    removeItem,
    approveItem,
    rejectItem,
  }
})
