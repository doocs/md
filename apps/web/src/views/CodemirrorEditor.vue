<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { highlightPendingBlocks, hljs } from '@md/core'
import { markdownSetup, theme } from '@md/shared/editor'
import imageCompression from 'browser-image-compression'
import { SidebarAIToolbar } from '@/components/ai'
import FolderSourcePanel from '@/components/editor/FolderSourcePanel.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { SearchTab } from '@/components/ui/search-tab'
import { useImageUploader } from '@/composables/useImageUploader'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { checkImage, toBase64 } from '@/utils'
import { fileUpload } from '@/utils/file'
import { store } from '@/utils/storage'

const editorStore = useEditorStore()
const postStore = usePostStore()
const renderStore = useRenderStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()
const cssEditorStore = useCssEditorStore()
const { upload } = useImageUploader()

const { editor } = storeToRefs(editorStore)
const { output } = storeToRefs(renderStore)
const { isDark } = storeToRefs(uiStore)
const { posts, currentPostIndex } = storeToRefs(postStore)
const {
  isMobile,
  isOpenPostSlider,
  isOpenFolderPanel,
  isOpenRightSlider,
  isOpenConfirmDialog,
  enableImageReupload,
  viewMode,
  previewDevice,
} = storeToRefs(uiStore)

const { toggleShowUploadImgDialog } = uiStore

// Editor refresh function
function editorRefresh() {
  themeStore.updateCodeTheme()

  const raw = editorStore.getContent()
  renderStore.render(raw)
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

const showEditor = computed(() => viewMode.value !== `preview`)

// 是否有侧面板打开（样式面板 / CSS编辑器）
const hasSidePanel = computed(() => !isMobile.value && (isOpenRightSlider.value || uiStore.isShowCssEditor))

// 编辑器面板尺寸配置
const editorPanelConfig = computed(() => {
  const mode = viewMode.value
  if (mode === `preview`) {
    return { min: 0, max: 0 }
  }
  if (mode === `edit`) {
    return hasSidePanel.value ? { min: 30, max: 85 } : { min: 100, max: 100 }
  }
  // split
  if (isMobile.value)
    return { min: 30, max: 70 }
  return { min: 15, max: 85 }
})

// 预览面板尺寸配置
const previewPanelConfig = computed(() => {
  const mode = viewMode.value
  if (mode === `edit`) {
    return { min: 0, max: 0 }
  }
  if (mode === `preview`) {
    return hasSidePanel.value ? { min: 20, max: 75 } : { min: 100, max: 100 }
  }
  // split
  if (isMobile.value)
    return { min: 30, max: 70 }
  return { min: 15, max: 85 }
})

// 编辑器/预览面板引用（用于 collapse/expand）
const editorPanelRef = ref<InstanceType<typeof ResizablePanel> | null>(null)
const previewPanelRef = ref<InstanceType<typeof ResizablePanel> | null>(null)

// 监听 viewMode 变化，编程式调整面板大小
watch(viewMode, (mode) => {
  nextTick(() => {
    if (mode === `edit`) {
      // 编辑模式：编辑器占满，预览折叠
      editorPanelRef.value?.resize(hasSidePanel.value ? 60 : 100)
      previewPanelRef.value?.resize(0)
    }
    else if (mode === `preview`) {
      // 预览模式：预览占满，编辑器折叠
      editorPanelRef.value?.resize(0)
      previewPanelRef.value?.resize(hasSidePanel.value ? 60 : 100)
    }
    else {
      // 双屏模式：各占一半
      editorPanelRef.value?.resize(50)
      previewPanelRef.value?.resize(50)
    }
  })
})

// 监听侧面板变化，在单屏模式下需重新分配空间
watch(hasSidePanel, (has) => {
  nextTick(() => {
    const mode = viewMode.value
    if (mode === `edit`) {
      editorPanelRef.value?.resize(has ? 60 : 100)
    }
    else if (mode === `preview`) {
      previewPanelRef.value?.resize(has ? 60 : 100)
    }
  })
})

// 预览区域宽度样式（受设备切换影响）
const effectivePreviewWidth = computed(() => {
  if (isMobile.value)
    return `w-full`
  return previewDevice.value === `mobile` ? `w-[375px]` : `w-full`
})

// AI 工具箱已移到侧边栏

const previewRef = useTemplateRef<HTMLDivElement>(`previewRef`)

const codeMirrorView = ref<EditorView | null>(null)
const themeCompartment = new Compartment()
const cursorSyncTimer = ref<NodeJS.Timeout>()
const skipCursorDrivenPreviewSync = ref(false)

function normalizeText(text: string) {
  return text
    .replace(/\s+/g, ` `)
    .trim()
}

function parseMarkdownHeadingLine(line: string): { level: number, title: string } | null {
  if (!line.startsWith(`#`)) {
    return null
  }

  let level = 0
  while (level < line.length && line[level] === `#` && level < 6) {
    level++
  }

  if (level === 0 || line[level] !== ` `) {
    return null
  }

  const title = normalizeText(line.slice(level + 1).replace(/#+\s*$/, ``))
  if (!title) {
    return null
  }

  return { level, title }
}

function scrollPreviewToElement(el: HTMLElement, behavior: ScrollBehavior = `auto`) {
  const container = previewRef.value
  if (!container)
    return

  const cRect = container.getBoundingClientRect()
  const eRect = el.getBoundingClientRect()
  const inView = eRect.top >= cRect.top + 32 && eRect.bottom <= cRect.bottom - 32

  if (!inView) {
    el.scrollIntoView({ behavior, block: `center` })
  }
}

function findHeadingElementInPreview(title: string, level?: number) {
  const headings = document.querySelectorAll<HTMLElement>(`#output [data-heading]`)
  const normalizedTitle = normalizeText(title)

  for (const heading of headings) {
    if (level && Number(heading.tagName.slice(1)) !== level)
      continue
    if (normalizeText(heading.textContent || ``) === normalizedTitle) {
      return heading
    }
  }

  for (const heading of headings) {
    if (level && Number(heading.tagName.slice(1)) !== level)
      continue
    if (normalizeText(heading.textContent || ``).includes(normalizedTitle)) {
      return heading
    }
  }
}

function findHeadingPosInEditor(title: string, level?: number) {
  const view = codeMirrorView.value
  if (!view)
    return null

  const doc = view.state.doc
  const normalizedTitle = normalizeText(title)

  for (let lineNo = 1; lineNo <= doc.lines; lineNo++) {
    const line = doc.line(lineNo)
    const parsed = parseMarkdownHeadingLine(line.text)
    if (!parsed)
      continue

    if (level && parsed.level !== level)
      continue

    const headingTitle = parsed.title
    if (headingTitle === normalizedTitle || headingTitle.includes(normalizedTitle) || normalizedTitle.includes(headingTitle)) {
      return line.from
    }
  }

  return null
}

function findTextPosInEditor(text: string) {
  const view = codeMirrorView.value
  if (!view)
    return null

  const docText = view.state.doc.toString()
  const normalized = normalizeText(text)
  if (!normalized)
    return null

  const candidates = [
    normalized,
    normalized.slice(0, 80),
    normalized.slice(0, 40),
    normalized.slice(0, 20),
  ].filter(item => item.length >= 6)

  for (const candidate of candidates) {
    const pos = docText.indexOf(candidate)
    if (pos !== -1) {
      return pos
    }
  }

  return null
}

function focusEditorAtPos(pos: number) {
  const view = codeMirrorView.value
  if (!view)
    return

  skipCursorDrivenPreviewSync.value = true
  view.dispatch({
    selection: { anchor: pos },
    effects: EditorView.scrollIntoView(pos, { y: `center` }),
  })
  view.focus()

  setTimeout(() => {
    skipCursorDrivenPreviewSync.value = false
  }, 180)
}

function syncPreviewToEditorCursor() {
  if (skipCursorDrivenPreviewSync.value)
    return

  const view = codeMirrorView.value
  if (!view)
    return

  const cursorPos = view.state.selection.main.head
  const doc = view.state.doc
  const cursorLineNo = doc.lineAt(cursorPos).number

  // 优先按“最近标题”进行语义定位，避免图片/代码块造成的高度失真。
  for (let lineNo = cursorLineNo; lineNo >= 1; lineNo--) {
    const text = doc.line(lineNo).text
    const parsed = parseMarkdownHeadingLine(text)
    if (!parsed)
      continue

    const headingEl = findHeadingElementInPreview(parsed.title, parsed.level)
    if (headingEl) {
      scrollPreviewToElement(headingEl)
      return
    }
  }

  // 无可用语义锚点时，退化为轻量比例定位。
  const container = previewRef.value
  if (!container)
    return
  const maxScrollTop = container.scrollHeight - container.offsetHeight
  const ratio = doc.length > 0 ? cursorPos / doc.length : 0
  container.scrollTo({ top: Math.max(0, maxScrollTop * ratio), behavior: `auto` })
}

function scheduleSyncPreviewToEditorCursor() {
  clearTimeout(cursorSyncTimer.value)
  cursorSyncTimer.value = setTimeout(() => {
    syncPreviewToEditorCursor()
  }, 100)
}

function syncEditorToPreviewElement(el: HTMLElement) {
  const tag = el.tagName.toLowerCase()
  let pos: number | null = null

  if (/^h[1-6]$/.test(tag)) {
    const level = Number(tag.slice(1))
    const title = normalizeText(el.textContent || ``)
    pos = findHeadingPosInEditor(title, level)
  }
  else if (tag === `img`) {
    const img = el as HTMLImageElement
    const alt = normalizeText(img.alt || ``)
    pos = alt ? findTextPosInEditor(alt) : null
    if (pos == null && img.src) {
      pos = findTextPosInEditor(img.src)
    }
  }
  else {
    const text = normalizeText(el.textContent || ``)
    pos = findTextPosInEditor(text)
  }

  if (pos != null) {
    focusEditorAtPos(pos)
  }
}

function handlePreviewContentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target)
    return

  const block = target.closest(`h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,td,th,img`) as HTMLElement | null
  if (!block)
    return

  syncEditorToPreviewElement(block)
}

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

function openReplaceWithSelection(view: EditorView) {
  const selection = view.state.selection.main
  const selected = view.state.doc.sliceString(selection.from, selection.to).trim()

  if (searchTabRef.value) {
    // SearchTab 已准备好，直接使用
    searchTabRef.value.setSearchWithReplace(selected)
  }
  else {
    // SearchTab 还没准备好，通过 UI Store 触发
    uiStore.openSearchTab(selected, true)
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

// 监听 UI Store 中的搜索请求
const { searchTabRequest } = storeToRefs(uiStore)
watch(searchTabRequest, (request) => {
  if (request && searchTabRef.value) {
    const { word, showReplace } = request

    // 根据是否需要替换功能，调用不同的方法
    if (showReplace) {
      searchTabRef.value.setSearchWithReplace(word)
    }
    else {
      if (word) {
        searchTabRef.value.setSearchWord(word)
      }
      else {
        searchTabRef.value.showSearchTab = true
      }
    }

    // 清除请求
    uiStore.clearSearchTabRequest()
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
        onReplace: openReplaceWithSelection,
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

        if (update.selectionSet || update.docChanged) {
          scheduleSyncPreviewToEditorCursor()
        }
      }),
      EditorView.domEventHandlers({
        paste: (event, view) => {
          // 1. 处理剪贴板中的文件 (截图/复制文件)
          if (event.clipboardData?.items && [...event.clipboardData.items].some(item => item.kind === 'file')) {
            if (isImgLoading.value) {
              return true
            }
            Promise.all(
              Array.from(event.clipboardData.items, item => item.getAsFile())
                .filter(item => item != null)
                .map(async item => (await beforeImageUpload(item!)) ? item : null),
            ).then((items) => {
              const validItems = items.filter(item => item != null) as File[]
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

              const processFiles = async () => {
                for (const item of validItems) {
                  await uploadImage(item)
                }
                clearInterval(intervalId)
                progressValue.value = 100
                setTimeout(() => {
                  progressValue.value = 0
                }, 1000)
              }
              processFiles()
            })
            return true
          }

          // 2. 处理剪贴板中的文本 (检测 Markdown 图片链接)
          const text = event.clipboardData?.getData('text/plain')
          if (text) {
            // 匹配 ![alt](url) 格式
            const mdImgRegex = /!\[(.*?)\]\((https?:\/\/[^)]+)\)/g
            const matches = [...text.matchAll(mdImgRegex)]

            if (matches.length > 0) {
              isImgLoading.value = true

              // 2.1 插入带有唯一 ID 的占位文本
              let previewText = text
              const placeholderMap = new Map<string, { originalUrl: string, originalAlt: string }>()

              // 使用 replace 来生成唯一的占位符
              let matchIndex = 0
              previewText = previewText.replace(mdImgRegex, (_, alt, url) => {
                const id = `LOADING_${Date.now()}_${matchIndex++}`
                placeholderMap.set(id, { originalUrl: url, originalAlt: alt })
                return `![⏳ 转存中...](${id})`
              })

              // 插入占位文本到编辑器
              view.dispatch(view.state.replaceSelection(previewText))

              // 2.2 提取唯一 URL 进行并发转存
              const uniqueUrls = [...new Set(matches.map(m => m[2]))]

              // 并发处理
              Promise.all(uniqueUrls.map(async (url) => {
                try {
                  // 根据开关决定是否转存
                  const newUrl = enableImageReupload.value ? await upload(url) : url

                  // 2.3 转存成功后（或直接使用原URL），精确替换编辑器中的对应内容
                  // 遍历 map，找到所有 originalUrl 为当前 url 的占位符 ID
                  for (const [id, info] of placeholderMap.entries()) {
                    if (info.originalUrl === url) {
                      // 查找该 ID 在文档中的位置
                      const searchStr = `![⏳ 转存中...](${id})`
                      const currentDoc = view.state.doc.toString()
                      const pos = currentDoc.indexOf(searchStr)

                      if (pos !== -1) {
                        const newText = `![${info.originalAlt}](${newUrl})`
                        view.dispatch({
                          changes: { from: pos, to: pos + searchStr.length, insert: newText },
                        })
                      }
                    }
                  }
                }
                catch (e) {
                  console.error(`转存失败: ${url}`, e)
                  // 失败时，将占位符恢复为原样
                  for (const [id, info] of placeholderMap.entries()) {
                    if (info.originalUrl === url) {
                      const searchStr = `![⏳ 转存中...](${id})`
                      const currentDoc = view.state.doc.toString()
                      const pos = currentDoc.indexOf(searchStr)

                      if (pos !== -1) {
                        const newText = `![${info.originalAlt}](${info.originalUrl})`
                        view.dispatch({
                          changes: { from: pos, to: pos + searchStr.length, insert: newText },
                        })
                      }
                    }
                  }
                  toast.error(`图片转存失败，已保留原链接`)
                }
              })).finally(() => {
                isImgLoading.value = false
              })

              return true
            }
          }
          return false
        },
      }),
    ],
  })

  // 创建编辑器视图
  const view = new EditorView({
    state,
    parent: dom,
  })

  codeMirrorView.value = view

  // 返回编辑器 view
  return view
}

// 初始化编辑器
onMounted(() => {
  const editorDom = editorRef.value

  if (editorDom == null) {
    return
  }

  // 初始化渲染器（新主题系统）
  renderStore.initRendererInstance({
    isMacCodeBlock: themeStore.isMacCodeBlock,
    isShowLineNumber: themeStore.isShowLineNumber,
  })

  // 应用主题样式（新主题系统）
  themeStore.applyCurrentTheme()

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
  // 重新渲染 markdown 以更新 infographic 等扩展的主题
  editorRefresh()
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
  clearTimeout(changeTimer.value)
  clearTimeout(cursorSyncTimer.value)

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
        class="container-main-section border-radius-10 relative flex flex-1 overflow-hidden border-x border-b"
      >
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            :default-size="isMobile ? 0 : 15"
            :max-size="!isMobile && isOpenPostSlider ? 20 : 0"
            :min-size="!isMobile && isOpenPostSlider ? 10 : 0"
          >
            <PostSlider />
          </ResizablePanel>
          <ResizableHandle class="hidden md:block" />
          <ResizablePanel
            :default-size="isOpenFolderPanel ? 15 : 0"
            :max-size="isOpenFolderPanel ? 25 : 0"
            :min-size="isOpenFolderPanel ? 10 : 0"
          >
            <FolderSourcePanel />
          </ResizablePanel>
          <ResizableHandle v-if="isOpenFolderPanel" class="hidden md:block" />

          <!-- 主内容区域 (嵌套灵动布局) -->
          <ResizablePanel :min-size="30">
            <ResizablePanelGroup direction="horizontal">
              <!-- Markdown 编辑器 -->
              <ResizablePanel
                ref="editorPanelRef"
                :order="1"
                :default-size="viewMode === 'preview' ? 0 : viewMode === 'edit' ? 100 : 50"
                :min-size="editorPanelConfig.min"
                :max-size="editorPanelConfig.max"
                collapsible
                :collapsed-size="0"
              >
                <div
                  v-show="viewMode !== 'preview'"
                  ref="codeMirrorWrapper"
                  class="codeMirror-wrapper relative h-full"
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
              </ResizablePanel>
              <ResizableHandle v-show="viewMode === 'split'" />

              <!-- 预览区 -->
              <ResizablePanel
                ref="previewPanelRef"
                :order="2"
                :default-size="viewMode === 'edit' ? 0 : viewMode === 'preview' ? 100 : 50"
                :min-size="previewPanelConfig.min"
                :max-size="previewPanelConfig.max"
                collapsible
                :collapsed-size="0"
              >
                <div v-show="viewMode !== 'edit'" class="relative h-full overflow-x-hidden">
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
                          effectivePreviewWidth,
                          effectivePreviewWidth === 'w-[375px]' ? 'max-w-full' : '',
                        ]"
                      >
                        <section id="output" class="w-full" @click="handlePreviewContentClick" v-html="output" />
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
                </div>
              </ResizablePanel>

              <!-- CSS 编辑器面板 -->
              <ResizableHandle v-if="!isMobile && uiStore.isShowCssEditor" class="hidden md:block" />
              <ResizablePanel
                v-if="!isMobile && uiStore.isShowCssEditor"
                :order="3"
                :default-size="25"
                :min-size="10"
                :max-size="60"
              >
                <CssEditor />
              </ResizablePanel>

              <!-- 样式面板 -->
              <ResizableHandle v-if="!isMobile && isOpenRightSlider" class="hidden md:block" />
              <ResizablePanel
                v-if="!isMobile && isOpenRightSlider"
                :order="4"
                :default-size="40"
                :min-size="25"
                :max-size="60"
              >
                <RightSlider />
              </ResizablePanel>
            </ResizablePanelGroup>

            <!-- 移动端：CssEditor 和 RightSlider 作为浮层 -->
            <template v-if="isMobile">
              <CssEditor />
              <RightSlider />
            </template>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <!-- AI工具箱已移到侧边栏，这里不再显示 -->

      <UploadImgDialog @upload-image="uploadImage" />

      <InsertFormDialog />

      <InsertMpCardDialog />

      <ImportMarkdownDialog />

      <TemplateDialog />

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
              确定
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

.preview-wrapper {
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.codeMirror-wrapper {
  overflow-x: hidden;
  height: 100%;
  position: relative;
}
</style>
