<script setup lang='ts'>
import { altSign, headingLevels as baseHeadingLevels, ctrlKey, ctrlSign, shiftSign } from '@md/shared/configs'
import {
  Bold,
  ClipboardPaste,
  Copy,
  FileCode,
  FileDown,
  FileImage,
  FileText,
  FileUp,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
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
import { useEditorFormat } from '@/composables/useEditorFormat'
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

const { addFormat } = useEditorFormat(editor)

const importMarkdownContent = useImportMarkdownContent()

const headingIcons = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6]
const headingLevels = baseHeadingLevels.map((item, index) => ({
  ...item,
  icon: headingIcons[index],
}))

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
  if (selectedText) {
    await copyPlain(selectedText)
  }
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
    <ContextMenuContent class="w-64 max-h-[80vh] overflow-y-auto">
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
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">B</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-I`)">
            <Italic class="mr-2 h-4 w-4" />
            斜体
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">I</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-D`)">
            <Strikethrough class="mr-2 h-4 w-4" />
            删除线
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">D</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem @click="addFormat(`${ctrlKey}-K`)">
            <Link class="mr-2 h-4 w-4" />
            超链接
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">K</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-E`)">
            <FileCode class="mr-2 h-4 w-4" />
            行内代码
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">E</kbd>
            </ContextMenuShortcut>
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
          <ContextMenuItem
            v-for="{ level, icon, label } in headingLevels"
            :key="level"
            @click="addFormat(`${ctrlKey}-${level}`)"
          >
            <component :is="icon" class="mr-2 h-4 w-4" />
            {{ label }}
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ level }}</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <!-- 列表 -->
      <ContextMenuItem @click="addFormat(`${ctrlKey}-U`)">
        <List class="mr-2 h-4 w-4" />
        无序列表
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">U</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem @click="addFormat(`${ctrlKey}-O`)">
        <ListOrdered class="mr-2 h-4 w-4" />
        有序列表
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">O</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <!-- 导入导出操作 -->
      <ContextMenuItem @click="importMarkdownContent()">
        <FileUp class="mr-2 h-4 w-4" />
        导入 .md 文档
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <FileDown class="mr-2 h-4 w-4" />
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

      <!-- 文档操作 -->
      <ContextMenuItem @click="formatContent()">
        <Wand2 class="mr-2 h-4 w-4" />
        格式化
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ altSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ shiftSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem @click="importDefaultContent()">
        <RefreshCw class="mr-2 h-4 w-4" />
        重置文档
      </ContextMenuItem>
      <ContextMenuItem @click="resetStyleConfirm()">
        <RotateCcw class="mr-2 h-4 w-4" />
        重置样式
      </ContextMenuItem>
      <ContextMenuItem @click="clearContent()">
        <Trash2 class="mr-2 h-4 w-4" />
        清空内容
      </ContextMenuItem>

      <ContextMenuSeparator />

      <!-- 编辑操作 -->
      <ContextMenuItem @click="copyToClipboard()">
        <Copy class="mr-2 h-4 w-4" />
        复制
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">C</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem @click="pasteFromClipboard">
        <ClipboardPaste class="mr-2 h-4 w-4" />
        粘贴
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">V</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
