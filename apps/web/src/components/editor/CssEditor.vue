<script setup lang="ts">
import type { ThemeName } from '@md/shared/configs'
import { Check, CheckSquare, CircleHelp, Download, Edit3, Ellipsis, Eye, Plus, X } from '@lucide/vue'
import { exportMergedTheme } from '@md/core'
import { getDefaultCustomTheme, isBuiltinThemeName, isMarketplaceThemeKey, themeMap } from '@md/shared'
import { getThemeLabel } from '@/composables/useLocalizedStyleOptions'
import { CONTENT_FONT_LANG } from '@/i18n/constants'
import { getLocale } from '@/i18n/translate'
import { copyPlain } from '@/lib/browser/clipboard'
import { useConfirmStore } from '@/stores/confirm'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useEditorStore } from '@/stores/editor'
import { useMarketplaceStore } from '@/stores/marketplace'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const { t } = useI18n()
const confirmStore = useConfirmStore()
const cssEditorStore = useCssEditorStore()
const uiStore = useUIStore()
const renderStore = useRenderStore()
const editorStore = useEditorStore()
const themeStore = useThemeStore()

const { isMobile } = storeToRefs(uiStore)
const { cssContentConfig, isSelectMode, selectedIds } = storeToRefs(cssEditorStore)

const enableAnimation = ref(false)

watch(() => uiStore.isShowCssEditor, () => {
  if (isMobile.value) {
    enableAnimation.value = true
  }
})

watch(() => isMobile.value, () => {
  enableAnimation.value = false
})

const isOpenEditDialog = ref(false)
const editInputVal = ref(``)

const inlineEditId = ref<string | null>(null)
const inlineEditVal = ref(``)
let inlineInputRef: HTMLInputElement | null = null
function setInlineInputRef(el: unknown) {
  inlineInputRef = el as HTMLInputElement | null
}

function startInlineRename(tab: { id: string, title: string }) {
  inlineEditId.value = tab.id
  inlineEditVal.value = tab.title
  nextTick(() => {
    inlineInputRef?.select()
  })
}

function commitInlineRename() {
  const id = inlineEditId.value
  if (!id)
    return
  const trimmed = inlineEditVal.value.trim()
  if (!trimmed) {
    toast.error(t('cssEditor.schemeNameRequired'))
    inlineEditId.value = null
    return
  }
  const currentTab = cssContentConfig.value.tabs.find(t => t.id === id)
  if (currentTab && trimmed !== currentTab.title) {
    currentTab.title = trimmed
    currentTab.name = trimmed
    currentTab.updateDatetime = new Date()
    toast.success(t('post.editSuccess'))
  }
  inlineEditId.value = null
}

function cancelInlineRename() {
  inlineEditId.value = null
}

async function scrollToActiveTab() {
  await nextTick()
  const activeTab = document.querySelector('.cssEditor-wrapper .css-tab-active')
  if (activeTab) {
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

function rename(name: string) {
  editInputVal.value = name
  isOpenEditDialog.value = true
}

function editTabName() {
  if (!(editInputVal.value).trim()) {
    toast.error(t('cssEditor.editNameFailed'))
    return
  }

  cssEditorStore.renameTab(editInputVal.value)
  isOpenEditDialog.value = false
  toast.success(t('post.editSuccess'))
}

const isOpenAddDialog = ref(false)
const isOpenTipsDialog = ref(false)

const addInputVal = ref(``)
const baseThemeForNew = ref<'blank' | 'default' | 'grace' | 'simple'>('blank')

async function addTab() {
  if (!(addInputVal.value).trim()) {
    toast.error(t('cssEditor.createNameFailed'))
    return
  }

  let initialContent = ''
  if (baseThemeForNew.value === 'blank') {
    initialContent = getDefaultCustomTheme(getLocale())
  }
  else {
    initialContent = themeMap[baseThemeForNew.value]
  }

  const newTabName = addInputVal.value

  cssEditorStore.addCssContentTab(newTabName, initialContent)

  isOpenAddDialog.value = false
  toast.success(t('cssEditor.createSuccess'))

  baseThemeForNew.value = 'blank'

  scrollToActiveTab()
}

function removeHandler(targetId: string) {
  confirmStore.confirm({
    title: t('confirm.tip'),
    description: t('cssEditor.deleteSchemeConfirm'),
    onConfirm: () => {
      const tabs = cssContentConfig.value.tabs
      if (tabs.length === 1) {
        toast.warning(t('cssEditor.keepOneScheme'))
        return
      }

      let activeId = cssContentConfig.value.active
      if (activeId === targetId) {
        tabs.forEach((tab, index) => {
          if (tab.id === targetId) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeId = nextTab.id
            }
          }
        })
      }

      cssEditorStore.tabChanged(activeId)
      cssContentConfig.value.tabs = tabs.filter(tab => tab.id !== targetId)

      toast.success(t('common.deleteSuccess'))
    },
  })
}

function addHandler() {
  addInputVal.value = t('cssEditor.schemeDefaultName', { index: cssContentConfig.value.tabs.length + 1 })
  baseThemeForNew.value = 'blank'
  isOpenAddDialog.value = true
}

const isOpenViewThemeDialog = ref(false)
const selectedViewTheme = ref<'default' | 'grace' | 'simple'>('default')

const contextMenuTargetId = ref<string | null>(null)
const showContextMenu = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })

function onContextMenu(e: MouseEvent, tabId: string) {
  e.preventDefault()
  e.stopPropagation()
  contextMenuTargetId.value = tabId
  contextMenuPos.value = { x: e.clientX, y: e.clientY }
  showContextMenu.value = true
}

function closeContextMenu() {
  showContextMenu.value = false
  contextMenuTargetId.value = null
}

function contextMenuRename() {
  const tab = cssContentConfig.value.tabs.find(t => t.id === contextMenuTargetId.value)
  if (tab) {
    rename(tab.name)
  }
  closeContextMenu()
}

function contextMenuExport() {
  if (contextMenuTargetId.value) {
    cssEditorStore.exportSingleTab(contextMenuTargetId.value)
  }
  closeContextMenu()
}

function contextMenuDelete() {
  if (contextMenuTargetId.value) {
    removeHandler(contextMenuTargetId.value)
  }
  closeContextMenu()
}

function enterSelectModeFromContextMenu() {
  if (contextMenuTargetId.value) {
    cssEditorStore.toggleSelectMode()
    cssEditorStore.toggleSelectTab(contextMenuTargetId.value)
  }
  closeContextMenu()
}

const allSelected = computed(
  () => cssContentConfig.value.tabs.length > 0 && selectedIds.value.length === cssContentConfig.value.tabs.length,
)

function openBatchDelConfirm() {
  const n = selectedIds.value.length
  const description = n === 1
    ? t('confirm.deleteItem', { name: cssContentConfig.value.tabs.find(tab => tab.id === selectedIds.value[0])?.title ?? '' })
    : t('confirm.deleteCssScheme', { count: n })

  confirmStore.confirm({
    title: t('confirm.tip'),
    description,
    confirmText: t('post.confirmDelete'),
    destructive: true,
    onConfirm: () => {
      cssEditorStore.batchDeleteTabs()
    },
  })
}

function handleTabClick(tabId: string) {
  if (isSelectMode.value) {
    cssEditorStore.toggleSelectTab(tabId)
  }
  else {
    tabChanged(tabId)
  }
}

function exitSelectMode() {
  cssEditorStore.toggleSelectMode()
}

function openViewThemeDialog() {
  selectedViewTheme.value = 'default'
  isOpenViewThemeDialog.value = true
}

async function copyThemeCSS() {
  const css = themeMap[selectedViewTheme.value]
  await copyPlain(css)
  toast.success(t('common.copiedToClipboard'))
}

function createFromViewTheme() {
  isOpenViewThemeDialog.value = false

  baseThemeForNew.value = selectedViewTheme.value
  addInputVal.value = t('cssEditor.basedOnTheme', { theme: getThemeLabel(t, selectedViewTheme.value as ThemeName) })
  isOpenAddDialog.value = true
}

function tabChanged(tabId: string | number) {
  cssEditorStore.tabChanged(tabId as string)

  scrollToActiveTab()
}

onMounted(() => {
  const handleCssUpdate = () => {
    themeStore.applyCurrentTheme()

    themeStore.updateCodeTheme()
    const raw = editorStore.getContent()
    renderStore.render(raw)
  }

  cssEditorStore.setOnTabChangedCallback(handleCssUpdate)

  cssEditorStore.initCssEditor(handleCssUpdate)

  scrollToActiveTab()

  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

function exportCurrentTheme() {
  const currentTab = cssContentConfig.value.tabs.find(tab => tab.id === cssContentConfig.value.active)
  if (!currentTab) {
    toast.error(t('cssEditor.schemeNotFound'))
    return
  }

  const currentThemeName = currentTab.title || currentTab.name

  // Export merged theme (includes default base + active preview theme)
  let baseTheme = themeMap.default
  if (themeStore.theme === `default`) {
    baseTheme = themeMap.default
  }
  else if (isBuiltinThemeName(themeStore.theme)) {
    baseTheme = `${themeMap.default}\n\n${themeMap[themeStore.theme]}`
  }
  else if (isMarketplaceThemeKey(themeStore.theme)) {
    const marketplaceCss = useMarketplaceStore().getInstalledThemeCss(themeStore.theme)
    if (marketplaceCss)
      baseTheme = `${themeMap.default}\n\n${marketplaceCss}`
  }

  exportMergedTheme(
    currentTab.content,
    baseTheme,
    {
      primaryColor: themeStore.primaryColor,
      fontFamily: themeStore.fontFamily,
      fontSize: themeStore.fontSize,
    },
    currentThemeName,
  )
}
</script>

<template>
  <div
    v-if="isMobile && uiStore.isShowCssEditor"
    class="fixed inset-0 bg-black/50 z-40"
    @click="uiStore.isShowCssEditor = false"
  />

  <div
    v-show="isMobile ? uiStore.isShowCssEditor : true"
    class="cssEditor-wrapper h-full flex flex-col overflow-y-auto"
    :class="{
      'fixed top-0 right-0 w-full h-full z-100 bg-background border-l shadow-lg mobile-css-editor': isMobile,
      'animate': isMobile && enableAnimation,
    }"
    :style="isMobile ? { transform: uiStore.isShowCssEditor ? 'translateX(0)' : 'translateX(100%)' } : undefined"
  >
    <div class="flex items-center h-9 px-2 shrink-0 border-b border-border">
      <div class="flex-1 flex items-center gap-0 overflow-x-auto custom-scrollbar min-w-0 h-full">
        <div
          v-for="item in cssContentConfig.tabs"
          :key="item.id"
          class="group/tab relative flex items-center gap-1.5 shrink-0 h-full px-3 text-xs transition-colors duration-150"
          :class="[
            cssContentConfig.active === item.id && !isSelectMode ? 'css-tab-active text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
            isSelectMode && selectedIds.includes(item.id) ? 'bg-accent text-accent-foreground' : '',
          ]"
          @click="handleTabClick(item.id)"
          @dblclick.stop="startInlineRename(item)"
          @contextmenu="onContextMenu($event, item.id)"
        >
          <span
            v-if="isSelectMode"
            class="inline-flex items-center justify-center size-4 rounded border transition-colors mr-1"
            :class="selectedIds.includes(item.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-border'"
          >
            <Check v-if="selectedIds.includes(item.id)" class="size-3" />
          </span>
          <input
            v-if="inlineEditId === item.id"
            :ref="setInlineInputRef"
            v-model="inlineEditVal"
            class="w-[80px] bg-transparent outline-none border-b border-primary text-xs"
            @click.stop
            @keyup.enter="commitInlineRename"
            @keyup.escape="cancelInlineRename"
            @blur="commitInlineRename"
          >
          <span v-else class="truncate max-w-[100px]">{{ item.title }}</span>

          <span
            v-if="cssContentConfig.active === item.id && !isSelectMode"
            class="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary"
          />

          <DropdownMenu v-if="cssContentConfig.active === item.id && !isSelectMode">
            <DropdownMenuTrigger as-child>
              <span
                class="inline-flex items-center justify-center size-4 rounded text-muted-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-100 cursor-pointer"
                @click.stop
              >
                <Ellipsis class="size-3" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-32">
              <DropdownMenuItem @click.stop="rename(item.name)">
                <Edit3 class="mr-2 size-4" /> {{ t('common.rename') }}
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="cssEditorStore.exportSingleTab(item.id)">
                <Download class="mr-2 size-4" /> {{ t('common.export') }}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-if="cssContentConfig.tabs.length > 1"
                class="text-destructive focus:text-destructive"
                @click.stop="removeHandler(item.id)"
              >
                <X class="mr-2 size-4" /> {{ t('common.delete') }}
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="cssEditorStore.toggleSelectMode(); cssEditorStore.toggleSelectTab(item.id)">
                <CheckSquare class="mr-2 size-4" /> {{ t('cssEditor.multiSelect') }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div class="flex items-center shrink-0">
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          :title="t('cssEditor.newTitle')"
          @click="addHandler"
        >
          <Plus class="size-3.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
              :title="t('common.more')"
            >
              <Ellipsis class="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="openViewThemeDialog">
              <Eye class="mr-2 size-4" /> {{ t('cssEditor.viewBuiltinTitle') }}
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportCurrentTheme">
              <Download class="mr-2 size-4" /> {{ t('common.export') }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="isOpenTipsDialog = true">
              <CircleHelp class="mr-2 size-4" /> {{ t('cssEditor.tipsTitle') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          :title="t('common.close')"
          @click="uiStore.isShowCssEditor = false"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0" :lang="CONTENT_FONT_LANG">
      <textarea
        id="cssEditor"
        type="textarea"
        :placeholder="t('cssEditor.cssPlaceholder')"
      />
    </div>

    <Transition name="slide-up">
      <div
        v-if="isSelectMode"
        class="shrink-0 border-t border-border bg-background px-3 pt-2 pb-3 space-y-2"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">
            {{ t('common.selected') }}
            <strong class="text-foreground font-semibold">{{ selectedIds.length }}</strong>
            {{ t('cssEditor.selectedUnit') }}
          </span>
          <div class="flex items-center gap-2 text-muted-foreground">
            <button
              class="hover:text-foreground transition-colors"
              @click="allSelected ? cssEditorStore.clearSelection() : cssEditorStore.selectAllTabs()"
            >
              {{ allSelected ? t('common.deselectAll') : t('common.selectAll') }}
            </button>
            <span class="opacity-30">·</span>
            <button class="hover:text-foreground transition-colors" @click="exitSelectMode">
              {{ t('common.done') }}
            </button>
          </div>
        </div>
        <div class="flex">
          <button
            class="flex flex-1 items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
            :title="t('common.export')"
            :disabled="!selectedIds.length"
            @click="cssEditorStore.batchExportTabs"
          >
            <Download class="size-4" />
          </button>
          <div class="mx-1 self-center h-5 w-px bg-border/60 shrink-0" />
          <button
            class="flex flex-1 items-center justify-center rounded-md py-2 text-destructive/60 transition-colors hover:bg-destructive/8 hover:text-destructive disabled:pointer-events-none disabled:opacity-35"
            :title="selectedIds.length >= cssContentConfig.tabs.length ? t('cssEditor.deleteSchemeMinOne') : t('common.delete')"
            :disabled="!selectedIds.length || selectedIds.length >= cssContentConfig.tabs.length"
            @click="openBatchDelConfirm()"
          >
            <X class="size-4" />
          </button>
        </div>
      </div>
    </Transition>

    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="fixed z-50 min-w-[120px] rounded-md border border-border bg-background p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        :style="{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }"
        @click.stop
      >
        <button
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
          @click="contextMenuRename"
        >
          <Edit3 class="mr-2 size-3.5" /> {{ t('common.rename') }}
        </button>
        <button
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
          @click="contextMenuExport"
        >
          <Download class="mr-2 size-3.5" /> {{ t('common.export') }}
        </button>
        <div class="my-1 h-px bg-border" />
        <button
          v-if="cssContentConfig.tabs.length > 1"
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-destructive hover:bg-destructive/8 transition-colors"
          @click="contextMenuDelete"
        >
          <X class="mr-2 size-3.5" /> {{ t('common.delete') }}
        </button>
        <button
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
          @click="enterSelectModeFromContextMenu"
        >
          <CheckSquare class="mr-2 size-3.5" /> {{ t('cssEditor.multiSelect') }}
        </button>
      </div>
    </Teleport>

    <Dialog v-model:open="isOpenAddDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ t('cssEditor.newTitle') }}</DialogTitle>
          <DialogDescription>
            {{ t('cssEditor.newDescription') }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">{{ t('cssEditor.schemeName') }}</label>
            <Input v-model="addInputVal" :placeholder="t('cssEditor.schemeNamePlaceholder')" @keyup.enter="addTab" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">{{ t('cssEditor.initialTemplate') }}</label>
            <Select v-model="baseThemeForNew">
              <SelectTrigger>
                <SelectValue :placeholder="t('cssEditor.selectTemplate')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">
                  {{ t('cssEditor.blankScheme') }}
                </SelectItem>
                <SelectItem value="default">
                  {{ t('cssEditor.basedClassic') }}
                </SelectItem>
                <SelectItem value="grace">
                  {{ t('cssEditor.basedGrace') }}
                </SelectItem>
                <SelectItem value="simple">
                  {{ t('cssEditor.basedSimple') }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              {{ t('cssEditor.templateHint') }}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isOpenAddDialog = false">
            {{ t('common.cancel') }}
          </Button>
          <Button @click="addTab()">
            {{ t('common.create') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isOpenEditDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ t('cssEditor.editSchemeTitle') }}</DialogTitle>
          <DialogDescription>
            {{ t('cssEditor.editSchemeDescription') }}
          </DialogDescription>
        </DialogHeader>
        <Input v-model="editInputVal" @keyup.enter="editTabName" />
        <DialogFooter>
          <Button variant="outline" @click="isOpenEditDialog = false">
            {{ t('common.cancel') }}
          </Button>
          <Button @click="editTabName">
            {{ t('common.save') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isOpenTipsDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ t('cssEditor.tipsTitle') }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>{{ t('cssEditor.editorHint') }}</p>
          <p>
            <i18n-t keypath="cssEditor.shareThemeHint" tag="span">
              <template #link>
                <a
                  href="https://github.com/doocs/md/discussions/426"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-foreground hover:text-primary underline-offset-2 hover:underline"
                >{{ t('cssEditor.shareThemeLinkText') }}</a>
              </template>
            </i18n-t>
          </p>
        </div>
        <DialogFooter>
          <Button @click="isOpenTipsDialog = false">
            {{ t('common.close') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <Dialog v-model:open="isOpenViewThemeDialog">
    <DialogContent class="sm:max-w-4xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>{{ t('cssEditor.viewBuiltinTitle') }}</DialogTitle>
        <DialogDescription>
          {{ t('cssEditor.viewBuiltinDescription') }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 flex-1 min-h-0 flex flex-col">
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('cssEditor.selectTheme') }}</label>
          <Select v-model="selectedViewTheme">
            <SelectTrigger class="w-full mt-2 sm:w-[200px] focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectValue :placeholder="t('cssEditor.selectThemePlaceholder')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">
                {{ getThemeLabel(t, 'default') }}
              </SelectItem>
              <SelectItem value="grace">
                {{ getThemeLabel(t, 'grace') }}
              </SelectItem>
              <SelectItem value="simple">
                {{ getThemeLabel(t, 'simple') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex-1 min-h-0 border rounded-lg overflow-auto">
          <pre class="h-full overflow-auto p-4 bg-muted text-sm"><code>{{ themeMap[selectedViewTheme] }}</code></pre>
        </div>
      </div>

      <DialogFooter class="flex-col sm:flex-row gap-2">
        <Button variant="outline" @click="isOpenViewThemeDialog = false">
          {{ t('common.close') }}
        </Button>
        <Button variant="outline" @click="copyThemeCSS">
          {{ t('cssEditor.copyAll') }}
        </Button>
        <Button variant="outline" @click="createFromViewTheme">
          {{ t('cssEditor.createFromTheme') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style lang="less" scoped>
.custom-scrollbar {
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.mobile-css-editor.animate {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
