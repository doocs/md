<script>
import { nextTick } from 'vue'
import { mapActions, mapState } from 'pinia'
import ResetDialog from './ResetDialog.vue'
import StyleOptionMenu from './StyleOptionMenu.vue'
import PostInfoDialog from './PostInfoDialog.vue'
import { useStore } from '@/stores'

import { setColorWithCustomTemplate, setFontSize } from '@/assets/scripts/util'
import { mergeCss, solveWeChatImage } from '@/assets/scripts/converter'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt?raw'
import config from '@/assets/scripts/config'

export default {
  name: `EditorHeader`,
  components: {
    PostInfoDialog,
    StyleOptionMenu,
    ResetDialog,
  },
  emits: ['refresh', 'startCopy', 'endCopy', 'showCssEditor', 'cssChanged', 'import-md', 'download', 'export', 'show-dialog-upload-img', 'show-dialog-form', 'show-about-dialog'],
  data() {
    return {
      config,
      citeStatus: false,
      isMacCodeBlock: true,
      isEditOnLeft: true,
      showResetConfirm: false,
      selectFont: ``,
      selectSize: ``,
      selectColor: ``,
      selectCodeTheme: config.codeThemeOption[2].value,
      selectLegend: ``,
      form: {
        dialogVisible: false,
        title: ``,
        desc: ``,
        thumb: ``,
        content: ``,
      },
      formatItems: [
        {
          label: `加粗`,
          kbd: `Ctrl/Command + B`,
          emitArgs: [`addFormat`, `**`],
        },
        {
          label: `斜体`,
          kbd: `Ctrl/Command + I`,
          emitArgs: [`addFormat`, `*`],
        },
        {
          label: `删除线`,
          kbd: `Ctrl/Command + D`,
          emitArgs: [`addFormat`, `~~`],
        },
        {
          label: `超链接`,
          kbd: `Ctrl/Command + K`,
          emitArgs: [`addFormat`, `[`, `]()`],
        },
        {
          label: `格式化`,
          kbd: `Ctrl/Command + F`,
          emitArgs: [`formatContent`],
        },
      ],
    }
  },
  computed: {
    btnType() {
      return this.nightMode ? `default` : `primary`
    },
    ...mapState(useStore, {
      output: state => state.output,
      editor: state => state.editor,
      cssEditor: state => state.cssEditor,
      currentFont: state => state.currentFont,
      currentSize: state => state.currentSize,
      currentColor: state => state.currentColor,
      codeTheme: state => state.codeTheme,
      legend: state => state.legend,
      nightMode: state => state.nightMode,
      currentCiteStatus: state => state.citeStatus,
      currentIsMacCodeBlock: state => state.isMacCodeBlock,
      currentIsEditOnLeft: state => state.isEditOnLeft,
    }),
  },
  mounted() {
    this.selectFont = this.currentFont
    this.selectSize = this.currentSize
    this.selectColor = this.currentColor
    this.selectCodeTheme = this.codeTheme
    this.selectLegend = this.legend
    this.citeStatus = this.currentCiteStatus
    this.isMacCodeBlock = this.currentIsMacCodeBlock
    this.isEditOnLeft = this.currentIsEditOnLeft

    const fileInput = this.$refs.fileInput
    fileInput.onchange = () => {
      const file = fileInput.files[0]
      if (file === null) {
        return
      }
      const read = new FileReader()
      read.readAsText(file)
      read.onload = () => {
        this.$emit(`import-md`, read.result)
      }
    }
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
            .map(h => document.querySelector(`#output h${h}`))
            .filter(h => h)[0].textContent,
          desc: document.querySelector(`#output p`).textContent,
          content: this.output,
        }
      }
      catch (error) {
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
        fonts,
      })
      this.setCurrentFont(fonts)
      this.selectFont = fonts
      this.$emit(`refresh`)
    },
    sizeChanged(size) {
      let theme = setFontSize(size.replace(`px`, ``))
      theme = setColorWithCustomTemplate(theme, this.currentColor)
      this.setWxRendererOptions({
        size,
        theme,
      })
      this.setCurrentSize(size)
      this.selectSize = size
      this.$emit(`refresh`)
    },
    colorChanged(color) {
      let theme = setFontSize(this.currentSize.replace(`px`, ``))

      theme = setColorWithCustomTemplate(theme, color)
      this.setWxRendererOptions({
        theme,
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
    legendChanged(legend) {
      this.setCurrentLegend(legend)
      this.selectLegend = legend
      this.$emit(`refresh`)
    },
    statusChanged() {
      this.citeStatus = !this.citeStatus
      this.setCiteStatus(this.citeStatus)
      this.$emit(`refresh`)
    },
    codeBlockChanged() {
      this.isMacCodeBlock = !this.isMacCodeBlock
      this.setIsMacCodeBlock(this.isMacCodeBlock)
      this.$emit(`refresh`)
    },
    isEditOnLeftChanged() {
      this.isEditOnLeft = !this.isEditOnLeft
      this.setIsEditOnLeft(this.isEditOnLeft)
    },
    // 复制到微信公众号
    copy() {
      this.$emit(`startCopy`)
      setTimeout(() => {
        function modifyHtmlStructure(htmlString) {
          // 创建一个 div 元素来暂存原始 HTML 字符串
          const tempDiv = document.createElement(`div`)
          tempDiv.innerHTML = htmlString

          const originalItems = tempDiv.querySelectorAll(`li > ul, li > ol`)

          originalItems.forEach((originalItem) => {
            originalItem.parentElement.insertAdjacentElement(
              `afterend`,
              originalItem,
            )
          })

          // 返回修改后的 HTML 字符串
          return tempDiv.innerHTML
        }

        solveWeChatImage()

        const clipboardDiv = document.getElementById(`output`)
        clipboardDiv.innerHTML = mergeCss(clipboardDiv.innerHTML)
        clipboardDiv.innerHTML = modifyHtmlStructure(clipboardDiv.innerHTML)

        // 调整 katex 公式元素为行内标签，目的是兼容微信公众号渲染
        clipboardDiv.innerHTML = clipboardDiv.innerHTML
          .replace(
            /class="base"( style="display: inline")*/g,
            `class="base" style="display: inline"`,
          )
          // 公众号不支持 position， 转换为等价的 translateY
          .replace(/top:(.*?)em/g, `transform: translateY($1em)`)
        clipboardDiv.focus()
        window.getSelection().removeAllRanges()
        const range = document.createRange()

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
      nextTick(() => {
        if (!this.cssEditor) {
          this.cssEditor.refresh()
        }
      })
      setTimeout(() => {
        this.cssEditor.refresh()
      }, 50)

      const flag = localStorage.getItem(`__css_content`)
      if (!flag) {
        this.setCssEditorValue(DEFAULT_CSS_CONTENT)
      }
    },
    // 重置样式
    confirmReset() {
      this.showResetConfirm = false
      localStorage.clear()
      this.cssEditor.setValue(DEFAULT_CSS_CONTENT)
      this.citeStatus = false
      this.statusChanged(false)
      this.fontChanged(this.config.builtinFonts[0].value)
      this.colorChanged(this.config.colorOption[0].value)
      this.sizeChanged(this.config.sizeOption[2].value)
      this.codeThemeChanged(this.config.codeThemeOption[2].value)
      this.legendChanged(this.config.legendOption[3].value)
      this.$emit(`cssChanged`)
      this.selectFont = this.currentFont
      this.selectSize = this.currentSize
      this.selectColor = this.currentColor
      this.selectCodeTheme = this.codeTheme

      this.isMacCodeBlock = false
      this.codeBlockChanged()
    },
    cancelReset() {
      this.showResetConfirm = false
      this.editor.focus()
    },
    ...mapActions(useStore, [
      `setCurrentColor`,
      `setCiteStatus`,
      `themeChanged`,
      `setCurrentFont`,
      `setCurrentSize`,
      `setCssEditorValue`,
      `setCurrentCodeTheme`,
      `setCurrentLegend`,
      `setWxRendererOptions`,
      `setIsMacCodeBlock`,
      `setIsEditOnLeft`,
    ]),
  },
}
</script>

<template>
  <el-container class="header-container is-dark">
    <div class="dropdowns">
      <el-dropdown>
        <span class="el-dropdown-link">
          文件<el-icon><ElIconArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="refClick">
              <el-icon><ElIconUpload /></el-icon>
              导入 .md
              <input ref="fileInput" hidden type="file" accept=".md">
            </el-dropdown-item>
            <el-dropdown-item @click="$emit('download')">
              <el-icon><ElIconDownload /></el-icon>
              导出 .md
            </el-dropdown-item>
            <el-dropdown-item @click="$emit('export')">
              <el-icon><ElIconDocument /></el-icon>
              导出 .html
            </el-dropdown-item>
            <el-dropdown-item divided @click="themeChanged">
              <el-icon :style="{ opacity: +!!nightMode }">
                <ElIconCheck />
              </el-icon>
              暗黑模式
            </el-dropdown-item>
            <el-dropdown-item divided @click="isEditOnLeftChanged">
              <el-icon :style="{ opacity: +isEditOnLeft }">
                <ElIconCheck />
              </el-icon>
              左侧编辑
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          格式<el-icon><ElIconArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="{ label, kbd, emitArgs } in formatItems"
              :key="kbd"
              class="format-item"
              @click="$emit(...emitArgs)"
            >
              {{ label }}
              <kbd>{{ kbd }}</kbd>
            </el-dropdown-item>
            <el-dropdown-item divided @click="statusChanged">
              <el-icon><ElIconCheck /></el-icon>
              微信外链转底部引用
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          编辑<el-icon><ElIconArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$emit('show-dialog-upload-img')">
              <el-icon><ElIconUpload /></el-icon>
              上传图片
            </el-dropdown-item>
            <el-dropdown-item @click="$emit('show-dialog-form')">
              <el-icon><ElIconGrid /></el-icon>
              插入表格
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          样式<el-icon><ElIconArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item class="padding-left-3">
              <StyleOptionMenu
                label="字体"
                :options="config.builtinFonts"
                :current="selectFont"
                :charge="fontChanged"
              />
            </el-dropdown-item>
            <el-dropdown-item class="padding-left-3">
              <StyleOptionMenu
                label="字号"
                :options="config.sizeOption"
                :current="selectSize"
                :charge="sizeChanged"
              />
            </el-dropdown-item>
            <el-dropdown-item class="padding-left-3">
              <StyleOptionMenu
                label="颜色"
                :options="config.colorOption"
                :current="selectColor"
                :charge="colorChanged"
              />
            </el-dropdown-item>
            <el-dropdown-item class="padding-left-3">
              <StyleOptionMenu
                label="代码主题"
                :options="config.codeThemeOption"
                :current="selectCodeTheme"
                :charge="codeThemeChanged"
              />
            </el-dropdown-item>
            <el-dropdown-item class="padding-left-3">
              <StyleOptionMenu
                label="图注格式"
                :options="config.legendOption"
                :current="selectLegend"
                :charge="legendChanged"
              />
            </el-dropdown-item>
            <el-dropdown-item
              divided
              class="padding-left-3"
              @click="showPicker()"
            >
              自定义颜色
              <el-color-picker
                ref="colorPicker"
                v-model="selectColor"
                show-alpha
                style="float: right; margin-top: 3px"
                @change="colorChanged"
              />
            </el-dropdown-item>
            <el-dropdown-item class="padding-left-3" @click="customStyle">
              自定义 CSS
            </el-dropdown-item>
            <el-dropdown-item divided @click="codeBlockChanged">
              <el-icon :style="{ opacity: +isMacCodeBlock }">
                <ElIconCheck />
              </el-icon>
              Mac 代码块
            </el-dropdown-item>
            <el-dropdown-item
              divided
              class="padding-left-3"
              @click="showResetConfirm = true"
            >
              重置
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          帮助<el-icon><ElIconArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$emit('show-about-dialog')">
              关于
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-button plain size="default" :type="btnType" @click="copy">
      复制
    </el-button>
    <el-button plain size="default" :type="btnType" @click="prePost">
      发布
    </el-button>

    <PostInfoDialog
      :form="form"
      @post="post"
      @close="form.dialogVisible = false"
    />
    <ResetDialog
      :show-reset-confirm="showResetConfirm"
      @confirm="confirmReset"
      @close="cancelReset"
    />
  </el-container>
</template>

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
