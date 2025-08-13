<script setup lang='ts'>
import { altSign, ctrlSign, shiftSign } from '@md/shared/config'
import { useDisplayStore, useStore } from '@/stores'

const {
  exportEditorContent2HTML,
  exportEditorContent2MD,
  formatContent,
  importDefaultContent,
  copyToClipboard,
  pasteFromClipboard,
  resetStyleConfirm,
  downloadAsCardImage,
  clearContent,
} = useStore()

const {
  toggleShowInsertFormDialog,
  toggleShowInsertMpCardDialog,
  toggleShowUploadImgDialog,
} = useDisplayStore()

const importMarkdownContent = useImportMarkdownContent()
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="w-64">
      <ContextMenuItem inset @click="toggleShowUploadImgDialog()">
        上传图片
      </ContextMenuItem>
      <ContextMenuItem inset @click="toggleShowInsertFormDialog()">
        插入表格
      </ContextMenuItem>
      <ContextMenuItem
        inset
        @click="toggleShowInsertMpCardDialog()"
      >
        插入公众号名片
      </ContextMenuItem>
      <ContextMenuItem inset @click="resetStyleConfirm()">
        重置样式
      </ContextMenuItem>
      <ContextMenuItem inset @click="importDefaultContent()">
        重置文档
      </ContextMenuItem>
      <ContextMenuItem inset @click="clearContent()">
        清空内容
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem inset @click="importMarkdownContent()">
        导入 .md 文档
      </ContextMenuItem>
      <ContextMenuItem inset @click="exportEditorContent2MD()">
        导出 .md 文档
      </ContextMenuItem>
      <ContextMenuItem inset @click="exportEditorContent2HTML()">
        导出 .html
      </ContextMenuItem>
      <ContextMenuItem inset @click="downloadAsCardImage()">
        导出 .png
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem inset @click="copyToClipboard()">
        复制
        <ContextMenuShortcut>
          {{ ctrlSign }} + C
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset @click="pasteFromClipboard">
        粘贴
        <ContextMenuShortcut>
          {{ ctrlSign }} + V
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset @click="formatContent()">
        格式化
        <ContextMenuShortcut>
          {{ altSign }} + {{ shiftSign }} + F
        </ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
