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
  FunctionSquare,
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
import { findMarkdownTableAt } from '@md/shared/utils/table'
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
const { t } = useI18n()

const {
  openTableEditDialog,
  toggleShowUploadImgDialog,
  toggleShowImportMdDialog,
  toggleShowComponentDialog,
} = uiStore

const isContextTargetInTable = ref(false)
const contextMenuPos = ref<number | null>(null)

/**
 * Right-click does not reliably move the caret, so judge "edit table" by the
 * clicked point rather than the stale cursor. Capture-phase listener runs
 * before reka-ui's open handling; it also moves the caret to the clicked
 * position (standard editor behavior, skipped inside an active selection) so
 * the dialog afterwards opens for the clicked table.
 */
function onContextMenuCapture(event: MouseEvent) {
  const view = toRaw(editorStore.editor)
  if (!view || !view.contentDOM.contains(event.target as Node))
    return
  const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
  contextMenuPos.value = pos
  if (pos == null)
    return
  const { from, to } = view.state.selection.main
  if (pos < from || pos > to)
    view.dispatch({ selection: { anchor: pos } })
}

onMounted(() => document.addEventListener(`contextmenu`, onContextMenuCapture, true))
onUnmounted(() => document.removeEventListener(`contextmenu`, onContextMenuCapture, true))

function onMenuOpen(open: boolean) {
  if (!open) {
    contextMenuPos.value = null
    return
  }
  const view = toRaw(editorStore.editor)
  const pos = contextMenuPos.value ?? view?.state.selection.main.head
  isContextTargetInTable.value = view != null && pos != null
    ? findMarkdownTableAt(view.state.doc.toString(), pos) !== null
    : false
}

const { editor } = storeToRefs(editorStore)

const { addFormat } = useEditorFormat(editor)

const { formatContent, resetContent, clearContent } = useEditorDocumentActions()

const headingIcons = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6]
const headingLevels = computed(() => baseHeadingLevels.map((item, index) => ({
  ...item,
  icon: headingIcons[index],
  label: t(`menu.headingN`, { n: item.level }),
})))

function openFormulaEditor() {
  const selection = normalizeFormulaInput(editorStore.getSelection())
  uiStore.openFormulaEditor({
    value: selection.latex,
    displayMode: selection.displayMode,
  })
}

async function copyToClipboard() {
  const selectedText = editorStore.getSelection()
  copyPlain(selectedText)
}

async function pasteFromClipboard() {
  const text = await readPlainFromClipboard()
  if (text !== null)
    editorStore.replaceSelection(text)
}

function resetStyleConfirm() {
  confirmStore.confirm({
    title: t(`confirm.tip`),
    description: t(`confirm.resetStyleDescription`),
    onConfirm: () => {
      themeStore.resetStyle()
      cssEditorStore.resetCssConfig()
      themeStore.applyCurrentTheme()
      themeStore.updateCodeTheme()
      const raw = editorStore.getContent()
      renderStore.render(raw)
      toast.success(t(`toast.styleReset`))
    },
  })
}

function exportEditorContent2HTML() {
  exportStore.exportEditorContent2HTML()
}

function exportEditorContent2PDF() {
  uiStore.openPdfExportDialog()
}

function exportEditorContent2MD() {
  exportStore.exportEditorContent2MD(editorStore.getContent())
}

function downloadAsCardImage() {
  exportStore.downloadAsCardImage()
}
</script>

<template>
  <ContextMenu @update:open="onMenuOpen">
    <ContextMenuTrigger>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="w-64 max-h-[80vh] overflow-y-auto">
      <template v-if="isContextTargetInTable">
        <ContextMenuItem @click="openTableEditDialog()">
          <Table class="mr-2 h-4 w-4" />
          {{ t('tableEditor.titleEdit') }}
        </ContextMenuItem>
        <ContextMenuSeparator />
      </template>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Import class="mr-2 h-4 w-4" />
          {{ t('menu.insert') }}
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-48">
          <ContextMenuItem @click="toggleShowUploadImgDialog()">
            <Image class="mr-2 h-4 w-4" />
            {{ t('menu.image') }}
          </ContextMenuItem>
          <ContextMenuItem @click="openFormulaEditor()">
            <FunctionSquare class="mr-2 h-4 w-4" />
            {{ t('menu.formula') }}
          </ContextMenuItem>
          <ContextMenuItem @click="openTableEditDialog()">
            <Table class="mr-2 h-4 w-4" />
            {{ t('menu.table') }}
          </ContextMenuItem>
          <ContextMenuItem @click="toggleShowComponentDialog()">
            <Blocks class="mr-2 h-4 w-4" />
            {{ t('menu.component') }}
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Wand2 class="mr-2 h-4 w-4" />
          {{ t('contextMenu.textFormat') }}
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-48">
          <ContextMenuItem @click="addFormat(`${ctrlKey}-B`)">
            <Bold class="mr-2 h-4 w-4" />
            {{ t('menu.bold') }}
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">B</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-I`)">
            <Italic class="mr-2 h-4 w-4" />
            {{ t('menu.italic') }}
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">I</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-D`)">
            <Strikethrough class="mr-2 h-4 w-4" />
            {{ t('menu.strikethrough') }}
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">D</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem @click="addFormat(`${ctrlKey}-K`)">
            <Link class="mr-2 h-4 w-4" />
            {{ t('menu.link') }}
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">K</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @click="addFormat(`${ctrlKey}-E`)">
            <FileCode class="mr-2 h-4 w-4" />
            {{ t('menu.inlineCode') }}
            <ContextMenuShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">E</kbd>
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Heading1 class="mr-2 h-4 w-4" />
          {{ t('menu.heading') }}
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

      <ContextMenuItem @click="addFormat(`${ctrlKey}-U`)">
        <List class="mr-2 h-4 w-4" />
        {{ t('menu.unorderedList') }}
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">U</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem @click="addFormat(`${ctrlKey}-O`)">
        <ListOrdered class="mr-2 h-4 w-4" />
        {{ t('menu.orderedList') }}
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">O</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem @click="toggleShowImportMdDialog(true)">
        <FileUp class="mr-2 h-4 w-4" />
        {{ t('contextMenu.importMd') }}
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <FileDown class="mr-2 h-4 w-4" />
          {{ t('menu.export') }}
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-48">
          <ContextMenuItem @click="exportEditorContent2MD()">
            <FileDown class="mr-2 h-4 w-4" />
            {{ t('contextMenu.exportMd') }}
          </ContextMenuItem>
          <ContextMenuItem @click="exportEditorContent2HTML()">
            <FileCode class="mr-2 h-4 w-4" />
            {{ t('contextMenu.exportHtml') }}
          </ContextMenuItem>
          <ContextMenuItem @click="exportEditorContent2PDF()">
            <FileText class="mr-2 h-4 w-4" />
            {{ t('contextMenu.exportPdf') }}
          </ContextMenuItem>
          <ContextMenuItem @click="downloadAsCardImage()">
            <FileImage class="mr-2 h-4 w-4" />
            {{ t('contextMenu.exportPng') }}
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuItem @click="formatContent()">
        <Wand2 class="mr-2 h-4 w-4" />
        {{ t('menu.formatContent') }}
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ altSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ shiftSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem @click="resetContent()">
        <RefreshCw class="mr-2 h-4 w-4" />
        {{ t('menu.reset') }}
      </ContextMenuItem>
      <ContextMenuItem @click="resetStyleConfirm()">
        <RotateCcw class="mr-2 h-4 w-4" />
        {{ t('contextMenu.resetStyle') }}
      </ContextMenuItem>
      <ContextMenuItem @click="clearContent()">
        <Trash2 class="mr-2 h-4 w-4" />
        {{ t('menu.clear') }}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem @click="copyToClipboard()">
        <Copy class="mr-2 h-4 w-4" />
        {{ t('menu.copy') }}
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">C</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem @click="pasteFromClipboard">
        <ClipboardPaste class="mr-2 h-4 w-4" />
        {{ t('menu.paste') }}
        <ContextMenuShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">V</kbd>
        </ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
