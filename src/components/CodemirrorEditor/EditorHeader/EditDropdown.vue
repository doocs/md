<script setup lang="ts">
import { ClipboardPasteIcon, Contact2Icon, CopyIcon, RefreshCwIcon, TableIcon, UploadCloudIcon } from 'lucide-vue-next'
import BatchReplaceImageDialog from '../BatchReplaceImageDialog.vue'

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog, toggleShowInsertMpCardDialog } = useDisplayStore()

const store = useStore()
const { copyToClipboard, pasteFromClipboard } = store

const batchReplaceImageDialogRef = ref<InstanceType<typeof BatchReplaceImageDialog>>()

function handleReplaceImages() {
  batchReplaceImageDialogRef.value?.open()
}
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      编辑
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <UploadCloudIcon class="mr-2 h-4 w-4" />
        上传图片
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <TableIcon class="mr-2 h-4 w-4" />
        插入表格
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertMpCardDialog()">
        <Contact2Icon class="mr-2 h-4 w-4" />
        插入公众号名片
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="handleReplaceImages">
        <RefreshCwIcon class="mr-2 h-4 w-4" />
        替换图片源
      </MenubarItem>
      <MenubarSeparator />
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

  <!-- 批量替换图片源对话框 -->
  <BatchReplaceImageDialog ref="batchReplaceImageDialogRef" />
</template>
