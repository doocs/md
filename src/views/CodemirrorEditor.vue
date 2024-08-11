<script>
import { mapActions, mapState } from 'pinia'
import fileApi from '../api/file'
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
  saveEditorContent,
  toBase64,
} from '@/assets/scripts/util'

import 'codemirror/mode/javascript/javascript'

export default {
  components: {
    CssEditor,
    RunLoading,
    EditorHeader,
    InsertFormDialog,
    RightClickMenu,
    UploadImgDialog,
  },
  setup() {
    const store = useStore()

    return {
      store,
    }
  },
  data() {
    return {
      showCssEditor: false,
      dialogUploadImgVisible: false,
      insertFormDialogVisible: false,
      isCoping: false,
      isImgLoading: false,
      backLight: false,
      timeout: null,
      changeTimer: null,
      source: ``,
      mouseLeft: 0,
      mouseTop: 0,
      rightClickMenuVisible: false,
    }
  },
  computed: {
    ...mapState(useStore, {
      output: state => state.output,
      editor: state => state.editor,
    }),
  },
  created() {
    this.$nextTick(() => {
      this.initEditor()
      this.onEditorRefresh()
      this.mdLocalToRemote()
    })
  },
  mounted() {
    setTimeout(() => {
      this.leftAndRightScroll()
    }, 300)
  },
  methods: {
    // 转换 markdown 中的本地图片为线上图片
    // todo 处理事件覆盖
    mdLocalToRemote() {
      const dom = this.$refs.codeMirrorWrapper.$el

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
              this.uploadImage(file, (url) => {
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
        this.editor.setValue(md.str)
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
    },
    initEditor() {
      this.initEditorEntity()
      this.editor.on(`change`, () => {
        if (this.changeTimer)
          clearTimeout(this.changeTimer)
        this.changeTimer = setTimeout(() => {
          this.onEditorRefresh()
          saveEditorContent(this.editor, `__editor_content`)
        }, 300)
      })

      // 粘贴上传图片并插入
      this.editor.on(`paste`, (cm, e) => {
        if (!(e.clipboardData && e.clipboardData.items) || this.isImgLoading) {
          return
        }
        for (let i = 0, len = e.clipboardData.items.length; i < len; ++i) {
          const item = e.clipboardData.items[i]
          if (item.kind === `file`) {
            // 校验图床参数
            const pasteFile = item.getAsFile()
            const isValid = this.beforeUpload(pasteFile)
            if (!isValid) {
              continue
            }
            this.uploadImage(pasteFile)
          }
        }
      })

      this.editor.on(`mousedown`, () => {
        this.rightClickMenuVisible = false
      })
      this.editor.on(`blur`, () => {
        // !影响到右键菜单的点击事件，右键菜单的点击事件在组件内通过mousedown触发
        this.rightClickMenuVisible = false
      })
      this.editor.on(`scroll`, () => {
        this.rightClickMenuVisible = false
      })
    },
    beforeUpload(file) {
      // validate image
      const checkResult = checkImage(file)
      if (!checkResult.ok) {
        this.$message.error(checkResult.msg)
        return false
      }

      // check image host
      let imgHost = localStorage.getItem(`imgHost`)
      imgHost = imgHost || `default`
      localStorage.setItem(`imgHost`, imgHost)

      const config = localStorage.getItem(`${imgHost}Config`)
      const isValidHost = imgHost === `default` || config
      if (!isValidHost) {
        this.$message.error(`请先配置 ${imgHost} 图床参数`)
        return false
      }
      return true
    },
    uploadImage(file, cb) {
      this.isImgLoading = true
      toBase64(file)
        .then((base64Content) => {
          fileApi
            .fileUpload(base64Content, file)
            .then((url) => {
              console.log(url)
              cb ? cb(url) : this.uploaded(url)
            })
            .catch((err) => {
              this.$message.error(err.message)
            })
        })
        .catch((err) => {
          this.$message.error(err.message)
        })
      this.isImgLoading = false
    },
    // 图片上传结束
    uploaded(response) {
      console.log(`图片上传之后: `, response)
      if (!response) {
        this.$message.error(`上传图片未知异常`)
        return
      }
      this.dialogUploadImgVisible = false
      // 上传成功，获取光标
      const cursor = this.editor.getCursor()
      const imageUrl = response
      const markdownImage = `![](${imageUrl})`
      // 将 Markdown 形式的 URL 插入编辑框光标所在位置
      this.editor.replaceSelection(`\n${markdownImage}\n`, cursor)
      this.$message.success(`图片上传成功`)
      this.onEditorRefresh()
    },
    // 左右滚动
    leftAndRightScroll() {
      const scrollCB = (text) => {
        let source, target

        clearTimeout(this.timeout)
        if (text === `preview`) {
          source = this.$refs.preview.$el
          target = document.getElementsByClassName(`CodeMirror-scroll`)[0]
          this.editor.off(`scroll`, editorScrollCB)
          this.timeout = setTimeout(() => {
            this.editor.on(`scroll`, editorScrollCB)
          }, 300)
        }
        else if (text === `editor`) {
          source = document.getElementsByClassName(`CodeMirror-scroll`)[0]
          target = this.$refs.preview.$el
          target.removeEventListener(`scroll`, previewScrollCB, false)
          this.timeout = setTimeout(() => {
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

      this.$refs.preview.$el.addEventListener(`scroll`, previewScrollCB, false)
      this.editor.on(`scroll`, editorScrollCB)
    },
    // 更新编辑器
    onEditorRefresh() {
      this.editorRefresh()
    },
    // 复制结束
    endCopy() {
      this.backLight = false
      setTimeout(() => {
        this.isCoping = false
      }, 800)
    },
    // 工具函数，添加格式
    addFormat(before, after = before) {
      const { head, anchor } = this.editor.doc.sel.ranges[0]
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
      for (const c of this.editor.getValue()) {
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
      this.editor.setValue(txt)
    },
    importMD(md) {
      this.editor.setValue(md)
      this.onEditorRefresh()
    },
    // 导入 Markdown 文档
    importMarkdownContent() {
      const menu = document.querySelector(`#menu`)
      const input = document.createElement(`input`)
      input.type = `file`
      input.name = `filename`
      input.accept = `.txt,.md`
      menu.appendChild(input)
      input.onchange = () => {
        if (!input.files) {
          return
        }
        const file = input.files[0]
        if (!/\.(?:txt|TXT|MD|md)$/.test(file.name)) {
          this.$message.error(`不支持的文档格式`)
          return
        }
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = (event) => {
          let txt = event.target.result
          txt = formatDoc(txt)
          if (txt) {
            localStorage.setItem(`__editor_content`, txt)
            this.editor.setValue(txt)
            this.$message.success(`文档导入成功`)
          }
        }
      }
      input.click()
      menu.removeChild(input)
    },
    // 右键菜单
    openMenu(e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left
      const offsetWidth = this.$el.offsetWidth
      const maxLeft = offsetWidth - menuMinWidth
      const left = e.clientX - offsetLeft
      this.mouseLeft = Math.min(maxLeft, left)
      this.mouseTop = e.clientY + 10
      this.rightClickMenuVisible = true
    },
    onMenuEvent(type) {
      switch (type) {
        case `resetStyle`:
          this.$refs.header.showResetConfirm = true
          break
        case `insertPic`:
          this.dialogUploadImgVisible = true
          break
        case `download`:
          this.downloadEditorContent()
          break
        case `export`:
          this.exportEditorContent()
          break
        case `insertTable`:
          this.insertFormDialogVisible = true
          break
        case `importMarkdown`:
          this.importMarkdownContent()
          break
        case `formatMarkdown`:
          this.formatContent()
          break
        default:
          break
      }
    },
    ...mapActions(useStore, [
      `initEditorEntity`,
      `editorRefresh`,
      `exportEditorContent`,
      `downloadEditorContent`,
      `formatContent`,
    ]),
  },
}
</script>

<template>
  <div class="container">
    <el-container>
      <el-header class="editor__header">
        <EditorHeader
          ref="header"
          @add-format="addFormat"
          @format-content="formatContent"
          @show-css-editor="showCssEditor = !showCssEditor"
          @show-dialog-form="insertFormDialogVisible = true"
          @show-dialog-upload-img="dialogUploadImgVisible = true"
          @start-copy=";(isCoping = true), (backLight = true)"
          @end-copy="endCopy"
        />
      </el-header>
      <el-main class="container-main">
        <el-row class="container-main-section">
          <el-col
            ref="codeMirrorWrapper"
            :style="{ order: store.isEditOnLeft ? 0 : 1 }"
            :span="showCssEditor ? 8 : 12"
            class="codeMirror-wrapper"
            @contextmenu.prevent="openMenu"
          >
            <textarea
              id="editor"
              v-model="source"
              type="textarea"
              placeholder="Your markdown text here."
            />
          </el-col>
          <el-col
            id="preview"
            ref="preview"
            :span="showCssEditor ? 8 : 12"
            class="preview-wrapper"
          >
            <div
              id="output-wrapper"
              :class="{ output_night: !backLight }"
            >
              <div class="preview">
                <section id="output" v-html="output" />
                <div v-if="isCoping" class="loading-mask">
                  <div class="loading__img" />
                  <span>正在生成</span>
                </div>
              </div>
            </div>
          </el-col>
          <CssEditor :show-css-editor="showCssEditor" />
        </el-row>
      </el-main>
    </el-container>

    <UploadImgDialog
      :visible="dialogUploadImgVisible"
      @close="dialogUploadImgVisible = false"
      @before-upload="beforeUpload"
      @upload-image="uploadImage"
      @uploaded="uploaded"
    />

    <InsertFormDialog
      :visible="insertFormDialogVisible"
      @close="insertFormDialogVisible = false"
    />

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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 376px;
  height: 101%;
  padding-top: 1px;
  font-size: 15px;
  color: var(--el-text-color-regular);
  background-color: var(--el-bg-color);

  .loading__img {
    position: absolute;
    left: 50%;
    top: 330px;
    width: 50px;
    height: 50px;
    transform: translate(-50%, -50%);
    background: url('../assets/images/favicon.png') no-repeat;
    background-size: cover;
  }

  span {
    position: absolute;
    left: 50%;
    top: 390px;
    transform: translate(-50%, -50%);
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
