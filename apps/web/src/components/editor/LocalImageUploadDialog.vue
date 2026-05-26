<script setup lang="ts">
import { Check, FileImage, FolderOpen, Loader2, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { progress as Progress } from '@/components/ui/progress'
import { useImageUploader } from '@/composables/useImageUploader'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const { upload } = useImageUploader()

// 批次上传状态（覆盖整个上传循环）
const isUploading = ref(false)

const isDialogOpen = computed({
  get: () => uiStore.isShowLocalImageUpload,
  set: (val) => {
    uiStore.isShowLocalImageUpload = val
  },
})

// 用户勾选要上传的路径
const selectedPaths = ref<Set<string>>(new Set())

// 上传进度
const progressValue = ref(0)
const uploadResults = ref<Record<string, string>>({})
const uploadErrors = ref<Record<string, string>>({})

// 用户选择的文件夹中的文件列表
const folderFiles = ref<File[]>([])

// 匹配状态
const matchedCount = computed(() => {
  let count = 0
  for (const path of selectedPaths.value) {
    if (findMatchedFile(path))
      count++
  }
  return count
})

// 是否全部上传成功（选中的图片都有结果且无报错）
const isAllUploaded = computed(() => {
  const paths = Array.from(selectedPaths.value)
  return paths.length > 0 && paths.every(p => uploadResults.value[p] && !uploadErrors.value[p])
})

watch(() => uiStore.localImageUploadData, (data) => {
  if (data) {
    selectedPaths.value = new Set(data.detectedPaths)
    progressValue.value = 0
    uploadResults.value = {}
    uploadErrors.value = {}
    folderFiles.value = []
  }
}, { immediate: true })

// 选择包含图片的文件夹
function handleFolderSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0)
    return

  folderFiles.value = Array.from(files)

  // 自动选中已匹配的路径
  for (const path of selectedPaths.value) {
    if (!findMatchedFile(path)) {
      selectedPaths.value.delete(path)
    }
  }
  for (const path of uiStore.localImageUploadData?.detectedPaths || []) {
    if (findMatchedFile(path)) {
      selectedPaths.value.add(path)
    }
  }

  // 重置 input
  ;(event.target as HTMLInputElement).value = ''
}

/**
 * 根据路径从文件夹文件中查找匹配的文件
 */
function findMatchedFile(path: string): File | undefined {
  const pathFileName = path.split(/[/\\]/).pop()!.toLowerCase()
  const fileArray = folderFiles.value

  // 第一轮：精确匹配文件名
  for (const file of fileArray) {
    if (file.name.toLowerCase() === pathFileName)
      return file
  }
  // 第二轮：去扩展名匹配
  const pathBase = pathFileName.replace(/\.[^.]+$/, '')
  for (const file of fileArray) {
    const fileBase = file.name.toLowerCase().replace(/\.[^.]+$/, '')
    if (fileBase === pathBase)
      return file
  }
  return undefined
}

// 开始上传
async function handleUpload() {
  if (!uiStore.localImageUploadData)
    return

  const pathsToUpload = Array.from(selectedPaths.value)
  const total = pathsToUpload.length
  if (total === 0) {
    toast.warning('请至少勾选一项')
    return
  }

  // 检查未匹配的
  const unmatched = pathsToUpload.filter(p => !findMatchedFile(p))
  if (unmatched.length > 0) {
    toast.error(`以下图片未在文件夹中找到：${unmatched.join(', ')}`)
    return
  }

  progressValue.value = 0
  uploadResults.value = {}
  uploadErrors.value = {}
  isUploading.value = true

  // 文件 → URL 缓存，避免同文件重复上传
  const fileUrlMap = new WeakMap<File, string>()

  for (let i = 0; i < pathsToUpload.length; i++) {
    const path = pathsToUpload[i]!
    try {
      const file = findMatchedFile(path)!
      let url = fileUrlMap.get(file)
      if (!url) {
        url = await upload(file)
        fileUrlMap.set(file, url)
      }
      uploadResults.value[path] = url
    }
    catch (err: unknown) {
      uploadErrors.value[path] = (err as Error).message || '上传失败'
    }
    progressValue.value = Math.round(((i + 1) / total) * 100)
  }
  isUploading.value = false
}

// 关闭并应用
function handleApply() {
  if (!uiStore.localImageUploadData)
    return

  // 仅替换图片语法 `![alt](path)`，避免误改普通链接
  let content = uiStore.localImageUploadData.markdownContent
  for (const [path, url] of Object.entries(uploadResults.value)) {
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    content = content
      .replace(new RegExp(`!\\]\\(${escaped}\\)`, 'g'), `!](${url})`)
      .replace(new RegExp(`!\\]\\(\\.\\/${escaped}\\)`, 'g'), `!](${url})`)
  }

  uiStore.localImageUploadData = {
    markdownContent: content,
    detectedPaths: [],
    processed: true,
  }
  isDialogOpen.value = false
}

// 关闭并跳过上传
function handleSkip() {
  if (uiStore.localImageUploadData) {
    uiStore.localImageUploadData = {
      ...uiStore.localImageUploadData,
      processed: true,
      skipUpload: true,
    }
  }
  isDialogOpen.value = false
}

function onOpenChange(val: boolean) {
  if (!val) {
    isDialogOpen.value = false
    uiStore.localImageUploadData = null
  }
}
</script>

<template>
  <Dialog :open="isDialogOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>检测到本地图片</DialogTitle>
        <DialogDescription>
          文档中包含本地图片路径，请选择包含这些图片的文件夹，系统将自动匹配并上传。
        </DialogDescription>
      </DialogHeader>

      <div v-if="uiStore.localImageUploadData" class="space-y-4">
        <!-- 图片路径列表 -->
        <div class="rounded-md border">
          <div class="flex items-center justify-between border-b px-4 py-2">
            <span class="text-sm font-medium">
              检测到 {{ uiStore.localImageUploadData.detectedPaths.length }} 张本地图片
            </span>
            <span v-if="folderFiles.length > 0" class="text-xs text-muted-foreground">
              已匹配 {{ matchedCount }} / {{ selectedPaths.size }}
            </span>
          </div>
          <div class="max-h-48 overflow-auto p-2">
            <div
              v-for="path in uiStore.localImageUploadData.detectedPaths"
              :key="path"
              class="flex items-center gap-2 rounded px-2 py-1.5 text-xs"
              :class="{
                'bg-primary/5': selectedPaths.has(path),
                'text-muted-foreground': !selectedPaths.has(path),
              }"
            >
              <input
                type="checkbox"
                :checked="selectedPaths.has(path)"
                :aria-label="path"
                class="h-3.5 w-3.5 shrink-0 accent-primary"
                @change="selectedPaths.has(path) ? selectedPaths.delete(path) : selectedPaths.add(path)"
              >
              <FileImage class="h-3.5 w-3.5 shrink-0" />
              <span class="truncate" :title="path">{{ path }}</span>
              <span v-if="uploadResults[path]" class="ml-auto shrink-0 text-green-600">
                <Check class="h-3.5 w-3.5" />
              </span>
              <span v-else-if="uploadErrors[path]" class="ml-auto shrink-0 text-destructive" :title="uploadErrors[path]">
                <X class="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>

        <!-- 进度条 -->
        <Progress v-if="isUploading || progressValue > 0" :model-value="progressValue" class="h-1.5" />

        <!-- 选择文件夹按钮 -->
        <label v-if="!isAllUploaded" class="block">
          <input
            type="file"
            webkitdirectory
            multiple
            accept="image/*"
            class="hidden"
            @change="handleFolderSelect"
          >
          <Button variant="outline" class="w-full" as="span">
            <FolderOpen class="mr-2 h-4 w-4" />
            {{ folderFiles.length > 0 ? `已选择文件夹 (${folderFiles.length} 个文件)` : '选择包含图片的文件夹' }}
          </Button>
        </label>

        <!-- 底部操作区 -->
        <div v-if="isAllUploaded" class="flex justify-end pt-2">
          <Button @click="handleApply">
            完成
          </Button>
        </div>
        <div v-else class="flex items-center justify-between gap-2 pt-2">
          <Button variant="link" class="px-2 text-muted-foreground" @click="handleSkip">
            跳过
          </Button>
          <div class="flex gap-2">
            <Button
              v-if="Object.keys(uploadResults).length > 0"
              @click="handleApply"
            >
              完成
            </Button>
            <Button
              :disabled="isUploading || selectedPaths.size === 0 || matchedCount === 0"
              @click="handleUpload"
            >
              <Loader2 v-if="isUploading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isUploading ? '上传中...' : '上传图片' }}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
