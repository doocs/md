<template>
  <div id="app" class="container">
    <el-container>
      <el-header class="top">
        <!-- 图片上传 -->
        <el-upload action="https://imgkr.com/api/files/upload" :headers="{'Content-Type': 'multipart/form-data'}"
          :show-file-list="false" :multiple="true" accept=".jpg,.jpeg,.png,.gif" name="file"
          :before-upload="beforeUpload" :on-success="uploaded">
          <el-tooltip class="item" effect="dark" content="上传图片" placement="bottom-start">
            <i class="el-icon-upload" size="medium">&nbsp;</i>
          </el-tooltip>
        </el-upload>
        <!-- 下载文本文档 -->
        <el-tooltip class="item" effect="dark" content="下载编辑框Markdown文档" placement="bottom-start">
          <i class="el-icon-download" size="medium" @click="downloadEditorContent">&nbsp;</i>
        </el-tooltip>
        <!-- 页面重置 -->
        <el-tooltip class="item" effect="dark" content="重置页面" placement="bottom-start">
          <i class="el-icon-refresh" size="medium" @click="reset">&nbsp;</i>
        </el-tooltip>
        <!-- 插入表格 -->
        <el-tooltip class="item" effect="dark" content="插入表格" placement="bottom-start">
          <i class="el-icon-s-grid" size="medium" @click="dialogFormVisible = true">&nbsp;</i>
        </el-tooltip>
        <el-form size="mini" class="ctrl" :inline=true>
          <el-form-item>
            <el-select v-model="currentFont" size="mini" placeholder="选择字体" clearable @change="fontChanged">
              <el-option v-for="font in builtinFonts" :style="{fontFamily: font.value}" :key="font.value"
                :label="font.label" :value="font.value">
                <span class="select-item-left">{{ font.label }}</span>
                <span class="select-item-right">Abc</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="currentSize" size="mini" placeholder="选择段落字号" clearable @change="sizeChanged">
              <el-option v-for="size in sizeOption" :key="size.value" :label="size.label" :value="size.value">
                <span class="select-item-left">{{ size.label }}</span>
                <span class="select-item-right">{{ size.desc }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="currentColor" size="mini" placeholder="选择颜色" clearable @change="colorChanged">
              <el-option v-for="color in colorOption" :key="color.value" :label="color.label" :value="color.value">
                <span class="select-item-left">{{ color.label }}</span>
                <span class="select-item-right">{{ color.hex }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-tooltip content="自定义颜色" placement="top">
            <el-color-picker v-model="currentColor" size="mini" show-alpha @change="colorChanged"></el-color-picker>
          </el-tooltip>
          &nbsp;&nbsp;
          <el-tooltip content="微信外链自动转为文末引用" placement="top">
            <el-switch v-model="status" active-color="#67c23a" inactive-color="#dcdfe6" @change="statusChanged">
            </el-switch>
          </el-tooltip>
        </el-form>
        <el-tooltip class="item" effect="dark" content="自定义CSS样式" placement="left">
          <el-button type="success" plain size="medium" icon="el-icon-setting" @click="customStyle"></el-button>
        </el-tooltip>
        <el-button type="success" plain size="medium" @click="copy">复制</el-button>
        <el-button type="success" plain size="medium" class="about" @click="aboutDialogVisible = true">关于</el-button>
      </el-header>
      <el-main class="main-body">
        <el-row :gutter="10" class="main-section">
          <el-col :span="12">
            <textarea id="editor" type="textarea" placeholder="Your markdown text here." v-model="source">
              </textarea>
          </el-col>
          <el-col :span="12" class="preview-wrapper" id="preview">
            <section id="output-wrapper">
              <div class="preview" contenteditable="true" >
                <section id="output" v-html="output">
                </section>
              </div>
            </section>
          </el-col>
          <transition name="custom-classes-transition" enter-active-class="animated bounceInRight">
            <el-col id="cssBox" :span="12" v-show="showBox">
              <textarea id="cssEditor" type="textarea" placeholder="Your custom css here.">
                </textarea>
            </el-col>
          </transition>

        </el-row>
      </el-main>
    </el-container>
    <el-dialog title="关于" :visible.sync="aboutDialogVisible" width="30%" center>
      <div style="text-align: center;">
        <h3>一款高度简洁的微信 Markdown 编辑器</h3>
      </div>
      <div style="text-align: center;margin-top:10px;">
        <p>扫码关注我的公众号，原创技术文章第一时间推送！</p>
        <img src="assets/images/qrcode-for-doocs.jpg" style="width: 40%; display: block; margin: 20px auto 10px;">
      </div>
      <span slot="footer" class="dialog-footer">
        <a href="https://github.com/doocs/md" target="_blank">
          <el-button type="success" plain>GitHub 仓库</el-button>
        </a>
        <a href="https://gitee.com/doocs/md" target="_blank">
          <el-button type="success" plain>Gitee 仓库</el-button>
        </a>
      </span>
    </el-dialog>
    <el-dialog title="插入表格" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="行数(表头不计入行数)">
          <el-input v-model="form.rows"></el-input>
        </el-form-item>
        <el-form-item label="列数">
          <el-input v-model="form.cols"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="success" plain @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="success" @click="insertTable">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import CodeMirror from 'codemirror/lib/codemirror'

import 'codemirror/mode/css/css'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/selection/active-line'

import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/css-hint.js'
import '../scripts/format.js'

import axios from 'axios'
import WxRenderer from '../scripts/renderers/wx-renderer'
import marked from 'marked'
import markdown from 'markdown'
import juice from 'juice'
import {
  setColorWithCustomTemplate,
  setColor,
  setFontSize,
  css2json,
  customCssWithTemplate
} from '../scripts/util'
import DEFAULT_CONTENT from '../scripts/default-content'
import DEFAULT_CSS_CONTENT from '../scripts/themes/default-theme-css'

require('codemirror/mode/javascript/javascript')
import '../scripts/closebrackets'
import $ from 'jquery'
import { solveWeChatImage, solveHtml, copySafari } from '../scripts/converter'
export default {
  data () {
    let d = {
      wxRenderer: null,
      aboutOutput: '',
      output: '',
      source: '',
      editor: null,
      cssEditor: null,
      builtinFonts: [
        { label: '无衬线', value: '-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif' },
        { label: '衬线', value: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif" }
      ],
      sizeOption: [
        { label: '12px', value: '12px', desc: '更小' },
        { label: '13px', value: '13px', desc: '稍小' },
        { label: '14px', value: '14px', desc: '推荐' },
        { label: '15px', value: '15px', desc: '稍大' },
        { label: '16px', value: '16px', desc: '更大' }
      ],
      colorOption: [
        { label: '经典蓝', value: 'rgba(15, 76, 129, 1)', hex: '最新流行' },
        { label: '翡翠绿', value: 'rgba(0, 152, 116, 1)', hex: '优雅清新' },
        { label: '活力橘', value: 'rgba(250, 81, 81, 1)', hex: '热情活泼' }
      ],
      showBox: false,
      aboutDialogVisible: false,
      dialogFormVisible: false,
      form: {
        rows: 1,
        cols: 1
      },
      timeout: null,
      html: ''
    }
    d.currentFont = d.builtinFonts[0].value
    d.currentSize = d.sizeOption[2].value
    d.currentColor = d.colorOption[1].value
    d.status = '1'
    return d
  },
  created () {
    this.currentFont = localStorage.getItem('fonts') || this.builtinFonts[0].value
    this.currentColor = localStorage.getItem('color') || this.colorOption[1].value
    this.currentSize = localStorage.getItem('size') || this.sizeOption[2].value
    this.status = localStorage.getItem('status') === 'true'
    this.$nextTick(() => {
      this.initEditor()
      this.initCssEditor()
    })
    this.wxRenderer = new WxRenderer({
      theme: setColor(this.currentColor),
      fonts: this.currentFont,
      size: this.currentSize,
      status: this.status
    })
  },
  methods: {
    initEditor() {
      this.editor = CodeMirror.fromTextArea(
        document.getElementById('editor'),
        {
          value: '',
          mode: 'text/x-markdown',
          theme: 'xq-light',
          lineNumbers: false,
          lineWrapping: true,
          styleActiveLine: true,
          autoCloseBrackets: true
        }
      )
      this.editor.on('change', (cm, e) => {
        this.refresh()
        this.saveEditorContent(this.editor, '__editor_content')
      })

      // 粘贴上传图片并插入
      this.editor.on('paste', (cm, e) => {
        if (!(e.clipboardData && e.clipboardData.items)) {
          return
        }
        for (let i = 0, len = e.clipboardData.items.length; i < len; ++i) {
          let item = e.clipboardData.items[i]
          if (item.kind === 'file') {
            const pasteFile = item.getAsFile()
            if (!(this.checkType(pasteFile) && this.checkImageSize(pasteFile))) {
              return
            }
            let data = new FormData()
            data.append('file', pasteFile)
            axios.post(
              'https://imgkr.com/api/files/upload',
              data,
              {
                headers: { 'Content-Type': 'multipart/form-data' }
              }
            ).then(resp => {
              this.uploaded(resp.data)
            }).catch(err => {
              console.log(err.message)
            })
          }
        }
      })

      // 如果有编辑器内容被保存则读取，否则加载默认内容
      this.loadLocalStorage(this.editor, '__editor_content', DEFAULT_CONTENT)
    },
    initCssEditor() {
      this.cssEditor = CodeMirror.fromTextArea(
        document.getElementById('cssEditor'), {
          value: '',
          mode: 'css',
          theme: 'style-mirror',
          lineNumbers: false,
          lineWrapping: true,
          matchBrackets: true,
          autofocus: true,
          extraKeys: {
            'Ctrl-F': function autoFormat (editor) {
              const totalLines = editor.lineCount()
              editor.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines })
            }
          }
        }
      )
      // 自动提示
      this.cssEditor.on('keyup', (cm, e) => {
        if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 189) {
          cm.showHint(e)
        }
      })
      this.cssEditor.on('update', (instance) => {
        this.cssChanged()
        this.saveEditorContent(this.cssEditor, '__css_content')
      })
      this.loadLocalStorage(this.cssEditor, '__css_content', DEFAULT_CSS_CONTENT)
    },
    renderWeChat (source) {
      let output = marked(source, { renderer: this.wxRenderer.getRenderer(this.status) })
      // 去除第一行的 margin-top
      output = output.replace(/(style=".*?)"/, '$1;margin-top: 0"')
      if (this.status) {
        // 引用脚注
        output += this.wxRenderer.buildFootnotes()
        // 附加的一些 style
        output += this.wxRenderer.buildAddition()
      }
      return output
    },
    fontChanged (fonts) {
      this.wxRenderer.setOptions({
        fonts: fonts
      })
      this.currentFont = fonts
      localStorage.setItem('fonts', fonts)
      this.refresh()
    },
    sizeChanged (size) {
      this.wxRenderer.setOptions({
        size: size
      })
      let theme = setFontSize(size.replace('px', ''))
      theme = setColorWithCustomTemplate(theme, this.currentColor)
      this.wxRenderer.setOptions({
        theme: theme
      })
      this.currentSize = size
      localStorage.setItem('size', size)
      this.refresh()
    },
    colorChanged (color) {
      let theme = setFontSize(this.currentSize.replace('px', ''))
      theme = setColorWithCustomTemplate(theme, color)
      this.wxRenderer.setOptions({
        theme: theme
      })
      this.currentColor = color
      localStorage.setItem('color', color)
      this.refresh()
    },
    cssChanged () {
      let json = css2json(this.cssEditor.getValue(0))
      console.log(json)
      let theme = setFontSize(this.currentSize.replace('px', ''))
      theme = customCssWithTemplate(json, this.currentColor, theme)
      this.wxRenderer.setOptions({
        theme: theme
      })
      this.refresh()
    },
    // 图片上传前的处理
    beforeUpload (file) {
      return this.checkType(file) && this.checkImageSize(file)
    },
    // 检查文件类型
    checkType (file) {
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name)) {
        this.$message({
          showClose: true,
          message: '请上传 JPG/PNG/GIF 格式的图片',
          type: 'error'
        })
        return false
      }
      return true
    },
    // 检查图片大小
    checkImageSize (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.$message({
          showClose: true,
          message: '由于公众号限制，图片大小不能超过 5.0M',
          type: 'error'
        })
        return false
      }
      return true
    },
    // 图片上传结束
    uploaded (response, file, fileList) {
      if (response.success) {
        // 上传成功，获取光标
        const cursor = this.editor.getCursor()
        const imageUrl = response.data
        const markdownImage = `![](${imageUrl})`
        // 将 Markdown 形式的 URL 插入编辑框光标所在位置
        this.editor.replaceSelection(`\n${markdownImage}\n`, cursor)
        this.$message({
          showClose: true,
          message: '图片插入成功',
          type: 'success'
        })
        this.refresh()
      } else {
        // 上传失败
        this.$message({
          showClose: true,
          message: response.message,
          type: 'error'
        })
      }
    },
    // 刷新右侧预览
    refresh () {
      this.output = this.renderWeChat(this.editor.getValue(0))
    },
    // 重置页面
    reset () {
      this.$confirm('此操作将丢失本地缓存的文本和自定义样式，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--success',
        cancelButtonClass: 'el-button--success is-plain',
        type: 'warning',
        center: true
      }).then(() => {
        localStorage.clear()
        this.editor.setValue(DEFAULT_CONTENT)
        this.cssEditor.setValue(DEFAULT_CSS_CONTENT)
        this.editor.focus()
        this.status = '1'
        this.fontChanged(this.builtinFonts[0].value)
        this.colorChanged(this.colorOption[1].value)
        this.sizeChanged(this.sizeOption[2].value)
        this.cssChanged()
      }).catch(() => {
        this.editor.focus()
      })
    },
    // 插入表格
    insertTable () {
      const cursor = this.editor.getCursor()
      const rows = parseInt(this.form.rows)
      const cols = parseInt(this.form.cols)
      if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
        this.$message({
          showClose: true,
          message: '输入的行/列数无效，请重新输入',
          type: 'error'
        })
        return
      }

      let table = ''
      for (let i = 0; i < rows + 2; ++i) {
        for (let j = 0; j < cols + 1; ++j) {
          table += (j === 0 ? '|' : (i !== 1 ? '     |' : ' --- |'))
        }
        table += '\n'
      }

      this.editor.replaceSelection(`\n${table}\n`, cursor)
      this.dialogFormVisible = false
      this.refresh()
    },
    statusChanged () {
      localStorage.setItem('status', this.status)
      this.refresh()
    },
    // 将编辑器内容保存到 LocalStorage
    saveEditorContent (editor, name) {
      const content = editor.getValue(0)
      if (content) {
        localStorage.setItem(name, content)
      } else {
        localStorage.removeItem(name)
      }
    },
    loadLocalStorage (editor, name, content) {
      if (localStorage.getItem(name)) {
        editor.setValue(localStorage.getItem(name))
      } else {
        editor.setValue(content)
      }
    },
    // 下载编辑器内容到本地
    downloadEditorContent () {
      let downLink = document.createElement('a')
      downLink.download = 'content.md'
      downLink.style.display = 'none'
      let blob = new Blob([this.editor.getValue(0)])
      downLink.href = URL.createObjectURL(blob)
      document.body.appendChild(downLink)
      downLink.click()
      document.body.removeChild(downLink)
    },
    // 自定义CSS样式
    async customStyle () {
      this.showBox = !this.showBox
      this.$nextTick(() => {
        if(!this.cssEditor) {
          this.cssEditor.refresh()
          // this.initCssEditor()
        }
      })
      setTimeout(() => {
        this.cssEditor.refresh()
      },50)
      let flag = await localStorage.getItem('__css_content')
      if (!flag) {
        this.cssEditor.setValue(DEFAULT_CSS_CONTENT)
      }
    },
    // 复制渲染后的内容到剪贴板
    copy12 () {
      let clipboardDiv = document.getElementById('output')
      clipboardDiv.focus()
      window.getSelection().removeAllRanges()
      let range = document.createRange()
      range.setStartBefore(clipboardDiv.firstChild)
      range.setEndAfter(clipboardDiv.lastChild)
      window.getSelection().addRange(range)
      document.execCommand('copy')
      // 输出提示
      this.$notify({
        showClose: true,
        message: '已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴',
        offset: 80,
        duration: 1600,
        type: 'success'
      })
    },
    // 复制到微信公众号
    copy() {
      let clipboardDiv = document.getElementById('output')
      const clipboardHTML = clipboardDiv.innerHTML
      // solveWeChatImage()
      this.html = solveHtml();
            // 输出提示
      this.$notify({
        showClose: true,
        message: '已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴',
        offset: 80,
        duration: 1600,
        type: 'success'
      })
      clipboardDiv.innerHTML = clipboardHTML; // 恢复现场
    },
    // 左右栏同步滚动
    leftAndRightScroll() {
      $('div.CodeMirror-scroll, #preview').on('scroll', function callback () {
        clearTimeout(this.timeout)

        let source = $(this)
        let target = $(source.is('#preview') ? 'div.CodeMirror-scroll' : '#preview')

        target.off('scroll')

        let source0 = source[0]
        let target0 = target[0]

        let percentage = source0.scrollTop / (source0.scrollHeight - source0.offsetHeight)
        let height = percentage * (target0.scrollHeight - target0.offsetHeight)
        target0.scrollTo(0, height)

        this.timeout = setTimeout(() => {
          target.on('scroll', callback)
        }, 100)
      })
    }
  },
  mounted () {
    this.leftAndRightScroll()
  }
}
</script>
<style lang="scss">

</style>
