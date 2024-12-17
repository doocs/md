<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import CssEditor from '@/components/CodemirrorEditor/CssEditor.vue'
import EditorHeader from '@/components/CodemirrorEditor/EditorHeader/index.vue'
import InsertFormDialog from '@/components/CodemirrorEditor/InsertFormDialog.vue'
import UploadImgDialog from '@/components/CodemirrorEditor/UploadImgDialog.vue'
import RunLoading from '@/components/RunLoading.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { altKey, altSign, ctrlKey, shiftKey, shiftSign } from '@/config'
import { useDisplayStore, useStore } from '@/stores'
import {
  checkImage,
  formatDoc,
  toBase64,
} from '@/utils'
import fileApi from '@/utils/file'
import CodeMirror from 'codemirror'
import { Plus, Trash } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref, toRaw, watch } from 'vue'
import { toast } from 'vue-sonner'

const store = useStore()
const displayStore = useDisplayStore()
const { isDark, output, editor } = storeToRefs(store)
const { isShowCssEditor } = storeToRefs(displayStore)

const {
  editorRefresh,
  exportEditorContent2HTML,
  exportEditorContent2MD,
  formatContent,
  importMarkdownContent,
  resetStyleConfirm,
} = store

const {
  toggleShowInsertFormDialog,
  toggleShowUploadImgDialog,
} = displayStore

const isImgLoading = ref(false)
const timeout = ref<NodeJS.Timeout>()

const preview = ref<HTMLDivElement | null>(null)

// 使浏览区与编辑区滚动条建立同步联系
function leftAndRightScroll() {
  const scrollCB = (text: string) => {
    let source: HTMLElement
    let target: HTMLElement

    clearTimeout(timeout.value)
    if (text === `preview`) {
      source = preview.value!
      target = document.querySelector<HTMLElement>(`.CodeMirror-scroll`)!

      editor.value!.off(`scroll`, editorScrollCB)
      timeout.value = setTimeout(() => {
        editor.value!.on(`scroll`, editorScrollCB)
      }, 300)
    }
    else {
      source = document.querySelector<HTMLElement>(`.CodeMirror-scroll`)!
      target = preview.value!

      target.removeEventListener(`scroll`, previewScrollCB, false)
      timeout.value = setTimeout(() => {
        target.addEventListener(`scroll`, previewScrollCB, false)
      }, 300)
    }

    const percentage
          = source.scrollTop / (source.scrollHeight - source.offsetHeight)
    const height = percentage * (target.scrollHeight - target.offsetHeight)

    target.scrollTo(0, height)
  }

  function editorScrollCB() {
    scrollCB(`editor`)
  }

  function previewScrollCB() {
    scrollCB(`preview`)
  }

  (preview.value!).addEventListener(`scroll`, previewScrollCB, false)
  editor.value!.on(`scroll`, editorScrollCB)
}

onMounted(() => {
  setTimeout(() => {
    leftAndRightScroll()
  }, 300)
})

// 更新编辑器
function onEditorRefresh() {
  editorRefresh()
}

const backLight = ref(false)
const isCoping = ref(false)

function startCopy() {
  isCoping.value = true
  backLight.value = true
}

// 拷贝结束
function endCopy() {
  backLight.value = false
  setTimeout(() => {
    isCoping.value = false
  }, 800)
}

function beforeUpload(file: File) {
  // validate image
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    toast.error(checkResult.msg!)
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
  toggleShowUploadImgDialog(false)
  // 上传成功，获取光标
  const cursor = editor.value!.getCursor()
  const markdownImage = `![](${imageUrl})`
  // 将 Markdown 形式的 URL 插入编辑框光标所在位置
  toRaw(store.editor!).replaceSelection(`\n${markdownImage}\n`, cursor as any)
  toast.success(`图片上传成功`)
}
function uploadImage(file: File, cb?: { (url: any): void, (arg0: unknown): void } | undefined) {
  isImgLoading.value = true

  toBase64(file)
    .then(base64Content => fileApi.fileUpload(base64Content, file))
    .then((url) => {
      if (cb) {
        cb(url)
      }
      else {
        uploaded(url)
      }
    })
    .catch((err) => {
      toast.error(err.message)
    })
    .finally(() => {
      isImgLoading.value = false
    })
}

const changeTimer = ref<NodeJS.Timeout>()

// 监听暗色模式并更新编辑器
watch(isDark, () => {
  const theme = isDark.value ? `darcula` : `xq-light`
  toRaw(editor.value)?.setOption?.(`theme`, theme)
})

// 初始化编辑器
function initEditor() {
  const editorDom = document.querySelector<HTMLTextAreaElement>(`#editor`)!

  if (!editorDom.value) {
    editorDom.value = store.posts[store.currentPostIndex].content
  }
  editor.value = CodeMirror.fromTextArea(editorDom, {
    mode: `text/x-markdown`,
    theme: isDark.value ? `darcula` : `xq-light`,
    lineNumbers: false,
    lineWrapping: true,
    styleActiveLine: true,
    autoCloseBrackets: true,
    extraKeys: {
      [`${shiftKey}-${altKey}-F`]: function autoFormat(editor) {
        formatDoc(editor.getValue()).then((doc) => {
          editor.setValue(doc)
        })
      },
      [`${ctrlKey}-B`]: function bold(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`**${selected}**`)
      },
      [`${ctrlKey}-I`]: function italic(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`*${selected}*`)
      },
      [`${ctrlKey}-D`]: function del(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`~~${selected}~~`)
      },
      [`${ctrlKey}-K`]: function italic(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`[${selected}]()`)
      },
      [`${ctrlKey}-E`]: function code(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`\`${selected}\``)
      },
      // 预备弃用
      [`${ctrlKey}-L`]: function code(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`\`${selected}\``)
      },
    },
  })

  editor.value.on(`change`, (e) => {
    clearTimeout(changeTimer.value)
    changeTimer.value = setTimeout(() => {
      onEditorRefresh()
      store.posts[store.currentPostIndex].content = e.getValue()
    }, 300)
  })

  // 粘贴上传图片并插入
  editor.value.on(`paste`, (_cm, e) => {
    if (!(e.clipboardData && e.clipboardData.items) || isImgLoading.value) {
      return
    }
    for (let i = 0, len = e.clipboardData.items.length; i < len; ++i) {
      const item = e.clipboardData.items[i]
      if (item.kind === `file`) {
        // 校验图床参数
        const pasteFile = item.getAsFile()!
        const isValid = beforeUpload(pasteFile)
        if (!isValid) {
          continue
        }
        uploadImage(pasteFile)
      }
    }
  })
}

const container = ref(null)

// 工具函数，添加格式
function addFormat(cmd: string | number) {
  (editor.value as any).options.extraKeys[cmd](editor.value)
}

const codeMirrorWrapper = ref<ComponentPublicInstance<HTMLDivElement> | null>(null)

// 转换 markdown 中的本地图片为线上图片
// todo 处理事件覆盖
function mdLocalToRemote() {
  const dom = codeMirrorWrapper.value!

  // 上传 md 中的图片
  const uploadMdImg = async ({ md, list }: { md: { str: string, path: string, file: File }, list: { path: string, file: File }[] }) => {
    const mdImgList = [
      ...(md.str.matchAll(/!\[(.*?)\]\((.*?)\)/g) || []),
    ].filter((item) => {
      return item // 获取所有相对地址的图片
    })
    const root = md.path.match(/.+?\//)![0]
    const resList = await Promise.all<{ matchStr: string, url: string }>(
      mdImgList.map((item) => {
        return new Promise((resolve) => {
          let [, , matchStr] = item
          matchStr = matchStr.replace(/^.\//, ``) // 处理 ./img/ 为 img/ 统一相对路径风格
          const { file }
                = list.find(f => f.path === `${root}${matchStr}`) || {}
          uploadImage(file!, (url) => {
            resolve({ matchStr, url })
          })
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

  dom.ondragover = evt => evt.preventDefault()
  dom.ondrop = async (evt: any) => {
    evt.preventDefault()
    for (const item of evt.dataTransfer.items) {
      item.getAsFileSystemHandle().then(async (handle: { kind: string, getFile: () => any }) => {
        if (handle.kind === `directory`) {
          const list = await showFileStructure(handle) as { path: string, file: File }[]
          const md = await getMd({ list })
          uploadMdImg({ md, list })
        }
        else {
          const file = await handle.getFile()
          console.log(`file`, file)
        }
      })
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
}

onMounted(() => {
  initEditor()
  onEditorRefresh()
  mdLocalToRemote()
})

const isOpen = ref(false)

const addPostInputVal = ref(``)

function addPost() {
  store.addPost(addPostInputVal.value)
  isOpen.value = false
  addPostInputVal.value = ``
}
</script>

<template>
  <div ref="container" class="container flex flex-col">
    <EditorHeader
      @add-format="addFormat"
      @format-content="formatContent"
      @start-copy="startCopy"
      @end-copy="endCopy"
    />
    <main class="container-main flex-1">
      <div class="container-main-section h-full flex border-1">
        <nav class="space-y-1 w-50 border-r bg-gray/20 p-2 dark:bg-gray/40">
          <Dialog v-model:open="isOpen">
            <DialogTrigger as-child>
              <Button variant="outline" class="w-full" size="xs">
                <Plus /> 新增文章
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增文章</DialogTitle>
                <DialogDescription>
                  请输入文章名称
                </DialogDescription>
              </DialogHeader>
              <Input v-model="addPostInputVal" />
              <DialogFooter>
                <Button @click="addPost()">
                  确 定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <a
            v-for="(post, index) in store.posts"
            :key="post.title"
            href="#"
            :class="{
              'bg-primary text-primary-foreground': store.currentPostIndex === index,
            }"
            class="hover:text-primary-foreground hover:bg-primary/90 dark:bg-muted dark:hover:bg-muted h-8 w-full inline-flex items-center justify-start gap-2 whitespace-nowrap rounded px-4 text-sm transition-colors dark:text-white dark:hover:text-white"
            @click="store.currentPostIndex = index"
          >
            <span>{{ post.title }}</span>
            <Trash v-if="index == store.currentPostIndex" class="ml-auto size-4" @click.stop="store.delPost(index)" />
          </a>
        </nav>
        <div
          ref="codeMirrorWrapper"
          class="codeMirror-wrapper flex-1 border-r-1"
          :class="{
            'order-1': !store.isEditOnLeft,
          }"
        >
          <ContextMenu>
            <ContextMenuTrigger>
              <textarea
                id="editor"
                type="textarea"
                placeholder="Your markdown text here."
              />
            </ContextMenuTrigger>
            <ContextMenuContent class="w-64">
              <ContextMenuItem inset @click="toggleShowUploadImgDialog()">
                上传图片
              </ContextMenuItem>
              <ContextMenuItem inset @click="toggleShowInsertFormDialog()">
                插入表格
              </ContextMenuItem>
              <ContextMenuItem inset @click="resetStyleConfirm()">
                恢复默认样式
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem inset @click="importMarkdownContent()">
                导入 .md 文档
              </ContextMenuItem>
              <ContextMenuItem inset @click="exportEditorContent2MD()">
                导出 .md 文档
              </ContextMenuItem>
              <ContextMenuItem inset @click="exportEditorContent2HTML()">
                导出 .html
              </ContextMenuItem>
              <ContextMenuItem inset @click="formatContent()">
                格式化
                <ContextMenuShortcut>{{ altSign }} + {{ shiftSign }} + F</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
        <div
          id="preview"
          ref="preview"
          :span="isShowCssEditor ? 8 : 12"
          class="preview-wrapper flex-1 p-5"
        >
          <div id="output-wrapper" :class="{ output_night: !backLight }">
            <div class="preview border shadow-xl">
              <section id="output" v-html="output" />
              <div v-if="isCoping" class="loading-mask">
                <div class="loading-mask-box">
                  <div class="loading__img" />
                  <span>正在生成</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CssEditor class="flex-1" />
      </div>
    </main>

    <UploadImgDialog
      @upload-image="uploadImage"
    />

    <InsertFormDialog />

    <RunLoading />

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
  padding: 20px;
  padding-top: 0;
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
  overflow-x: auto;
}
</style>
