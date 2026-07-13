<script setup lang="ts">
import { Check, Copy, Expand, UploadCloud } from '@lucide/vue'
import { downloadFile } from '@md/shared/utils/fileHelpers'
import { computed } from 'vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { copyPlain } from '@/lib/browser/clipboard'
import { useCssEditorStore } from '@/stores/cssEditor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t, te } = useI18n()

function storeStateLabel(key: string) {
  const i18nKey = `editorState.storeLabels.${key}`
  return te(i18nKey) ? t(i18nKey) : key
}

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})
const themeStore = useThemeStore()
const uiStore = useUIStore()
const postStore = usePostStore()
const cssEditorStore = useCssEditorStore()
const renderStore = useRenderStore()

const activeName = ref(`import`)
const tabs = computed(() => [
  { value: `import`, label: t('editorState.importTab') },
  { value: `export`, label: t('editorState.exportTab') },
] as const)

const storeStates = ref<{
  data: Record<string, any>
  selected: Record<string, boolean>
}>({
  data: {},
  selected: {},
})

watch(
  () => props.open,
  (val) => {
    if (val)
      fetchStoreStates()
  },
  { immediate: true },
)

function getAllStoreStates() {
  return {
    isDark: uiStore.isDark,
    isOpenRightSlider: uiStore.isOpenRightSlider,
    isOpenPostSlider: uiStore.isOpenPostSlider,
    showAIToolbox: uiStore.showAIToolbox,

    theme: themeStore.theme,
    fontFamily: themeStore.fontFamily,
    fontSize: themeStore.fontSize,
    primaryColor: themeStore.primaryColor,
    codeBlockTheme: themeStore.codeBlockTheme,
    legend: themeStore.legend,
    isMacCodeBlock: themeStore.isMacCodeBlock,
    isShowLineNumber: themeStore.isShowLineNumber,
    isCiteStatus: themeStore.isCiteStatus,
    isCountStatus: themeStore.isCountStatus,
    isUseIndent: themeStore.isUseIndent,
    isUseJustify: themeStore.isUseJustify,

    currentPostId: postStore.currentPostId,
    currentPostIndex: postStore.currentPostIndex,
    posts: postStore.posts,

    cssContentConfig: cssEditorStore.cssContentConfig,

    titleList: renderStore.titleList,
    readingTime: renderStore.readingTime,

    isShowCssEditor: uiStore.isShowCssEditor,
    isShowInsertFormDialog: uiStore.isShowInsertFormDialog,
    isShowUploadImgDialog: uiStore.isShowUploadImgDialog,
    aiDialogVisible: uiStore.aiDialogVisible,
    aiImageDialogVisible: uiStore.aiImageDialogVisible,
  }
}

async function fetchStoreStates() {
  try {
    const states = getAllStoreStates()
    storeStates.value = {
      data: states,
      selected: Object.keys(states).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {} as Record<string, boolean>),
    }
  }
  catch {
  }
}

const filteredExportJSON = computed(() => {
  if (!storeStates.value.data)
    return {}

  return Object.keys(storeStates.value.data).reduce((acc, key) => {
    if (storeStates.value.selected[key]) {
      acc[key] = storeStates.value.data[key]
    }
    return acc
  }, {} as Record<string, any>)
})

const importStates = ref<{
  data: Record<string, any>
  selected: Record<string, boolean>
}>({
  data: {},
  selected: {},
})
const originalImportData = ref<Record<string, any> | null>(null)

const filteredImportJSON = computed(() => {
  if (!importStates.value.data)
    return {}

  return Object.keys(importStates.value.data).reduce((acc, key) => {
    if (importStates.value.selected[key]) {
      acc[key] = importStates.value.data[key]
    }
    return acc
  }, {} as Record<string, any>)
})
function exportSelectedConfig() {
  const selectedConfig = Object.keys(storeStates.value.data).reduce((acc, key) => {
    if (storeStates.value.selected[key]) {
      acc[key] = storeStates.value.data[key]
    }
    return acc
  }, {} as Record<string, any>)

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, `0`)
  const filename = `doocs-md-config-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.json`
  downloadFile(JSON.stringify(selectedConfig, null, 2), filename, `application/json`)
  toast.success(t('editorState.exportSuccess'))
  dialogOpen.value = false
}

const isMaximized = ref(false)
const currentMaximizedJSON = computed(() => {
  if (activeName.value === `export`) {
    return filteredExportJSON.value
  }
  else if (activeName.value === `import`) {
    return filteredImportJSON.value
  }
  return {}
})

const isCopied = ref(false)

async function copyToClipboard(text: string) {
  try {
    await copyPlain(text)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 1500)
  }
  catch {
    toast.error(t('editorState.copyRetry'))
  }
}

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length)
    return

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const importedData = JSON.parse(content) as Record<string, any>

      if (typeof importedData !== `object` || Array.isArray(importedData)) {
        toast.error(t('editorState.importFormatError'))
        return
      }

      const allowedKeys = Object.keys(storeStates.value.data).concat(Object.keys(importStates.value.data))
      const filteredData = Object.keys(importedData).reduce((acc, key) => {
        if (allowedKeys.includes(key)) {
          acc[key] = importedData[key]
        }
        return acc
      }, {} as Record<string, any>)

      if (Object.keys(filteredData).length === 0) {
        toast.error(t('editorState.importNoApplicable'))
        return
      }

      originalImportData.value = importedData
      importStates.value = {
        data: importedData,
        selected: Object.keys(importedData).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {} as Record<string, boolean>),
      }
      toast.success(t('editorState.importSuccess'))
    }
    catch {
      toast.error(t('editorState.parseFailed'))
    }
  }

  reader.readAsText(file)
  input.value = ``
}

function applyImportedConfig() {
  if (!filteredImportJSON.value)
    return

  Object.keys(importStates.value.selected).forEach((key) => {
    if (importStates.value.selected[key] && importStates.value.data?.[key] !== undefined) {
      const value = importStates.value.data[key]

      if (key === `isDark`)
        uiStore.isDark = value
      else if (key === `isOpenRightSlider`)
        uiStore.isOpenRightSlider = value
      else if (key === `isOpenPostSlider`)
        uiStore.isOpenPostSlider = value
      else if (key === `showAIToolbox`)
        uiStore.showAIToolbox = value

      else if (key === `theme`)
        themeStore.theme = value
      else if (key === `fontFamily`)
        themeStore.fontFamily = value
      else if (key === `fontSize`)
        themeStore.fontSize = value
      else if (key === `primaryColor`)
        themeStore.primaryColor = value
      else if (key === `codeBlockTheme`)
        themeStore.codeBlockTheme = value
      else if (key === `legend`)
        themeStore.legend = value
      else if (key === `isMacCodeBlock`)
        themeStore.isMacCodeBlock = value
      else if (key === `isShowLineNumber`)
        themeStore.isShowLineNumber = value
      else if (key === `isCiteStatus`)
        themeStore.isCiteStatus = value
      else if (key === `isCountStatus`)
        themeStore.isCountStatus = value
      else if (key === `isUseIndent`)
        themeStore.isUseIndent = value
      else if (key === `isUseJustify`)
        themeStore.isUseJustify = value

      else if (key === `currentPostId`)
        postStore.currentPostId = value
      else if (key === `currentPostIndex`)
        postStore.currentPostIndex = value
      else if (key === `posts`)
        postStore.replacePosts(value)

      else if (key === `cssContentConfig`)
        cssEditorStore.cssContentConfig = value

      else if (key === `titleList`)
        renderStore.titleList = value
      else if (key === `readingTime`)
        renderStore.readingTime = value

      else if (key === `isShowCssEditor`)
        uiStore.isShowCssEditor = value
      else if (key === `isShowInsertFormDialog`)
        uiStore.isShowInsertFormDialog = value
      else if (key === `isShowUploadImgDialog`)
        uiStore.isShowUploadImgDialog = value
      else if (key === `aiDialogVisible`)
        uiStore.aiDialogVisible = value
      else if (key === `aiImageDialogVisible`)
        uiStore.aiImageDialogVisible = value
    }
  })

  toast.success(t('editorState.applySuccess'))
  dialogOpen.value = false
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('editorState.title')"
    :description="t('editorState.description')"
    :icon="UploadCloud"
    size="4xl"
  >
    <div class="px-4 py-4 sm:px-6">
      <Tabs v-model="activeName" class="w-full">
        <TabsList class="grid h-auto w-full grid-cols-2">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" class="mt-4 space-y-4">
          <div class="grid gap-4 lg:grid-cols-2">
            <div class="flex min-h-[12rem] flex-col overflow-hidden rounded-lg border border-border lg:min-h-[24rem] lg:max-h-[24rem]">
              <p class="shrink-0 border-b border-border bg-muted/50 p-2 text-sm font-medium text-muted-foreground">
                {{ t('editorState.selectExport') }}
              </p>
              <ul v-if="storeStates.data" class="min-h-0 flex-1 space-y-2 overflow-auto px-3 py-2 text-left">
                <li v-for="(_, key) in storeStates.data" :key="key" class="flex items-center space-x-2">
                  <Checkbox
                    :id="`export-${key}`"
                    v-model="storeStates.selected[key]"
                  />
                  <label :for="`export-${key}`" class="text-sm text-foreground">
                    {{ storeStateLabel(key) }}
                  </label>
                </li>
              </ul>
              <div v-else class="flex flex-1 items-center justify-center p-4">
                <p class="text-sm text-muted-foreground">
                  {{ t('common.loading') }}
                </p>
              </div>
            </div>

            <div class="flex min-h-[12rem] flex-col overflow-hidden rounded-lg border border-border lg:min-h-[24rem] lg:max-h-[24rem]">
              <p class="relative shrink-0 border-b border-border bg-muted/50 p-2 text-sm font-medium text-muted-foreground">
                <span>{{ t('editorState.jsonPreview') }}</span>
                <Expand
                  class="absolute right-2 top-2 cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted"
                  @click="isMaximized = true"
                />
              </p>
              <div class="min-h-0 flex-1 overflow-auto p-2">
                <pre class="text-left text-xs text-muted-foreground sm:text-sm">{{ JSON.stringify(filteredExportJSON, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <Button
              class="h-10 w-full sm:w-auto"
              :disabled="Object.values(storeStates.selected).every(v => !v)"
              @click="exportSelectedConfig"
            >
              {{ t('editorState.exportSelected') }}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="import" class="mt-4 space-y-4">
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleFileImport"
          >

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="flex min-h-[12rem] flex-col overflow-hidden rounded-lg border border-border lg:min-h-[24rem] lg:max-h-[24rem]">
              <p class="relative shrink-0 border-b border-border bg-muted/50 p-2 text-sm font-medium text-muted-foreground">
                <span>{{ t('editorState.importJson') }}</span>
                <Expand
                  v-if="originalImportData"
                  class="absolute right-2 top-2 cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted"
                  @click="isMaximized = true"
                />
              </p>
              <div class="min-h-0 flex-1 p-2">
                <div
                  v-if="!originalImportData"
                  class="flex h-full min-h-[10rem] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border"
                >
                  <button
                    type="button"
                    class="flex h-full w-full flex-col cursor-pointer items-center justify-center rounded-lg hover:bg-muted"
                    @click="triggerFileInput"
                  >
                    <UploadCloud class="mb-2 size-12 text-muted-foreground sm:size-16" />
                    <span class="text-sm text-muted-foreground">
                      {{ t('editorState.selectJsonFile') }}
                    </span>
                    <span class="mt-1 text-xs text-muted-foreground/60">
                      {{ t('editorState.jsonFormatHint') }}
                    </span>
                  </button>
                </div>
                <div v-else class="h-full overflow-auto">
                  <pre class="text-left text-xs text-muted-foreground sm:text-sm">{{ JSON.stringify(filteredImportJSON, null, 2) }}</pre>
                </div>
              </div>
            </div>

            <div class="flex min-h-[12rem] flex-col overflow-hidden rounded-lg border border-border lg:min-h-[24rem] lg:max-h-[24rem]">
              <p class="shrink-0 border-b border-border bg-muted/50 p-2 text-sm font-medium text-muted-foreground">
                {{ t('editorState.selectImportItems') }}
              </p>
              <div class="min-h-0 flex-1 overflow-auto">
                <ul v-if="originalImportData" class="space-y-2 px-3 py-2 text-left">
                  <li v-for="(_, key) in importStates.data" :key="key" class="flex items-center space-x-2">
                    <Checkbox
                      :id="`import-${key}`"
                      v-model="importStates.selected[key]"
                    />
                    <label :for="`import-${key}`" class="text-sm text-foreground">
                      {{ storeStateLabel(key) }}
                    </label>
                  </li>
                </ul>
                <div v-else class="flex h-full min-h-[10rem] items-center justify-center p-4 text-sm text-muted-foreground">
                  {{ t('editorState.importFirst') }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              class="h-10 w-full sm:w-auto"
              @click="triggerFileInput"
            >
              {{ t('editorState.reimport') }}
            </Button>
            <Button
              class="h-10 w-full sm:w-auto"
              :disabled="Object.values(importStates.selected).every(v => !v)"
              @click="applyImportedConfig"
            >
              {{ t('editorState.applySelected') }}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </PanelDialog>

  <PanelDialog
    v-model:open="isMaximized"
    :title="t('editorState.fullscreenPreview')"
    :description="t('editorState.fullscreenDescription')"
    size="4xl"
  >
    <div class="px-4 py-4 sm:px-6">
      <div class="relative max-h-[min(60vh,28rem)] overflow-auto rounded-lg border border-border bg-muted p-4">
        <Button
          v-if="isCopied"
          variant="ghost"
          size="icon"
          class="absolute right-2 top-2 size-8 cursor-default"
          disabled
          :aria-label="t('common.copied')"
        >
          <Check class="size-4 text-green-500" />
        </Button>
        <Button
          v-else
          variant="ghost"
          size="icon"
          class="absolute right-2 top-2 size-8 text-muted-foreground hover:text-foreground"
          :aria-label="t('editorState.copyJson')"
          @click="copyToClipboard(JSON.stringify(currentMaximizedJSON, null, 2))"
        >
          <Copy class="size-4" />
        </Button>
        <pre class="break-all text-left text-xs text-muted-foreground sm:text-sm">{{ JSON.stringify(currentMaximizedJSON, null, 2) }}</pre>
      </div>
    </div>
  </PanelDialog>
</template>
