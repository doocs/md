<script setup lang="ts">
import { Check, Copy, Expand, UploadCloud } from '@lucide/vue'
import { storeLabels } from '@md/shared/configs'
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

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})
const themeStore = useThemeStore()
const uiStore = useUIStore()
const postStore = usePostStore()
const cssEditorStore = useCssEditorStore()
const renderStore = useRenderStore()

watch(
  () => props.open,
  (val) => {
    if (val)
      fetchStoreStates()
  },
)

const activeName = ref(`import`)
const tabs = [
  { value: `import`, label: `导入配置` },
  { value: `export`, label: `导出配置` },
] as const

// 使用响应式对象存储状态和选中状态
const storeStates = ref<{
  data: Record<string, any>
  selected: Record<string, boolean>
}>({
  data: {},
  selected: {},
})

// 获取状态并初始化选中状态
function getAllStoreStates() {
  return {
    // UI store 的状态
    isDark: uiStore.isDark,
    isEditOnLeft: uiStore.isEditOnLeft,
    isOpenRightSlider: uiStore.isOpenRightSlider,
    isOpenPostSlider: uiStore.isOpenPostSlider,
    showAIToolbox: uiStore.showAIToolbox,

    // Theme store 的状态
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

    // Post store 的状态
    currentPostId: postStore.currentPostId,
    currentPostIndex: postStore.currentPostIndex,
    posts: postStore.posts,

    // CSS Editor store 的状态
    cssContentConfig: cssEditorStore.cssContentConfig,

    // Render store 的状态
    titleList: renderStore.titleList,
    readingTime: renderStore.readingTime,

    // Display store 的状态
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
        acc[key] = true // 默认全部选中
        return acc
      }, {} as Record<string, boolean>),
    }
  }
  catch {
  }
}

// 计算属性：根据选中状态过滤后的JSON
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

// 导入的配置数据
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
  toast.success(`配置文件导出成功`)
  dialogOpen.value = false
}

// 处理最大化弹窗预览代码
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
    toast.error(`复制失败，请重试`)
  }
}

// 处理文件导入
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
      // 检查导入的数据是否符合预期
      if (typeof importedData !== `object` || Array.isArray(importedData)) {
        toast.error(`导入的文件格式不正确`)
        return
      }

      // 过滤导入的数据项，只接受允许的项，与getLable函数对应
      const allowedKeys = Object.keys(storeStates.value.data).concat(Object.keys(importStates.value.data))
      const filteredData = Object.keys(importedData).reduce((acc, key) => {
        if (allowedKeys.includes(key)) {
          acc[key] = importedData[key]
        }
        return acc
      }, {} as Record<string, any>)
      // 检查导入的数据是否符合预期
      if (Object.keys(filteredData).length === 0) {
        toast.error(`导入的文件无可应用项目配置`)
        return
      }

      originalImportData.value = importedData // 保存原始导入数据
      importStates.value = {
        data: importedData,
        selected: Object.keys(importedData).reduce((acc, key) => {
          acc[key] = true // 默认全部选中
          return acc
        }, {} as Record<string, boolean>),
      }
      toast.success(`配置文件导入成功`)
    }
    catch {
      toast.error(`文件解析失败，请检查JSON格式`)
    }
  }

  reader.readAsText(file)
  input.value = `` // 重置input，允许重复选择同一文件
}

// 应用导入的配置
function applyImportedConfig() {
  if (!filteredImportJSON.value)
    return

  Object.keys(importStates.value.selected).forEach((key) => {
    if (importStates.value.selected[key] && importStates.value.data?.[key] !== undefined) {
      const value = importStates.value.data[key]

      // UI store 的状态
      if (key === `isDark`)
        uiStore.isDark = value
      else if (key === `isEditOnLeft`)
        uiStore.isEditOnLeft = value
      else if (key === `isOpenRightSlider`)
        uiStore.isOpenRightSlider = value
      else if (key === `isOpenPostSlider`)
        uiStore.isOpenPostSlider = value
      else if (key === `showAIToolbox`)
        uiStore.showAIToolbox = value

      // Theme store 的状态
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

      // Post store 的状态
      else if (key === `currentPostId`)
        postStore.currentPostId = value
      else if (key === `currentPostIndex`)
        postStore.currentPostIndex = value
      else if (key === `posts`)
        postStore.replacePosts(value)

      // CSS Editor store 的状态
      else if (key === `cssContentConfig`)
        cssEditorStore.cssContentConfig = value

      // Render store 的状态
      else if (key === `titleList`)
        renderStore.titleList = value
      else if (key === `readingTime`)
        renderStore.readingTime = value

      // Display store 的状态
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

  toast.success(`配置应用成功，请刷新页面查看效果`)
  dialogOpen.value = false
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    title="导入/导出项目配置"
    description="导入的配置将覆盖当前项目的配置，请谨慎操作。"
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
                请选择需要导出的配置
              </p>
              <ul v-if="storeStates.data" class="min-h-0 flex-1 space-y-2 overflow-auto px-3 py-2 text-left">
                <li v-for="(_, key) in storeStates.data" :key="key" class="flex items-center space-x-2">
                  <Checkbox
                    :id="`export-${key}`"
                    v-model="storeStates.selected[key]"
                  />
                  <label :for="`export-${key}`" class="text-sm text-foreground">
                    {{ storeLabels[key] || key }}
                  </label>
                </li>
              </ul>
              <div v-else class="flex flex-1 items-center justify-center p-4">
                <p class="text-sm text-muted-foreground">
                  加载中...
                </p>
              </div>
            </div>

            <div class="flex min-h-[12rem] flex-col overflow-hidden rounded-lg border border-border lg:min-h-[24rem] lg:max-h-[24rem]">
              <p class="relative shrink-0 border-b border-border bg-muted/50 p-2 text-sm font-medium text-muted-foreground">
                <span>当前 JSON 预览</span>
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
              导出选中配置
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
                <span>导入 JSON 配置文件</span>
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
                      点击选择 JSON 文件
                    </span>
                    <span class="mt-1 text-xs text-muted-foreground/60">
                      支持格式: .json
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
                选择要导入的配置项
              </p>
              <div class="min-h-0 flex-1 overflow-auto">
                <ul v-if="originalImportData" class="space-y-2 px-3 py-2 text-left">
                  <li v-for="(_, key) in importStates.data" :key="key" class="flex items-center space-x-2">
                    <Checkbox
                      :id="`import-${key}`"
                      v-model="importStates.selected[key]"
                    />
                    <label :for="`import-${key}`" class="text-sm text-foreground">
                      {{ storeLabels[key] || key }}
                    </label>
                  </li>
                </ul>
                <div v-else class="flex h-full min-h-[10rem] items-center justify-center p-4 text-sm text-muted-foreground">
                  请先导入 JSON 文件
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
              重新导入
            </Button>
            <Button
              class="h-10 w-full sm:w-auto"
              :disabled="Object.values(importStates.selected).every(v => !v)"
              @click="applyImportedConfig"
            >
              应用选中配置
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </PanelDialog>

  <PanelDialog
    v-model:open="isMaximized"
    title="JSON 全屏预览"
    description="当前配置的完整 JSON 数据"
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
          aria-label="已复制"
        >
          <Check class="size-4 text-green-500" />
        </Button>
        <Button
          v-else
          variant="ghost"
          size="icon"
          class="absolute right-2 top-2 size-8 text-muted-foreground hover:text-foreground"
          aria-label="复制 JSON"
          @click="copyToClipboard(JSON.stringify(currentMaximizedJSON, null, 2))"
        >
          <Copy class="size-4" />
        </Button>
        <pre class="break-all text-left text-xs text-muted-foreground sm:text-sm">{{ JSON.stringify(currentMaximizedJSON, null, 2) }}</pre>
      </div>
    </div>
  </PanelDialog>
</template>
