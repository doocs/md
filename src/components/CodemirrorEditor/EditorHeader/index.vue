<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import {
  altSign,
  ctrlKey,
  ctrlSign,
  shiftSign,
} from '@/config'
import { useStore } from '@/stores'
import { addPrefix, processClipboardContent } from '@/utils'
import { ChevronDownIcon, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sun } from 'lucide-vue-next'

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

const { isDark, isCiteStatus, isCountStatus, output, primaryColor, isOpenPostSlider } = storeToRefs(store)

const { toggleDark, editorRefresh, citeStatusChanged, countStatusChanged } = store

const copyMode = useStorage(addPrefix(`copyMode`), `txt`)
const source = ref(``)
const { copy: copyContent } = useClipboard({ source })

// 复制到微信公众号
function copy() {
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

      editorRefresh()
      emit(`endCopy`)
    })
  }, 350)
}
</script>

<template>
  <header class="header-container h-15 flex items-center justify-between px-5 dark:bg-[#191c20]">
    <div class="space-x-2 flex">
      <Menubar class="menubar">
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

    <div class="space-x-2 flex">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline" @click="isOpenPostSlider = !isOpenPostSlider">
              <PanelLeftOpen v-show="!isOpenPostSlider" class="size-4" />
              <PanelLeftClose v-show="isOpenPostSlider" class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {{ isOpenPostSlider ? "关闭" : "内容管理" }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button variant="outline" @click="toggleDark()">
        <Moon v-show="isDark" class="size-4" />
        <Sun v-show="!isDark" class="size-4" />
      </Button>

      <div class="bg-background space-x-1 text-background-foreground mx-2 flex items-center border rounded-md">
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
                公众号格式
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="html">
                HTML 格式
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PostInfo />

      <Button variant="outline" @click="store.isOpenRightSlider = !store.isOpenRightSlider">
        <Settings class="size-4" />
      </Button>

      <Toaster rich-colors position="top-center" />
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
