<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { markdownSetup, theme } from '@md/shared/editor'
import imageCompression from 'browser-image-compression'
import { SidebarAIToolbar } from '@/components/ai'
import { SearchTab } from '@/components/ui/search-tab'
import { useImageUploader } from '@/composables/useImageUploader'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { checkImage, toBase64 } from '@/utils'
import { fileUpload } from '@/utils/file'
import { store } from '@/utils/storage'

const props = defineProps<{
  skipCursorDrivenPreviewSync: boolean
  onCursorActivity: () => void
}>()

const editorStore = useEditorStore()
const postStore = usePostStore()
const renderStore = useRenderStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()
const { upload } = useImageUploader()

const { editor } = storeToRefs(editorStore)
const { isDark } = storeToRefs(uiStore)
const { posts, currentPostIndex } = storeToRefs(postStore)
const {
  isMobile,
  enableImageReupload,
  viewMode,
} = storeToRefs(uiStore)

const { toggleShowUploadImgDialog } = uiStore

const showEditor = computed(() => viewMode.value !== `preview`)

const codeMirrorView = shallowRef<EditorView | null>(null)
const themeCompartment = new Compartment()
const changeTimer = ref<ReturnType<typeof setTimeout>>()

const editorRef = useTemplateRef<HTMLDivElement>(`editorRef`)
const codeMirrorWrapper = useTemplateRef<ComponentPublicInstance<HTMLDivElement>>(`codeMirrorWrapper`)

const progressValue = ref(0)
const isImgLoading = ref(false)

// Editor refresh function
function editorRefresh() {
  themeStore.updateCodeTheme()
  const raw = editorStore.getContent()
  renderStore.render(raw)
}

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
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    toast.error(checkResult.msg)
    return false
  }

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

function uploaded(imageUrl: string) {
  if (!imageUrl) {
    toast.error(`上传图片未知异常`)
    return
  }
  setTimeout(() => {
    toggleShowUploadImgDialog(false)
  }, 1000)
  const markdownImage = `![](${imageUrl})`
  if (codeMirrorView.value) {
    codeMirrorView.value.dispatch(codeMirrorView.value.state.replaceSelection(`\n${markdownImage}\n`))
  }
  toast.success(`图片上传成功`)
}

async function compressImage(file: File) {
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
          return `![⏳ 转存中...](${id})`
        })

        view.dispatch(view.state.replaceSelection(previewText))

        const uniqueUrls = [...new Set(matches.map(m => m[2]))]

        Promise.all(uniqueUrls.map(async (url) => {
          try {
            const newUrl = enableImageReupload.value ? await upload(url) : url

            for (const [id, info] of placeholderMap.entries()) {
              if (info.originalUrl === url) {
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
          props.onCursorActivity()
        }
      }),
      EditorView.domEventHandlers({
        paste: createPasteHandler(),
      }),
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
onMounted(() => {
  const editorDom = editorRef.value
  if (editorDom == null) {
    return
  }

  renderStore.initRendererInstance({
    isMacCodeBlock: themeStore.isMacCodeBlock,
    isShowLineNumber: themeStore.isShowLineNumber,
  })

  themeStore.applyCurrentTheme()

  nextTick(() => {
    const editorView = createFormTextArea(editorDom)
    editor.value = editorView

    editorRefresh()
    mdLocalToRemote()
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

watch(currentPostIndex, () => {
  if (!codeMirrorView.value)
    return

  const currentPost = posts.value[currentPostIndex.value]
  if (!currentPost)
    return

  const currentContent = codeMirrorView.value.state.doc.toString()
  if (currentContent !== currentPost.content) {
    codeMirrorView.value.dispatch({
      changes: {
        from: 0,
        to: codeMirrorView.value.state.doc.length,
        insert: currentPost.content,
      },
    })
    editorRefresh()
  }
})

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
      datetime: new Date().toLocaleString(`zh-CN`),
    })

    currentPost.history.length = Math.min(currentPost.history.length, 10)
  }, 30 * 1000)
})

onUnmounted(() => {
  clearTimeout(historyTimer.value)
  clearTimeout(changeTimer.value)
  document.removeEventListener(`keydown`, handleGlobalKeydown)
})

defineExpose({
  codeMirrorView,
  editorRefresh,
  uploadImage,
  progressValue,
})
</script>

<template>
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
