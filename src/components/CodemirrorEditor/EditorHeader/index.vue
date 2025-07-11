<script setup lang="ts">
import {
  ChevronDownIcon,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
} from 'lucide-vue-next'
import { altSign, ctrlKey, ctrlSign, shiftSign } from '@/config'
import { useStore } from '@/stores'
import { addPrefix, processClipboardContent } from '@/utils'

const emit = defineEmits([`startCopy`, `endCopy`])

const store = useStore()

const {
  isDark,
  isCiteStatus,
  isCountStatus,
  output,
  primaryColor,
  isOpenPostSlider,
  editor,
} = storeToRefs(store)

const {
  toggleDark,
  editorRefresh,
  citeStatusChanged,
  countStatusChanged,
  formatContent,
} = store

// 工具函数，添加格式
function addFormat(cmd: string) {
  (editor.value as any).options.extraKeys[cmd](editor.value)
}

const formatItems = [
  {
    label: `加粗`,
    kbd: [ctrlSign, `B`],
    cmd: `${ctrlKey}-B`,
  },
  {
    label: `斜体`,
    kbd: [ctrlSign, `I`],
    cmd: `${ctrlKey}-I`,
  },
  {
    label: `删除线`,
    kbd: [ctrlSign, `D`],
    cmd: `${ctrlKey}-D`,
  },
  {
    label: `超链接`,
    kbd: [ctrlSign, `K`],
    cmd: `${ctrlKey}-K`,
  },
  {
    label: `行内代码`,
    kbd: [ctrlSign, `E`],
    cmd: `${ctrlKey}-E`,
  },
  {
    label: `标题`,
    kbd: [ctrlSign, `H`],
    cmd: `${ctrlKey}-H`,
  },
  {
    label: `无序列表`,
    kbd: [ctrlSign, `U`],
    cmd: `${ctrlKey}-U`,
  },
  {
    label: `有序列表`,
    kbd: [ctrlSign, `O`],
    cmd: `${ctrlKey}-O`,
  },
  {
    label: `格式化`,
    kbd: [altSign, shiftSign, `F`],
    cmd: `formatContent`,
  },
] as const

const copyMode = useStorage(addPrefix(`copyMode`), `txt`)

const { copy: copyContent } = useClipboard({
  legacy: true,
})

// 复制到微信公众号
async function copy() {
  // 如果是 Markdown 源码，直接复制并返回
  if (copyMode.value === `md`) {
    const mdContent = editor.value?.getValue() || ``
    await copyContent(mdContent)
    toast.success(`已复制 Markdown 源码到剪贴板。`)
    return
  }

  // 以下处理非 Markdown 的复制流程
  emit(`startCopy`)

  setTimeout(() => {
    // 如果是深色模式，复制之前需要先切换到白天模式
    const isBeforeDark = isDark.value
    if (isBeforeDark) {
      toggleDark()
    }

    nextTick(async () => {
      processClipboardContent(primaryColor.value)
      const clipboardDiv = document.getElementById(`output`)!
      clipboardDiv.focus()
      window.getSelection()!.removeAllRanges()

      const temp = clipboardDiv.innerHTML

      if (copyMode.value === `txt`) {
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

      if (copyMode.value === `html`) {
        await copyContent(temp)
      }

      // 输出提示
      toast.success(
        copyMode.value === `html`
          ? `已复制 HTML 源码，请进行下一步操作。`
          : `已复制渲染后的内容到剪贴板，可直接到公众号后台粘贴。`,
      )
      window.dispatchEvent(
        new CustomEvent(`copyToMp`, {
          detail: {
            content: output.value,
          },
        }),
      )
      editorRefresh()
      emit(`endCopy`)
    })
  }, 350)
}
</script>

<template>
  <header
    class="header-container h-15 flex flex-wrap items-center justify-between px-5 dark:bg-[#191c20]"
  >
    <!-- 左侧菜单：移动端隐藏 -->
    <div class="space-x-2 hidden sm:flex">
      <Menubar class="menubar">
        <FileDropdown />

        <MenubarMenu>
          <MenubarTrigger> 格式</MenubarTrigger>
          <MenubarContent class="w-60" align="start">
            <MenubarCheckboxItem
              v-for="{ label, kbd, cmd } in formatItems"
              :key="label"
              @click="
                cmd === 'formatContent' ? formatContent() : addFormat(cmd)
              "
            >
              {{ label }}
              <MenubarShortcut>
                <kbd
                  v-for="item in kbd"
                  :key="item"
                  class="mx-1 bg-gray-2 dark:bg-stone-9"
                >
                  {{ item }}
                </kbd>
              </MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarCheckboxItem
              :checked="isCiteStatus"
              @click="citeStatusChanged()"
            >
              微信外链转底部引用
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarCheckboxItem
              :checked="isCountStatus"
              @click="countStatusChanged()"
            >
              统计字数和阅读时间
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <EditDropdown />
        <StyleDropdown />
        <HelpDropdown />
      </Menubar>
    </div>

    <!-- 右侧操作区：移动端保留核心按钮 -->
    <div class="space-x-2 flex flex-wrap">
      <!-- 展开/收起左侧内容栏 -->
      <Button
        variant="outline"
        size="icon"
        @click="isOpenPostSlider = !isOpenPostSlider"
      >
        <PanelLeftOpen v-show="!isOpenPostSlider" class="size-4" />
        <PanelLeftClose v-show="isOpenPostSlider" class="size-4" />
      </Button>

      <!-- 暗色切换 -->
      <Button variant="outline" size="icon" @click="toggleDark()">
        <Moon v-show="isDark" class="size-4" />
        <Sun v-show="!isDark" class="size-4" />
      </Button>

      <!-- 复制按钮组 -->
      <div
        class="bg-background space-x-1 text-background-foreground mx-2 flex items-center border rounded-md"
      >
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
          <DropdownMenuContent align="end" :align-offset="-5" class="w-[200px]">
            <DropdownMenuRadioGroup v-model="copyMode">
              <DropdownMenuRadioItem value="txt">
                公众号格式
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="html">
                HTML 格式
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="md">
                MD 格式
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- 文章信息（移动端隐藏） -->
      <PostInfo class="hidden sm:inline-flex" />

      <!-- 设置按钮 -->
      <Button
        variant="outline"
        size="icon"
        @click="store.isOpenRightSlider = !store.isOpenRightSlider"
      >
        <Settings class="size-4" />
      </Button>
    </div>
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
