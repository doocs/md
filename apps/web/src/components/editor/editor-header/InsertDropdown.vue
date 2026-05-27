<script setup lang="ts">
import { Blocks, Contact, Image, Table } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { normalizeFormulaInput } from '@/utils/formula'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)
const uiStore = useUIStore()
const editorStore = useEditorStore()

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog, toggleShowInsertMpCardDialog, toggleShowComponentDialog } = uiStore

function openFormulaEditor() {
  const selection = normalizeFormulaInput(editorStore.getSelection())
  uiStore.openFormulaEditor({
    value: selection.latex,
    displayMode: selection.displayMode,
  })
}
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      插入
    </MenubarSubTrigger>
    <MenubarSubContent class="w-52">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <Image class="mr-2 h-4 w-4" />
        图片
      </MenubarItem>
      <MenubarItem @click="openFormulaEditor()">
        <span class="mr-2 inline-flex h-4 w-4 items-center justify-center text-xs font-semibold">ƒ</span>
        公式
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <Table class="mr-2 h-4 w-4" />
        表格
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertMpCardDialog()">
        <Contact class="mr-2 h-4 w-4" />
        公众号名片
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="toggleShowComponentDialog()">
        <Blocks class="mr-2 h-4 w-4" />
        自定义组件
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      插入
    </MenubarTrigger>
    <MenubarContent class="w-52" align="start">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <Image class="mr-2 h-4 w-4" />
        图片
      </MenubarItem>
      <MenubarItem @click="openFormulaEditor()">
        <span class="mr-2 inline-flex h-4 w-4 items-center justify-center text-xs font-semibold">ƒ</span>
        公式
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <Table class="mr-2 h-4 w-4" />
        表格
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertMpCardDialog()">
        <Contact class="mr-2 h-4 w-4" />
        公众号名片
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="toggleShowComponentDialog()">
        <Blocks class="mr-2 h-4 w-4" />
        自定义组件
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
