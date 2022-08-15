<template>
  <el-container class="header-container is-dark">
    <div class="dropdowns">
      <el-dropdown>
        <span class="el-dropdown-link">
          文件<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="refClick">
            <i class="el-icon-upload2"></i>
            导入 .md
            <input hidden type="file" ref="fileInput" accept=".md" />
          </el-dropdown-item>
          <el-dropdown-item @click.native="$emit('download')">
            <i class="el-icon-download"></i>
            导出 .md
          </el-dropdown-item>
          <el-dropdown-item @click.native="$emit('export')">
            <i class="el-icon-document"></i>
            导出 .html
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="themeChanged">
            <i
              class="el-icon-check"
              :style="{ opacity: nightMode ? 1 : 0 }"
            ></i>
            暗黑模式
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          格式<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            class="format-item"
            @click.native="$emit('addFormat', '**')"
          >
            加粗
            <kbd> Ctrl + B </kbd>
          </el-dropdown-item>
          <el-dropdown-item
            class="format-item"
            @click.native="$emit('addFormat', '*')"
          >
            斜体
            <kbd> Ctrl + I </kbd>
          </el-dropdown-item>
          <el-dropdown-item
            class="format-item"
            @click.native="$emit('addFormat', '~~')"
          >
            删除线
            <kbd> Alt + Shift + U </kbd>
          </el-dropdown-item>
          <el-dropdown-item
            class="format-item"
            @click.native="$emit('addFormat', '[', ']()')"
          >
            超链接
            <kbd> Alt + Shift + K </kbd>
          </el-dropdown-item>
          <el-dropdown-item
            class="format-item"
            @click.native="$emit('formatContent')"
          >
            格式化
            <kbd> Ctrl + Alt + L </kbd>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="statusChanged">
            <i
              class="el-icon-check"
              :style="{ opacity: citeStatus ? 1 : 0 }"
            ></i>
            微信外链转底部引用
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          编辑<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="$emit('show-dialog-upload-img')">
            <i class="el-icon-upload"></i>
            上传图片
          </el-dropdown-item>
          <el-dropdown-item @click.native="$emit('show-dialog-form')">
            <i class="el-icon-s-grid"></i>
            插入表格
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          样式<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item class="padding-left-3">
            <style-option-menu
              label="字体"
              :options="config.builtinFonts"
              :current="selectFont"
              :charge="fontChanged"
            ></style-option-menu>
          </el-dropdown-item>
          <el-dropdown-item class="padding-left-3">
            <style-option-menu
              label="字号"
              :options="config.sizeOption"
              :current="selectSize"
              :charge="sizeChanged"
            ></style-option-menu>
          </el-dropdown-item>
          <el-dropdown-item class="padding-left-3">
            <style-option-menu
              label="颜色"
              :options="config.colorOption"
              :current="selectColor"
              :charge="colorChanged"
            ></style-option-menu>
          </el-dropdown-item>
          <el-dropdown-item class="padding-left-3">
            <style-option-menu
              label="代码主题"
              :options="config.codeThemeOption"
              :current="selectCodeTheme"
              :charge="codeThemeChanged"
            ></style-option-menu>
          </el-dropdown-item>
          <el-dropdown-item
            divided
            class="padding-left-3"
            @click.native="showPicker()"
          >
            自定义颜色
            <el-color-picker
              show-alpha
              ref="colorPicker"
              size="mini"
              style="float: right; margin-top: 3px"
              v-model="selectColor"
              @change="colorChanged"
            ></el-color-picker>
          </el-dropdown-item>
          <el-dropdown-item class="padding-left-3" @click.native="customStyle">
            自定义 CSS
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="codeBlockChanged">
            <i
              class="el-icon-check"
              :style="{ opacity: isMacCodeBlock ? 1 : 0 }"
            ></i>
            Mac 代码块
          </el-dropdown-item>
          <el-dropdown-item
            divided
            class="padding-left-3"
            @click.native="showResetConfirm = true"
          >
            重置
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          帮助<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="$emit('show-about-dialog')">
            关于
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-button plain size="medium" :type="btnType" @click="copy">
      复制
    </el-button>
    <el-button plain size="medium" :type="btnType" @click="prePost">
      发布
    </el-button>

    <el-dialog title="发布" :visible.sync="form.dialogVisible">
      <div class="postInfo">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="封面">
            <el-input
              v-model="form.thumb"
              placeholder="自动提取第一张图"
            ></el-input>
          </el-form-item>
          <el-form-item label="标题">
            <el-input
              v-model="form.title"
              placeholder="自动提取第一个标题"
            ></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              type="textarea"
              :rows="4"
              v-model="form.desc"
              placeholder="自动提取第一个段落"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <div class="info">
              注：此功能由第三方浏览器插件支持，本平台不保证安全性。
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="form.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="post">确 定</el-button>
      </span>
    </el-dialog>
    <reset-dialog
      :show-reset-confirm="showResetConfirm"
      @confirm="confirmReset"
      @close="cancelReset"
    ></reset-dialog>
  </el-container>
</template>

<script>
import { setFontSize, setColorWithCustomTemplate } from '@/assets/scripts/util'
import { solveWeChatImage, solveHtml } from '@/assets/scripts/converter'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt'
import config from '@/assets/scripts/config'
import ResetDialog from './ResetDialog'
import StyleOptionMenu from './StyleOptionMenu'
import { mapState, mapMutations } from 'vuex'

export default {
  name: `editor-header`,
  data() {
    return {
      form: {
        dialogVisible: false,
        title: ``,
        desc: ``,
        thumb: ``,
        content: ``,
      },
      config: config,
      citeStatus: false,
      isMacCodeBlock: true,
      showResetConfirm: false,
      selectFont: ``,
      selectSize: ``,
      selectColor: ``,
      selectCodeTheme: config.codeThemeOption[0].value,
    }
  },
  components: {
    StyleOptionMenu,
    ResetDialog,
  },
  computed: {
    effect() {
      return this.nightMode ? `dark` : `light`
    },
    btnContent() {
      return this.nightMode ? `浅色模式` : `暗黑模式`
    },
    btnType() {
      return this.nightMode ? `default` : `primary`
    },
    ...mapState({
      output: (state) => state.output,
      editor: (state) => state.editor,
      cssEditor: (state) => state.cssEditor,
      currentFont: (state) => state.currentFont,
      currentSize: (state) => state.currentSize,
      currentColor: (state) => state.currentColor,
      codeTheme: (state) => state.codeTheme,
      nightMode: (state) => state.nightMode,
      currentCiteStatus: (state) => state.citeStatus,
      currentIsMacCodeBlock: (state) => state.isMacCodeBlock,
    }),
  },
  methods: {
    refClick() {
      this.$refs.fileInput.click()
    },
    showPicker() {
      this.$refs.colorPicker.showPicker = true
    },
    prePost() {
      let auto = {}
      try {
        auto = {
          thumb: document.querySelector(`#output img`).src,
          title: [1, 2, 3, 4, 5, 6]
            .map((h) => document.querySelector(`#output h${h}`))
            .filter((h) => h)[0].innerText,
          desc: document.querySelector(`#output p`).innerText,
          content: this.output,
        }
      } catch (error) {
        console.log(`error`, error)
      }
      this.form = {
        dialogVisible: true,
        ...auto,
        auto,
      }
    },
    post() {
      this.form.dialogVisible = false
      // 使用 window.$syncer 可以检测是否安装插件
      window.syncPost({
        title: this.form.title || this.form.auto.title,
        desc: this.form.desc || this.form.auto.desc,
        content: this.form.content || this.form.auto.content,
        thumb: this.form.thumb || this.form.auto.thumb,
      })
    },
    fontChanged(fonts) {
      this.setWxRendererOptions({
        fonts: fonts,
      })
      this.setCurrentFont(fonts)
      this.selectFont = fonts
      this.$emit(`refresh`)
    },
    sizeChanged(size) {
      let theme = setFontSize(size.replace(`px`, ``))
      theme = setColorWithCustomTemplate(theme, this.currentColor)
      this.setWxRendererOptions({
        size: size,
        theme: theme,
      })
      this.setCurrentSize(size)
      this.selectSize = size
      this.$emit(`refresh`)
    },
    colorChanged(color) {
      let theme = setFontSize(this.currentSize.replace(`px`, ``))

      theme = setColorWithCustomTemplate(theme, color)
      this.setWxRendererOptions({
        theme: theme,
      })
      this.setCurrentColor(color)
      this.selectColor = color
      this.$emit(`refresh`)
    },
    codeThemeChanged(theme) {
      this.setCurrentCodeTheme(theme)
      this.selectCodeTheme = theme
      this.$emit(`refresh`)
    },
    statusChanged() {
      this.citeStatus = !this.citeStatus
      this.setCiteStatus(this.citeStatus)
      this.$emit(`refresh`)
    },
    codeBlockChanged() {
      this.isMacCodeBlock = !this.isMacCodeBlock
      this.macCodeBlockChanged()
      this.$emit(`refresh`)
    },
    // 复制到微信公众号
    copy() {
      this.$emit(`startCopy`)
      setTimeout(() => {
        const clipboardDiv = document.getElementById(`output`)
        if (this.isMacCodeBlock) {
          clipboardDiv.innerHTML = clipboardDiv.innerHTML.replace(
            /(<pre.+?>)/g,
            `$1
            <span style="
            display: block;
            height: 20px;
            transform: translate(0px, -100%);
            background-color: transparent;
            background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNDUwcHgiIGhlaWdodD0iMTMwcHgiPgogIDxlbGxpcHNlIGN4PSI2NSIgY3k9IjY1IiByeD0iNTAiIHJ5PSI1MiIgc3Ryb2tlPSJyZ2IoMjIwLDYwLDU0KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJyZ2IoMjM3LDEwOCw5NikiLz4KICA8ZWxsaXBzZSBjeD0iMjI1IiBjeT0iNjUiIHJ4PSI1MCIgcnk9IjUyIiAgc3Ryb2tlPSJyZ2IoMjE4LDE1MSwzMykiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0icmdiKDI0NywxOTMsODEpIi8+CiAgPGVsbGlwc2UgY3g9IjM4NSIgY3k9IjY1IiByeD0iNTAiIHJ5PSI1MiIgIHN0cm9rZT0icmdiKDI3LDE2MSwzNykiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0icmdiKDEwMCwyMDAsODYpIi8+Cjwvc3ZnPg==');
            background-position: 0 5px;
            background-repeat: no-repeat;
            background-size: 40px;"></span>`
          )
        }
        solveWeChatImage()
        solveHtml()
        clipboardDiv.focus()
        window.getSelection().removeAllRanges()
        let range = document.createRange()

        range.setStartBefore(clipboardDiv.firstChild)
        range.setEndAfter(clipboardDiv.lastChild)
        window.getSelection().addRange(range)
        document.execCommand(`copy`)
        window.getSelection().removeAllRanges()
        clipboardDiv.innerHTML = this.output
        // 输出提示
        this.$notify({
          showClose: true,
          message: `已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴`,
          offset: 80,
          duration: 1600,
          type: `success`,
        })
        this.$emit(`refresh`)
        this.$emit(`endCopy`)
      }, 350)
    },
    // 自定义CSS样式
    async customStyle() {
      this.$emit(`showCssEditor`)
      this.$nextTick(() => {
        if (!this.cssEditor) {
          this.cssEditor.refresh()
        }
      })
      setTimeout(() => {
        this.cssEditor.refresh()
      }, 50)

      let flag = localStorage.getItem(`__css_content`)
      if (!flag) {
        this.setCssEditorValue(DEFAULT_CSS_CONTENT)
      }
    },
    // 重置样式
    confirmReset() {
      localStorage.clear()
      this.cssEditor.setValue(DEFAULT_CSS_CONTENT)
      this.citeStatus = false
      this.statusChanged(false)
      this.fontChanged(this.config.builtinFonts[0].value)
      this.colorChanged(this.config.colorOption[0].value)
      this.sizeChanged(this.config.sizeOption[2].value)
      this.codeThemeChanged(this.config.codeThemeOption[0].value)
      this.$emit(`cssChanged`)
      this.selectFont = this.currentFont
      this.selectSize = this.currentSize
      this.selectColor = this.currentColor
      this.showResetConfirm = false
      this.isMacCodeBlock = true
      this.selectCodeTheme = this.codeTheme
    },
    cancelReset() {
      this.showResetConfirm = false
      this.editor.focus()
    },
    ...mapMutations([
      `setCurrentColor`,
      `setCiteStatus`,
      `themeChanged`,
      `setCurrentFont`,
      `setCurrentSize`,
      `setCssEditorValue`,
      `setCurrentCodeTheme`,
      `setWxRendererOptions`,
      `macCodeBlockChanged`,
    ]),
  },
  mounted() {
    this.selectFont = this.currentFont
    this.selectSize = this.currentSize
    this.selectColor = this.currentColor
    this.selectCodeTheme = this.codeTheme
    this.citeStatus = this.currentCiteStatus
    this.isMacCodeBlock = this.currentIsMacCodeBlock

    const fileInput = this.$refs.fileInput
    fileInput.onchange = () => {
      const file = fileInput.files[0]
      if (file == null) {
        return
      }
      const read = new FileReader()
      read.readAsText(file)
      read.onload = () => {
        this.$emit(`import-md`, read.result)
      }
    }
  },
}
</script>

<style lang="less" scoped>
.header-container {
  padding: 10px 20px;
  align-items: center;
}

.dropdowns {
  flex: 1;
}

.el-dropdown {
  margin: 0 10px;
}

.el-dropdown-link {
  cursor: pointer;
}

.padding-left-3 {
  padding-left: 3em;
}

// 添加边距影响了 divided 行的移入效果，此处做一个兼容处理
.el-dropdown-menu__item--divided.padding-left-3 {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3em;
    height: 6px;
    background: white;
  }
}

.format-item {
  .padding-left-3;
  width: 180px;

  kbd {
    font-size: 0.75em;
    float: right;
    color: #666;
  }
}
</style>
