<script setup lang="ts">
import { altSign, ctrlKey, ctrlSign, shiftSign } from '@/configs/shortcut-key'
import { useStore } from '@/stores'
import {
  applyHeading,
  formatBold,
  formatCode,
  formatItalic,
  formatLink,
  formatOrderedList,
  formatStrikethrough,
  formatUnorderedList,
} from '@/utils/editor'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)

const store = useStore()

const {
  isCiteStatus,
  isCountStatus,
  editor,
} = storeToRefs(store)

const {
  citeStatusChanged,
  countStatusChanged,
  formatContent,
} = store

// 工具函数，添加格式
function addFormat(cmd: string) {
  if (!editor.value)
    return

  // 获取兼容层编辑器
  const compatEditor = (editor.value as any).compatibleEditor || editor.value

  switch (cmd) {
    case `${ctrlKey}-B`:
      formatBold(compatEditor)
      break
    case `${ctrlKey}-I`:
      formatItalic(compatEditor)
      break
    case `${ctrlKey}-D`:
      formatStrikethrough(compatEditor)
      break
    case `${ctrlKey}-K`:
      formatLink(compatEditor)
      break
    case `${ctrlKey}-E`:
      formatCode(compatEditor)
      break
    case `${ctrlKey}-H`:
      applyHeading(compatEditor, 1)
      break
    case `${ctrlKey}-U`:
      formatUnorderedList(compatEditor)
      break
    case `${ctrlKey}-O`:
      formatOrderedList(compatEditor)
      break
    case `${ctrlKey}-1`:
      applyHeading(compatEditor, 1)
      break
    case `${ctrlKey}-2`:
      applyHeading(compatEditor, 2)
      break
    case `${ctrlKey}-3`:
      applyHeading(compatEditor, 3)
      break
    case `${ctrlKey}-4`:
      applyHeading(compatEditor, 4)
      break
    case `${ctrlKey}-5`:
      applyHeading(compatEditor, 5)
      break
    case `${ctrlKey}-6`:
      applyHeading(compatEditor, 6)
      break
  }
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
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      格式
    </MenubarSubTrigger>
    <MenubarSubContent class="w-60">
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
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
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
</template>
