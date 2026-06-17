<script setup lang='ts'>
import {
  Blocks,
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
} from '@lucide/vue'
import { altSign, headingLevels as baseHeadingLevels, ctrlKey, ctrlSign, shiftSign } from '@md/shared/configs'
import { useEditorDocumentActions } from '@/composables/useEditorDocumentActions'
import { useEditorFormat } from '@/composables/useEditorFormat'
import { copyPlain, readPlainFromClipboard } from '@/lib/browser/clipboard'
import { normalizeFormulaInput } from '@/lib/markdown/formula'
import { useConfirmStore } from '@/stores/confirm'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useEditorStore } from '@/stores/editor'
import { useExportStore } from '@/stores/export'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const confirmStore = useConfirmStore()
const cssEditorStore = useCssEditorStore()
const editorStore = useEditorStore()
const exportStore = useExportStore()
const renderStore = useRenderStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()

const {
  toggleShowInsertFormDialog,
  toggleShowUploadImgDialog,
  toggleShowImportMdDialog,
  toggleShowComponentDialog,
} = uiStore

const { editor } = storeToRefs(editorStore)

const { addFormat } = useEditorFormat(editor)

const { formatContent, resetContent, clearContent } = useEditorDocumentActions()

const headingIcons = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6]
const headingLevels = baseHeadingLevels.map((item, index) => ({
  ...item,
  icon: headingIcons[index],
}))

function openFormulaEditor() {
  const selection = normalizeFormulaInput(editorStore.getSelection())
  uiStore.openFormulaEditor({
    value: selection.latex,
    displayMode: selection.displayMode,
  })
}

// 复制到剪贴板
async function copyToClipboard() {
  const selectedText = editorStore.getSelection()
  copyPlain(selectedText)
}

// 从剪贴板粘贴
async function pasteFromClipboard() {
  const text = await readPlainFromClipboard()
  if (text !== null)
    editorStore.replaceSelection(text)
}

// 重置样式确认
function resetStyleConfirm() {
  confirmStore.confirm({
    title: '提示',
    description: '此操作将丢失本地自定义样式，是否继续？',
    onConfirm: () => {
      themeStore.resetStyle()
      cssEditorStore.resetCssConfig()
      themeStore.applyCurrentTheme()
      themeStore.updateCodeTheme()
      const raw = editorStore.getContent()
      renderStore.render(raw)
      toast.success(`样式已重置`)
    },
  })
}

// 导出函数
function exportEditorContent2HTML() {
  exportStore.exportEditorContent2HTML()
}

function exportEditorContent2PDF() {
  exportStore.exportEditorContent2PDF()
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
          <ContextMenuItem @click="openFormulaEditor()">
            <span class="mr-2 inline-flex h-4 w-4 items-center justify-center text-xs font-semibold">ƒ</span>
            公式
          </ContextMenuItem>
          <ContextMenuItem @click="toggleShowInsertFormDialog()">
            <Table class="mr-2 h-4 w-4" />
            表格
          </ContextMenuItem>
          <ContextMenuItem @click="toggleShowComponentDialog()">
            <Blocks class="mr-2 h-4 w-4" />
            组件
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
      <ContextMenuItem @click="toggleShowImportMdDialog(true)">
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
          <ContextMenuItem @click="exportEditorContent2PDF()">
            <FileText class="mr-2 h-4 w-4" />
            导出 .pdf
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
      <ContextMenuItem @click="resetContent()">
        <RefreshCw class="mr-2 h-4 w-4" />
        重置
      </ContextMenuItem>
      <ContextMenuItem @click="resetStyleConfirm()">
        <RotateCcw class="mr-2 h-4 w-4" />
        重置样式
      </ContextMenuItem>
      <ContextMenuItem @click="clearContent()">
        <Trash2 class="mr-2 h-4 w-4" />
        清空
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
