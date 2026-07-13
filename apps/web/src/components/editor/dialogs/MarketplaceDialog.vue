<script setup lang="ts">
import type { MarketplaceItemDetail, MarketplaceItemSummary, MarketplaceItemType, MarketplaceSort } from '@md/shared'
import type { GenericObject } from 'vee-validate'
import type { Format } from 'vue-pick-colors'
import {
  Check,
  Download,
  LoaderCircle,
  Palette,
  Pencil,
  Plus,
  Search,
  Shield,
  Store,
  Trash2,
} from '@lucide/vue'
import { initRenderer, wrapCSSWithScope } from '@md/core'
import { postProcessHtml, renderMarkdown } from '@md/core/utils'
import { marketplaceThemeKey, themeMap } from '@md/shared'
import { toTypedSchema } from '@vee-validate/yup'
import { storeToRefs } from 'pinia'
import { Field, Form } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import PickColors from 'vue-pick-colors'
import * as yup from 'yup'
import { getDefaultContent } from '@/assets/example/default-content'
import FormItem from '@/components/editor/FormItem.vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DEFAULT_LOCALE, isAppLocale } from '@/i18n/constants'
import { isMarketplaceUiEnabled } from '@/services/marketplace/client'
import { useAuthStore } from '@/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useMarketplaceStore } from '@/stores/marketplace'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const { t, locale } = useI18n()
const uiStore = useUIStore()
const authStore = useAuthStore()
const marketplaceStore = useMarketplaceStore()
const confirmStore = useConfirmStore()
const cssEditorStore = useCssEditorStore()
const themeStore = useThemeStore()

const { isDark } = storeToRefs(uiStore)

const pickColorsContainer = ref<HTMLElement | null>(null)
const format = ref<Format>(`hex`)
const formatOptions = ref<Format[]>([`hex`, `rgb`, `hsl`])

const {
  isShowMarketplaceDialog,
  marketplaceDialogTab,
  marketplaceDialogView,
} = storeToRefs(uiStore)

const {
  discoverItems,
  myItems,
  pendingItems,
  loading,
  publishing,
  installedThemes,
  isAdmin,
} = storeToRefs(marketplaceStore)

const { isLoggedIn } = storeToRefs(authStore)

const showUi = isMarketplaceUiEnabled()
const searchQuery = ref(``)
const sort = ref<MarketplaceSort>(`newest`)
const selectedId = ref<string | null>(null)
const selectedDetail = ref<MarketplaceItemDetail | null>(null)
const rejectReason = ref(``)
const publishFormKey = ref(0)
const importSchemeSelectKey = ref(0)
const editingItemId = ref<string | null>(null)
/** Theme sample Markdown source for publish/edit. */
const sampleMarkdownMode = ref<`default` | `custom`>(`default`)
const sampleMarkdownDraft = ref(``)
let lastAutoSlug = ``

const emptyPublishValues = {
  name: ``,
  slug: ``,
  description: ``,
  coverUrl: ``,
  primaryColor: `#0F4C81`,
  css: ``,
}

const publishInitialValues = ref({ ...emptyPublishValues })
const isEditing = computed(() => editingItemId.value != null)

const dialogOpen = computed({
  get: () => isShowMarketplaceDialog.value,
  set: (val: boolean) => { isShowMarketplaceDialog.value = val },
})

// Themes only for now; component marketplace UI is temporarily disabled.
const itemType = computed<MarketplaceItemType>(() => `theme`)

watch(isShowMarketplaceDialog, (open) => {
  if (open)
    marketplaceDialogTab.value = `theme`
})

watch(marketplaceDialogTab, (tab) => {
  if (tab !== `theme`)
    marketplaceDialogTab.value = `theme`
})

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/
const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

function optionalHttpUrl() {
  return yup
    .string()
    .trim()
    .transform(value => (value || undefined))
    .test(`http-url`, t(`marketplace.validation.coverUrlInvalid`), (value) => {
      if (!value)
        return true
      try {
        const url = new URL(value)
        return url.protocol === `http:` || url.protocol === `https:`
      }
      catch {
        return false
      }
    })
}

const publishSchema = computed(() => {
  void locale.value
  return toTypedSchema(yup.object({
    name: yup
      .string()
      .trim()
      .required(t(`marketplace.validation.nameRequired`))
      .max(64, t(`marketplace.validation.nameMax`)),
    slug: yup
      .string()
      .trim()
      .required(t(`marketplace.validation.slugRequired`))
      .matches(SLUG_RE, t(`marketplace.validation.slugInvalid`)),
    description: yup
      .string()
      .max(2000, t(`marketplace.validation.descriptionMax`)),
    coverUrl: optionalHttpUrl(),
    primaryColor: yup
      .string()
      .trim()
      .required(t(`marketplace.validation.primaryColorRequired`))
      .matches(HEX_COLOR_RE, t(`marketplace.validation.primaryColorInvalid`)),
    css: yup
      .string()
      .trim()
      .required(t(`marketplace.validation.cssRequired`)),
  }))
})

const statusLabel = computed(() => {
  void locale.value
  return {
    pending: t(`marketplace.statusPending`),
    approved: t(`marketplace.statusApproved`),
    rejected: t(`marketplace.statusRejected`),
    draft: t(`marketplace.statusPending`),
  } as Record<string, string>
})

async function refresh() {
  if (!showUi)
    return
  const view = marketplaceDialogView.value
  if (view === `discover`) {
    await marketplaceStore.fetchDiscover(itemType.value, {
      q: searchQuery.value.trim() || undefined,
      sort: sort.value,
    })
  }
  else if (view === `mine`) {
    await marketplaceStore.fetchMine()
  }
  else if (view === `admin`) {
    await marketplaceStore.fetchPending(itemType.value)
  }
}

watch(
  [isShowMarketplaceDialog, marketplaceDialogTab, marketplaceDialogView],
  ([open]) => {
    closeDetail()
    if (open)
      refresh()
  },
  { immediate: true },
)

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch([searchQuery, sort], () => {
  if (marketplaceDialogView.value !== `discover`)
    return
  if (searchTimer)
    clearTimeout(searchTimer)
  searchTimer = setTimeout(refresh, 300)
})

const filteredMine = computed(() =>
  myItems.value.filter(item => item.type === itemType.value),
)

const installedThemeList = computed(() => Object.values(installedThemes.value))

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, `-`)
    .replace(/^-+|-+$/g, ``)
    .slice(0, 48)
}

function syncSlugFromName(
  name: string,
  slug: string,
  setFieldValue: (field: string, value: string) => void,
) {
  const next = slugify(name)
  if (!slug || slug === lastAutoSlug) {
    lastAutoSlug = next
    clearPublishSlugError()
    setFieldValue(`slug`, next)
  }
}

function isInstalled(item: MarketplaceItemSummary): boolean {
  return marketplaceStore.isThemeInstalled(item.id)
}

async function openDetail(item: MarketplaceItemSummary | MarketplaceItemDetail) {
  selectedId.value = item.id
  if (`payload` in item && typeof item.payload === `string`) {
    selectedDetail.value = item as MarketplaceItemDetail
    return
  }
  const detail = await marketplaceStore.fetchDetail(item.id)
  if (detail)
    selectedDetail.value = detail
  else
    selectedId.value = null
}

function closeDetail() {
  selectedId.value = null
  selectedDetail.value = null
}

async function onInstall(item: MarketplaceItemSummary) {
  await marketplaceStore.installItem(item.id, true)
}

function onUninstallTheme(marketplaceId: string, name: string) {
  confirmStore.confirm({
    title: t(`marketplace.uninstall`),
    description: t(`marketplace.confirmUninstall`, { name }),
    destructive: true,
    onConfirm: () => marketplaceStore.uninstallTheme(marketplaceId),
  })
}

function applyInstalledTheme(marketplaceId: string) {
  themeStore.theme = marketplaceThemeKey(marketplaceId)
  const installed = installedThemes.value[marketplaceThemeKey(marketplaceId)]
  if (installed?.primaryColor)
    themeStore.primaryColor = installed.primaryColor
  themeStore.applyCurrentTheme()
}

function importCssFromScheme(
  tabId: string,
  setFieldValue: (field: string, value: string) => void,
) {
  const tab = cssEditorStore.cssContentConfig.tabs.find(t => t.id === tabId)
  if (!tab)
    return
  setFieldValue(`css`, tab.content ?? ``)
  toast.success(t(`marketplace.importCssSuccess`, { name: tab.title || tab.name }))
  importSchemeSelectKey.value += 1
}

const cssSchemeOptions = computed(() =>
  cssEditorStore.cssContentConfig.tabs.map(tab => ({
    id: tab.id,
    label: tab.title || tab.name,
  })),
)

const publishSlugError = ref(``)

function clearPublishSlugError() {
  publishSlugError.value = ``
}

async function submitPublish(formValues: GenericObject) {
  if (!isLoggedIn.value) {
    uiStore.toggleShowAccountDialog(true)
    return
  }

  clearPublishSlugError()
  const values = formValues as typeof emptyPublishValues
  const resolvedSampleMarkdown = sampleMarkdownMode.value === `custom`
    ? (sampleMarkdownDraft.value.trim() || null)
    : null

  if (editingItemId.value) {
    const ok = await marketplaceStore.updateItem(editingItemId.value, {
      name: values.name,
      description: values.description,
      coverUrl: values.coverUrl || null,
      primaryColor: values.primaryColor || null,
      sampleMarkdown: resolvedSampleMarkdown,
      css: values.css,
    })
    if (ok) {
      marketplaceDialogView.value = `mine`
      resetPublishForm()
    }
    return
  }

  const { item, errorCode } = await marketplaceStore.publishTheme({
    name: values.name,
    slug: values.slug || slugify(values.name),
    description: values.description,
    coverUrl: values.coverUrl || null,
    primaryColor: values.primaryColor || null,
    sampleMarkdown: resolvedSampleMarkdown,
    css: values.css,
  })
  if (item) {
    marketplaceDialogView.value = `mine`
    resetPublishForm()
    return
  }
  if (errorCode === `slug_taken`)
    publishSlugError.value = t(`marketplace.validation.slugTaken`)
}

function resetPublishForm() {
  lastAutoSlug = ``
  editingItemId.value = null
  sampleMarkdownMode.value = `default`
  sampleMarkdownDraft.value = ``
  clearPublishSlugError()
  publishInitialValues.value = { ...emptyPublishValues }
  publishFormKey.value += 1
}

function goPublish() {
  if (!isLoggedIn.value) {
    uiStore.toggleShowAccountDialog(true)
    return
  }
  resetPublishForm()
  marketplaceDialogView.value = `publish`
}

async function goEdit(item: MarketplaceItemSummary) {
  if (!isLoggedIn.value) {
    uiStore.toggleShowAccountDialog(true)
    return
  }
  if (item.type !== `theme`)
    return

  const detail = await marketplaceStore.fetchDetail(item.id)
  if (!detail || detail.type !== `theme`)
    return

  clearPublishSlugError()
  editingItemId.value = detail.id
  lastAutoSlug = detail.slug

  const customSample = detail.sampleMarkdown?.trim() || ``
  sampleMarkdownMode.value = customSample ? `custom` : `default`
  sampleMarkdownDraft.value = customSample
  publishInitialValues.value = {
    ...emptyPublishValues,
    name: detail.name,
    slug: detail.slug,
    description: detail.description,
    coverUrl: detail.coverUrl ?? ``,
    primaryColor: detail.primaryColor || `#0F4C81`,
    css: detail.payload,
  }

  marketplaceDialogTab.value = `theme`
  publishFormKey.value += 1
  marketplaceDialogView.value = `publish`
}

function backFromPublish() {
  resetPublishForm()
  marketplaceDialogView.value = isLoggedIn.value ? `mine` : `discover`
}

function onDeleteMine(item: MarketplaceItemSummary) {
  confirmStore.confirm({
    title: t(`marketplace.delete`),
    description: t(`marketplace.confirmDelete`),
    destructive: true,
    onConfirm: () => { void marketplaceStore.removeItem(item.id) },
  })
}

async function onApprove(id: string) {
  await marketplaceStore.approveItem(id)
  closeDetail()
}

async function onReject(id: string) {
  await marketplaceStore.rejectItem(id, rejectReason.value || undefined)
  rejectReason.value = ``
  closeDetail()
}

const MARKETPLACE_PREVIEW_SCOPE = `#marketplace-preview-output`
const DEFAULT_PREVIEW_PRIMARY = `#0F4C81`
const styleTag = `style` as const

const previewCss = computed(() => {
  if (!selectedDetail.value || selectedDetail.value.type !== `theme`)
    return ``

  const primaryColor = selectedDetail.value.primaryColor || DEFAULT_PREVIEW_PRIMARY
  // Theme CSS reads var(--md-primary-color); inject the published recommendation into the preview scope
  const variablesCSS = `${MARKETPLACE_PREVIEW_SCOPE} { --md-primary-color: ${primaryColor}; }`
  const merged = `${themeMap.default}\n\n${selectedDetail.value.payload}`
  return `${variablesCSS}\n\n${wrapCSSWithScope(merged, MARKETPLACE_PREVIEW_SCOPE)}`
})

const previewArticleHtml = ref(``)
let previewRenderer: ReturnType<typeof initRenderer> | null = null

function renderPreviewArticle() {
  const detail = selectedDetail.value
  if (!detail || detail.type !== `theme`) {
    previewArticleHtml.value = ``
    return
  }

  const appLocale = isAppLocale(locale.value) ? locale.value : DEFAULT_LOCALE
  const custom = detail.sampleMarkdown?.trim()
  const markdown = custom || getDefaultContent(appLocale)
  if (!previewRenderer)
    previewRenderer = initRenderer({})

  const { html, readingTime } = renderMarkdown(markdown, previewRenderer)
  previewArticleHtml.value = postProcessHtml(html, readingTime, previewRenderer)
}

watch(
  [selectedDetail, locale],
  ([detail]) => {
    if (detail)
      renderPreviewArticle()
    else
      previewArticleHtml.value = ``
  },
)
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('marketplace.title')"
    :description="t('marketplace.description')"
    :icon="Store"
    size="full"
  >
    <div v-if="!showUi" class="px-6 py-10 text-center text-sm text-muted-foreground">
      {{ t('marketplace.notConfigured') }}
    </div>

    <div v-else class="flex h-[min(82vh,880px)] flex-col overflow-hidden">
      <!-- View tabs (themes only): scrollable on narrow screens -->
      <div class="flex shrink-0 items-center gap-2 border-b px-3 py-2.5 sm:px-6 sm:py-3">
        <div
          class="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div class="inline-flex flex-nowrap items-center gap-0.5 sm:gap-1">
            <Button
              size="sm"
              variant="ghost"
              class="h-8 shrink-0 px-2.5 text-xs"
              :class="marketplaceDialogView === 'discover' && 'bg-accent text-accent-foreground'"
              @click="marketplaceDialogView = 'discover'"
            >
              {{ t('marketplace.viewDiscover') }}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              class="h-8 shrink-0 px-2.5 text-xs"
              :class="marketplaceDialogView === 'installed' && 'bg-accent text-accent-foreground'"
              @click="marketplaceDialogView = 'installed'"
            >
              {{ t('marketplace.viewInstalled') }}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              class="h-8 shrink-0 px-2.5 text-xs"
              :class="marketplaceDialogView === 'mine' && 'bg-accent text-accent-foreground'"
              @click="marketplaceDialogView = 'mine'"
            >
              {{ t('marketplace.viewMine') }}
            </Button>
            <Button
              v-if="isAdmin"
              size="sm"
              variant="ghost"
              class="h-8 shrink-0 gap-1 px-2.5 text-xs"
              :class="marketplaceDialogView === 'admin' && 'bg-accent text-accent-foreground'"
              @click="marketplaceDialogView = 'admin'"
            >
              <Shield class="size-3.5" />
              {{ t('marketplace.viewAdmin') }}
            </Button>
          </div>
        </div>

        <Button size="sm" class="h-8 shrink-0 gap-1 px-2.5 sm:px-3" @click="goPublish">
          <Plus class="size-3.5" />
          {{ t('marketplace.publish') }}
        </Button>
      </div>

      <!-- Discover toolbar -->
      <div
        v-if="marketplaceDialogView === 'discover'"
        class="flex shrink-0 flex-col gap-2 border-b px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:px-6"
      >
        <div class="relative min-w-0 w-full flex-1 sm:min-w-[12rem]">
          <Search class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            class="h-8 pl-8"
            :placeholder="t('marketplace.searchPlaceholder')"
          />
        </div>
        <div class="inline-flex w-fit shrink-0 rounded-md border p-0.5">
          <Button
            size="sm"
            variant="ghost"
            class="h-7 px-2 text-xs"
            :class="sort === 'newest' && 'bg-accent'"
            @click="sort = 'newest'"
          >
            {{ t('marketplace.sortNewest') }}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            class="h-7 px-2 text-xs"
            :class="sort === 'popular' && 'bg-accent'"
            @click="sort = 'popular'"
          >
            {{ t('marketplace.sortPopular') }}
          </Button>
        </div>
      </div>

      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <!-- List / forms -->
        <div
          class="min-h-0 overflow-y-auto px-4 py-4 sm:px-6"
          :class="[
            marketplaceDialogView === 'publish'
              ? 'h-full w-full'
              : 'h-full lg:w-[min(100%,26rem)] lg:shrink-0 lg:border-r xl:w-[28rem]',
            selectedDetail && marketplaceDialogView !== 'publish' ? 'max-lg:hidden' : '',
          ]"
        >
          <div v-if="loading" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <LoaderCircle class="size-4 animate-spin" />
          </div>

          <!-- Discover -->
          <template v-else-if="marketplaceDialogView === 'discover'">
            <div v-if="!discoverItems.length" class="py-16 text-center text-sm text-muted-foreground">
              {{ t('marketplace.emptyDiscover') }}
            </div>
            <div v-else class="grid gap-3">
              <button
                v-for="item in discoverItems"
                :key="item.id"
                type="button"
                class="group rounded-xl border bg-card text-left transition-colors hover:border-primary/30 hover:bg-accent/30"
                :class="selectedId === item.id && 'border-primary/40 ring-1 ring-primary/20'"
                @click="openDetail(item)"
              >
                <div
                  class="h-1.5 rounded-t-[11px]"
                  :style="{ background: item.primaryColor || 'hsl(var(--muted))' }"
                />
                <div class="space-y-2 p-3.5">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="truncate font-medium">
                        {{ item.name }}
                      </div>
                      <div class="truncate text-xs text-muted-foreground">
                        {{ t('marketplace.byAuthor', { login: item.author.login }) }}
                        · {{ t('marketplace.version', { version: item.version }) }}
                      </div>
                    </div>
                    <span
                      v-if="isInstalled(item)"
                      class="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                    >
                      <Check class="size-3" />
                      {{ t('marketplace.installed') }}
                    </span>
                  </div>
                  <p class="line-clamp-2 text-xs text-muted-foreground">
                    {{ item.description || '—' }}
                  </p>
                  <div class="flex items-center justify-between pt-1">
                    <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Download class="size-3" />
                      {{ t('marketplace.downloads', { count: item.downloadCount }) }}
                    </span>
                    <Button
                      size="sm"
                      class="h-7 px-2.5 text-xs"
                      :disabled="isInstalled(item)"
                      @click.stop="onInstall(item)"
                    >
                      {{ isInstalled(item) ? t('marketplace.installed') : t('marketplace.install') }}
                    </Button>
                  </div>
                </div>
              </button>
            </div>
          </template>

          <!-- Installed -->
          <template v-else-if="marketplaceDialogView === 'installed'">
            <div
              v-if="!installedThemeList.length"
              class="py-16 text-center text-sm text-muted-foreground"
            >
              {{ t('marketplace.emptyInstalled') }}
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="theme in installedThemeList"
                :key="theme.marketplaceId"
                class="flex items-center gap-3 rounded-xl border p-3"
              >
                <div
                  class="size-10 shrink-0 rounded-lg border"
                  :style="{ background: theme.primaryColor || 'hsl(var(--muted))' }"
                />
                <div class="min-w-0 flex-1">
                  <div class="font-medium">
                    {{ theme.name }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ t('marketplace.byAuthor', { login: theme.authorLogin }) }}
                  </div>
                </div>
                <Button size="sm" variant="outline" class="h-8" @click="applyInstalledTheme(theme.marketplaceId)">
                  {{ t('marketplace.apply') }}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  class="h-8 text-destructive"
                  @click="onUninstallTheme(theme.marketplaceId, theme.name)"
                >
                  <Trash2 class="size-3.5" />
                </Button>
              </div>
            </div>
          </template>

          <!-- Mine -->
          <template v-else-if="marketplaceDialogView === 'mine'">
            <div v-if="!isLoggedIn" class="py-16 text-center">
              <p class="mb-3 text-sm text-muted-foreground">
                {{ t('marketplace.loginRequired') }}
              </p>
              <Button @click="uiStore.toggleShowAccountDialog(true)">
                {{ t('marketplace.goLogin') }}
              </Button>
            </div>
            <div v-else-if="!filteredMine.length" class="py-16 text-center text-sm text-muted-foreground">
              {{ t('marketplace.emptyMine') }}
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="item in filteredMine"
                :key="item.id"
                role="button"
                tabindex="0"
                class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:border-primary/30 hover:bg-accent/30"
                :class="selectedId === item.id && 'border-primary/40 ring-1 ring-primary/20'"
                @click="openDetail(item)"
                @keydown.enter="openDetail(item)"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ item.name }}</span>
                    <span
                      class="rounded-full px-2 py-0.5 text-[10px]"
                      :class="{
                        'bg-amber-500/15 text-amber-700 dark:text-amber-300': item.status === 'pending',
                        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300': item.status === 'approved',
                        'bg-destructive/10 text-destructive': item.status === 'rejected',
                      }"
                    >
                      {{ statusLabel[item.status] }}
                    </span>
                  </div>
                  <p v-if="item.rejectReason" class="mt-1 text-xs text-destructive">
                    {{ item.rejectReason }}
                  </p>
                  <div class="text-xs text-muted-foreground">
                    {{ item.slug }} · {{ t('marketplace.version', { version: item.version }) }}
                  </div>
                </div>
                <Button size="sm" variant="ghost" class="h-8" @click.stop="goEdit(item)">
                  <Pencil class="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" class="h-8 text-destructive" @click.stop="onDeleteMine(item)">
                  <Trash2 class="size-3.5" />
                </Button>
              </div>
            </div>
          </template>

          <!-- Admin -->
          <template v-else-if="marketplaceDialogView === 'admin'">
            <div v-if="!pendingItems.length" class="py-16 text-center text-sm text-muted-foreground">
              {{ t('marketplace.emptyPending') }}
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="item in pendingItems.filter(i => i.type === itemType)"
                :key="item.id"
                class="rounded-xl border p-3 transition-colors"
                :class="selectedId === item.id && 'border-primary/40 ring-1 ring-primary/20'"
              >
                <button
                  type="button"
                  class="w-full text-left"
                  @click="openDetail(item)"
                >
                  <div class="font-medium">
                    {{ item.name }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ t('marketplace.byAuthor', { login: item.author.login }) }} · {{ item.slug }}
                  </div>
                  <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {{ item.description }}
                  </p>
                </button>
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <Input
                    v-model="rejectReason"
                    class="h-8 max-w-xs"
                    :placeholder="t('marketplace.rejectReasonPlaceholder')"
                    @click.stop
                  />
                  <Button size="sm" class="h-8" @click="onApprove(item.id)">
                    {{ t('marketplace.approve') }}
                  </Button>
                  <Button size="sm" variant="destructive" class="h-8" @click="onReject(item.id)">
                    {{ t('marketplace.reject') }}
                  </Button>
                </div>
              </div>
            </div>
          </template>

          <!-- Publish -->
          <template v-else-if="marketplaceDialogView === 'publish'">
            <Form
              :key="`${publishFormKey}-${itemType}`"
              v-slot="{ setFieldValue, values }"
              class="mx-auto max-w-xl space-y-1"
              :validation-schema="publishSchema"
              :initial-values="publishInitialValues"
              @submit="submitPublish"
            >
              <Field v-slot="{ field, errorMessage, handleChange }" name="name">
                <FormItem :label="t('marketplace.fieldName')" required :error="errorMessage" :width="120">
                  <Input
                    v-bind="field"
                    :model-value="field.value"
                    @update:model-value="(v) => {
                      handleChange(v)
                      if (!isEditing)
                        syncSlugFromName(String(v ?? ''), String(values.slug ?? ''), setFieldValue)
                    }"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage, handleChange }" name="slug">
                <FormItem
                  :label="t('marketplace.fieldSlug')"
                  required
                  :error="errorMessage || publishSlugError"
                  :width="120"
                >
                  <Input
                    v-bind="field"
                    :model-value="field.value"
                    :disabled="isEditing"
                    :placeholder="t('marketplace.fieldSlugHint')"
                    @update:model-value="(v) => {
                      clearPublishSlugError()
                      handleChange(v)
                    }"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="description">
                <FormItem :label="t('marketplace.fieldDescription')" :error="errorMessage" :width="120">
                  <Textarea
                    v-bind="field"
                    v-model.trim="field.value"
                    rows="3"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="coverUrl">
                <FormItem :label="t('marketplace.fieldCoverUrl')" :error="errorMessage" :width="120">
                  <Input
                    v-bind="field"
                    v-model.trim="field.value"
                    placeholder="https://"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ value, handleChange, errorMessage }" name="primaryColor">
                <FormItem :label="t('marketplace.fieldPrimaryColor')" required :error="errorMessage" :width="120">
                  <div ref="pickColorsContainer" class="w-full">
                    <PickColors
                      v-if="pickColorsContainer"
                      :value="value"
                      show-alpha
                      :format="format"
                      :format-options="formatOptions"
                      :theme="isDark ? 'dark' : 'light'"
                      :popup-container="pickColorsContainer"
                      @change="handleChange"
                    />
                  </div>
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="css">
                <div class="min-h-[auto] md:min-h-[64px]">
                  <div class="mb-2 flex flex-col gap-2 sm:mb-2 sm:flex-row sm:items-center sm:justify-between md:mb-0">
                    <span class="shrink-0 text-sm font-medium md:w-[120px] md:text-right">
                      <span class="mr-1 text-red-500">*</span>{{ t('marketplace.fieldCss') }}
                    </span>
                    <Select
                      :key="importSchemeSelectKey"
                      :disabled="!cssSchemeOptions.length"
                      @update:model-value="(id) => {
                        if (typeof id === 'string')
                          importCssFromScheme(id, setFieldValue)
                      }"
                    >
                      <SelectTrigger class="h-8 w-full text-xs sm:max-w-[14rem]">
                        <SelectValue :placeholder="t('marketplace.importFromCssScheme')" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="scheme in cssSchemeOptions"
                          :key="scheme.id"
                          :value="scheme.id"
                        >
                          {{ scheme.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="md:pl-[136px]">
                    <Textarea
                      v-bind="field"
                      v-model="field.value"
                      class="min-h-40 w-full font-mono text-xs"
                      rows="10"
                    />
                    <p v-if="errorMessage" class="mt-1 text-[12px] text-red-500">
                      {{ errorMessage }}
                    </p>
                  </div>
                </div>
              </Field>

              <FormItem :label="t('marketplace.fieldSampleMarkdown')" :width="120">
                <div class="flex w-full flex-col gap-2">
                  <RadioGroup
                    v-model="sampleMarkdownMode"
                    class="flex flex-wrap gap-4"
                  >
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                      <RadioGroupItem id="mp-sample-default" value="default" />
                      {{ t('marketplace.sampleMarkdownDefault') }}
                    </label>
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                      <RadioGroupItem id="mp-sample-custom" value="custom" />
                      {{ t('marketplace.sampleMarkdownCustom') }}
                    </label>
                  </RadioGroup>
                  <Textarea
                    v-if="sampleMarkdownMode === 'custom'"
                    v-model="sampleMarkdownDraft"
                    class="min-h-32 font-mono text-xs"
                    rows="8"
                    :placeholder="t('marketplace.sampleMarkdownPlaceholder')"
                  />
                </div>
              </FormItem>

              <div class="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" @click="backFromPublish">
                  {{ t('marketplace.back') }}
                </Button>
                <Button type="submit" :disabled="publishing">
                  <LoaderCircle v-if="publishing" class="mr-1 size-3.5 animate-spin" />
                  {{ isEditing ? t('marketplace.updateSubmit') : t('marketplace.publishSubmit') }}
                </Button>
              </div>
            </Form>
          </template>
        </div>

        <!-- Preview pane: right column on desktop, full-screen on smaller viewports -->
        <aside
          v-if="marketplaceDialogView !== 'publish'"
          class="min-h-0 flex-col bg-background"
          :class="selectedDetail
            ? 'absolute inset-0 z-20 flex lg:static lg:inset-auto lg:z-auto lg:h-full lg:flex-1'
            : 'hidden lg:flex lg:h-full lg:flex-1'"
        >
          <template v-if="selectedDetail">
            <div class="flex shrink-0 items-center gap-2 border-b bg-background px-3 py-2 lg:hidden">
              <Button size="sm" variant="ghost" class="h-8 px-2" @click="closeDetail">
                {{ t('marketplace.back') }}
              </Button>
              <span class="min-w-0 truncate text-sm font-medium">
                {{ selectedDetail.name }}
              </span>
            </div>
            <div class="min-h-0 flex-1 overflow-auto bg-muted/30 p-3 sm:p-5">
              <div
                class="mx-auto min-h-full w-full max-w-[680px] rounded-xl border bg-background shadow-sm"
              >
                <component :is="styleTag">
                  {{ previewCss }}
                </component>
                <div
                  id="marketplace-preview-output"
                  class="px-5 py-6 text-base leading-relaxed sm:px-8 sm:py-8"
                  v-html="previewArticleHtml"
                />
              </div>
            </div>
          </template>
          <div
            v-else
            class="hidden flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground lg:flex"
          >
            <Palette class="size-8 opacity-40" />
            <p>{{ t('marketplace.previewEmpty') }}</p>
          </div>
        </aside>
      </div>
    </div>
  </PanelDialog>
</template>
