<script setup lang='ts'>
import type { EditorView } from '@codemirror/view'
import { altSign, ctrlKey, ctrlSign, shiftSign } from '@md/shared/configs'
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
  ClipboardPaste,
  Copy,
  Download,
  FileCode,
  FileDown,
  FileImage,
  FileText,
  FileUp,
  Heading1,
  Image,
  Import,
  Italic,
  Link,
  List,
  ListOrdered,
  RefreshCw,
  RotateCcw,
  Strikethrough,
  Table,
  Trash2,
  Wand2,
} from 'lucide-vue-next'
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

const { editor } = storeToRefs(editorStore)

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

// 格式化工具函数
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
  <ContextMenu>
    <ContextMenuTrigger>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="w-64">
      <!-- 插入子菜单 -->
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Import class="mr-2 h-4 w-4" />
          插入
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-48">
          <ContextMenuItem @click="toggleShowUploadImgDialog()">
            <Image class="mr-2 h-4 w-4" />
            图片
          </ContextMenuItem>
          <ContextMenuItem @click="toggleShowInsertFormDialog()">
            <Table class="mr-2 h-4 w-4" />
            表格
          </ContextMenuItem>
          <ContextMenuItem @click="toggleShowInsertMpCardDialog()">
            <FileText class="mr-2 h-4 w-4" />
            公众号名片
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <!-- 格式化子菜单 -->
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Wand2 class="mr-2 h-4 w-4" />
          文本格式
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-48">
          <ContextMenuItem @click="addFormat(`${ctrlKey}-B`)">
            <Bold class="mr-2 h-4 w-4" />
            加粗
            <ContextMenuShortcut>{{ ctrlSign }} + B</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-I`)">
            <Italic class="mr-2 h-4 w-4" />
            斜体
            <ContextMenuShortcut>{{ ctrlSign }} + I</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-D`)">
            <Strikethrough class="mr-2 h-4 w-4" />
            删除线
            <ContextMenuShortcut>{{ ctrlSign }} + D</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-K`)">
            <Link class="mr-2 h-4 w-4" />
            超链接
            <ContextMenuShortcut>{{ ctrlSign }} + K</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-E`)">
            <FileCode class="mr-2 h-4 w-4" />
            行内代码
            <ContextMenuShortcut>{{ ctrlSign }} + E</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <!-- 标题子菜单 -->
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Heading1 class="mr-2 h-4 w-4" />
          标题
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-48">
          <ContextMenuItem @click="addFormat(`${ctrlKey}-1`)">
            <Heading1 class="mr-2 h-4 w-4" />
            标题 1
            <ContextMenuShortcut>{{ ctrlSign }} + 1</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-2`)">
            <Heading1 class="mr-2 h-4 w-4" />
            标题 2
            <ContextMenuShortcut>{{ ctrlSign }} + 2</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-3`)">
            <Heading1 class="mr-2 h-4 w-4" />
            标题 3
            <ContextMenuShortcut>{{ ctrlSign }} + 3</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <!-- 列表 -->
      <ContextMenuItem @click="addFormat(`${ctrlKey}-U`)">
        <List class="mr-2 h-4 w-4" />
        无序列表
        <ContextMenuShortcut>{{ ctrlSign }} + U</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem @click="addFormat(`${ctrlKey}-O`)">
        <ListOrdered class="mr-2 h-4 w-4" />
        有序列表
        <ContextMenuShortcut>{{ ctrlSign }} + O</ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <!-- 文档操作子菜单 -->
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <FileText class="mr-2 h-4 w-4" />
          文档
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-56">
          <ContextMenuItem @click="importMarkdownContent()">
            <FileUp class="mr-2 h-4 w-4" />
            导入 .md 文档
          </ContextMenuItem>
          <ContextMenuItem @click="formatContent()">
            <Wand2 class="mr-2 h-4 w-4" />
            格式化
            <ContextMenuShortcut>
              {{ altSign }} + {{ shiftSign }} + F
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem @click="importDefaultContent()">
            <RefreshCw class="mr-2 h-4 w-4" />
            重置文档
          </ContextMenuItem>
          <ContextMenuItem @click="clearContent()">
            <Trash2 class="mr-2 h-4 w-4" />
            清空内容
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <!-- 导出子菜单 -->
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Download class="mr-2 h-4 w-4" />
          导出
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-48">
          <ContextMenuItem @click="exportEditorContent2MD()">
            <FileDown class="mr-2 h-4 w-4" />
            导出 .md 文档
          </ContextMenuItem>
          <ContextMenuItem @click="exportEditorContent2HTML()">
            <FileCode class="mr-2 h-4 w-4" />
            导出 .html
          </ContextMenuItem>
          <ContextMenuItem @click="downloadAsCardImage()">
            <FileImage class="mr-2 h-4 w-4" />
            导出 .png
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <!-- 编辑操作 -->
      <ContextMenuItem @click="copyToClipboard()">
        <Copy class="mr-2 h-4 w-4" />
        复制
        <ContextMenuShortcut>
          {{ ctrlSign }} + C
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem @click="pasteFromClipboard">
        <ClipboardPaste class="mr-2 h-4 w-4" />
        粘贴
        <ContextMenuShortcut>
          {{ ctrlSign }} + V
        </ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <!-- 其他操作 -->
      <ContextMenuItem @click="resetStyleConfirm()">
        <RotateCcw class="mr-2 h-4 w-4" />
        重置样式
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
