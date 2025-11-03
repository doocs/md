<script setup lang="ts">
import { storeLabels } from '@md/shared/configs'
import { Expand, UploadCloud } from 'lucide-vue-next'
import { useCssEditorStore } from '@/stores/cssEditor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { downloadFile } from '@/utils'
import { copyPlain } from '@/utils/clipboard'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits([`close`])
const themeStore = useThemeStore()
const uiStore = useUIStore()
const postStore = usePostStore()
const cssEditorStore = useCssEditorStore()
const renderStore = useRenderStore()

watch(
  () => props.visible,
  (val) => {
    if (val)
      fetchStoreStates()
  },
)

function onUpdate(val: boolean) {
  if (!val) {
    emit(`close`)
  }
}

const activeName = ref(`import`)
const tabs = ref([
  {
    value: `import`,
    label: `导入配置`,
  },
  {
    value: `export`,
    label: `导出配置`,
  },
])

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
    isShowInsertMpCardDialog: uiStore.isShowInsertMpCardDialog,
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

  downloadFile(JSON.stringify(selectedConfig, null, 2), `exported_config.json`, `application/json`)
  toast.success(`配置文件导出成功`)
  emit(`close`)
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

function copyToClipboard(text: string) {
  copyPlain(text)
  toast.success(`复制成功`)
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
        postStore.posts = value

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
      else if (key === `isShowInsertMpCardDialog`)
        uiStore.isShowInsertMpCardDialog = value
      else if (key === `aiDialogVisible`)
        uiStore.aiDialogVisible = value
      else if (key === `aiImageDialogVisible`)
        uiStore.aiImageDialogVisible = value
    }
  })

  toast.success(`配置应用成功，请刷新页面查看效果`)
  emit(`close`)
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent class="md:max-w-2/3">
      <DialogHeader>
        <DialogTitle>导入/导出项目配置</DialogTitle>
        <DialogDescription>
          导入的配置将覆盖当前项目的配置，请谨慎操作。
        </DialogDescription>
      </DialogHeader>
      <Tabs v-model="activeName" class="w-full">
        <TabsList>
          <TabsTrigger value="import">
            导入配置
          </TabsTrigger>
          <TabsTrigger v-for="item in tabs.filter(tab => tab.value !== 'import')" :key="item.value" :value="item.value">
            {{ item.label }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <div class="grid grid-cols-1 lg:grid-cols-2 my-5 h-[60vh] lg:h-96 gap-4 text-center">
            <div class="flex flex-col overflow-hidden">
              <p class="bg-white p-2 dark:bg-gray-900">
                请选择需要导出的配置
              </p>
              <ul v-if="storeStates.data" class="space-y-2 overflow-auto">
                <li v-for="(_, key) in storeStates.data" :key="key" class="space-x-2 flex items-center">
                  <input
                    :id="`export-${key}`"
                    v-model="storeStates.selected[key]"
                    type="checkbox"
                    class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                  >
                  <label :for="`export-${key}`" class="text-sm text-gray-700 dark:text-gray-300">
                    {{ storeLabels[key] || key }}
                  </label>
                </li>
              </ul>
              <div v-else>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  加载中...
                </p>
              </div>
            </div>
            <div class="flex flex-col overflow-hidden">
              <p class="relative bg-white p-2 dark:bg-gray-900">
                <span>当前 JSON 预览</span>
                <Expand class="absolute right-2 top-2 cursor-pointer p-1 text-gray-500 dark:text-gray-400" @click="isMaximized = true" />
              </p>
              <div class="w-full overflow-auto border rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                <pre class="text-left text-sm text-gray-500 dark:text-gray-400">{{ JSON.stringify(filteredExportJSON, null, 2) }}</pre>
              </div>
            </div>
            <div class="col-span-1 lg:col-span-2 flex justify-end">
              <Button
                type="primary"
                :disabled="Object.values(storeStates.selected).every(v => !v)"
                @click="exportSelectedConfig"
              >
                导出选中配置
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="import">
          <div class="grid grid-cols-1 lg:grid-cols-2 my-5 h-[60vh] lg:h-96 gap-4 text-center">
            <div class="overflow-auto h-full flex flex-col">
              <p class="sticky top-0 z-10 bg-white p-2 dark:bg-gray-900">
                <span>导入 JSON 配置文件</span>
                <Expand class="absolute right-2 top-2 cursor-pointer p-1 text-gray-500 dark:text-gray-400" @click="isMaximized = true" />
              </p>
              <div v-if="!originalImportData" class="m-4 flex-1 flex flex-col items-center justify-center border-2 rounded-lg border-dashed">
                <input
                  id="json-import-input"
                  ref="fileInputRef"
                  type="file"
                  accept=".json"
                  class="hidden"
                  @change="handleFileImport"
                >
                <label
                  for="json-import-input"
                  class="flex-1 w-full flex flex-col cursor-pointer items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <UploadCloud class="mb-2 size-16 text-gray-500 dark:text-gray-400" />
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    点击或拖拽 JSON 文件到此处
                  </span>
                  <span class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    支持格式: .json
                  </span>
                </label>
              </div>
              <div v-else class="mt-4 border rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                <pre class="text-left text-sm text-gray-500 dark:text-gray-400">{{ JSON.stringify(filteredImportJSON, null, 2) }}</pre>
              </div>
            </div>

            <div class="overflow-auto h-full flex flex-col">
              <p class="sticky top-0 z-10 bg-white p-2 dark:bg-gray-900">
                选择要导入的配置项
              </p>
              <div v-if="originalImportData">
                <ul class="space-y-2">
                  <li v-for="(_, key) in importStates.data" :key="key" class="space-x-2 flex items-center">
                    <input
                      :id="`import-${key}`"
                      v-model="importStates.selected[key]"
                      type="checkbox"
                      class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                    >
                    <label :for="`import-${key}`" class="text-sm text-gray-700 dark:text-gray-300">
                      {{ storeLabels[key] || key }}
                    </label>
                  </li>
                </ul>
              </div>
              <div v-else class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                请先导入JSON文件
              </div>
            </div>
            <div class="flex-1 col-span-1 lg:col-span-2 flex justify-end">
              <input
                id="json-import-input"
                ref="fileInputRef"
                type="file"
                accept=".json"
                class="hidden"
                @change="handleFileImport"
              >
              <Button
                variant="ghost"
                class="mr-2"
                @click="triggerFileInput"
              >
                重新导入
              </Button>

              <Button
                :disabled="Object.values(importStates.selected).every(v => !v)"
                @click="applyImportedConfig"
              >
                应用选中配置
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>

  <!-- 最大化弹窗 -->
  <Dialog :open="isMaximized" @update:open="(val) => isMaximized = val">
    <DialogContent class="max-h-[90vh] max-w-[90vw] overflow-auto">
      <DialogHeader>
        <DialogTitle>JSON 全屏预览</DialogTitle>
        <DialogDescription>
          当前配置的完整 JSON 数据
        </DialogDescription>
      </DialogHeader>
      <div class="max-h-[70vh] overflow-hidden">
        <div class="h-full overflow-auto border rounded-md bg-gray-50 p-4 dark:bg-gray-800">
          <pre class="break-all text-left text-sm text-gray-500 dark:text-gray-400">{{ JSON.stringify(currentMaximizedJSON, null, 2) }}</pre>
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          @click="copyToClipboard(JSON.stringify(currentMaximizedJSON, null, 2))"
        >
          复制 JSON 到剪贴板
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
