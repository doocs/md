<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { monaco, registerShortcuts } from '@md/shared'
import imageCompression from 'browser-image-compression'
import { Eye, Pen } from 'lucide-vue-next'
import { SidebarAIToolbar } from '@/components/ai'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { checkImage, toBase64 } from '@/utils'
import { fileUpload } from '@/utils/file'
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution'

const store = useStore()
const displayStore = useDisplayStore()

const { isDark, output, editor } = storeToRefs(store)
const { editorRefresh } = store

const { toggleShowUploadImgDialog } = displayStore

const backLight = ref(false)
const isCoping = ref(false)

function startCopy() {
  backLight.value = true
  isCoping.value = true
}

// 拷贝结束
function endCopy() {
  backLight.value = false
  setTimeout(() => {
    isCoping.value = false
  }, 800)
}

const showEditor = ref(true)

// 切换编辑/预览视图（仅限移动端）
function toggleView() {
  showEditor.value = !showEditor.value
}

// AI 工具箱已移到侧边栏

const previewRef = useTemplateRef<HTMLDivElement>(`previewRef`)

const timeout = ref<NodeJS.Timeout>()
let editorScrollDisposable: any = null

// 使浏览区与编辑区滚动条建立同步联系
function leftAndRightScroll() {
  let isEditorScrolling = false
  let isPreviewScrolling = false

  function syncScrollTo(source: `editor` | `preview`) {
    if (!editor.value || !previewRef.value)
      return

    if (source === `editor`) {
      if (isPreviewScrolling)
        return
      isEditorScrolling = true

      const scrollTop = editor.value.getScrollTop()
      const scrollHeight = editor.value.getScrollHeight()
      const visibleHeight = editor.value.getLayoutInfo().height
      const percentage = scrollTop / (scrollHeight - visibleHeight)

      const previewEl = previewRef.value
      const targetScroll = percentage * (previewEl.scrollHeight - previewEl.offsetHeight)
      previewEl.scrollTo(0, targetScroll)

      requestAnimationFrame(() => {
        isEditorScrolling = false
      })
    }
    else {
      if (isEditorScrolling)
        return
      isPreviewScrolling = true

      const previewEl = previewRef.value
      const percentage = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.offsetHeight)

      const scrollHeight = editor.value.getScrollHeight()
      const visibleHeight = editor.value.getLayoutInfo().height
      const targetScroll = percentage * (scrollHeight - visibleHeight)
      editor.value.setScrollTop(targetScroll)

      requestAnimationFrame(() => {
        isPreviewScrolling = false
      })
    }
  }

  // 监听预览区滚动
  if (previewRef.value) {
    previewRef.value.addEventListener(`scroll`, () => syncScrollTo(`preview`), false)
  }

  // 监听编辑器滚动
  if (editor.value) {
    editorScrollDisposable = editor.value.onDidScrollChange(() => syncScrollTo(`editor`))
  }
}

onMounted(() => {
  setTimeout(() => {
    leftAndRightScroll()
  }, 300)
})

function beforeUpload(file: File) {
  // validate image
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    toast.error(checkResult.msg)
    return false
  }

  // check image host
  const imgHost = localStorage.getItem(`imgHost`) || `default`
  localStorage.setItem(`imgHost`, imgHost)

  const config = localStorage.getItem(`${imgHost}Config`)
  const isValidHost = imgHost === `default` || config
  if (!isValidHost) {
    toast.error(`请先配置 ${imgHost} 图床参数`)
    return false
  }

  return true
}

// 图片上传结束
function uploaded(imageUrl: string) {
  if (!imageUrl) {
    toast.error(`上传图片未知异常`)
    return
  }
  setTimeout(() => {
    toggleShowUploadImgDialog(false)
  }, 1000)
  // 上传成功，获取光标
  const position = editor.value!.getPosition()
  const markdownImage = `![](${imageUrl})`
  // 将 Markdown 形式的 URL 插入编辑框光标所在位置
  if (position) {
    editor.value!.executeEdits(`insert-image`, [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: `\n${markdownImage}\n`,
    }])
  }
  toast.success(`图片上传成功`)
}

const isImgLoading = ref(false)
async function compressImage(file: File) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }
  const compressedFile = await imageCompression(file, options)
  return compressedFile
}
async function uploadImage(
  file: File,
  cb?: { (url: any, data: string): void, (arg0: unknown): void } | undefined,
  applyUrl?: boolean,
) {
  try {
    isImgLoading.value = true
    // compress image if useCompression is true
    const useCompression = localStorage.getItem(`useCompression`) === `true`
    if (useCompression) {
      file = await compressImage(file)
    }
    const base64Content = await toBase64(file)
    const url = await fileUpload(base64Content, file)
    if (cb) {
      cb(url, base64Content)
    }
    else {
      uploaded(url)
    }
    if (applyUrl) {
      return uploaded(url)
    }
  }
  catch (err) {
    toast.error((err as any).message)
  }
  finally {
    isImgLoading.value = false
  }
}

// 从文件列表中查找一个 md 文件并解析
async function getMd({ list }: { list: { path: string, file: File }[] }) {
  return new Promise<{ str: string, file: File, path: string }>((resolve) => {
    const { path, file } = list.find(item => item.path.match(/\.md$/))!
    const reader = new FileReader()
    reader.readAsText(file!, `UTF-8`)
    reader.onload = (evt) => {
      resolve({
        str: evt.target!.result as string,
        file,
        path,
      })
    }
  })
}

// 转换文件系统句柄中的文件为文件列表
async function showFileStructure(root: any) {
  const result = []
  let cwd = ``
  try {
    const dirs = [root]
    for (const dir of dirs) {
      cwd += `${dir.name}/`
      for await (const [, handle] of dir) {
        if (handle.kind === `file`) {
          result.push({
            path: cwd + handle.name,
            file: await handle.getFile(),
          })
        }
        else {
          result.push({
            path: `${cwd + handle.name}/`,
          })
          dirs.push(handle)
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
  return result
}

// 上传 md 中的图片
async function uploadMdImg({
  md,
  list,
}: {
  md: { str: string, path: string, file: File }
  list: { path: string, file: File }[]
}) {
  // 获取所有相对地址的图片
  const mdImgList = [...(md.str.matchAll(/!\[(.*?)\]\((.*?)\)/g) || [])].filter(item => item)
  const root = md.path.match(/.+?\//)![0]
  const resList = await Promise.all<{ matchStr: string, url: string }>(
    mdImgList.map((item) => {
      return new Promise((resolve) => {
        let [, , matchStr] = item
        matchStr = matchStr.replace(/^.\//, ``) // 处理 ./img/ 为 img/ 统一相对路径风格
        const { file }
          = list.find(f => f.path === `${root}${matchStr}`) || {}
        uploadImage(file!, url => resolve({ matchStr, url }))
      })
    }),
  )
  resList.forEach((item) => {
    md.str = md.str
      .replace(`](./${item.matchStr})`, `](${item.url})`)
      .replace(`](${item.matchStr})`, `](${item.url})`)
  })
  editor.value!.setValue(md.str)
}

const codeMirrorWrapper = useTemplateRef<ComponentPublicInstance<HTMLDivElement>>(`codeMirrorWrapper`)

// 转换 markdown 中的本地图片为线上图片
// todo 处理事件覆盖
function mdLocalToRemote() {
  const dom = codeMirrorWrapper.value!

  dom.ondragover = evt => evt.preventDefault()
  dom.ondrop = async (evt) => {
    evt.preventDefault()
    if (evt.dataTransfer == null || !Array.isArray(evt.dataTransfer.items)) {
      return
    }

    for (const item of evt.dataTransfer.items.filter(item => item.kind === `file`)) {
      item
        .getAsFileSystemHandle()
        .then(async (handle: { kind: string, getFile: () => any }) => {
          if (handle.kind === `directory`) {
            const list = (await showFileStructure(handle)) as {
              path: string
              file: File
            }[]
            const md = await getMd({ list })
            uploadMdImg({ md, list })
          }
          else {
            const file = await handle.getFile()
            console.log(`file`, file)
            beforeUpload(file) && uploadImage(file)
          }
        })
    }
  }
}

const changeTimer = ref<NodeJS.Timeout>()
const handlePaste = ref<((event: ClipboardEvent) => Promise<void>) | null>(null)

const editorRef = useTemplateRef<HTMLTextAreaElement>(`editorRef`)
const progressValue = ref(0)

function createMonacoEditor(dom: HTMLTextAreaElement) {
  const monacoEditor = monaco.editor.create(dom, {
    value: store.posts[store.currentPostIndex].content,
    language: `markdown`,
    theme: isDark.value ? `vs-dark` : `vs`,
    lineNumbers: `off`,
    wordWrap: `on`,
    automaticLayout: true,
    fontSize: 14,
    lineHeight: 22,
    tabSize: 2,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  })

  monacoEditor.onDidChangeModelContent(() => {
    clearTimeout(changeTimer.value)
    changeTimer.value = setTimeout(() => {
      editorRefresh()

      const currentPost = store.posts[store.currentPostIndex]
      const content = monacoEditor.getValue()
      if (content === currentPost.content) {
        return
      }

      currentPost.updateDatetime = new Date()
      currentPost.content = content
    }, 300)
  })

  // 注册快捷键
  registerShortcuts(monacoEditor, {
    onFormat: async () => {
      const { formatDoc } = await import(`@/utils`)
      const value = monacoEditor.getValue()
      formatDoc(value).then((doc: string) => {
        monacoEditor.setValue(doc)
      })
    },
  })

  // 粘贴上传图片并插入 - 使用全局粘贴事件监听
  handlePaste.value = async (event: ClipboardEvent) => {
    // 检查焦点是否在编辑器内
    const editorDomNode = monacoEditor.getDomNode()
    if (!editorDomNode || !editorDomNode.contains(document.activeElement)) {
      return
    }

    if (!(event.clipboardData?.items) || isImgLoading.value) {
      return
    }

    const items = [...event.clipboardData.items]
      .map(item => item.getAsFile())
      .filter(item => item != null && beforeUpload(item)) as File[]

    console.log(`paste items`, items)

    if (items.length === 0) {
      return
    }

    // 有图片文件，阻止默认粘贴行为
    event.preventDefault()
    event.stopPropagation()

    // start progress
    const intervalId = setInterval(() => {
      const newProgress = progressValue.value + 1
      if (newProgress >= 100) {
        return
      }
      progressValue.value = newProgress
    }, 100)

    for (const item of items) {
      await uploadImage(item)
    }

    const cleanup = () => {
      clearInterval(intervalId)
      progressValue.value = 100 // 设置完成状态

      // 可选：延迟一段时间后重置进度
      setTimeout(() => {
        progressValue.value = 0
      }, 1000)
    }
    cleanup()
  }

  // 在 document 上监听粘贴事件（捕获阶段）
  document.addEventListener(`paste`, handlePaste.value, true)

  return monacoEditor
}

// 初始化编辑器
onMounted(() => {
  const editorDom = editorRef.value

  if (editorDom == null) {
    return
  }

  editorDom.value = store.posts[store.currentPostIndex].content

  nextTick(() => {
    editor.value = createMonacoEditor(editorDom)

    // AI 工具箱已移到侧边栏，不再需要初始化编辑器事件
    editorRefresh()
    mdLocalToRemote()
  })
})

// 监听暗色模式变化并更新编辑器主题
watch(isDark, () => {
  const theme = isDark.value ? `vs-dark` : `vs`
  editor.value?.updateOptions?.({ theme })
})

// 历史记录的定时器
const historyTimer = ref<NodeJS.Timeout>()
onMounted(() => {
  // 定时，30 秒记录一次文章的历史记录
  historyTimer.value = setInterval(() => {
    const currentPost = store.posts[store.currentPostIndex]

    // 与最后一篇记录对比
    const pre = (currentPost.history || [])[0]?.content
    if (pre === currentPost.content) {
      return
    }

    currentPost.history ??= []
    currentPost.history.unshift({
      content: currentPost.content,
      datetime: new Date().toLocaleString(`zh-CN`),
    })

    currentPost.history.length = Math.min(currentPost.history.length, 10)
  }, 30 * 1000)
})

// 销毁时清理定时器和全局事件监听器
onUnmounted(() => {
  // 清理定时器 - 防止回调访问已销毁的DOM
  clearTimeout(historyTimer.value)
  clearTimeout(timeout.value)
  clearTimeout(changeTimer.value)

  if (handlePaste.value) {
    document.removeEventListener(`paste`, handlePaste.value, true)
  }

  // 清理滚动监听器
  if (editorScrollDisposable) {
    editorScrollDisposable.dispose()
  }
})
</script>

<template>
  <div class="container flex flex-col">
    <Progress v-model="progressValue" class="absolute left-0 right-0 rounded-none" style="height: 2px;" />
    <EditorHeader
      @start-copy="startCopy"
      @end-copy="endCopy"
    />

    <main class="container-main flex flex-1 flex-col">
      <div
        class="container-main-section border-radius-10 relative flex flex-1 overflow-hidden border"
      >
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            :default-size="15"
            :max-size="store.isOpenPostSlider ? 30 : 0"
            :min-size="store.isOpenPostSlider ? 10 : 0"
          >
            <PostSlider />
          </ResizablePanel>
          <ResizableHandle class="hidden md:block" />
          <ResizablePanel class="flex">
            <div
              v-show="!store.isMobile || (store.isMobile && showEditor)"
              ref="codeMirrorWrapper"
              class="codeMirror-wrapper relative flex-1"
              :class="{
                'order-1 border-l': !store.isEditOnLeft,
                'border-r': store.isEditOnLeft,
              }"
            >
              <SidebarAIToolbar
                :is-mobile="store.isMobile"
                :show-editor="showEditor"
              />

              <EditorContextMenu>
                <div
                  id="editor"
                  ref="editorRef"
                  class="monaco-editor-container"
                />
              </EditorContextMenu>
            </div>
            <div
              v-show="!store.isMobile || (store.isMobile && !showEditor)"
              class="relative flex-1 overflow-x-hidden transition-width"
              :class="[store.isOpenRightSlider ? 'w-0' : 'w-100']"
            >
              <div
                id="preview"
                ref="previewRef"
                class="preview-wrapper w-full p-5"
              >
                <div
                  id="output-wrapper"
                  class="w-full"
                  :class="{ output_night: !backLight }"
                >
                  <div
                    class="preview border-x shadow-xl"
                    :class="[store.isMobile ? 'w-[100%]' : store.previewWidth]"
                  >
                    <section id="output" class="w-full" v-html="output" />
                    <div v-if="isCoping" class="loading-mask">
                      <div class="loading-mask-box">
                        <div class="loading__img" />
                        <span>正在生成</span>
                      </div>
                    </div>
                  </div>
                </div>
                <BackTop
                  target="preview"
                  :right="store.isMobile ? 24 : 20"
                  :bottom="store.isMobile ? 90 : 20"
                />
              </div>

              <FloatingToc />
            </div>
            <CssEditor />
            <RightSlider />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <!-- 移动端浮动按钮组 -->
      <div v-if="store.isMobile" class="fixed bottom-16 right-6 z-50 flex flex-col gap-2">
        <!-- 切换编辑/预览按钮 -->
        <button
          class="bg-primary flex items-center justify-center rounded-full p-3 text-white shadow-lg transition active:scale-95 hover:scale-105 dark:bg-gray-700 dark:text-white dark:ring-2 dark:ring-white/30"
          aria-label="切换编辑/预览"
          @click="toggleView"
        >
          <component :is="showEditor ? Eye : Pen" class="h-5 w-5" />
        </button>
      </div>

      <!-- AI工具箱已移到侧边栏，这里不再显示 -->

      <UploadImgDialog @upload-image="uploadImage" />

      <InsertFormDialog />

      <InsertMpCardDialog />

      <AlertDialog v-model:open="store.isOpenConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>提示</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将丢失本地自定义样式，是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="store.resetStyle()">
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>

    <Footer />
  </div>
</template>

<style lang="less" scoped>
@import url('../assets/less/app.less');
</style>

<style lang="less" scoped>
.container {
  height: 100vh;
  min-width: 100%;
  padding: 0;
}

.container-main {
  overflow: hidden;
}

#output-wrapper {
  position: relative;
  user-select: text;
  height: 100%;
}

.loading-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));

  .loading-mask-box {
    position: sticky;
    top: 50%;
    transform: translateY(-50%);

    .loading__img {
      width: 75px;
      height: 75px;
      background: url('../assets/images/favicon.png') no-repeat;
      margin: 1em auto;
      background-size: cover;
    }
  }
}

:deep(.preview-table) {
  border-spacing: 0;
}

.codeMirror-wrapper,
.preview-wrapper {
  height: 100%;
}

.codeMirror-wrapper {
  overflow-x: hidden;
  height: 100%;
  position: relative;
}
</style>
