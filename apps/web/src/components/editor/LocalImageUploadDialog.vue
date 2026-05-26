<script setup lang="ts">
import { Check, FileImage, Loader2, Upload, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { progress as Progress } from '@/components/ui/progress'
import { useImageUploader } from '@/composables/useImageUploader'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const { upload } = useImageUploader()

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
const isUploadingBatch = ref(false)

// 用户选择的文件列表（按选择顺序，与勾选的路径一一对应）
const selectedFiles = ref<File[]>([])

watch(() => uiStore.localImageUploadData, (data) => {
  if (data) {
    selectedPaths.value = new Set(data.detectedPaths)
    progressValue.value = 0
    uploadResults.value = {}
    uploadErrors.value = {}
    isUploadingBatch.value = false
    selectedFiles.value = []
  }
}, { immediate: true })

/**
 * 根据文件名自动匹配路径
 * 将匹配到的文件自动关联到对应的路径上
 */
function autoMatchFiles() {
  if (!uiStore.localImageUploadData || selectedFiles.value.length === 0)
    return

  const fileArray = selectedFiles.value
  const paths = uiStore.localImageUploadData.detectedPaths
  const pathIndexMap = new Map<string, number>()

  // 第一轮：精确匹配（文件名相同）
  const usedFileIndices = new Set<number>()
  for (const path of paths) {
    if (pathIndexMap.has(path))
      continue
    const pathFileName = path.split(/[/\\]/).pop()!.toLowerCase()
    for (let fi = 0; fi < fileArray.length; fi++) {
      if (usedFileIndices.has(fi))
        continue
      if (fileArray[fi]!.name.toLowerCase() === pathFileName) {
        pathIndexMap.set(path, fi)
        usedFileIndices.add(fi)
        break
      }
    }
  }

  // 第二轮：模糊匹配（文件名包含或去掉扩展名匹配）
  for (const path of paths) {
    if (pathIndexMap.has(path))
      continue
    const pathFileName = path.split(/[/\\]/).pop()!.toLowerCase().replace(/\.[^.]+$/, '')
    for (let fi = 0; fi < fileArray.length; fi++) {
      if (usedFileIndices.has(fi))
        continue
      const fileBase = fileArray[fi]!.name.toLowerCase().replace(/\.[^.]+$/, '')
      if (pathFileName === fileBase) {
        pathIndexMap.set(path, fi)
        usedFileIndices.add(fi)
        break
      }
    }
  }

  // 将匹配到的路径自动选中
  for (const path of pathIndexMap.keys()) {
    selectedPaths.value.add(path)
  }

  // 重置 input
  const input = document.getElementById('local-image-file-input') as HTMLInputElement
  if (input)
    input.value = ''
}

// 选择文件
function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0)
    return

  // 追加新选择的文件
  const existing = Array.from(selectedFiles.value)
  selectedFiles.value = [...existing, ...Array.from(files)]

  // 自动匹配
  autoMatchFiles()
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

  isUploadingBatch.value = true
  progressValue.value = 0
  uploadResults.value = {}
  uploadErrors.value = {}

  for (let i = 0; i < pathsToUpload.length; i++) {
    const path = pathsToUpload[i]!
    try {
      let url: string
      const matchedFile = findMatchedFile(path)
      if (matchedFile) {
        // 有匹配的文件，直接上传
        url = await upload(matchedFile)
      }
      else {
        // 没有匹配的文件，但用户勾选了，说明用户想自己上传
        toast.error(`路径 "${path}" 未找到对应文件`)
        uploadErrors.value[path] = '未选择对应文件'
        progressValue.value = Math.round(((i + 1) / total) * 100)
        continue
      }
      uploadResults.value[path] = url
    }
    catch (err: unknown) {
      uploadErrors.value[path] = (err as Error).message || '上传失败'
    }
    progressValue.value = Math.round(((i + 1) / total) * 100)
  }

  isUploadingBatch.value = false
}

function findMatchedFile(path: string): File | undefined {
  const pathFileName = path.split(/[/\\]/).pop()!.toLowerCase()
  const fileArray = selectedFiles.value
  // 精确匹配
  for (const file of fileArray) {
    if (file.name.toLowerCase() === pathFileName)
      return file
  }
  // 模糊匹配（去扩展名）
  const pathBase = pathFileName.replace(/\.[^.]+$/, '')
  for (const file of fileArray) {
    const fileBase = file.name.toLowerCase().replace(/\.[^.]+$/, '')
    if (fileBase === pathBase)
      return file
  }
  return undefined
}

// 关闭并应用
function handleApply() {
  if (!uiStore.localImageUploadData)
    return

  // 替换 Markdown 中的路径
  let content = uiStore.localImageUploadData.markdownContent
  for (const [path, url] of Object.entries(uploadResults.value)) {
    // 替换 ](path) 和 ](./path) 两种形式
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    content = content
      .replace(new RegExp(`\\]\\(${escaped}\\)`, 'g'), `](${url})`)
      .replace(new RegExp(`\\]\\(\\.\\/${escaped}\\)`, 'g'), `](${url})`)
  }

  // 触发后续处理（设置内容等）
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
          文档中包含本地图片路径，请选择对应文件并上传到图床。
        </DialogDescription>
      </DialogHeader>

      <div v-if="uiStore.localImageUploadData" class="space-y-4">
        <!-- 图片路径列表 -->
        <div class="rounded-md border">
          <div class="flex items-center justify-between border-b px-4 py-2">
            <span class="text-sm font-medium">
              检测到 {{ uiStore.localImageUploadData.detectedPaths.length }} 张本地图片
            </span>
            <span class="text-xs text-muted-foreground">
              已选择 {{ selectedFiles.length }} 个文件
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
        <Progress v-if="isUploadingBatch || progressValue > 0" :model-value="progressValue" class="h-1.5" />

        <!-- 选择文件按钮 -->
        <div class="flex items-center gap-2">
          <label class="flex-1">
            <input
              id="local-image-file-input"
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            >
            <Button variant="outline" class="w-full" as="span">
              <Upload class="mr-2 h-4 w-4" />
              选择图片文件{{ selectedFiles.length > 0 ? `（已选 ${selectedFiles.length} 个）` : '' }}
            </Button>
          </label>
        </div>

        <!-- 已选文件列表 -->
        <div v-if="selectedFiles.length > 0" class="text-xs text-muted-foreground space-y-1">
          <div v-for="(file, i) in selectedFiles" :key="i" class="flex items-center gap-1">
            <span>{{ file.name }}</span>
            <span class="text-muted-foreground/50">({{ (file.size / 1024).toFixed(1) }} KB)</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="handleSkip">
            跳过，按原样导入
          </Button>
          <Button
            :disabled="isUploadingBatch || selectedPaths.size === 0"
            @click="handleUpload"
          >
            <Loader2 v-if="isUploadingBatch" class="mr-2 h-4 w-4 animate-spin" />
            {{ isUploadingBatch ? '上传中...' : '上传选中的图片' }}
          </Button>
          <Button
            v-if="Object.keys(uploadResults).length > 0"
            @click="handleApply"
          >
            应用并导入
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
