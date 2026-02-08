<script setup lang="ts">
import { FileText, Globe, Loader2, Upload, Wand2 } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

const editorStore = useEditorStore()
const uiStore = useUIStore()

const { isShowImportMdDialog } = storeToRefs(uiStore)

// 当前选中的 tab
const activeTab = ref<'url' | 'file' | 'smart'>(`file`)

// ==================== 网络链接导入 ====================
const url = ref(``)
const isUrlLoading = ref(false)
const urlError = ref(``)
let abortController: AbortController | null = null

/** 从异常中取可读文案（部分环境 CORS 信息在 toString 里） */
function getErrorText(err: unknown): string {
  const e = err as Error
  const msg = typeof e?.message === `string` ? e.message : ``
  const str = typeof err?.toString === `function` ? err.toString() : ``
  return `${msg} ${str}`.trim()
}

/** 浏览器明确报出的 CORS 错误（如 "blocked by CORS policy"） */
function isCorsBlockedError(err: unknown): boolean {
  const text = getErrorText(err).toLowerCase()
  return text.includes(`cors`) || text.includes(`access-control-allow-origin`)
}

/** 请求未得到响应就失败（网络异常、域名不可达、连接被拒等），与 CORS 不同 */
function isNetworkOrRequestFailure(err: unknown): boolean {
  const e = err as Error
  return e?.name === `TypeError` || (typeof e?.message === `string` && e.message.includes(`Failed to fetch`))
}

function getImportErrorDisplay(err: unknown): { message: string, showCorsLink: boolean } {
  if (isCorsBlockedError(err)) {
    return {
      message: `因跨域限制无法访问该链接，需由提供该文件的服务器配置 CORS。`,
      showCorsLink: true,
    }
  }
  if (isNetworkOrRequestFailure(err)) {
    return {
      message: `无法获取该链接（可能为跨域限制、网络异常或链接不可达）。若您拥有该链接所在服务器，可配置 CORS；否则请检查链接或改用「本地文件」导入。`,
      showCorsLink: true,
    }
  }
  const text = getErrorText(err) || `未知错误`
  return {
    message: `导入失败：${text}。请检查链接是否有效且可公开访问。`,
    showCorsLink: false,
  }
}

const CORS_DOC_URL = `https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS`
const isCorsError = ref(false)

async function importFromUrl() {
  const rawUrl = url.value.trim()
  if (!rawUrl) {
    urlError.value = `请输入 Markdown 文件的网络链接`
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
    const response = await fetch(rawUrl, { signal })
    if (!response.ok) {
      urlError.value = `导入失败：${response.status} ${response.statusText}。请确认链接有效且可公开访问。`
      return
    }

    const content = await response.text()
    if (signal.aborted)
      return

    if (!content.trim()) {
      urlError.value = `导入失败：该链接返回的内容为空。`
      return
    }

    editorStore.importContent(content)
    closeDialog()
  }
  catch (err) {
    if ((err as Error).name === `AbortError`)
      return
    const { message, showCorsLink } = getImportErrorDisplay(err)
    urlError.value = message
    isCorsError.value = showCorsLink
  }
  finally {
    isUrlLoading.value = false
  }
}

// ==================== 智能转换（Anything-MD）====================
const smartUrl = ref(``)
const isSmartLoading = ref(false)
const smartError = ref(``)
let smartAbortController: AbortController | null = null

const ANYTHING_MD_API = `https://anything-md.doocs.org/`

async function importFromSmartUrl() {
  const rawUrl = smartUrl.value.trim()
  if (!rawUrl) {
    smartError.value = `请输入网页链接`
    return
  }

  if (!URL.canParse(rawUrl) || !/^https?:\/\//i.test(rawUrl)) {
    smartError.value = `请输入有效的 URL 地址（仅支持 http/https）`
    return
  }

  smartError.value = ``
  isSmartLoading.value = true
  smartAbortController?.abort()
  smartAbortController = new AbortController()
  const { signal } = smartAbortController

  try {
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
      return

    if (!data.success) {
      throw new Error(data.error || `转换失败`)
    }

    const markdown = data.markdown?.trim()
    if (!markdown) {
      throw new Error(`转换结果为空`)
    }

    editorStore.importContent(markdown)
    closeDialog()
  }
  catch (err) {
    if ((err as Error).name === `AbortError`)
      return
    smartError.value = (err as Error).message || `转换失败，请检查链接是否有效`
  }
  finally {
    isSmartLoading.value = false
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
  smartAbortController?.abort()
  smartAbortController = null
  isShowImportMdDialog.value = false
  url.value = ``
  urlError.value = ``
  isCorsError.value = false
  isUrlLoading.value = false
  smartUrl.value = ``
  smartError.value = ``
  isSmartLoading.value = false
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
  isCorsError.value = false
  nextTick(() => importFromUrl())
})
</script>

<template>
  <Dialog :open="isShowImportMdDialog" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>导入 Markdown</DialogTitle>
        <DialogDescription>
          从网络链接、本地文件导入，或将任意网页智能转换为 Markdown
        </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
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
          <TabsTrigger value="smart">
            <span class="inline-flex items-center">
              <Wand2 class="mr-2 size-4 shrink-0" />
              智能转换
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
              <label class="text-sm font-medium">Markdown 文件链接</label>
              <Input
                v-model="url"
                placeholder="如：https://raw.githubusercontent.com/doocs/md/main/README.md"
                :class="{ 'border-destructive': urlError }"
                @keydown.enter="importFromUrl"
                @input="urlError = ``; isCorsError = false"
              />
              <p v-if="urlError" class="text-xs text-destructive">
                {{ urlError }}
                <a
                  v-if="isCorsError"
                  :href="CORS_DOC_URL"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline ml-1"
                >
                  了解 CORS
                </a>
              </p>
              <p v-else class="text-xs text-muted-foreground">
                输入 Markdown 文件的网络地址，支持 GitHub raw 链接等
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
          </div>
        </TabsContent>
        <!-- 智能转换（网页 → Markdown） -->
        <TabsContent value="smart" class="mt-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">网页链接</label>
              <Input
                v-model="smartUrl"
                placeholder="如：https://mp.weixin.qq.com/s/xxxxx"
                :class="{ 'border-destructive': smartError }"
                @keydown.enter="importFromSmartUrl"
                @input="smartError = ``"
              />
              <p v-if="smartError" class="text-xs text-destructive">
                {{ smartError }}
              </p>
              <p v-else class="text-xs text-muted-foreground">
                输入任意网页链接（如公众号文章、博客等），自动转换为 Markdown 导入
              </p>
            </div>
            <Button
              class="w-full"
              :disabled="isSmartLoading || !smartUrl.trim()"
              @click="importFromSmartUrl"
            >
              <Loader2 v-if="isSmartLoading" class="mr-2 size-4 animate-spin" />
              {{ isSmartLoading ? '转换中...' : '智能转换并导入' }}
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
