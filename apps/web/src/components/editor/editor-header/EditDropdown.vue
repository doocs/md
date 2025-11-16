<script setup lang="ts">
import { ClipboardPasteIcon, Contact2Icon, CopyIcon, Redo2Icon, TableIcon, Undo2Icon, UploadCloudIcon } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { copyPlain } from '@/utils/clipboard'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)

const editorStore = useEditorStore()
const uiStore = useUIStore()

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog, toggleShowInsertMpCardDialog } = uiStore

// Clipboard operations
async function copyToClipboard() {
  const selectedText = editorStore.getSelection()
  copyPlain(selectedText)
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    editorStore.replaceSelection(text)
  }
  catch (error) {
    console.log(`粘贴失败`, error)
  }
}

// Undo/Redo (handled by keyboard shortcuts)
function undo() {
  console.log(`Undo should be handled by keyboard shortcuts`)
}

function redo() {
  console.log(`Redo should be handled by keyboard shortcuts`)
}
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      编辑
    </MenubarSubTrigger>
    <MenubarSubContent>
      <!-- 历史操作 -->
      <MenubarItem @click="undo()">
        <Undo2Icon class="mr-2 h-4 w-4" />
        撤销
      </MenubarItem>
      <MenubarItem @click="redo()">
        <Redo2Icon class="mr-2 h-4 w-4" />
        重做
      </MenubarItem>

      <MenubarSeparator />

      <!-- 插入操作子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <TableIcon class="mr-2 h-4 w-4" />
          插入
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="toggleShowUploadImgDialog()">
            <UploadCloudIcon class="mr-2 h-4 w-4" />
            插入图片
          </MenubarItem>
          <MenubarItem @click="toggleShowInsertFormDialog()">
            <TableIcon class="mr-2 h-4 w-4" />
            插入表格
          </MenubarItem>
          <MenubarItem @click="toggleShowInsertMpCardDialog()">
            <Contact2Icon class="mr-2 h-4 w-4" />
            插入公众号名片
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <!-- 剪贴板操作 -->
      <MenubarItem @click="copyToClipboard()">
        <CopyIcon class="mr-2 h-4 w-4" />
        复制
      </MenubarItem>
      <MenubarItem @click="pasteFromClipboard()">
        <ClipboardPasteIcon class="mr-2 h-4 w-4" />
        粘贴
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      编辑
    </MenubarTrigger>
    <MenubarContent align="start">
      <!-- 历史操作 -->
      <MenubarItem @click="undo()">
        <Undo2Icon class="mr-2 h-4 w-4" />
        撤销
      </MenubarItem>
      <MenubarItem @click="redo()">
        <Redo2Icon class="mr-2 h-4 w-4" />
        重做
      </MenubarItem>

      <MenubarSeparator />

      <!-- 插入操作子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <TableIcon class="mr-2 h-4 w-4" />
          插入
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="toggleShowUploadImgDialog()">
            <UploadCloudIcon class="mr-2 h-4 w-4" />
            插入图片
          </MenubarItem>
          <MenubarItem @click="toggleShowInsertFormDialog()">
            <TableIcon class="mr-2 h-4 w-4" />
            插入表格
          </MenubarItem>
          <MenubarItem @click="toggleShowInsertMpCardDialog()">
            <Contact2Icon class="mr-2 h-4 w-4" />
            插入公众号名片
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <!-- 剪贴板操作 -->
      <MenubarItem @click="copyToClipboard()">
        <CopyIcon class="mr-2 h-4 w-4" />
        复制
      </MenubarItem>
      <MenubarItem @click="pasteFromClipboard()">
        <ClipboardPasteIcon class="mr-2 h-4 w-4" />
        粘贴
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
