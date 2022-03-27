<template>
  <div class="left-side">
    <!-- 图片上传 -->
    <el-tooltip :effect="effect" content="上传图片" placement="bottom-start">
      <i
        class="el-icon-upload"
        size="medium"
        @click="$emit('show-dialog-upload-img')"
      ></i>
    </el-tooltip>
    <!-- 导出 Markdown 文档 -->
    <el-tooltip
      class="header__item"
      :effect="effect"
      content="导出 Markdown 文档"
      placement="bottom-start"
    >
      <i class="el-icon-download" size="medium" @click="$emit('download')"></i>
    </el-tooltip>
    <!-- 导出 HTML -->
    <el-tooltip
      class="header__item"
      :effect="effect"
      content="导出 HTML 页面"
      placement="bottom-start"
    >
      <i class="el-icon-document" size="medium" @click="$emit('export')"></i>
    </el-tooltip>
    <!-- 样式重置 -->
    <el-tooltip
      class="header__item"
      :effect="effect"
      content="重置样式"
      placement="bottom-start"
    >
      <i
        class="el-icon-refresh"
        size="medium"
        @click="showResetConfirm = true"
      ></i>
    </el-tooltip>
    <!-- 插入表格 -->
    <el-tooltip
      class="header__item header__item_last"
      :effect="effect"
      content="插入表格"
      placement="bottom-start"
    >
      <i
        class="el-icon-s-grid"
        size="medium"
        @click="$emit('show-dialog-form')"
      ></i>
    </el-tooltip>
    <el-select
      v-model="selectFont"
      size="mini"
      placeholder="选择字体"
      clearable
      @change="fontChanged"
    >
      <el-option
        v-for="font in config.builtinFonts"
        :style="{ fontFamily: font.value }"
        :key="font.value"
        :label="font.label"
        :value="font.value"
      >
        <span class="select-item-left">{{ font.label }}</span>
        <span class="select-item-right">Abc</span>
      </el-option>
    </el-select>
    <el-select
      v-model="selectSize"
      size="mini"
      placeholder="选择段落字号"
      clearable
      @change="sizeChanged"
    >
      <el-option
        v-for="size in config.sizeOption"
        :key="size.value"
        :label="size.label"
        :value="size.value"
      >
        <span class="select-item-left">{{ size.label }}</span>
        <span class="select-item-right">{{ size.desc }}</span>
      </el-option>
    </el-select>
    <el-select
      v-model="selectColor"
      size="mini"
      placeholder="选择颜色"
      clearable
      @change="colorChanged"
    >
      <el-option
        v-for="color in config.colorOption"
        :key="color.value"
        :label="color.label"
        :value="color.value"
      >
        <span class="select-item-left">{{ color.label }}</span>
        <span class="select-item-right">{{ color.desc }}</span>
      </el-option>
    </el-select>
    <el-select
      v-model="selectCodeTheme"
      size="mini"
      placeholder="代码主题"
      @change="codeThemeChanged"
    >
      <el-option
        v-for="code in config.codeThemeOption"
        :key="code.value"
        :label="code.label"
        :value="code.value"
      >
        <span class="select-item-left">{{ code.label }}</span>
        <span class="select-item-right">{{ code.desc }}</span>
      </el-option>
    </el-select>
    <el-tooltip content="自定义颜色" :effect="effect" placement="top">
      <el-color-picker
        v-model="selectColor"
        size="mini"
        show-alpha
        @change="colorChanged"
      ></el-color-picker>
    </el-tooltip>
    <el-tooltip
      content="微信外链自动转为文末引用"
      :effect="effect"
      placement="top"
    >
      <el-switch
        class="header__switch"
        v-model="citeStatus"
        active-color="#67c23a"
        inactive-color="#dcdfe6"
        @change="statusChanged"
      ></el-switch>
    </el-tooltip>
    <reset-dialog
      :showResetConfirm="showResetConfirm"
      @confirm="confirmReset"
      @close="cancelReset"
    ></reset-dialog>
  </div>
</template>

<script>
import config from '@/assets/scripts/config'
import { mapState, mapMutations } from 'vuex'
import { setColorWithCustomTemplate, setFontSize } from '@/assets/scripts/util'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt'
import ResetDialog from './resetDialog'

export default {
  name: `leftSide`,
  components: {
    ResetDialog,
  },
  data() {
    return {
      config,
      form: {
        dialogVisible: false,
        title: ``,
        desc: ``,
        thumb: ``,
        content: ``,
      },
      citeStatus: false,
      showResetConfirm: false,
      selectFont: ``,
      selectSize: ``,
      selectColor: ``,
      selectCodeTheme: config.codeThemeOption[0].value,
    }
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
    colorChanged(color) {
      let theme = setFontSize(this.currentSize.replace(`px`, ``))

      theme = setColorWithCustomTemplate(theme, color)
      this.setWxRendererOptions({
        theme: theme,
      })
      this.setCurrentColor(color)
      this.$emit(`refresh`)
    },
    fontChanged(fonts) {
      this.setWxRendererOptions({
        fonts: fonts,
      })
      this.setCurrentFont(fonts)
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
      this.$emit(`refresh`)
    },
    statusChanged(val) {
      this.setCiteStatus(val)
      this.$emit(`refresh`)
    },
    codeThemeChanged(theme) {
      this.setCurrentCodeTheme(theme)
      this.$emit(`refresh`)
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
      `setCurrentFont`,
      `setCurrentSize`,
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
  },
}
</script>

<style lang="less" scoped>
.header__item {
  margin: 0 3px;
}

.header__item_last {
  margin-right: 8px;
}

.header__switch {
  margin-left: 8px;
}

.el-select {
  margin-right: 12px;
}

.left-side {
  display: flex;
  align-items: center;
  flex: 1;
}

.select-item-left {
  float: left;
}

.select-item-right {
  float: right;
  color: #8492a6;
  font-size: 13px;
}
</style>
