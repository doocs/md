<script setup lang="ts">
import { Blocks, FunctionSquare, Image, Table } from '@lucide/vue'
import { normalizeFormulaInput } from '@/lib/markdown/formula'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)
const { t } = useI18n()
const uiStore = useUIStore()
const editorStore = useEditorStore()

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog, toggleShowComponentDialog } = uiStore

function openFormulaEditor() {
  const selection = normalizeFormulaInput(editorStore.getSelection())
  uiStore.openFormulaEditor({
    value: selection.latex,
    displayMode: selection.displayMode,
  })
}
</script>

<template>
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      {{ t('menu.insert') }}
    </MenubarSubTrigger>
    <MenubarSubContent class="w-52">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <Image class="mr-2 h-4 w-4" />
        {{ t('menu.image') }}
      </MenubarItem>
      <MenubarItem @click="openFormulaEditor()">
        <FunctionSquare class="mr-2 h-4 w-4" />
        {{ t('menu.formula') }}
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <Table class="mr-2 h-4 w-4" />
        {{ t('menu.table') }}
      </MenubarItem>
      <MenubarItem @click="toggleShowComponentDialog()">
        <Blocks class="mr-2 h-4 w-4" />
        {{ t('menu.component') }}
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <MenubarMenu v-else>
    <MenubarTrigger>
      {{ t('menu.insert') }}
    </MenubarTrigger>
    <MenubarContent class="w-52" align="start">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <Image class="mr-2 h-4 w-4" />
        {{ t('menu.image') }}
      </MenubarItem>
      <MenubarItem @click="openFormulaEditor()">
        <FunctionSquare class="mr-2 h-4 w-4" />
        {{ t('menu.formula') }}
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <Table class="mr-2 h-4 w-4" />
        {{ t('menu.table') }}
      </MenubarItem>
      <MenubarItem @click="toggleShowComponentDialog()">
        <Blocks class="mr-2 h-4 w-4" />
        {{ t('menu.component') }}
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
