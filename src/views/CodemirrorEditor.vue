<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import CodeMirror from 'codemirror'

import fileApi from '@/utils/file'
import { useStore } from '@/stores'

import EditorHeader from '@/components/CodemirrorEditor/EditorHeader/index.vue'
import InsertFormDialog from '@/components/CodemirrorEditor/InsertFormDialog.vue'
import RightClickMenu from '@/components/CodemirrorEditor/RightClickMenu.vue'
import UploadImgDialog from '@/components/CodemirrorEditor/UploadImgDialog.vue'
import CssEditor from '@/components/CodemirrorEditor/CssEditor.vue'
import RunLoading from '@/components/RunLoading.vue'

import {
  checkImage,
  formatDoc,
  toBase64,
} from '@/utils'

import 'codemirror/mode/javascript/javascript'

const defaultKeyMap = CodeMirror.keyMap.default
const modPrefix
  = defaultKeyMap === CodeMirror.keyMap.macDefault ? `Cmd` : `Ctrl`

const store = useStore()
const { output, editor, editorContent, isShowCssEditor } = storeToRefs(store)

const {
  editorRefresh,
  exportEditorContent2HTML,
  exportEditorContent2MD,
  formatContent,
  importMarkdownContent,
  resetStyleConfirm,
  toggleShowInsertFormDialog,
  toggleShowUploadImgDialog,
} = store

const isImgLoading = ref(false)
const timeout = ref(0)
const mouseLeft = ref(0)
const mouseTop = ref(0)
const rightClickMenuVisible = ref(false)

const preview = ref(null)

// 使浏览区与编辑区滚动条建立同步联系
function leftAndRightScroll() {
  const scrollCB = (text) => {
    let source, target

    clearTimeout(timeout.value)
    if (text === `preview`) {
      source = preview.value.$el
      target = document.querySelector(`.CodeMirror-scroll`)

      editor.value.off(`scroll`, editorScrollCB)
      timeout.value = setTimeout(() => {
        editor.value.on(`scroll`, editorScrollCB)
      }, 300)
    }
    else if (text === `editor`) {
      source = document.querySelector(`.CodeMirror-scroll`)
      target = preview.value.$el

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

  preview.value.$el.addEventListener(`scroll`, previewScrollCB, false)
  editor.value.on(`scroll`, editorScrollCB)
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

function onMenuEvent(type) {
  switch (type) {
    case `insertPic`:
      toggleShowUploadImgDialog()
      break
    case `insertTable`:
      toggleShowInsertFormDialog()
      break
    case `resetStyle`:
      resetStyleConfirm()
      break
    case `importMarkdown`:
      importMarkdownContent()
      break
    case `exportMarkdown`:
      exportEditorContent2MD()
      break
    case `exportHtml`:
      exportEditorContent2HTML()
      break
    case `formatMarkdown`:
      formatContent()
      break
    default:
      break
  }
}

function beforeUpload(file) {
  // validate image
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    ElMessage.error(checkResult.msg)
    return false
  }

  // check image host
  const imgHost = localStorage.getItem(`imgHost`) || `default`
  localStorage.setItem(`imgHost`, imgHost)

  const config = localStorage.getItem(`${imgHost}Config`)
  const isValidHost = imgHost === `default` || config
  if (!isValidHost) {
    ElMessage.error(`请先配置 ${imgHost} 图床参数`)
    return false
  }
  return true
}

// 图片上传结束
function uploaded(imageUrl) {
  console.log(`图片上传之后: `, imageUrl)
  if (!imageUrl) {
    ElMessage.error(`上传图片未知异常`)
    return
  }
  toggleShowUploadImgDialog(false)
  // 上传成功，获取光标
  const cursor = editor.value.getCursor()
  const markdownImage = `![](${imageUrl})`
  // 将 Markdown 形式的 URL 插入编辑框光标所在位置
  editor.value.replaceSelection(`\n${markdownImage}\n`, cursor)
  ElMessage.success(`图片上传成功`)
  onEditorRefresh()
}
function uploadImage(file, cb) {
  isImgLoading.value = true
  toBase64(file)
    .then((base64Content) => {
      fileApi
        .fileUpload(base64Content, file)
        .then((url) => {
          console.log(url)
          cb ? cb(url) : uploaded(url)
        })
        .catch((err) => {
          ElMessage.error(err.message)
        })
    })
    .catch((err) => {
      ElMessage.error(err.message)
    })
  isImgLoading.value = false
}

const changeTimer = ref(0)

// 初始化编辑器
function initEditor() {
  const editorDom = document.querySelector(`#editor`)

  if (!editorDom.value) {
    editorDom.value = editorContent.value
  }
  editor.value = CodeMirror.fromTextArea(editorDom, {
    mode: `text/x-markdown`,
    theme: `xq-light`,
    lineNumbers: false,
    lineWrapping: true,
    styleActiveLine: true,
    autoCloseBrackets: true,
    extraKeys: {
      [`${modPrefix}-F`]: function autoFormat(editor) {
        const doc = formatDoc(editor.getValue(0))
        editor.setValue(doc)
      },
      [`${modPrefix}-B`]: function bold(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`**${selected}**`)
      },
      [`${modPrefix}-D`]: function del(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`~~${selected}~~`)
      },
      [`${modPrefix}-I`]: function italic(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`*${selected}*`)
      },
      [`${modPrefix}-K`]: function italic(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`[${selected}]()`)
      },
      [`${modPrefix}-L`]: function code(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`\`${selected}\``)
      },
    },
  })

  editor.value.on(`change`, (e) => {
    clearTimeout(changeTimer.value)
    changeTimer.value = setTimeout(() => {
      onEditorRefresh()
      editorContent.value = e.getValue()
    }, 300)
  })

  // 粘贴上传图片并插入
  editor.value.on(`paste`, (cm, e) => {
    if (!(e.clipboardData && e.clipboardData.items) || isImgLoading.value) {
      return
    }
    for (let i = 0, len = e.clipboardData.items.length; i < len; ++i) {
      const item = e.clipboardData.items[i]
      if (item.kind === `file`) {
        // 校验图床参数
        const pasteFile = item.getAsFile()
        const isValid = beforeUpload(pasteFile)
        if (!isValid) {
          continue
        }
        uploadImage(pasteFile)
      }
    }
  })

  editor.value.on(`mousedown`, () => {
    rightClickMenuVisible.value = false
  })
  editor.value.on(`blur`, () => {
    // !影响到右键菜单的点击事件，右键菜单的点击事件在组件内通过mousedown触发
    rightClickMenuVisible.value = false
  })
  editor.value.on(`scroll`, () => {
    rightClickMenuVisible.value = false
  })
}

const container = ref(null)

// 右键菜单
function openMenu(e) {
  const menuMinWidth = 105
  const offsetLeft = container.value.getBoundingClientRect().left
  const offsetWidth = container.value.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth
  const left = e.clientX - offsetLeft
  mouseLeft.value = Math.min(maxLeft, left)
  mouseTop.value = e.clientY + 10
  rightClickMenuVisible.value = true
}

// 工具函数，添加格式
function addFormat(before, after = before) {
  const { head, anchor } = editor.value.doc.sel.ranges[0]
  let start
  let end
  // 确定起始关系
  if (head.line === anchor.line) {
    if (head.ch < anchor.ch) {
      start = head
      end = anchor
    }
    else {
      start = anchor
      end = head
    }
  }
  else {
    if (head.line < anchor.line) {
      start = head
      end = anchor
    }
    else {
      start = anchor
      end = head
    }
  }

  const rows = []
  let row = ``
  for (const c of editor.value.getValue()) {
    if (c === `\n`) {
      rows.push(row)
      row = ``
    }
    else {
      row += c
    }
  }
  rows.push(row)

  let txt = ``
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    for (let j = 0; j < row.length; j++) {
      if (i === start.line && j === start.ch) {
        txt += before
      }
      if (i === end.line && j === end.ch) {
        txt += after
      }
      txt += row[j]
    }
    //* 特殊情况，结束光标在末尾，无法遍历到
    if (i === end.line && row.length === end.ch) {
      txt += after
    }
    txt += `\n`
  }
  editor.value.setValue(txt)
}

const codeMirrorWrapper = ref(null)

// 转换 markdown 中的本地图片为线上图片
// todo 处理事件覆盖
function mdLocalToRemote() {
  const dom = codeMirrorWrapper.value.$el

  // 上传 md 中的图片
  const uploadMdImg = async ({ md, list }) => {
    const mdImgList = [
      ...(md.str.matchAll(/!\[(.*?)\]\((.*?)\)/g) || []),
    ].filter((item) => {
      return item // 获取所有相对地址的图片
    })
    const root = md.path.match(/.+?\//)[0]
    const resList = await Promise.all(
      mdImgList.map((item) => {
        return new Promise((resolve) => {
          let [, , matchStr] = item
          matchStr = matchStr.replace(/^.\//, ``) // 处理 ./img/ 为 img/ 统一相对路径风格
          const { file }
                = list.find(f => f.path === `${root}${matchStr}`) || {}
          uploadImage(file, (url) => {
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
    editor.value.setValue(md.str)
    console.log(`resList`, resList, md.str)
  }

  dom.ondragover = evt => evt.preventDefault()
  dom.ondrop = async (evt) => {
    evt.preventDefault()
    for (const item of evt.dataTransfer.items) {
      item.getAsFileSystemHandle().then(async (handle) => {
        if (handle.kind === `directory`) {
          const list = await showFileStructure(handle)
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
  async function getMd({ list }) {
    return new Promise((resolve) => {
      const { path, file } = list.find(item => item.path.match(/\.md$/))
      const reader = new FileReader()
      reader.readAsText(file, `UTF-8`)
      reader.onload = (evt) => {
        resolve({
          str: evt.target.result,
          file,
          path,
        })
      }
    })
  }

  // 转换文件系统句柄中的文件为文件列表
  async function showFileStructure(root) {
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
</script>

<template>
  <div ref="container" class="container">
    <el-container>
      <el-header class="editor__header">
        <EditorHeader
          @add-format="addFormat"
          @format-content="formatContent"
          @start-copy="startCopy"
          @end-copy="endCopy"
        />
      </el-header>
      <el-main class="container-main">
        <el-row class="container-main-section">
          <el-col
            ref="codeMirrorWrapper"
            :style="{ order: store.isEditOnLeft ? 0 : 1 }"
            :span="isShowCssEditor ? 8 : 12"
            class="codeMirror-wrapper"
            @contextmenu.prevent="openMenu"
          >
            <textarea
              id="editor"
              type="textarea"
              placeholder="Your markdown text here."
            />
          </el-col>
          <el-col
            id="preview"
            ref="preview"
            :span="isShowCssEditor ? 8 : 12"
            class="preview-wrapper"
          >
            <div id="output-wrapper" :class="{ output_night: !backLight }">
              <div class="preview">
                <section id="output" v-html="output" />
                <div v-if="isCoping" class="loading-mask">
                  <div class="loading-mask-box">
                    <div class="loading__img" />
                    <span>正在生成</span>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <CssEditor />
        </el-row>
      </el-main>
    </el-container>

    <UploadImgDialog
      @before-upload="beforeUpload"
      @upload-image="uploadImage"
      @uploaded="uploaded"
    />

    <InsertFormDialog />

    <RightClickMenu
      :visible="rightClickMenuVisible"
      :left="mouseLeft"
      :top="mouseTop"
      @menu-tick="onMenuEvent"
      @close-menu="rightClickMenuVisible = false"
    />

    <RunLoading />
  </div>
</template>

<style lang="less" scoped>
@import url('../assets/less/app.less');
</style>

<style lang="less" scoped>
.container {
  height: 100%;
  min-width: 100%;
  padding: 0;
}

.container-main {
  padding: 20px;
  padding-top: 0;
}

.container-main-section {
  height: 100%;
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
  color: var(--el-text-color-regular);
  background-color: var(--el-bg-color);

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
