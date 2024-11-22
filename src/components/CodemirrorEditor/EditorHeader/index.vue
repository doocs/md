<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  altSign,
  codeBlockThemeOptions,
  colorOptions,
  ctrlKey,
  ctrlSign,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  shiftSign,
  themeOptions,
} from '@/config'
import { useDisplayStore, useStore } from '@/stores'
import { mergeCss, solveWeChatImage } from '@/utils'
import { ElNotification } from 'element-plus'
import { Moon, Paintbrush, Sun } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

import { nextTick } from 'vue'
import EditDropdown from './EditDropdown.vue'

import FileDropdown from './FileDropdown.vue'
import HelpDropdown from './HelpDropdown.vue'

import PostInfo from './PostInfo.vue'
import StyleDropdown from './StyleDropdown.vue'

const emit = defineEmits([`addFormat`, `formatContent`, `startCopy`, `endCopy`])

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
] as const

const store = useStore()
const displayStore = useDisplayStore()

const { isDark, isCiteStatus, output, primaryColor } = storeToRefs(store)

const { toggleDark, editorRefresh, citeStatusChanged } = store

// 复制到微信公众号
function copy() {
  emit(`startCopy`)
  setTimeout(() => {
    function modifyHtmlStructure(htmlString: string) {
      // 创建一个 div 元素来暂存原始 HTML 字符串
      const tempDiv = document.createElement(`div`)
      tempDiv.innerHTML = htmlString

      const originalItems = tempDiv.querySelectorAll(`li > ul, li > ol`)

      originalItems.forEach((originalItem) => {
        originalItem.parentElement!.insertAdjacentElement(`afterend`, originalItem)
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

      const clipboardDiv = document.getElementById(`output`)!
      clipboardDiv.innerHTML = mergeCss(clipboardDiv.innerHTML)
      clipboardDiv.innerHTML = modifyHtmlStructure(clipboardDiv.innerHTML)
      clipboardDiv.innerHTML = clipboardDiv.innerHTML
        // 公众号不支持 position， 转换为等价的 translateY
        .replace(/top:(.*?)em/g, `transform: translateY($1em)`)
        // 适配主题中的颜色变量
        .replaceAll(`var(--el-text-color-regular)`, `#3f3f3f`)
        .replaceAll(`var(--blockquote-background)`, `#f7f7f7`)
        .replaceAll(`var(--md-primary-color)`, primaryColor.value)
        .replaceAll(/--md-primary-color:.+?;/g, ``)

      clipboardDiv.focus()

      // edge case: 由于 svg 无法复制， 在前面插入一个空节点
      const p = document.createElement(`p`)
      p.style.fontSize = `0` // 设置字体大小为 0
      p.style.lineHeight = `0` // 行高也为 0
      p.style.margin = `0` // 避免外边距干扰
      p.innerHTML = `&nbsp;`
      clipboardDiv.insertBefore(p, clipboardDiv.firstChild)

      window.getSelection()!.removeAllRanges()
      const range = document.createRange()

      range.setStartBefore(clipboardDiv.firstChild!)
      range.setEndAfter(clipboardDiv.lastChild!)
      window.getSelection()!.addRange(range)
      document.execCommand(`copy`)
      window.getSelection()!.removeAllRanges()
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

function customStyle() {
  displayStore.toggleShowCssEditor()
  setTimeout(() => {
    store.cssEditor!.refresh()
  }, 50)
}
</script>

<template>
  <header class="header-container h-15 flex items-center px-5">
    <Menubar class="menubar mr-auto">
      <FileDropdown />

      <MenubarMenu>
        <MenubarTrigger> 格式 </MenubarTrigger>
        <MenubarContent class="w-60" align="start">
          <MenubarItem
            v-for="{ label, kbd, emitArgs } in formatItems"
            :key="label"
            @click="emitArgs[0] === 'addFormat' ? $emit(emitArgs[0], emitArgs[1]) : $emit(emitArgs[0])"
          >
            <el-icon class="mr-2 h-4 w-4" />
            {{ label }}
            <MenubarShortcut>
              <kbd v-for="item in kbd" :key="item" class="mx-1 bg-gray-2 dark:bg-stone-9">
                {{ item }}
              </kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="citeStatusChanged()">
            <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isCiteStatus }">
              <ElIconCheck />
            </el-icon>
            微信外链转底部引用
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <EditDropdown />
      <StyleDropdown />
      <HelpDropdown />
    </Menubar>

    <Popover>
      <PopoverTrigger>
        <Button variant="outline">
          <Paintbrush class="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="h-100 w-100 overflow-auto px-6" align="end">
        <div class="space-y-4">
          <div class="space-y-2">
            <h2>主题</h2>
            <div class="grid grid-cols-3 justify-items-center gap-2">
              <Button
                v-for="{ label, value } in themeOptions"
                :key="value"
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': store.theme === value,
                }"
                @click="store.themeChanged(value)"
              >
                {{ label }}
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>字体</h2>
            <div class="grid grid-cols-3 justify-items-center gap-2">
              <Button
                v-for="{ label, value } in fontFamilyOptions"
                :key="value"
                variant="outline"
                class="w-full"
                :class="{ 'border-black dark:border-white': store.fontFamily === value }"
                @click="store.fontChanged(value)"
              >
                {{ label }}
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>字号</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                v-for="{ value, desc } in fontSizeOptions"
                :key="value"
                variant="outline"
                class="w-full"
                :class="{
                  'border-black dark:border-white': store.fontSize === value,
                }"
                @click="store.sizeChanged(value)"
              >
                {{ desc }}
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>主题色</h2>
            <div class="grid grid-cols-3 justify-items-center gap-2">
              <Button
                v-for="{ label, value } in colorOptions"
                :key="value"
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': store.primaryColor === value,
                }"
                @click="store.colorChanged(value)"
              >
                <span
                  class="mr-2 inline-block h-4 w-4 rounded-full"
                  :style="{
                    background: value,
                  }"
                />
                {{ label }}
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>自定义主题色</h2>
            <div>
              <el-color-picker
                v-model="primaryColor"
                :teleported="false"
                show-alpha
                @change="store.colorChanged"
              />
            </div>
          </div>
          <div class="space-y-2">
            <h2>代码块主题</h2>
            <div>
              <Select
                v-model="store.codeBlockTheme"
                @update:model-value="store.codeBlockThemeChanged"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="{ label, value } in codeBlockThemeOptions"
                    :key="label"
                    :value="value"
                  >
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <h2>图注格式</h2>
            <div class="grid grid-cols-3 justify-items-center gap-2">
              <Button
                v-for="{ label, value } in legendOptions"
                :key="value"
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': store.legend === value,
                }"
                @click="store.legendChanged(value)"
              >
                {{ label }}
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <h2>Mac 代码块</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': store.isMacCodeBlock,
                }"
                @click="!store.isMacCodeBlock && store.macCodeBlockChanged()"
              >
                开启
              </Button>
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': !store.isMacCodeBlock,
                }"
                @click="store.isMacCodeBlock && store.macCodeBlockChanged()"
              >
                关闭
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>微信外链转底部引用</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': store.isCiteStatus,
                }"
                @click="!store.isCiteStatus && store.citeStatusChanged()"
              >
                开启
              </Button>
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': !store.isCiteStatus,
                }"
                @click="store.isCiteStatus && store.citeStatusChanged()"
              >
                关闭
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>段落首行缩进</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': store.isUseIndent,
                }"
                @click="!store.isUseIndent && store.useIndentChanged()"
              >
                开启
              </Button>
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': !store.isUseIndent,
                }"
                @click="store.isUseIndent && store.useIndentChanged()"
              >
                关闭
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>自定义 CSS 面板</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': displayStore.isShowCssEditor,
                }"
                @click="!displayStore.isShowCssEditor && customStyle()"
              >
                开启
              </Button>
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': !displayStore.isShowCssEditor,
                }"
                @click="displayStore.isShowCssEditor && customStyle()"
              >
                关闭
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>编辑区位置</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': store.isEditOnLeft,
                }"
                @click="!store.isEditOnLeft && store.toggleEditOnLeft()"
              >
                左侧
              </Button>
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': !store.isEditOnLeft,
                }"
                @click="store.isEditOnLeft && store.toggleEditOnLeft()"
              >
                右侧
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>模式</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': !isDark,
                }"
                @click="store.toggleDark(false)"
              >
                <Sun class="h-4 w-4" />
              </Button>
              <Button
                class="w-full"
                variant="outline"
                :class="{
                  'border-black dark:border-white': isDark,
                }"
                @click="store.toggleDark(true)"
              >
                <Moon class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>样式配置</h2>
            <div>
              <Button
                class="w-full"
                @click="store.resetStyleConfirm()"
              >
                重置
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    <Button variant="outline" class="mx-2" @click="copy">
      复制
    </Button>

    <PostInfo />
  </header>
</template>

<style lang="less" scoped>
.menubar {
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
