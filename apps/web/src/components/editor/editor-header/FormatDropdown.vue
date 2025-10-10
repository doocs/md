<script setup lang="ts">
import { applyHeading, toggleFormat, toggleList } from '@md/shared/editor'
import { altSign, ctrlKey, ctrlSign, shiftSign } from '@/configs/shortcut-key'
import { useStore } from '@/stores'

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

  const formatMap: Record<string, () => void> = {
    [`${ctrlKey}-B`]: () => toggleFormat(editor.value!, { prefix: `**`, suffix: `**`, afterOffset: -2 }),
    [`${ctrlKey}-I`]: () => toggleFormat(editor.value!, { prefix: `*`, suffix: `*`, afterOffset: -1 }),
    [`${ctrlKey}-D`]: () => toggleFormat(editor.value!, { prefix: `~~`, suffix: `~~`, afterOffset: -2 }),
    [`${ctrlKey}-K`]: () => toggleFormat(editor.value!, { prefix: `[`, suffix: `]()`, afterOffset: -1 }),
    [`${ctrlKey}-E`]: () => toggleFormat(editor.value!, { prefix: `\``, suffix: `\``, afterOffset: -1 }),
    [`${ctrlKey}-H`]: () => applyHeading(editor.value!, 1),
    [`${ctrlKey}-U`]: () => toggleList(editor.value!, `unordered`),
    [`${ctrlKey}-O`]: () => toggleList(editor.value!, `ordered`),
  }

  const handler = formatMap[cmd]
  if (handler) {
    handler()
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
