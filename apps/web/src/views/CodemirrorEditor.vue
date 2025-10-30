<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { highlightPendingBlocks, hljs } from '@md/core'
import { themeMap } from '@md/shared/configs'
import { markdownSetup, theme } from '@md/shared/editor'
import imageCompression from 'browser-image-compression'
import { Eye, Pen } from 'lucide-vue-next'
import { SidebarAIToolbar } from '@/components/ai'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { SearchTab } from '@/components/ui/search-tab'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { checkImage, store, toBase64 } from '@/utils'
import { fileUpload } from '@/utils/file'

const editorStore = useEditorStore()
const postStore = usePostStore()
const renderStore = useRenderStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()
const cssEditorStore = useCssEditorStore()

const { editor } = storeToRefs(editorStore)
const { output } = storeToRefs(renderStore)
const { isDark } = storeToRefs(uiStore)
const { posts, currentPostIndex } = storeToRefs(postStore)
const { previewWidth } = storeToRefs(themeStore)
const {
  isMobile,
  isEditOnLeft,
  isOpenPostSlider,
  isOpenRightSlider,
  isOpenConfirmDialog,
} = storeToRefs(uiStore)

const { toggleShowUploadImgDialog } = uiStore

// Editor refresh function
function editorRefresh() {
  themeStore.updateCodeTheme()

  const raw = editorStore.getContent()
  renderStore.render(raw, {
    isCiteStatus: themeStore.isCiteStatus,
    legend: themeStore.legend,
    isUseIndent: themeStore.isUseIndent,
    isUseJustify: themeStore.isUseJustify,
    isCountStatus: themeStore.isCountStatus,
    isMacCodeBlock: themeStore.isMacCodeBlock,
    isShowLineNumber: themeStore.isShowLineNumber,
  })
}

// Reset style function
function resetStyle() {
  themeStore.resetStyle()
  cssEditorStore.resetCssConfig()
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
  toast.success(`样式已重置`)
}

watch(output, () => {
  nextTick(() => {
    const outputElement = document.getElementById(`output`)
    if (outputElement) {
      highlightPendingBlocks(hljs, outputElement)
    }
  })
})

const backLight = ref(false)
const isCoping = ref(false)

// 辅助函数：查找 CodeMirror 滚动容器
function findCodeMirrorScroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`.cm-scroller`)
    || document.querySelector<HTMLElement>(`.CodeMirror-scroll`)
}

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
const codeMirrorView = ref<EditorView | null>(null)
const themeCompartment = new Compartment()

// 使浏览区与编辑区滚动条建立同步联系
function leftAndRightScroll() {
  const scrollCB = (text: string) => {
    // AIPolishBtnRef.value?.close()

    let source: HTMLElement | null
    let target: HTMLElement | null

    clearTimeout(timeout.value)
    if (text === `preview`) {
      source = previewRef.value!
      target = findCodeMirrorScroller()
      if (!target) {
        console.warn(`Cannot find CodeMirror scroll container`)
        return
      }
      // CodeMirror v6 使用 DOM 事件
      const scrollEl = findCodeMirrorScroller()
      if (scrollEl) {
        scrollEl.removeEventListener(`scroll`, editorScrollCB)
        timeout.value = setTimeout(() => {
          scrollEl.addEventListener(`scroll`, editorScrollCB)
        }, 300)
      }
    }
    else {
      source = findCodeMirrorScroller()
      target = previewRef.value!
      if (!source) {
        console.warn(`Cannot find CodeMirror scroll container`)
        return
      }
      target.removeEventListener(`scroll`, previewScrollCB, false)
      timeout.value = setTimeout(() => {
        target!.addEventListener(`scroll`, previewScrollCB, false)
      }, 300)
    }

    if (!source || !target) {
      return
    }

    const sourceHeight = source.scrollHeight - source.offsetHeight
    const targetHeight = target.scrollHeight - target.offsetHeight

    if (sourceHeight <= 0 || targetHeight <= 0) {
      return
    }

    const percentage = source.scrollTop / sourceHeight
    const height = percentage * targetHeight

    target.scrollTo(0, height)
  }

  function editorScrollCB() {
    scrollCB(`editor`)
  }

  function previewScrollCB() {
    scrollCB(`preview`)
  }

  if (previewRef.value) {
    previewRef.value.addEventListener(`scroll`, previewScrollCB, false)
  }
  const scrollEl = findCodeMirrorScroller()
  if (scrollEl) {
    scrollEl.addEventListener(`scroll`, editorScrollCB)
  }
}

onMounted(() => {
  setTimeout(() => {
    leftAndRightScroll()
  }, 300)
})

const searchTabRef
  = useTemplateRef<InstanceType<typeof SearchTab>>(`searchTabRef`)

// 用于存储待处理的搜索请求
const pendingSearchRequest = ref<{ selected: string } | null>(null)

function openSearchWithSelection(view: EditorView) {
  const selection = view.state.selection.main
  const selected = view.state.doc.sliceString(selection.from, selection.to).trim()

  if (searchTabRef.value) {
    // SearchTab 已准备好，直接使用
    if (selected) {
      searchTabRef.value.setSearchWord(selected)
    }
    else {
      searchTabRef.value.showSearchTab = true
    }
  }
  else {
    // SearchTab 还没准备好，保存请求
    pendingSearchRequest.value = { selected }
  }
}

// 监听 searchTabRef 的变化，处理待处理的请求
watch(searchTabRef, (newRef) => {
  if (newRef && pendingSearchRequest.value) {
    const { selected } = pendingSearchRequest.value
    if (selected) {
      newRef.setSearchWord(selected)
    }
    else {
      newRef.showSearchTab = true
    }
    pendingSearchRequest.value = null
  }
})

function handleGlobalKeydown(e: KeyboardEvent) {
  // 处理 ESC 键关闭搜索
  const editorView = codeMirrorView.value

  if (e.key === `Escape` && searchTabRef.value?.showSearchTab) {
    searchTabRef.value.showSearchTab = false
    e.preventDefault()
    editorView?.focus()
  }
}

onMounted(() => {
  // 使用较低优先级确保 CodeMirror 键盘事件先处理
  document.addEventListener(`keydown`, handleGlobalKeydown, { passive: false, capture: false })
})

async function beforeImageUpload(file: File) {
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    toast.error(checkResult.msg)
    return false
  }

  // check image host
  const imgHost = (await store.get(`imgHost`)) || `default`
  await store.set(`imgHost`, imgHost)

  const config = await store.get(`${imgHost}Config`)
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
  // 上传成功，插入图片
  const markdownImage = `![](${imageUrl})`
  // 将 Markdown 形式的 URL 插入编辑框光标所在位置
  if (codeMirrorView.value) {
    codeMirrorView.value.dispatch(codeMirrorView.value.state.replaceSelection(`\n${markdownImage}\n`))
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
    const useCompression = (await store.get(`useCompression`)) === `true`
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
  if (codeMirrorView.value) {
    codeMirrorView.value.dispatch({
      changes: { from: 0, to: codeMirrorView.value.state.doc.length, insert: md.str },
    })
  }
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
            if (await beforeImageUpload(file)) {
              uploadImage(file)
            }
          }
        })
    }
  }
}

const changeTimer = ref<NodeJS.Timeout>()

const editorRef = useTemplateRef<HTMLDivElement>(`editorRef`)
const progressValue = ref(0)

function createFormTextArea(dom: HTMLDivElement) {
  // 创建编辑器状态
  const state = EditorState.create({
    doc: posts.value[currentPostIndex.value].content,
    extensions: [
      markdownSetup({
        onSearch: openSearchWithSelection,
      }),
      themeCompartment.of(theme(isDark.value)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const value = update.state.doc.toString()
          clearTimeout(changeTimer.value)
          changeTimer.value = setTimeout(() => {
            editorRefresh()

            const currentPost = posts.value[currentPostIndex.value]
            if (value === currentPost.content) {
              return
            }

            currentPost.updateDatetime = new Date()
            currentPost.content = value
          }, 300)
        }
      }),
    ],
  })

  // 创建编辑器视图
  const view = new EditorView({
    state,
    parent: dom,
  })

  codeMirrorView.value = view

  // 添加粘贴事件监听
  view.dom.addEventListener(`paste`, async (event: ClipboardEvent) => {
    if (!(event.clipboardData?.items) || isImgLoading.value) {
      return
    }
    const items = await Promise.all(
      [...event.clipboardData.items]
        .map(item => item.getAsFile())
        .filter(item => item != null)
        .map(async item => (await beforeImageUpload(item!)) ? item : null),
    )
    const validItems = items.filter(item => item != null) as File[]
    // 即使return了，粘贴的文本内容也会被插入
    if (validItems.length === 0) {
      return
    }
    // start progress
    const intervalId = setInterval(() => {
      const newProgress = progressValue.value + 1
      if (newProgress >= 100) {
        return
      }
      progressValue.value = newProgress
    }, 100)
    for (const item of validItems) {
      event.preventDefault()
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
  })

  // 返回编辑器 view
  return view
}

// 初始化编辑器
onMounted(() => {
  const editorDom = editorRef.value

  if (editorDom == null) {
    return
  }

  // 初始化渲染器
  const cssContent = cssEditorStore.getCurrentTabContent()
  renderStore.initRendererInstance(
    cssContent,
    themeMap[themeStore.theme],
    themeStore.fontFamily,
    themeStore.fontSize,
    {
      primaryColor: themeStore.primaryColor,
      isUseIndent: themeStore.isUseIndent,
      isUseJustify: themeStore.isUseJustify,
      isMacCodeBlock: themeStore.isMacCodeBlock,
      isShowLineNumber: themeStore.isShowLineNumber,
    },
  )

  // 🧪 测试新主题系统：应用 CSS 主题
  console.log(`[新主题系统测试] 开始应用主题...`)

  // 等待异步应用完成后检查
  themeStore.applyCurrentTheme().then(() => {
    setTimeout(() => {
      const styleEl = document.querySelector(`#md-theme`)
      if (styleEl) {
        console.log(`✅ [新主题系统测试] 主题样式已成功注入！`)
        console.log(`📝 [新主题系统测试] CSS 内容长度:`, styleEl.textContent?.length, `字符`)
        console.log(`🎨 [新主题系统测试] 当前主题:`, themeStore.theme)
        console.log(`🎨 [新主题系统测试] 主色调:`, themeStore.primaryColor)
        console.log(`📏 [新主题系统测试] 字体大小:`, themeStore.fontSize)

        // 打印 CSS 内容的前 500 字符作为预览
        const preview = styleEl.textContent?.substring(0, 500)
        console.log(`📄 [新主题系统测试] CSS 预览:\n`, preview)
      }
      else {
        console.error(`❌ [新主题系统测试] 主题样式注入失败！未找到 #md-theme 标签`)
      }
    }, 50)
  }).catch((error) => {
    console.error(`❌ [新主题系统测试] 应用主题时出错:`, error)
  })

  nextTick(() => {
    const editorView = createFormTextArea(editorDom)
    editor.value = editorView

    // AI 工具箱已移到侧边栏，不再需要初始化编辑器事件
    editorRefresh()
    mdLocalToRemote()
  })
})

// 监听暗色模式变化并更新编辑器主题
watch(isDark, () => {
  if (codeMirrorView.value) {
    codeMirrorView.value.dispatch({
      effects: themeCompartment.reconfigure(theme(isDark.value)),
    })
  }
})

// 监听当前文章切换，更新编辑器内容
watch(currentPostIndex, () => {
  if (!codeMirrorView.value)
    return

  const currentPost = posts.value[currentPostIndex.value]
  if (!currentPost)
    return

  const currentContent = codeMirrorView.value.state.doc.toString()

  // 只有当内容不同时才更新，避免不必要的更新
  if (currentContent !== currentPost.content) {
    codeMirrorView.value.dispatch({
      changes: {
        from: 0,
        to: codeMirrorView.value.state.doc.length,
        insert: currentPost.content,
      },
    })

    // 更新编辑器后刷新渲染
    editorRefresh()
  }
})

// 历史记录的定时器
const historyTimer = ref<NodeJS.Timeout>()
onMounted(() => {
  // 定时，30 秒记录一次文章的历史记录
  historyTimer.value = setInterval(() => {
    const currentPost = posts.value[currentPostIndex.value]

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

  // 清理全局事件监听器 - 防止全局事件触发已销毁的组件
  document.removeEventListener(`keydown`, handleGlobalKeydown)
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
            :max-size="isOpenPostSlider ? 20 : 0"
            :min-size="isOpenPostSlider ? 10 : 0"
          >
            <PostSlider />
          </ResizablePanel>
          <ResizableHandle class="hidden md:block" />
          <ResizablePanel class="flex">
            <div
              v-show="!isMobile || (isMobile && showEditor)"
              ref="codeMirrorWrapper"
              class="codeMirror-wrapper relative flex-1"
              :class="{
                'order-1 border-l': !isEditOnLeft,
                'border-r': isEditOnLeft,
              }"
            >
              <SearchTab v-if="codeMirrorView" ref="searchTabRef" :editor-view="codeMirrorView as any" />
              <SidebarAIToolbar
                :is-mobile="isMobile"
                :show-editor="showEditor"
              />

              <EditorContextMenu>
                <div
                  id="editor"
                  ref="editorRef"
                  class="codemirror-container"
                />
              </EditorContextMenu>
            </div>
            <div
              v-show="!isMobile || (isMobile && !showEditor)"
              class="relative flex-1 overflow-x-hidden transition-width"
              :class="[isOpenRightSlider ? 'w-0' : 'w-100']"
            >
              <div
                id="preview"
                ref="previewRef"
                class="preview-wrapper w-full p-5 flex justify-center"
              >
                <div
                  id="output-wrapper"
                  class="w-full max-w-full"
                  :class="{ output_night: !backLight }"
                >
                  <div
                    class="preview border-x shadow-xl mx-auto"
                    :class="[
                      isMobile ? 'w-full' : previewWidth,
                      themeStore.previewWidth === 'w-[375px]' ? 'max-w-full' : '',
                    ]"
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
                  :right="isMobile ? 24 : 20"
                  :bottom="isMobile ? 90 : 20"
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
      <div v-if="isMobile" class="fixed bottom-16 right-6 z-50 flex flex-col gap-2">
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

      <AlertDialog v-model:open="isOpenConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>提示</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将丢失本地自定义样式，是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="resetStyle">
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
