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
import { copyPlain, readPlainFromClipboard } from '@/lib/browser/clipboard'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const emit = defineEmits(['copy'])

const { asSub } = toRefs(props)
const { t } = useI18n()

const editorStore = useEditorStore()
const uiStore = useUIStore()

const { formatContent, resetContent, clearContent } = useEditorDocumentActions()

const { editor } = storeToRefs(editorStore)

async function copyToClipboard() {
  const selectedText = editorStore.getSelection()
  copyPlain(selectedText)
}

async function pasteFromClipboard() {
  const text = await readPlainFromClipboard()
  if (text !== null)
    editorStore.replaceSelection(text)
}

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

function openSearch() {
  if (editor.value) {
    const selection = editor.value.state.selection.main
    const selected = editor.value.state.doc.sliceString(selection.from, selection.to).trim()

    uiStore.openSearchTab(selected)
  }
}

function openReplace() {
  if (editor.value) {
    const selection = editor.value.state.selection.main
    const selected = editor.value.state.doc.sliceString(selection.from, selection.to).trim()

    uiStore.openSearchTab(selected, true)
  }
}
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      {{ t('menu.edit') }}
    </MenubarSubTrigger>
    <MenubarSubContent class="min-w-64">
      <MenubarItem @click="undo()">
        <Undo2 class="mr-2 h-4 w-4" />
        {{ t('menu.undo') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">Z</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="redo()">
        <Redo2 class="mr-2 h-4 w-4" />
        {{ t('menu.redo') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">Y</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarSub>
        <MenubarSubTrigger>
          <Copy class="mr-2 h-4 w-4" />
          {{ t('menu.copy') }}
        </MenubarSubTrigger>
        <MenubarSubContent class="min-w-52">
          <MenubarItem @click="emit('copy', 'txt')">
            {{ t('menu.copyWechat') }}
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html')">
            {{ t('menu.copyHtml') }}
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html-without-style')">
            {{ t('menu.copyHtmlNoStyle') }}
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html-and-style')">
            {{ t('menu.copyHtmlCompat') }}
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'md')">
            {{ t('menu.copyMd') }}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="copyToClipboard()">
            {{ t('menu.copySelection') }}
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">C</kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem @click="pasteFromClipboard()">
        <ClipboardPaste class="mr-2 h-4 w-4" />
        {{ t('menu.paste') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">V</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="formatContent()">
        <WandSparkles class="mr-2 h-4 w-4" />
        {{ t('menu.formatContent') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ altSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ shiftSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="resetContent()">
        <RefreshCw class="mr-2 h-4 w-4" />
        {{ t('menu.reset') }}
      </MenubarItem>
      <MenubarItem @click="clearContent()">
        <Trash2 class="mr-2 h-4 w-4" />
        {{ t('menu.clear') }}
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="openSearch()">
        <Search class="mr-2 h-4 w-4" />
        {{ t('menu.find') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="openReplace()">
        <Replace class="mr-2 h-4 w-4" />
        {{ t('menu.replace') }}
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
      {{ t('menu.edit') }}
    </MenubarTrigger>
    <MenubarContent class="min-w-64" align="start">
      <MenubarItem @click="undo()">
        <Undo2 class="mr-2 h-4 w-4" />
        {{ t('menu.undo') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">Z</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="redo()">
        <Redo2 class="mr-2 h-4 w-4" />
        {{ t('menu.redo') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">Y</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarSub>
        <MenubarSubTrigger>
          <Copy class="mr-2 h-4 w-4" />
          {{ t('menu.copy') }}
        </MenubarSubTrigger>
        <MenubarSubContent class="min-w-52">
          <MenubarItem @click="emit('copy', 'txt')">
            {{ t('menu.copyWechat') }}
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html')">
            {{ t('menu.copyHtml') }}
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html-without-style')">
            {{ t('menu.copyHtmlNoStyle') }}
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'html-and-style')">
            {{ t('menu.copyHtmlCompat') }}
          </MenubarItem>
          <MenubarItem @click="emit('copy', 'md')">
            {{ t('menu.copyMd') }}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="copyToClipboard()">
            {{ t('menu.copySelection') }}
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">C</kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem @click="pasteFromClipboard()">
        <ClipboardPaste class="mr-2 h-4 w-4" />
        {{ t('menu.paste') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">V</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="formatContent()">
        <WandSparkles class="mr-2 h-4 w-4" />
        {{ t('menu.formatContent') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ altSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ shiftSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="resetContent()">
        <RefreshCw class="mr-2 h-4 w-4" />
        {{ t('menu.reset') }}
      </MenubarItem>
      <MenubarItem @click="clearContent()">
        <Trash2 class="mr-2 h-4 w-4" />
        {{ t('menu.clear') }}
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="openSearch()">
        <Search class="mr-2 h-4 w-4" />
        {{ t('menu.find') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">F</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="openReplace()">
        <Replace class="mr-2 h-4 w-4" />
        {{ t('menu.replace') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">H</kbd>
        </MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
