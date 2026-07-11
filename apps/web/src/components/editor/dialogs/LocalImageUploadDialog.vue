<script setup lang="ts">
import { Check, FileImage, FolderOpen, Loader2, X } from '@lucide/vue'
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

const { t } = useI18n()
const uiStore = useUIStore()
const { upload } = useImageUploader()

// Batch upload state (covers the entire upload loop)
const isUploading = ref(false)

const isDialogOpen = computed({
  get: () => uiStore.isShowLocalImageUpload,
  set: (val) => {
    uiStore.isShowLocalImageUpload = val
  },
})

const selectedPaths = ref<Set<string>>(new Set())

const progressValue = ref(0)
const uploadResults = ref<Record<string, string>>({})
const uploadErrors = ref<Record<string, string>>({})

const folderFiles = ref<File[]>([])

const matchedCount = computed(() => {
  let count = 0
  for (const path of selectedPaths.value) {
    if (findMatchedFile(path))
      count++
  }
  return count
})

const hasUploadAttempt = computed(() =>
  Object.keys(uploadResults.value).length > 0 || Object.keys(uploadErrors.value).length > 0,
)

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

function handleFolderSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0)
    return

  folderFiles.value = Array.from(files)

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

  ;(event.target as HTMLInputElement).value = ''
}

/**
 * Find a matching file in the folder for a path
 */
function findMatchedFile(path: string): File | undefined {
  const pathFileName = path.split(/[/\\]/).pop()!.toLowerCase()
  const fileArray = folderFiles.value

  // Round 1: exact filename match
  for (const file of fileArray) {
    if (file.name.toLowerCase() === pathFileName)
      return file
  }
  // Round 2: match without extension
  const pathBase = pathFileName.replace(/\.[^.]+$/, '')
  for (const file of fileArray) {
    const fileBase = file.name.toLowerCase().replace(/\.[^.]+$/, '')
    if (fileBase === pathBase)
      return file
  }
  return undefined
}

async function handleUpload() {
  if (!uiStore.localImageUploadData)
    return

  const pathsToUpload = Array.from(selectedPaths.value)
  const total = pathsToUpload.length
  if (total === 0) {
    toast.warning(t('localImage.selectAtLeastOne'))
    return
  }

  const unmatched = pathsToUpload.filter(p => !findMatchedFile(p))
  if (unmatched.length > 0) {
    toast.error(t('localImage.notFoundInFolder', { paths: unmatched.join(', ') }))
    return
  }

  progressValue.value = 0
  uploadResults.value = {}
  uploadErrors.value = {}
  isUploading.value = true

  // File-to-URL cache to avoid re-uploading the same file
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
      uploadErrors.value[path] = (err as Error).message || t('localImage.uploadFailed')
    }
    progressValue.value = Math.round(((i + 1) / total) * 100)
  }
  isUploading.value = false
}

function handleApply() {
  if (!uiStore.localImageUploadData)
    return

  // Replace only image syntax `![alt](path)` paths with uploaded URLs
  let content = uiStore.localImageUploadData.markdownContent
  for (const [path, url] of Object.entries(uploadResults.value)) {
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    content = content
      .replace(new RegExp(`(!\\[[^\\]]*\\]\\()${escaped}\\)`, 'g'), `$1${url})`)
      .replace(new RegExp(`(!\\[[^\\]]*\\]\\(\\.\\/)${escaped}\\)`, 'g'), `$1${url})`)
  }

  uiStore.localImageUploadData = {
    markdownContent: content,
    detectedPaths: [],
    processed: true,
  }
  isDialogOpen.value = false
}

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
        <DialogTitle>{{ t('localImage.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('localImage.description') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="uiStore.localImageUploadData" class="space-y-4">
        <div class="rounded-md border">
          <div class="flex items-center justify-between border-b px-4 py-2">
            <span class="text-sm font-medium">
              {{ t('localImage.detectedCount', { count: uiStore.localImageUploadData.detectedPaths.length }) }}
            </span>
            <span v-if="folderFiles.length > 0" class="text-xs text-muted-foreground">
              {{ t('localImage.matchedCount', { matched: matchedCount, total: selectedPaths.size }) }}
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

        <Progress v-if="isUploading || progressValue > 0" :model-value="progressValue" class="h-1.5" />

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
            {{ folderFiles.length > 0 ? t('localImage.folderSelected', { count: folderFiles.length }) : t('localImage.selectFolder') }}
          </Button>
        </label>

        <div v-if="isAllUploaded" class="flex justify-end pt-2">
          <Button @click="handleApply">
            {{ t('common.done') }}
          </Button>
        </div>
        <div v-else-if="hasUploadAttempt" class="flex items-center justify-between gap-2 pt-2">
          <Button variant="link" class="px-2 text-muted-foreground" @click="handleSkip">
            {{ t('common.skip') }}
          </Button>
          <div class="flex gap-2">
            <Button
              v-if="Object.keys(uploadResults).length > 0"
              @click="handleApply"
            >
              {{ t('common.done') }}
            </Button>
            <Button variant="outline" @click="handleUpload">
              {{ t('localImage.reupload') }}
            </Button>
          </div>
        </div>
        <div v-else class="flex items-center justify-between gap-2 pt-2">
          <Button variant="link" class="px-2 text-muted-foreground" @click="handleSkip">
            {{ t('common.skip') }}
          </Button>
          <div class="flex gap-2">
            <Button
              :disabled="isUploading || selectedPaths.size === 0 || matchedCount === 0"
              @click="handleUpload"
            >
              <Loader2 v-if="isUploading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isUploading ? t('common.uploading') : t('localImage.uploadImages') }}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
