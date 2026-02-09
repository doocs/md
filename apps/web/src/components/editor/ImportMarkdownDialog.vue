<script setup lang="ts">
import { FileText, Globe, Loader2, Upload } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

const editorStore = useEditorStore()
const uiStore = useUIStore()

const { isShowImportMdDialog } = storeToRefs(uiStore)

// 当前选中的 tab
const activeTab = ref<'url' | 'file'>(`file`)

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
    throw new Error(`请求失败: ${response.status} ${response.statusText}`)
  }
  const content = await response.text()
  if (!content.trim()) {
    throw new Error(`该链接返回的内容为空`)
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
    throw new Error(`请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  if (signal.aborted)
    throw new DOMException(``, `AbortError`)

  if (!data.success) {
    throw new Error(data.error || `转换失败`)
  }

  const markdown = data.markdown?.trim()
  if (!markdown) {
    throw new Error(`转换结果为空`)
  }
  return markdown
}

async function importFromUrl() {
  const rawUrl = url.value.trim()
  if (!rawUrl) {
    urlError.value = `请输入链接`
    return
  }

  if (!URL.canParse(rawUrl) || !/^https?:\/\//i.test(rawUrl)) {
    urlError.value = `请输入有效的 URL 地址（仅支持 http/https）`
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

    editorStore.importContent(content)
    closeDialog()
  }
  catch (err) {
    if ((err as Error).name === `AbortError`)
      return
    urlError.value = (err as Error).message || `导入失败，请检查链接是否有效`
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
    toast.error(`请拖入 Markdown 文件（.md / .markdown / .txt）`)
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
  const contents = await Promise.all(files.map(readFileAsText))
  const merged = contents.filter(c => c.trim()).join(`\n\n`)
  if (merged) {
    editorStore.importContent(merged)
    closeDialog()
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
        <DialogTitle>导入 Markdown</DialogTitle>
        <DialogDescription>
          从网络链接或本地文件导入内容，支持公众号文章、博客等任意网页链接
        </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <span class="inline-flex items-center">
              <Upload class="mr-2 size-4 shrink-0" />
              本地文件
            </span>
          </TabsTrigger>
          <TabsTrigger value="url">
            <span class="inline-flex items-center">
              <Globe class="mr-2 size-4 shrink-0" />
              网络链接
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
              点击选择文件或拖拽文件到此处
            </p>
            <p class="mt-1 text-xs text-muted-foreground/70">
              支持 .md、.markdown、.txt 格式
            </p>
          </div>
        </TabsContent>

        <!-- 网络链接导入 -->
        <TabsContent value="url" class="mt-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <Input
                v-model="url"
                placeholder="如：https://mp.weixin.qq.com/s/xxxxx"
                :class="{ 'border-destructive': urlError }"
                @keydown.enter="importFromUrl"
                @input="urlError = ``"
              />
              <p v-if="urlError" class="text-xs text-destructive">
                {{ urlError }}
              </p>
              <p v-else class="text-xs text-muted-foreground">
                支持 Markdown 文件链接直接导入，或网页链接自动转换
              </p>
            </div>
            <Button
              class="w-full"
              :disabled="isUrlLoading || !url.trim()"
              @click="importFromUrl"
            >
              <Loader2 v-if="isUrlLoading" class="mr-2 size-4 animate-spin" />
              {{ isUrlLoading ? '导入中...' : '导入' }}
            </Button>
            <p class="text-center text-xs text-muted-foreground/60">
              基于
              <a
                href="https://github.com/doocs/anything-md"
                target="_blank"
                class="underline hover:text-muted-foreground"
              >Anything-MD</a>
              提供转换服务
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
