<script setup lang="ts">
import type { EditorView } from '@codemirror/view'
import {
  ClipboardPaste,
  Copy,
  Redo2,
  RefreshCw,
  Replace,
  Search,
  Trash2,
  Undo2,
  WandSparkles,
} from '@lucide/vue'
import { altSign, ctrlSign, shiftSign } from '@md/shared/configs'
import { redoAction, undoAction } from '@md/shared/editor'
import { useEditorDocumentActions } from '@/composables/useEditorDocumentActions'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { copyPlain, readPlainFromClipboard } from '@/utils/clipboard'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const emit = defineEmits(['copy'])

const { asSub } = toRefs(props)

const editorStore = useEditorStore()
const uiStore = useUIStore()

const { formatContent, resetContent, clearContent } = useEditorDocumentActions()

const { editor } = storeToRefs(editorStore)

// Clipboard operations
async function copyToClipboard() {
  const selectedText = editorStore.getSelection()
  copyPlain(selectedText)
}

async function pasteFromClipboard() {
  const text = await readPlainFromClipboard()
  if (text !== null)
    editorStore.replaceSelection(text)
}

// Undo/Redo
function undo() {
  if (!editor.value)
    return

  try {
    const editorView = toRaw(editor.value) as EditorView
    undoAction(editorView)
    editorView.focus()
  }
  catch (error) {
    console.error('Undo failed:', error)
  }
}

function redo() {
  if (!editor.value)
    return

  try {
    const editorView = toRaw(editor.value) as EditorView
    redoAction(editorView)
    editorView.focus()
  }
  catch (error) {
    console.error('Redo failed:', error)
  }
}

// Search/Replace - 使用项目已有的 SearchTab 组件
function openSearch() {
  // 触发打开搜索面板
  if (editor.value) {
    const selection = editor.value.state.selection.main
    const selected = editor.value.state.doc.sliceString(selection.from, selection.to).trim()

    // 使用 UI store 来触发搜索面板的打开
    uiStore.openSearchTab(selected)
  }
}

function openReplace() {
  // 打开搜索面板并展开替换功能
  if (editor.value) {
    const selection = editor.value.state.selection.main
    const selected = editor.value.state.doc.sliceString(selection.from, selection.to).trim()

    // 使用 UI store 来触发搜索面板的打开，并显示替换选项
    uiStore.openSearchTab(selected, true)
  }
}
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      编辑
    </MenubarSubTrigger>
    <MenubarSubContent class="w-64">
      <!-- 历史操作 -->
      <MenubarItem @click="undo()">
        <Undo2 class="mr-2 h-4 w-4" />
        撤销
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">Z</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="redo()">
        <Redo2 class="mr-2 h-4 w-4" />
        重做
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">Y</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <!-- 剪贴板操作 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Copy class="mr-2 h-4 w-4" />
          复制
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="emit('copy', 'txt')">
            公众号格式
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html')">
            HTML 格式
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html-without-style')">
            HTML 格式（无样式）
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html-and-style')">
            HTML 格式（兼容样式）
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'md')">
            MD 格式
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="copyToClipboard()">
            复制选中内容
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">C</kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem @click="pasteFromClipboard()">
        <ClipboardPaste class="mr-2 h-4 w-4" />
        粘贴
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">V</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <!-- 格式化 -->
      <MenubarItem @click="formatContent()">
        <WandSparkles class="mr-2 h-4 w-4" />
        格式化
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ altSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ shiftSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="resetContent()">
        <RefreshCw class="mr-2 h-4 w-4" />
        重置
      </MenubarItem>
      <MenubarItem @click="clearContent()">
        <Trash2 class="mr-2 h-4 w-4" />
        清空
      </MenubarItem>

      <MenubarSeparator />

      <!-- 查找替换 -->
      <MenubarItem @click="openSearch()">
        <Search class="mr-2 h-4 w-4" />
        查找
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="openReplace()">
        <Replace class="mr-2 h-4 w-4" />
        替换
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">H</kbd>
        </MenubarShortcut>
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      编辑
    </MenubarTrigger>
    <MenubarContent class="w-64" align="start">
      <!-- 历史操作 -->
      <MenubarItem @click="undo()">
        <Undo2 class="mr-2 h-4 w-4" />
        撤销
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">Z</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="redo()">
        <Redo2 class="mr-2 h-4 w-4" />
        重做
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">Y</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <!-- 剪贴板操作 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Copy class="mr-2 h-4 w-4" />
          复制
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="emit('copy', 'txt')">
            公众号格式
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html')">
            HTML 格式
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html-without-style')">
            HTML 格式（无样式）
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html-and-style')">
            HTML 格式（兼容样式）
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'md')">
            MD 格式
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="copyToClipboard()">
            复制选中内容
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">C</kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem @click="pasteFromClipboard()">
        <ClipboardPaste class="mr-2 h-4 w-4" />
        粘贴
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">V</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <!-- 格式化 -->
      <MenubarItem @click="formatContent()">
        <WandSparkles class="mr-2 h-4 w-4" />
        格式化
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ altSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ shiftSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="resetContent()">
        <RefreshCw class="mr-2 h-4 w-4" />
        重置
      </MenubarItem>
      <MenubarItem @click="clearContent()">
        <Trash2 class="mr-2 h-4 w-4" />
        清空
      </MenubarItem>

      <MenubarSeparator />

      <!-- 查找替换 -->
      <MenubarItem @click="openSearch()">
        <Search class="mr-2 h-4 w-4" />
        查找
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="openReplace()">
        <Replace class="mr-2 h-4 w-4" />
        替换
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">H</kbd>
        </MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
