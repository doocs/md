<template>
  <el-container class="top is-dark">
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
    <div class="left-side">
      <el-dropdown>
        <span class="el-dropdown-link">
          文件<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="refClick">
            <i class="el-icon-upload2" size="medium"></i>
            导入 .md
            <input hidden type="file" ref="fileInput" accept=".md" />
          </el-dropdown-item>
          <el-dropdown-item @click.native="$emit('download')">
            <i class="el-icon-download" size="medium"></i>
            导出 .md
          </el-dropdown-item>
          <el-dropdown-item @click.native="$emit('export')">
            <i class="el-icon-document" size="medium"></i>
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
            <i class="el-icon-upload" size="medium"></i>
            上传图片
          </el-dropdown-item>
          <el-dropdown-item @click.native="$emit('show-dialog-form')">
            <i class="el-icon-s-grid" size="medium"></i>
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
            <el-dropdown placement="right" class="style-option-menu">
              <div class="el-dropdown-link">
                字体
                <i class="el-icon-arrow-right el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown" style="width: 200px">
                <el-dropdown-item
                  v-for="font in config.builtinFonts"
                  :style="{ fontFamily: font.value }"
                  :key="font.value"
                  :label="font.label"
                  :value="font.value"
                  @click.native="fontChanged(font.value)"
                >
                  <i
                    class="el-icon-check"
                    :style="{ opacity: selectFont === font.value ? 1 : 0 }"
                  ></i>
                  <span>{{ font.label }}</span>
                  <span class="select-item-right">Abc</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-dropdown-item>
          <el-dropdown-item class="padding-left-3">
            <el-dropdown placement="right" class="style-option-menu">
              <div class="el-dropdown-link">
                字号
                <i class="el-icon-arrow-right el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown" style="width: 200px">
                <el-dropdown-item
                  v-for="size in config.sizeOption"
                  :key="size.value"
                  :label="size.label"
                  :value="size.value"
                  @click.native="sizeChanged(size.value)"
                >
                  <i
                    class="el-icon-check"
                    :style="{ opacity: selectSize === size.value ? 1 : 0 }"
                  ></i>
                  <span>{{ size.label }}</span>
                  <span class="select-item-right">{{ size.desc }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-dropdown-item>
          <el-dropdown-item class="padding-left-3">
            <el-dropdown placement="right" class="style-option-menu">
              <div class="el-dropdown-link">
                颜色
                <i class="el-icon-arrow-right el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown" style="width: 200px">
                <el-dropdown-item
                  v-for="color in config.colorOption"
                  :key="color.value"
                  :label="color.label"
                  :value="color.value"
                  @click.native="colorChanged(color.value)"
                >
                  <i
                    class="el-icon-check"
                    :style="{ opacity: selectColor === color.value ? 1 : 0 }"
                  ></i>
                  <span>{{ color.label }}</span>
                  <span class="select-item-right">{{ color.desc }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-dropdown-item>
          <el-dropdown-item class="padding-left-3">
            <el-dropdown placement="right" class="style-option-menu">
              <div class="el-dropdown-link">
                代码主题
                <i class="el-icon-arrow-right el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown" style="width: 200px">
                <el-dropdown-item
                  v-for="code in config.codeThemeOption"
                  :key="code.value"
                  :label="code.label"
                  :value="code.value"
                  @click.native="codeThemeChanged(code.value)"
                >
                  <i
                    class="el-icon-check"
                    :style="{ opacity: selectCodeTheme === code.value ? 1 : 0 }"
                  ></i>
                  <span>{{ code.label }}</span>
                  <span class="select-item-right">{{ code.desc }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

    <div class="right-side">
      <el-button
        :type="btnType"
        plain
        size="medium"
        @click="copy"
        placement="bottom-start"
        >复制
      </el-button>
      <el-button
        :type="btnType"
        plain
        size="medium"
        @click="prePost"
        placement="bottom-start"
        >发布
      </el-button>
    </div>
    <resetDialog
      :showResetConfirm="showResetConfirm"
      @confirm="confirmReset"
      @close="cancelReset"
    />
  </el-container>
</template>

<script>
import { setFontSize, setColorWithCustomTemplate } from '@/assets/scripts/util'
import { solveWeChatImage, solveHtml } from '@/assets/scripts/converter'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt'
import config from '@/assets/scripts/config'
import resetDialog from './resetDialog'
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
      showResetConfirm: false,
      selectFont: ``,
      selectSize: ``,
      selectColor: ``,
      selectCodeTheme: config.codeThemeOption[0].value,
    }
  },
  components: {
    resetDialog,
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
    // 复制到微信公众号
    copy(e) {
      this.$emit(`startCopy`)
      setTimeout(() => {
        let clipboardDiv = document.getElementById(`output`)
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
    ]),
  },
  mounted() {
    this.selectFont = this.currentFont
    this.selectSize = this.currentSize
    this.selectColor = this.currentColor
    this.selectCodeTheme = this.codeTheme
    this.citeStatus = this.currentCiteStatus

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
.editor__header {
  width: 100%;
}

.header__switch {
  margin-left: 8px;
}

.mode__switch {
  margin-left: 24px;
  margin-right: 24px;
  width: 24px;
  height: 24px;
  background: url('../../assets/images/night.png') no-repeat;
  background-size: cover;
  transition: all 0.3s;
}

.mode__switch_black {
  background: url('../../assets/images/light.png') no-repeat;
  background-size: cover;
}

.top {
  height: 60px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  margin-right: 0;
}

.el-select {
  margin-right: 12px;
}

.left-side {
  display: flex;
  align-items: center;
  flex: 1;
}

.right-side {
  display: flex;
  align-items: center;
}

/*
.preview table tr:nth-child(even){
  background: rgb(250, 250, 250);
}
 */
.select-item-left {
  float: left;
}

.select-item-right {
  float: right;
  color: #8492a6;
  font-size: 13px;
}

.el-dropdown {
  margin: 0 10px;
}

.el-dropdown-link {
  cursor: pointer;
}

.style-option-menu {
  margin: 0;
  width: 150px;

  .el-dropdown-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
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
