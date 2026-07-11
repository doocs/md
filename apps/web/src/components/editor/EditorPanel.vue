<script setup lang="ts">
import { Compartment, EditorState, Prec } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { history, markdownSetup, replaceDocumentWithoutHistory, resetEditorHistory, theme } from '@md/shared/editor'
import { toBase64 } from '@md/shared/utils/fileHelpers'
import { defineAsyncComponent } from 'vue'
import SlashCommandMenu from '@/components/editor/SlashCommandMenu.vue'
import { SearchTab } from '@/components/ui/search-tab'
import { useEditorRefresh } from '@/composables/useEditorRefresh'
import { useImageUploader } from '@/composables/useImageUploader'
import { completeInitialPreviewBoot } from '@/composables/useInitialPreviewBoot'
import { useLocalizedUploadHostOptions } from '@/composables/useLocalizedUploadHosts'
import { useSlashCommand } from '@/composables/useSlashCommand'
import { formatLocalDateTime } from '@/i18n/translate'
import { jumpToAdjacentHeading } from '@/lib/markdown/headingNavigation'
import { contentHasMath, loadMathJax, MATHJAX_READY_EVENT } from '@/lib/preview/mathjax'
import { validateImageFile } from '@/lib/upload/validate-image'
import { fileUpload } from '@/services/upload'
import { store } from '@/storage'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const SidebarAIToolbar = defineAsyncComponent(() => import('@/components/ai/SidebarAIToolbar.vue'))

const { t, locale } = useI18n()
const uploadHostOptions = useLocalizedUploadHostOptions()
const editorStore = useEditorStore()
const postStore = usePostStore()
const renderStore = useRenderStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()
const { upload } = useImageUploader()
const { editorRefresh, scheduleEditorRefresh } = useEditorRefresh()

const {
  visible: slashVisible,
  position: slashPosition,
  filter: slashFilter,
  activeIndex: slashActiveIndex,
  basicCommands: slashBasicCommands,
  commonCommands: slashCommonCommands,
  editCommands: slashEditCommands,
  styleCommands: slashStyleCommands,
  filteredCommands: slashFilteredCommands,
  closeMenu: closeSlashMenu,
  executeCommand: executeSlashCommand,
  createExtension: createSlashExtension,
} = useSlashCommand()

function onWrapperContextMenuCapture(e: MouseEvent) {
  if (!slashVisible.value)
    return
  e.preventDefault()
  e.stopPropagation()
}

const { editor } = storeToRefs(editorStore)
const { isDark } = storeToRefs(uiStore)
const { posts, currentPostIndex, currentPost } = storeToRefs(postStore)
const {
  isMobile,
  enableImageReupload,
  viewMode,
} = storeToRefs(uiStore)

const { toggleShowUploadImgDialog } = uiStore

const showEditor = computed(() => viewMode.value !== `preview`)

const codeMirrorView = shallowRef<EditorView | null>(null)
const themeCompartment = new Compartment()
const placeholderCompartment = new Compartment()
const historyCompartment = new Compartment()

function editorPlaceholder() {
  return placeholder(t(`codemirror.contentPlaceholder`))
}
const persistTimer = ref<ReturnType<typeof setTimeout>>()

const editorRef = useTemplateRef<HTMLDivElement>(`editorRef`)
const codeMirrorWrapper = useTemplateRef<HTMLDivElement>(`codeMirrorWrapper`)

const isImgLoading = ref(false)

// Editor refresh is provided by useEditorRefresh()

// --- Search tab integration ---
const searchTabRef = useTemplateRef<InstanceType<typeof SearchTab>>(`searchTabRef`)
const pendingSearchRequest = ref<{ selected: string } | null>(null)

function openSearchWithSelection(view: EditorView) {
  const selection = view.state.selection.main
  const selected = view.state.doc.sliceString(selection.from, selection.to).trim()

  if (searchTabRef.value) {
    if (selected) {
      searchTabRef.value.setSearchWord(selected)
    }
    else {
      searchTabRef.value.showSearchTab = true
    }
  }
  else {
    pendingSearchRequest.value = { selected }
  }
}

function openReplaceWithSelection(view: EditorView) {
  const selection = view.state.selection.main
  const selected = view.state.doc.sliceString(selection.from, selection.to).trim()

  if (searchTabRef.value) {
    searchTabRef.value.setSearchWithReplace(selected)
  }
  else {
    uiStore.openSearchTab(selected, true)
  }
}

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

const { searchTabRequest } = storeToRefs(uiStore)
watch(searchTabRequest, (request) => {
  if (request && searchTabRef.value) {
    const { word, showReplace } = request
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
    uiStore.clearSearchTabRequest()
  }
})

function handleGlobalKeydown(e: KeyboardEvent) {
  const editorView = codeMirrorView.value
  if (e.key === `Escape` && searchTabRef.value?.showSearchTab) {
    searchTabRef.value.showSearchTab = false
    e.preventDefault()
    editorView?.focus()
  }
}

// --- Image upload ---
async function beforeImageUpload(file: File) {
  const checkResult = validateImageFile(file, t)
  if (!checkResult.ok) {
    toast.error(checkResult.msg)
    return false
  }

  const imgHost = (await store.get(`imgHost`)) || `default`
  await store.set(`imgHost`, imgHost)

  const config = await store.get(`${imgHost}Config`)
  const isValidHost = imgHost === `default` || config
  if (!isValidHost) {
    const hostLabel = uploadHostOptions.value.find(option => option.value === imgHost)?.label ?? imgHost
    toast.error(t('editorPanel.configureImgHost', { host: hostLabel }))
    toggleShowUploadImgDialog(true)
    return false
  }

  return true
}

function uploaded(imageUrl: string) {
  if (!imageUrl) {
    toast.error(t('editorPanel.uploadUnknownError'))
    return
  }
  setTimeout(() => {
    toggleShowUploadImgDialog(false)
  }, 1000)
  const markdownImage = `![](${imageUrl})`
  if (codeMirrorView.value) {
    codeMirrorView.value.dispatch(codeMirrorView.value.state.replaceSelection(`\n${markdownImage}\n`))
  }
  toast.success(t('editorPanel.uploadSuccess'))
}

async function compressImage(file: File) {
  const { default: imageCompression } = await import(`browser-image-compression`)
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }
  return await imageCompression(file, options)
}

async function uploadImage(
  file: File,
  cb?: { (url: any, data: string): void, (arg0: unknown): void } | undefined,
  applyUrl?: boolean,
) {
  try {
    isImgLoading.value = true
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
    if (cb)
      cb(``, ``)
  }
  finally {
    isImgLoading.value = false
  }
}

// --- Drag & drop folder ---
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

async function uploadMdImg({
  md,
  list,
}: {
  md: { str: string, path: string, file: File }
  list: { path: string, file: File }[]
}) {
  const mdImgList = [...(md.str.matchAll(/!\[(.*?)\]\((.*?)\)/g) || [])].filter(item => item)
  const root = md.path.match(/.+?\//)![0]
  const resList = await Promise.all<{ matchStr: string, url: string }>(
    mdImgList.map((item) => {
      return new Promise((resolve) => {
        let [, , matchStr] = item
        matchStr = matchStr.replace(/^.\//, ``)
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
            if (await beforeImageUpload(file)) {
              uploadImage(file)
            }
          }
        })
    }
  }
}

// --- Image paste handler for CodeMirror ---
function createPasteHandler() {
  return (event: ClipboardEvent, view: EditorView) => {
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
        const processFiles = async () => {
          for (const item of validItems)
            await uploadImage(item)
        }
        void processFiles()
      })
      return true
    }

    // 2. 处理剪贴板中的文本 (检测 Markdown 图片链接)
    const text = event.clipboardData?.getData('text/plain')
    if (text) {
      const mdImgRegex = /!\[(.*?)\]\((https?:\/\/[^)]+)\)/g
      const matches = [...text.matchAll(mdImgRegex)]

      if (matches.length > 0) {
        isImgLoading.value = true

        let previewText = text
        const placeholderMap = new Map<string, { originalUrl: string, originalAlt: string }>()

        let matchIndex = 0
        previewText = previewText.replace(mdImgRegex, (_, alt, url) => {
          const id = `LOADING_${Date.now()}_${matchIndex++}`
          placeholderMap.set(id, { originalUrl: url, originalAlt: alt })
          return `![${t('editorPanel.reuploading')}](${id})`
        })

        view.dispatch(view.state.replaceSelection(previewText))

        const uniqueUrls = [...new Set(matches.map(m => m[2]))]

        Promise.all(uniqueUrls.map(async (url) => {
          try {
            const newUrl = enableImageReupload.value ? await upload(url) : url

            for (const [id, info] of placeholderMap.entries()) {
              if (info.originalUrl === url) {
                const searchStr = `![${t('editorPanel.reuploading')}](${id})`
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
            for (const [id, info] of placeholderMap.entries()) {
              if (info.originalUrl === url) {
                const searchStr = `![${t('editorPanel.reuploading')}](${id})`
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
            toast.error(t('editorPanel.reuploadFailed'))
          }
        })).finally(() => {
          isImgLoading.value = false
        })

        return true
      }
    }
    return false
  }
}

// --- CodeMirror creation ---
function createFormTextArea(dom: HTMLDivElement) {
  const state = EditorState.create({
    doc: posts.value[currentPostIndex.value].content,
    extensions: [
      markdownSetup({
        onSearch: openSearchWithSelection,
        onReplace: openReplaceWithSelection,
        onGoToLine: () => uiStore.requestGoToLine(),
        withoutHistory: true,
      }),
      historyCompartment.of(history()),
      Prec.high(keymap.of([
        { key: `Mod-Alt-ArrowUp`, run: view => jumpToAdjacentHeading(view, `prev`) },
        { key: `Mod-Alt-ArrowDown`, run: view => jumpToAdjacentHeading(view, `next`) },
      ])),
      placeholderCompartment.of(editorPlaceholder()),
      themeCompartment.of(theme(isDark.value)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          scheduleEditorRefresh()
          clearTimeout(persistTimer.value)
          persistTimer.value = setTimeout(() => {
            commitEditorContentToPost()
          }, 300)
        }
      }),
      EditorView.domEventHandlers({
        paste: createPasteHandler(),
      }),
      ...createSlashExtension(() => codeMirrorView.value),
    ],
  })

  const view = new EditorView({
    state,
    parent: dom,
  })

  codeMirrorView.value = view
  return view
}

// --- Lifecycle ---
function handleMathJaxReady() {
  editorRefresh()
}

async function preloadMathJaxIfNeeded(content: string) {
  if (!contentHasMath(content))
    return

  try {
    await loadMathJax()
  }
  catch (error) {
    console.error(error)
  }
}

let postSwitchGeneration = 0

function flushEditorContentToPostAtIndex(index: number) {
  clearTimeout(persistTimer.value)
  persistTimer.value = undefined
  if (!codeMirrorView.value || index < 0)
    return

  const value = codeMirrorView.value.state.doc.toString()
  const post = posts.value[index]
  if (!post || value === post.content)
    return

  post.updateDatetime = new Date()
  post.content = value
}

function commitEditorContentToPost() {
  flushEditorContentToPostAtIndex(currentPostIndex.value)
}

onMounted(() => {
  const editorDom = editorRef.value
  if (editorDom == null) {
    void completeInitialPreviewBoot()
    return
  }

  window.addEventListener(MATHJAX_READY_EVENT, handleMathJaxReady)

  renderStore.initRendererInstance({
    isMacCodeBlock: themeStore.isMacCodeBlock,
    isShowLineNumber: themeStore.isShowLineNumber,
  })

  themeStore.applyCurrentTheme()

  void nextTick(async () => {
    const editorView = createFormTextArea(editorDom)
    editor.value = editorView
    editorStore.registerContentFlush(commitEditorContentToPost)

    const content = posts.value[currentPostIndex.value]?.content ?? ``
    await preloadMathJaxIfNeeded(content)

    editorRefresh()
    mdLocalToRemote()
    void completeInitialPreviewBoot()
  })

  document.addEventListener(`keydown`, handleGlobalKeydown, { passive: false, capture: false })
})

watch(isDark, () => {
  if (codeMirrorView.value) {
    codeMirrorView.value.dispatch({
      effects: themeCompartment.reconfigure(theme(isDark.value)),
    })
  }
  editorRefresh()
})

watch(locale, () => {
  if (!codeMirrorView.value)
    return
  codeMirrorView.value.dispatch({
    effects: placeholderCompartment.reconfigure(editorPlaceholder()),
  })
  editorRefresh()
})

function syncEditorToPostContent(content: string) {
  const view = codeMirrorView.value
  if (!view)
    return

  const currentContent = view.state.doc.toString()
  if (currentContent === content)
    return

  const generation = ++postSwitchGeneration
  replaceDocumentWithoutHistory(view, content)
  resetEditorHistory(view, historyCompartment)
  void preloadMathJaxIfNeeded(content).then(() => {
    if (generation !== postSwitchGeneration)
      return
    editorRefresh()
  })
}

watch(currentPostIndex, (newIndex, oldIndex) => {
  if (oldIndex !== undefined && oldIndex >= 0)
    flushEditorContentToPostAtIndex(oldIndex)

  const post = posts.value[newIndex]
  if (!post)
    return
  syncEditorToPostContent(post.content)
})

/** 云端同步等外部写入 posts 时，当前文章 index 不变也需刷新编辑器 */
watch(
  () => currentPost.value?.content,
  (content) => {
    if (content == null)
      return
    syncEditorToPostContent(content)
  },
)

// 历史记录的定时器
const historyTimer = ref<ReturnType<typeof setTimeout>>()
onMounted(() => {
  historyTimer.value = setInterval(() => {
    const currentPost = posts.value[currentPostIndex.value]

    const pre = (currentPost.history || [])[0]?.content
    if (pre === currentPost.content) {
      return
    }

    currentPost.history ??= []
    currentPost.history.unshift({
      content: currentPost.content,
      datetime: formatLocalDateTime(),
    })

    currentPost.history.length = Math.min(currentPost.history.length, 10)
  }, 30 * 1000)
})

onUnmounted(() => {
  editorStore.unregisterContentFlush()
  window.removeEventListener(MATHJAX_READY_EVENT, handleMathJaxReady)
  clearTimeout(historyTimer.value)
  clearTimeout(persistTimer.value)
  document.removeEventListener(`keydown`, handleGlobalKeydown, { capture: false })
})

defineExpose({
  codeMirrorView,
  editorRefresh,
  uploadImage,
  isImgLoading,
})
</script>

<template>
  <div
    v-show="viewMode !== 'preview'"
    ref="codeMirrorWrapper"
    class="codeMirror-wrapper relative h-full"
    @contextmenu.capture="onWrapperContextMenuCapture"
  >
    <SearchTab v-if="codeMirrorView" ref="searchTabRef" :editor-view="codeMirrorView as any" />
    <SlashCommandMenu
      :visible="slashVisible"
      :position="slashPosition"
      :active-index="slashActiveIndex"
      :filter="slashFilter"
      :container-el="codeMirrorWrapper"
      :basic-commands="slashBasicCommands"
      :common-commands="slashCommonCommands"
      :edit-commands="slashEditCommands"
      :style-commands="slashStyleCommands"
      :filtered-commands="slashFilteredCommands"
      @execute="(cmd) => codeMirrorView && executeSlashCommand(codeMirrorView, cmd)"
      @close="closeSlashMenu()"
    />
    <SidebarAIToolbar
      :is-mobile="isMobile"
      :show-editor="showEditor"
    />

    <EditorContextMenu>
      <div
        id="editor"
        ref="editorRef"
        class="codemirror-container mathjax-ignore"
      />
    </EditorContextMenu>
  </div>
</template>

<style lang="less" scoped>
@import url('../../assets/less/app.less');
</style>

<style lang="less" scoped>
.codeMirror-wrapper {
  overflow-x: hidden;
  height: 100%;
  position: relative;
}
</style>
