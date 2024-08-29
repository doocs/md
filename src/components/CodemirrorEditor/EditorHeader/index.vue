<script setup>
import { nextTick, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElNotification } from 'element-plus'

import PostInfo from './PostInfo.vue'
import FileDropdown from './FileDropdown.vue'
import HelpDropdown from './HelpDropdown.vue'
import StyleDropdown from './StyleDropdown.vue'
import EditDropdown from './EditDropdown.vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { altSign, ctrlKey, ctrlSign, shiftSign } from '@/config'
import { mergeCss, solveWeChatImage } from '@/utils'
import { useStore } from '@/stores'

const emit = defineEmits([
  `addFormat`,
  `formatContent`,
  `startCopy`,
  `endCopy`,
])

const formatItems = [
  {
    label: `加粗`,
    kbd: [ctrlSign, `B`],
    emitArgs: [`addFormat`, `${ctrlKey}-B`],
  },
  {
    label: `斜体`,
    kbd: [ctrlSign, `I`],
    emitArgs: [`addFormat`, `${ctrlKey}-I`],
  },
  {
    label: `删除线`,
    kbd: [ctrlSign, `D`],
    emitArgs: [`addFormat`, `${ctrlKey}-D`],
  },
  {
    label: `超链接`,
    kbd: [ctrlSign, `K`],
    emitArgs: [`addFormat`, `${ctrlKey}-K`],
  },
  {
    label: `行内代码`,
    kbd: [ctrlSign, `E`],
    emitArgs: [`addFormat`, `${ctrlKey}-E`],
  },
  {
    label: `格式化`,
    kbd: [altSign, shiftSign, `F`],
    emitArgs: [`formatContent`],
  },
]

const store = useStore()

const {
  isDark,
  isCiteStatus,
  output,
  fontColor,
} = storeToRefs(store)

const {
  toggleDark,
  editorRefresh,
  citeStatusChanged,
} = store

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

    nextTick(() => {
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
        .replaceAll(`var(--md-primary-color)`, fontColor.value)
        .replaceAll(/--md-primary-color:.+?;/g, ``)
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
        nextTick(() => toggleDark())
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
    })
  }, 350)
}

const isClickTrigger = ref(false)
const isOpenList = reactive(Array.from({ length: 5 }).fill(false))
function clickTrigger() {
  isClickTrigger.value = !isClickTrigger.value
}

function openDropdown(index) {
  return () => {
    isOpenList.fill(false)
    isOpenList[index] = true
  }
}

function updateOpen(isOpen) {
  if (!isOpen) {
    isClickTrigger.value = false
  }
}
</script>

<template>
  <div class="header-container">
    <div class="dropdowns flex flex-auto">
      <FileDropdown
        :is-open="isClickTrigger && isOpenList[0]" :click-trigger="clickTrigger"
        :open-dropdown="openDropdown(0)" :update-open="updateOpen"
      />

      <DropdownMenu :open="isClickTrigger && isOpenList[1]" @update:open="updateOpen">
        <DropdownMenuTrigger
          class="flex items-center p-2 px-4 hover:bg-gray-2 dark:hover:bg-stone-9" :class="{
            'bg-gray-2': isClickTrigger && isOpenList[1],
            'dark:bg-stone-9': isClickTrigger && isOpenList[1],
          }" @click="clickTrigger()" @mouseenter="openDropdown(1)()"
        >
          格式
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-60" align="start">
          <DropdownMenuItem v-for="{ label, kbd, emitArgs } in formatItems" :key="kbd" @click="$emit(...emitArgs);">
            <el-icon class="mr-2 h-4 w-4" />
            {{ label }}
            <DropdownMenuShortcut>
              <kbd v-for="item in kbd" :key="item" class="mx-1 bg-gray-2 dark:bg-stone-9">
                {{ item }}
              </kbd>
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="citeStatusChanged()">
            <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isCiteStatus }">
              <ElIconCheck />
            </el-icon>
            微信外链转底部引用
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditDropdown
        :is-open="isClickTrigger && isOpenList[2]" :click-trigger="clickTrigger"
        :open-dropdown="openDropdown(2)" :update-open="updateOpen"
      />
      <StyleDropdown
        :is-open="isClickTrigger && isOpenList[3]" :click-trigger="clickTrigger"
        :open-dropdown="openDropdown(3)" :update-open="updateOpen"
      />
      <HelpDropdown
        :is-open="isClickTrigger && isOpenList[4]" :click-trigger="clickTrigger"
        :open-dropdown="openDropdown(4)" :update-open="updateOpen"
      />
    </div>
    <el-button plain type="primary" @click="copy">
      复制
    </el-button>

    <PostInfo />
  </div>
</template>

<style lang="less" scoped>
.header-container {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.dropdowns {
  user-select: none;
}

kbd {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #a8a8a8;
  padding: 1px 4px;
  border-radius: 2px;
}
</style>
