<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElNotification } from 'element-plus'

import ResetDialog from './ResetDialog.vue'
import StyleOptionMenu from './StyleOptionMenu.vue'
import PostInfo from './PostInfo.vue'
import HelpDropdown from './HelpDropdown.vue'
import FileDropdown from './FileDropdown.vue'

import { mergeCss, solveWeChatImage } from '@/assets/scripts/converter'
import config from '@/config'
import { useStore } from '@/stores'

const emit = defineEmits([
  `addFormat`,
  `formatContent`,
  `startCopy`,
  `endCopy`,
  `showCssEditor`,
  `showDialogUploadImg`,
  `showDialogForm`,
])

const formatItems = [
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
]

const store = useStore()

const {
  fontFamily,
  fontSize,
  fontColor,
  codeBlockTheme,
  legend,
  isDark,
  isCiteStatus,
  isMacCodeBlock,
  output,
  cssEditor,
  editor,
} = storeToRefs(store)

const {
  toggleDark,
  resetStyle,
  editorRefresh,

  fontChanged,
  sizeChanged,
  colorChanged,
  codeBlockThemeChanged,
  legendChanged,
  macCodeBlockChanged,
  citeStatusChanged,
} = store

const colorPicker = ref(null)

function showPicker() {
  colorPicker.value.show()
}

// 复制到微信公众号
function copy() {
  emit(`startCopy`)
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

    // 如果是深色模式，复制之前需要先切换到白天模式
    const isBeforeDark = isDark.value
    if (isBeforeDark) {
      toggleDark()
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
      // 适配主题中的颜色变量
      .replaceAll(`var(--el-text-color-regular)`, `#3f3f3f`)
    clipboardDiv.focus()
    window.getSelection().removeAllRanges()
    const range = document.createRange()

    range.setStartBefore(clipboardDiv.firstChild)
    range.setEndAfter(clipboardDiv.lastChild)
    window.getSelection().addRange(range)
    document.execCommand(`copy`)
    window.getSelection().removeAllRanges()
    clipboardDiv.innerHTML = output.value

    if (isBeforeDark) {
      toggleDark()
    }

    // 输出提示
    ElNotification({
      showClose: true,
      message: `已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴`,
      offset: 80,
      duration: 1600,
      type: `success`,
    })

    editorRefresh()
    emit(`endCopy`)
  }, 350)
}

// 自定义CSS样式
function customStyle() {
  emit(`showCssEditor`)
  nextTick(() => {
    if (!cssEditor.value) {
      cssEditor.value.refresh()
    }
  })
  setTimeout(() => {
    cssEditor.value.refresh()
  }, 50)
}

const showResetConfirm = ref(false)

// 重置样式
function confirmReset() {
  showResetConfirm.value = false
  resetStyle()
  ElNotification({
    showClose: true,
    message: `已重置样式`,
    offset: 80,
    duration: 1600,
    type: `success`,
  })
}

function cancelReset() {
  showResetConfirm.value = false
  editor.value.focus()
}
</script>

<template>
  <div class="header-container">
    <el-space class="dropdowns flex-auto" size="large">
      <FileDropdown />
      <el-dropdown>
        <span class="el-dropdown-link">
          格式<el-icon class="ml-2">
            <ElIconArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="format-list">
            <el-dropdown-item
              v-for="{ label, kbd, emitArgs } in formatItems"
              :key="kbd"
              class="format-item leading-8"
              @click="$emit(...emitArgs)"
            >
              <el-icon class="opacity-0">
                <ElIconCheck />
              </el-icon>
              {{ label }}
              <kbd class="ml-auto">{{ kbd }}</kbd>
            </el-dropdown-item>
            <el-dropdown-item divided class="leading-8" @click="citeStatusChanged">
              <el-icon :class="{ 'opacity-0': !isCiteStatus }">
                <ElIconCheck />
              </el-icon>
              微信外链转底部引用
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          编辑<el-icon class="ml-2">
            <ElIconArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item class="leading-8" @click="$emit('showDialogUploadImg')">
              <el-icon>
                <ElIconUpload />
              </el-icon>
              上传图片
            </el-dropdown-item>
            <el-dropdown-item class="leading-8" @click="$emit('showDialogForm')">
              <el-icon>
                <ElIconGrid />
              </el-icon>
              插入表格
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <span class="el-dropdown-link">
          样式<el-icon class="ml-2">
            <ElIconArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item class="leading-8">
              <StyleOptionMenu title="字体" :options="config.builtinFonts" :current="fontFamily" :change="fontChanged" />
            </el-dropdown-item>
            <el-dropdown-item class="leading-8">
              <StyleOptionMenu title="字号" :options="config.sizeOption" :current="fontSize" :change="sizeChanged" />
            </el-dropdown-item>
            <el-dropdown-item class="leading-8">
              <StyleOptionMenu
                title="颜色"
                :options="config.colorOption"
                :current="fontColor"
                :change="colorChanged"
              />
            </el-dropdown-item>
            <el-dropdown-item class="leading-8">
              <StyleOptionMenu
                title="代码主题"
                :options="config.codeThemeOption"
                :current="codeBlockTheme"
                :change="codeBlockThemeChanged"
              />
            </el-dropdown-item>
            <el-dropdown-item class="leading-8">
              <StyleOptionMenu title="图注格式" :options="config.legendOption" :current="legend" :change="legendChanged" />
            </el-dropdown-item>
            <el-dropdown-item divided class="leading-8" @click="showPicker()">
              <el-tooltip placement="right" effect="light">
                <template #content>
                  <el-color-picker
                    ref="colorPicker"
                    v-model="fontColor"
                    :teleported="false"
                    show-alpha
                    class="ml-auto"
                    style="height: 2em"
                    @change="colorChanged"
                  />
                </template>
                <div class="flex w-full">
                  <el-icon class="opacity-0">
                    <ElIconCheck />
                  </el-icon>
                  自定义颜色
                </div>
              </el-tooltip>
            </el-dropdown-item>
            <el-dropdown-item class="leading-8" @click="customStyle">
              <el-icon class="opacity-0">
                <ElIconCheck />
              </el-icon>
              自定义 CSS
            </el-dropdown-item>
            <el-dropdown-item divided class="leading-8" @click="macCodeBlockChanged">
              <el-icon :class="{ 'opacity-0': !isMacCodeBlock }">
                <ElIconCheck />
              </el-icon>
              Mac 代码块
            </el-dropdown-item>
            <el-dropdown-item divided class="leading-8" @click="showResetConfirm = true">
              <el-icon class="opacity-0">
                <ElIconCheck />
              </el-icon>
              重置
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <HelpDropdown />
    </el-space>
    <el-button plain type="primary" @click="copy">
      复制
    </el-button>

    <PostInfo />

    <ResetDialog :show-reset-confirm="showResetConfirm" @confirm="confirmReset" @close="cancelReset" />
  </div>
</template>

<style lang="less" scoped>
.header-container {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.format-list {
  width: 250px;
}

.format-item {
  kbd {
    font-size: 0.75em;
    float: right;
    color: #666;
  }
}
</style>
