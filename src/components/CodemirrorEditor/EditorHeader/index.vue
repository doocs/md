<script setup lang="ts">
import type { Format } from 'vue-pick-colors'
import { Toaster } from '@/components/ui/sonner'
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
import { addPrefix, mergeCss, solveWeChatImage } from '@/utils'
import { ChevronDownIcon, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sun } from 'lucide-vue-next'
import PickColors from 'vue-pick-colors'

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

const copyMode = useStorage(addPrefix(`copyMode`), `txt`)
const source = ref(``)
const { copy: copyContent } = useClipboard({ source })

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

    nextTick(async () => {
      solveWeChatImage()

      const clipboardDiv = document.getElementById(`output`)!
      clipboardDiv.innerHTML = mergeCss(clipboardDiv.innerHTML)
      clipboardDiv.innerHTML = modifyHtmlStructure(clipboardDiv.innerHTML)
      clipboardDiv.innerHTML = clipboardDiv.innerHTML
        // 公众号不支持 position， 转换为等价的 translateY
        .replace(/top:(.*?)em/g, `transform: translateY($1em)`)
        // 适配主题中的颜色变量
        .replace(/hsl\(var\(--foreground\)\)/g, `#3f3f3f`)
        .replace(/var\(--blockquote-background\)/g, `#f7f7f7`)
        .replace(/var\(--md-primary-color\)/g, primaryColor.value)
        .replace(/--md-primary-color:.+?;/g, ``)
        .replace(/<span class="nodeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g, `<span class="nodeLabel"$1>$2</span>`)

      clipboardDiv.focus()

      // edge case: 由于 svg 无法复制， 在前面插入一个空节点
      const p = document.createElement(`p`)
      p.style.fontSize = `0` // 设置字体大小为 0
      p.style.lineHeight = `0` // 行高也为 0
      p.style.margin = `0` // 避免外边距干扰
      p.innerHTML = `&nbsp;`
      clipboardDiv.insertBefore(p, clipboardDiv.firstChild)

      // 兼容 Mermaid
      const nodes = clipboardDiv.querySelectorAll(`.nodeLabel`)
      nodes.forEach((node) => {
        const parent = node.parentElement!
        const xmlns = parent.getAttribute(`xmlns`)!
        const style = parent.getAttribute(`style`)!
        const section = document.createElement(`section`)
        section.setAttribute(`xmlns`, xmlns)
        section.setAttribute(`style`, style)
        section.innerHTML = parent.innerHTML

        const grand = parent.parentElement!
        grand.innerHTML = ``
        grand.appendChild(section)
      })

      window.getSelection()!.removeAllRanges()

      if (copyMode.value === `html`) {
        await copyContent(clipboardDiv.innerHTML)
      }
      else {
        const range = document.createRange()
        range.setStartBefore(clipboardDiv.firstChild!)
        range.setEndAfter(clipboardDiv.lastChild!)
        window.getSelection()!.addRange(range)
        document.execCommand(`copy`)
        window.getSelection()!.removeAllRanges()
      }

      clipboardDiv.innerHTML = output.value

      if (isBeforeDark) {
        nextTick(() => toggleDark())
      }

      // 输出提示
      toast.success(`已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴`)

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

const pickColorsContainer = useTemplateRef<HTMLElement | undefined>(`pickColorsContainer`)
const format = ref<Format>(`rgb`)
const formatOptions = ref<Format[]>([`rgb`, `hex`, `hsl`, `hsv`])
</script>

<template>
  <header class="header-container h-15 flex items-center px-5">
    <Menubar class="menubar mr-auto">
      <FileDropdown />

      <MenubarMenu>
        <MenubarTrigger> 格式 </MenubarTrigger>
        <MenubarContent class="w-60" align="start">
          <MenubarCheckboxItem
            v-for="{ label, kbd, emitArgs } in formatItems" :key="label"
            @click="emitArgs[0] === 'addFormat' ? $emit(emitArgs[0], emitArgs[1]) : $emit(emitArgs[0])"
          >
            {{ label }}
            <MenubarShortcut>
              <kbd v-for="item in kbd" :key="item" class="mx-1 bg-gray-2 dark:bg-stone-9">
                {{ item }}
              </kbd>
            </MenubarShortcut>
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarCheckboxItem :checked="isCiteStatus" @click="citeStatusChanged()">
            微信外链转底部引用
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <EditDropdown />
      <StyleDropdown />
      <HelpDropdown />
    </Menubar>

    <Button v-if="!store.isOpenPostSlider" variant="outline" class="mr-2" @click="store.isOpenPostSlider = true">
      <PanelLeftOpen class="size-4" />
    </Button>
    <Button v-else variant="outline" class="mr-2" @click="store.isOpenPostSlider = false">
      <PanelLeftClose class="size-4" />
    </Button>
    <Popover>
      <PopoverTrigger>
        <Button variant="outline">
          <Settings class="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="h-100 w-100 overflow-auto px-6" align="end">
        <div class="space-y-4">
          <div class="space-y-2">
            <h2>主题</h2>
            <div class="grid grid-cols-3 justify-items-center gap-2">
              <Button
                v-for="{ label, value } in themeOptions" :key="value" class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': store.theme === value,
                }" @click="store.themeChanged(value)"
              >
                {{ label }}
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>字体</h2>
            <div class="grid grid-cols-3 justify-items-center gap-2">
              <Button
                v-for="{ label, value } in fontFamilyOptions" :key="value" variant="outline" class="w-full"
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
                v-for="{ value, desc } in fontSizeOptions" :key="value" variant="outline" class="w-full" :class="{
                  'border-black dark:border-white': store.fontSize === value,
                }" @click="store.sizeChanged(value)"
              >
                {{ desc }}
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>主题色</h2>
            <div class="grid grid-cols-3 justify-items-center gap-2">
              <Button
                v-for="{ label, value } in colorOptions" :key="value" class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': store.primaryColor === value,
                }" @click="store.colorChanged(value)"
              >
                <span
                  class="mr-2 inline-block h-4 w-4 rounded-full" :style="{
                    background: value,
                  }"
                />
                {{ label }}
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>自定义主题色</h2>
            <div ref="pickColorsContainer">
              <PickColors
                v-if="pickColorsContainer"
                v-model:value="primaryColor"
                show-alpha :format="format"
                :format-options="formatOptions"
                :theme="store.isDark ? 'dark' : 'light'"
                :popup-container="pickColorsContainer"
                @change="store.colorChanged"
              />
            </div>
          </div>
          <div class="space-y-2">
            <h2>代码块主题</h2>
            <div>
              <Select v-model="store.codeBlockTheme" @update:model-value="store.codeBlockThemeChanged">
                <SelectTrigger>
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="{ label, value } in codeBlockThemeOptions" :key="label" :value="value">
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
                v-for="{ label, value } in legendOptions" :key="value" class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': store.legend === value,
                }" @click="store.legendChanged(value)"
              >
                {{ label }}
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <h2>Mac 代码块</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': store.isMacCodeBlock,
                }" @click="!store.isMacCodeBlock && store.macCodeBlockChanged()"
              >
                开启
              </Button>
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': !store.isMacCodeBlock,
                }" @click="store.isMacCodeBlock && store.macCodeBlockChanged()"
              >
                关闭
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>微信外链转底部引用</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': store.isCiteStatus,
                }" @click="!store.isCiteStatus && store.citeStatusChanged()"
              >
                开启
              </Button>
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': !store.isCiteStatus,
                }" @click="store.isCiteStatus && store.citeStatusChanged()"
              >
                关闭
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>段落首行缩进</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': store.isUseIndent,
                }" @click="!store.isUseIndent && store.useIndentChanged()"
              >
                开启
              </Button>
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': !store.isUseIndent,
                }" @click="store.isUseIndent && store.useIndentChanged()"
              >
                关闭
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>自定义 CSS 面板</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': displayStore.isShowCssEditor,
                }" @click="!displayStore.isShowCssEditor && customStyle()"
              >
                开启
              </Button>
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': !displayStore.isShowCssEditor,
                }" @click="displayStore.isShowCssEditor && customStyle()"
              >
                关闭
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>编辑区位置</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': store.isEditOnLeft,
                }" @click="!store.isEditOnLeft && store.toggleEditOnLeft()"
              >
                左侧
              </Button>
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': !store.isEditOnLeft,
                }" @click="store.isEditOnLeft && store.toggleEditOnLeft()"
              >
                右侧
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>模式</h2>
            <div class="grid grid-cols-5 justify-items-center gap-2">
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': !isDark,
                }" @click="store.toggleDark(false)"
              >
                <Sun class="h-4 w-4" />
              </Button>
              <Button
                class="w-full" variant="outline" :class="{
                  'border-black dark:border-white': isDark,
                }" @click="store.toggleDark(true)"
              >
                <Moon class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <h2>样式配置</h2>
            <Button @click="store.resetStyleConfirm">
              重置
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <div class="space-x-1 bg-background text-background-foreground mx-2 flex items-center border rounded-md">
      <Button variant="ghost" class="shadow-none" @click="copy">
        复制
      </Button>
      <Separator orientation="vertical" class="h-5" />
      <DropdownMenu v-model="copyMode">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="px-2 shadow-none">
            <ChevronDownIcon class="text-secondary-foreground h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          :align-offset="-5"
          class="w-[200px]"
        >
          <DropdownMenuRadioGroup v-model="copyMode">
            <DropdownMenuRadioItem value="txt">
              文本
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="html">
              HTML 格式
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <PostInfo />

    <Toaster rich-colors position="top-center" />
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
