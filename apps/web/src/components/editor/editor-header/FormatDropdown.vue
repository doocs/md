<script setup lang="ts">
import type { EditorView } from '@codemirror/view'
import { ctrlKey, ctrlSign } from '@md/shared/configs'
import {
  applyHeading,
  formatBold,
  formatCode,
  formatItalic,
  formatLink,
  formatOrderedList,
  formatStrikethrough,
  formatUnorderedList,
} from '@md/shared/editor'
import {
  Bold,
  Clock,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  Link,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
} from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const renderStore = useRenderStore()
const { editor } = storeToRefs(editorStore)

// Editor refresh function
function editorRefresh() {
  themeStore.updateCodeTheme()

  const raw = editorStore.getContent()
  renderStore.render(raw, {
    isCiteStatus: themeStore.isCiteStatus,
    legend: themeStore.legend,
    isUseIndent: themeStore.isUseIndent,
    isUseJustify: themeStore.isUseJustify,
    isCountStatus: themeStore.isCountStatus,
    isMacCodeBlock: themeStore.isMacCodeBlock,
    isShowLineNumber: themeStore.isShowLineNumber,
  })
}

function citeStatusChanged() {
  themeStore.toggleCiteStatus()
  editorRefresh()
}

function countStatusChanged() {
  themeStore.toggleCountStatus()
  editorRefresh()
}

// 工具函数，添加格式
function addFormat(cmd: string) {
  const editorView = editor.value as EditorView
  if (!editor.value)
    return

  switch (cmd) {
    case `${ctrlKey}-B`:
      formatBold(editorView)
      break
    case `${ctrlKey}-I`:
      formatItalic(editorView)
      break
    case `${ctrlKey}-D`:
      formatStrikethrough(editorView)
      break
    case `${ctrlKey}-K`:
      formatLink(editorView)
      break
    case `${ctrlKey}-E`:
      formatCode(editorView)
      break
    case `${ctrlKey}-1`:
      applyHeading(editorView, 1)
      break
    case `${ctrlKey}-2`:
      applyHeading(editorView, 2)
      break
    case `${ctrlKey}-3`:
      applyHeading(editorView, 3)
      break
    case `${ctrlKey}-4`:
      applyHeading(editorView, 4)
      break
    case `${ctrlKey}-5`:
      applyHeading(editorView, 5)
      break
    case `${ctrlKey}-6`:
      applyHeading(editorView, 6)
      break
    case `${ctrlKey}-U`:
      formatUnorderedList(editorView)
      break
    case `${ctrlKey}-O`:
      formatOrderedList(editorView)
      break
  }
}
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      格式
    </MenubarSubTrigger>
    <MenubarSubContent class="w-64">
      <!-- 文本格式化 -->
      <MenubarItem @click="addFormat(`${ctrlKey}-B`)">
        <Bold class="mr-2 h-4 w-4" />
        加粗
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">B</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-I`)">
        <Italic class="mr-2 h-4 w-4" />
        斜体
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">I</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-D`)">
        <Strikethrough class="mr-2 h-4 w-4" />
        删除线
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">D</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-K`)">
        <Link class="mr-2 h-4 w-4" />
        超链接
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">K</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-E`)">
        <Code class="mr-2 h-4 w-4" />
        行内代码
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">E</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <!-- 标题和列表 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Heading1 class="mr-2 h-4 w-4" />
          标题
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="addFormat(`${ctrlKey}-1`)">
            <Heading1 class="mr-2 h-4 w-4" />
            标题 1
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">1</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-2`)">
            <Heading2 class="mr-2 h-4 w-4" />
            标题 2
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">2</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-3`)">
            <Heading3 class="mr-2 h-4 w-4" />
            标题 3
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">3</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-4`)">
            <Heading4 class="mr-2 h-4 w-4" />
            标题 4
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">4</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-5`)">
            <Heading5 class="mr-2 h-4 w-4" />
            标题 5
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">5</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-6`)">
            <Heading6 class="mr-2 h-4 w-4" />
            标题 6
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">6</kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem @click="addFormat(`${ctrlKey}-U`)">
        <List class="mr-2 h-4 w-4" />
        无序列表
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">U</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-O`)">
        <ListOrdered class="mr-2 h-4 w-4" />
        有序列表
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">O</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="citeStatusChanged()">
        <Link2 class="mr-2 h-4 w-4" />
        微信外链转引用
      </MenubarItem>
      <MenubarItem @click="countStatusChanged()">
        <Clock class="mr-2 h-4 w-4" />
        统计字数时间
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      格式
    </MenubarTrigger>
    <MenubarContent class="w-64" align="start">
      <!-- 文本格式化 -->
      <MenubarItem @click="addFormat(`${ctrlKey}-B`)">
        <Bold class="mr-2 h-4 w-4" />
        加粗
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">B</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-I`)">
        <Italic class="mr-2 h-4 w-4" />
        斜体
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">I</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-D`)">
        <Strikethrough class="mr-2 h-4 w-4" />
        删除线
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">D</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-K`)">
        <Link class="mr-2 h-4 w-4" />
        超链接
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">K</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-E`)">
        <Code class="mr-2 h-4 w-4" />
        行内代码
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">E</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <!-- 标题和列表 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Heading1 class="mr-2 h-4 w-4" />
          标题
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="addFormat(`${ctrlKey}-1`)">
            <Heading1 class="mr-2 h-4 w-4" />
            标题 1
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">1</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-2`)">
            <Heading2 class="mr-2 h-4 w-4" />
            标题 2
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">2</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-3`)">
            <Heading3 class="mr-2 h-4 w-4" />
            标题 3
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">3</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-4`)">
            <Heading4 class="mr-2 h-4 w-4" />
            标题 4
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">4</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-5`)">
            <Heading5 class="mr-2 h-4 w-4" />
            标题 5
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">5</kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem @click="addFormat(`${ctrlKey}-6`)">
            <Heading6 class="mr-2 h-4 w-4" />
            标题 6
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">6</kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem @click="addFormat(`${ctrlKey}-U`)">
        <List class="mr-2 h-4 w-4" />
        无序列表
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">U</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-O`)">
        <ListOrdered class="mr-2 h-4 w-4" />
        有序列表
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">O</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="citeStatusChanged()">
        <Link2 class="mr-2 h-4 w-4" />
        微信外链转引用
      </MenubarItem>
      <MenubarItem @click="countStatusChanged()">
        <Clock class="mr-2 h-4 w-4" />
        统计字数时间
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
