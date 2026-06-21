<script setup lang="ts">
import { FileText, Globe, Loader2, Upload } from '@lucide/vue'
import { usePostStore } from '@/stores/post'
import { useUIStore } from '@/stores/ui'

const { t } = useI18n()
const postStore = usePostStore()
const uiStore = useUIStore()

const { isShowImportMdDialog } = storeToRefs(uiStore)

// 当前选中的 tab
const activeTab = ref<'url' | 'file'>(`file`)

// ==================== 检测本地图片路径 ====================
/**
 * 从 Markdown 内容中检测本地图片路径
 * 排除 http/https URL、data URI 和空路径
 */
function detectLocalImagePaths(content: string): string[] {
  const regex = /!\[[^\]]*\]\((?!https?:\/\/|data:)([^)]+)\)/g
  const paths = new Set<string>()
  let match = regex.exec(content)
  while (match != null) {
    const path = match[1]!.trim()
    if (path) {
      paths.add(path)
    }
    match = regex.exec(content)
  }
  return Array.from(paths)
}

/**
 * 导入内容，如果包含本地图片则弹出上传对话框
 */
async function importContent(title: string, content: string) {
  const localPaths = detectLocalImagePaths(content)
  if (localPaths.length === 0) {
    // 没有本地图片，直接导入
    postStore.addPost(title)
    postStore.updatePostContent(postStore.currentPostId, content)
    closeDialog()
    return
  }

  // 有本地图片，弹出上传对话框
  uiStore.localImageUploadData = {
    markdownContent: content,
    detectedPaths: localPaths,
  }
  uiStore.isShowLocalImageUpload = true

  // 等待上传对话框处理完成
  await new Promise<void>((resolve) => {
    const unwatch = watch(
      () => uiStore.localImageUploadData,
      (data) => {
        if (data && data.processed) {
          unwatch()
          if (data.skipUpload) {
            // 用户选择跳过，按原样导入
            postStore.addPost(title)
            postStore.updatePostContent(postStore.currentPostId, content)
          }
          else {
            // 用户已上传并应用，使用替换后的内容
            postStore.addPost(title)
            postStore.updatePostContent(postStore.currentPostId, data!.markdownContent)
          }
          closeDialog()
          resolve()
        }
      },
    )
  })

  // 清理
  uiStore.localImageUploadData = null
}

// ==================== 网络链接导入 ====================
const url = ref(``)
const isUrlLoading = ref(false)
const urlError = ref(``)
let abortController: AbortController | null = null

const ANYTHING_MD_API = `https://anything-md.doocs.org/`

/** 判断链接是否直接指向 Markdown 文件 */
function isMarkdownUrl(rawUrl: string): boolean {
  try {
    const { pathname } = new URL(rawUrl)
    return /\.(?:md|markdown|txt)$/i.test(pathname)
  }
  catch {
    return false
  }
}

/** 直接获取 Markdown 文件内容 */
async function fetchMarkdownFile(rawUrl: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(rawUrl, { signal })
  if (!response.ok) {
    throw new Error(t('importMd.requestFailed', { status: response.status, statusText: response.statusText }))
  }
  const content = await response.text()
  if (!content.trim()) {
    throw new Error(t('importMd.contentEmpty'))
  }
  return content
}

/** 通过 Anything-MD 将网页转换为 Markdown */
async function fetchViaAnythingMd(rawUrl: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(ANYTHING_MD_API, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({ url: rawUrl }),
    signal,
  })

  if (!response.ok) {
    throw new Error(t('importMd.requestFailed', { status: response.status, statusText: response.statusText }))
  }

  const data = await response.json()
  if (signal.aborted)
    throw new DOMException(``, `AbortError`)

  if (!data.success) {
    throw new Error(data.error || t('importMd.convertFailed'))
  }

  const markdown = data.markdown?.trim()
  if (!markdown) {
    throw new Error(t('importMd.convertResultEmpty'))
  }
  return markdown
}

async function importFromUrl() {
  const rawUrl = url.value.trim()
  if (!rawUrl) {
    urlError.value = t('importMd.urlRequired')
    return
  }

  if (!URL.canParse(rawUrl) || !/^https?:\/\//i.test(rawUrl)) {
    urlError.value = t('importMd.urlInvalid')
    return
  }

  urlError.value = ``
  isUrlLoading.value = true
  abortController?.abort()
  abortController = new AbortController()
  const { signal } = abortController

  try {
    const content = isMarkdownUrl(rawUrl)
      ? await fetchMarkdownFile(rawUrl, signal)
      : await fetchViaAnythingMd(rawUrl, signal)

    // 从 URL 中提取标题
    const urlTitle = (() => {
      try {
        const { pathname } = new URL(rawUrl)
        const name = pathname.split(`/`).filter(Boolean).pop() || `untitled`
        return name.replace(/\.(md|markdown|txt)$/i, ``)
      }
      catch {
        return `untitled`
      }
    })()
    await importContent(urlTitle, content)
  }
  catch (err) {
    if ((err as Error).name === `AbortError`)
      return
    urlError.value = (err as Error).message || t('importMd.importFailed')
  }
  finally {
    isUrlLoading.value = false
  }
}

// ==================== 本地文件导入 ====================
const isDragover = ref(false)
const { open: openFileDialog, reset: resetFileDialog, onChange: onFileChange } = useFileDialog({
  accept: `.md,.markdown,.txt`,
  multiple: true,
})

onFileChange((files) => {
  if (files == null || files.length === 0)
    return
  readAndImportFiles(Array.from(files))
})

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragover.value = false

  const files = event.dataTransfer?.files
  if (!files || files.length === 0)
    return

  const validFiles = Array.from(files).filter(file =>
    file.name.match(/\.(md|markdown|txt)$/i),
  )

  if (validFiles.length === 0) {
    toast.error(t('importMd.dropInvalid'))
    return
  }

  readAndImportFiles(validFiles)
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsText(file, `UTF-8`)
    reader.onload = (event) => {
      resolve((event.target?.result as string) || ``)
    }
    reader.onerror = () => resolve(``)
  })
}

async function readAndImportFiles(files: File[]) {
  const results = await Promise.all(
    files.map(async (file) => {
      const content = await readFileAsText(file)
      return { file, content }
    }),
  )
  const validResults = results.filter(r => r.content.trim())
  if (validResults.length === 0)
    return
  for (const { file, content } of validResults) {
    const title = file.name.replace(/\.(md|markdown|txt)$/i, ``)
    await importContent(title, content)
  }
  if (validResults.length > 0) {
    toast.success(validResults.length === 1 ? t('importMd.importedOne') : t('importMd.importedBatch', { count: validResults.length }))
  }
}

// ==================== 对话框控制 ====================
function closeDialog() {
  abortController?.abort()
  abortController = null
  isShowImportMdDialog.value = false
  url.value = ``
  urlError.value = ``
  isUrlLoading.value = false
  isDragover.value = false
  resetFileDialog()
}

function onOpenChange(val: boolean) {
  if (!val) {
    closeDialog()
  }
}

// URL 参数 open 传入的链接：打开对话框时自动填入并执行导入
watch(isShowImportMdDialog, (visible) => {
  if (!visible || !uiStore.importMdOpenUrl)
    return
  const urlToImport = uiStore.importMdOpenUrl
  uiStore.importMdOpenUrl = null
  url.value = urlToImport
  activeTab.value = `url`
  urlError.value = ``
  nextTick(() => importFromUrl())
})
</script>

<template>
  <Dialog :open="isShowImportMdDialog" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ t('importMd.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('importMd.description') }}
        </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <span class="inline-flex items-center">
              <Upload class="mr-2 size-4 shrink-0" />
              {{ t('importMd.localFile') }}
            </span>
          </TabsTrigger>
          <TabsTrigger value="url">
            <span class="inline-flex items-center">
              <Globe class="mr-2 size-4 shrink-0" />
              {{ t('importMd.networkUrl') }}
            </span>
          </TabsTrigger>
        </TabsList>

        <!-- 本地文件导入 -->
        <TabsContent value="file" class="mt-4">
          <div
            class="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
            :class="{
              'border-primary bg-primary/5': isDragover,
              'border-muted-foreground/25 hover:border-muted-foreground/50': !isDragover,
            }"
            @click="openFileDialog()"
            @dragover.prevent="isDragover = true"
            @dragleave.prevent="isDragover = false"
            @drop="handleDrop"
          >
            <FileText class="mb-3 size-10 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              {{ t('importMd.dropHint') }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground/70">
              {{ t('importMd.formatHint') }}
            </p>
          </div>
        </TabsContent>

        <!-- 网络链接导入 -->
        <TabsContent value="url" class="mt-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <Input
                v-model="url"
                :placeholder="t('importMd.urlPlaceholder')"
                :class="{ 'border-destructive': urlError }"
                @keydown.enter="importFromUrl"
                @input="urlError = ``"
              />
              <p v-if="urlError" class="text-xs text-destructive">
                {{ urlError }}
              </p>
              <p v-else class="text-xs text-muted-foreground">
                {{ t('importMd.urlHint') }}
              </p>
            </div>
            <Button
              class="w-full"
              :disabled="isUrlLoading || !url.trim()"
              @click="importFromUrl"
            >
              <Loader2 v-if="isUrlLoading" class="mr-2 size-4 animate-spin" />
              {{ isUrlLoading ? t('importMd.importing') : t('common.import') }}
            </Button>
            <p class="text-center text-xs text-muted-foreground/60">
              {{ t('importMd.poweredBy') }}
              <a
                href="https://github.com/doocs/anything-md"
                target="_blank" rel="noopener noreferrer"
                class="underline hover:text-muted-foreground"
              >Anything-MD</a>
              {{ t('importMd.conversionService') }}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
