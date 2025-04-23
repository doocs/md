<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { useCopyContent } from '@/composables/useCopyContent'
import {
  altSign,
  ctrlKey,
  ctrlSign,
  shiftSign,
} from '@/config'

import { useStore } from '@/stores'
import { ChevronDownIcon, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sun } from 'lucide-vue-next'

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

const { isDark, isCiteStatus, isCountStatus, isOpenPostSlider } = storeToRefs(store)

const { toggleDark, citeStatusChanged, countStatusChanged } = store

const { copyMode, handleCopyContent } = useCopyContent()
</script>

<template>
  <header class="header-container h-15 flex flex-wrap items-center justify-between px-5 dark:bg-[#191c20]">
    <!-- 左侧菜单：移动端隐藏 -->
    <div class="space-x-2 hidden sm:flex">
      <Menubar class="menubar">
        <FileDropdown />

        <MenubarMenu>
          <MenubarTrigger> 格式 </MenubarTrigger>
          <MenubarContent class="w-60" align="start">
            <MenubarCheckboxItem
              v-for="{ label, kbd, emitArgs } in formatItems"
              :key="label"
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

    <!-- 右侧操作区：移动端保留核心按钮 -->
    <div class="space-x-2 flex flex-wrap">
      <!-- 展开/收起左侧内容栏 -->
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

      <!-- 暗色切换 -->
      <Button variant="outline" @click="toggleDark()">
        <Moon v-show="isDark" class="size-4" />
        <Sun v-show="!isDark" class="size-4" />
      </Button>

      <!-- 复制按钮组 -->
      <div class="space-x-1 bg-background text-background-foreground mx-2 flex items-center border rounded-md">
        <Button variant="ghost" class="shadow-none" @click="() => handleCopyContent(copyMode)">
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

      <!-- 文章信息（移动端隐藏） -->
      <PostInfo class="hidden sm:inline-flex" />

      <!-- 设置按钮 -->
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
