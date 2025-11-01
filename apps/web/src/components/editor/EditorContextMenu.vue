<script setup lang='ts'>
import { altSign, ctrlSign, shiftSign } from '@md/shared/configs'
import DEFAULT_CONTENT from '@/assets/example/markdown.md?raw'
import { useEditorStore } from '@/stores/editor'
import { useExportStore } from '@/stores/export'
import { usePostStore } from '@/stores/post'
import { useUIStore } from '@/stores/ui'
import { copyPlain } from '@/utils/clipboard'

const editorStore = useEditorStore()
const postStore = usePostStore()
const exportStore = useExportStore()
const uiStore = useUIStore()

const {
  toggleShowInsertFormDialog,
  toggleShowInsertMpCardDialog,
  toggleShowUploadImgDialog,
} = uiStore

const importMarkdownContent = useImportMarkdownContent()

// 格式化文档
async function formatContent() {
  const doc = await editorStore.formatContent()
  if (doc && postStore.currentPost) {
    postStore.updatePostContent(postStore.currentPostId, doc)
  }
}

// 导入默认内容
function importDefaultContent() {
  editorStore.importContent(DEFAULT_CONTENT)
  toast.success(`文档已重置`)
}

// 清空内容
function clearContent() {
  editorStore.clearContent()
}

// 复制到剪贴板
async function copyToClipboard() {
  const selectedText = editorStore.getSelection()
  copyPlain(selectedText)
}

// 从剪贴板粘贴
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    editorStore.replaceSelection(text)
  }
  catch (error) {
    console.log(`粘贴失败`, error)
  }
}

// 重置样式确认
function resetStyleConfirm() {
  uiStore.isOpenConfirmDialog = true
}

// 导出函数
function exportEditorContent2HTML() {
  exportStore.exportEditorContent2HTML()
}

function exportEditorContent2MD() {
  exportStore.exportEditorContent2MD(editorStore.getContent())
}

function downloadAsCardImage() {
  exportStore.downloadAsCardImage()
}
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
