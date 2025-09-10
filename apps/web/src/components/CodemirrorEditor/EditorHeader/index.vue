<script setup lang="ts">
import {
  ChevronDownIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-vue-next'
import { altSign, ctrlKey, ctrlSign, shiftSign } from '@/configs/shortcut-key'
import { useStore } from '@/stores'
import { addPrefix, processClipboardContent } from '@/utils'

const emit = defineEmits([`startCopy`, `endCopy`])

const store = useStore()

const {
  isCiteStatus,
  isCountStatus,
  output,
  primaryColor,
  isOpenPostSlider,
  editor,
} = storeToRefs(store)

const {
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
    nextTick(async () => {
      await processClipboardContent(primaryColor.value)
      const clipboardDiv = document.getElementById(`output`)!
      clipboardDiv.focus()
      window.getSelection()!.removeAllRanges()

      const temp = clipboardDiv.innerHTML

      if (copyMode.value === `txt`) {
        // execCommand 已废弃，且会丢失 SVG 等复杂内容
        try {
          const plainText = clipboardDiv.textContent || ``
          const clipboardItem = new ClipboardItem({
            'text/html': new Blob([temp], { type: `text/html` }),
            'text/plain': new Blob([plainText], { type: `text/plain` }),
          })
          // FIX: https://stackoverflow.com/questions/62327358/javascript-clipboard-api-safari-ios-notallowederror-message
          // NotAllowedError: the request is not allowed by the user agent or the platform in the current context,
          // possibly because the user denied permission.
          setTimeout(async () => {
            await navigator.clipboard.write([clipboardItem])
          }, 0)
        }
        catch (error) {
          toast.error(`复制失败，请联系开发者。${error}`)
          return
        }
      }

      clipboardDiv.innerHTML = output.value

      if (copyMode.value === `html`) {
        await copyContent(temp)
      }
      else if (copyMode.value === `html-and-style`) {
        await copyContent(store.editorContent2HTML())
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
    class="header-container h-15 flex flex-wrap items-center justify-between px-5 relative"
  >
    <!-- 桌面端左侧菜单 -->
    <div class="space-x-2 hidden md:flex">
      <Menubar class="menubar border-0">
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

    <!-- 移动端汉堡菜单按钮 -->
    <div class="md:hidden">
      <Menubar class="menubar border-0 p-0">
        <MenubarMenu>
          <MenubarTrigger as-child class="p-0">
            <Button variant="outline" size="icon">
              <Menu class="size-4" />
            </Button>
          </MenubarTrigger>
          <MenubarContent align="start" class="w-64 h-[calc(100vh-60px)]">
            <Menubar class="menubar border-0 flex-col gap-2">
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
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>

    <!-- 右侧操作区 -->
    <div class="space-x-2 flex flex-wrap items-center">
      <!-- 展开/收起左侧内容栏 -->
      <Button
        variant="outline"
        size="icon"
        @click="isOpenPostSlider = !isOpenPostSlider"
      >
        <PanelLeftOpen v-show="!isOpenPostSlider" class="size-4" />
        <PanelLeftClose v-show="isOpenPostSlider" class="size-4" />
      </Button>

      <!-- 复制按钮组 -->
      <div
        class="bg-background space-x-1 text-background-foreground flex items-center border rounded-md"
      >
        <Button variant="ghost" class="shadow-none text-sm px-2 md:px-4" @click="copy">
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
              <DropdownMenuRadioItem value="html-and-style">
                HTML 格式（兼容样式）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="md">
                MD 格式
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- 文章信息（移动端隐藏） -->
      <PostInfo class="hidden md:inline-flex" />

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

@media (max-width: 768px) {
  .menubar {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;

    > * {
      width: 100%;
      justify-content: flex-start;
    }
  }
}
</style>
