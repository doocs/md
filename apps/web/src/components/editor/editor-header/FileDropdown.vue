<script setup lang="ts">
import { Cloud, Download, FileCode, FileCog, FileText, FolderKanban, FolderOpen, Package, Settings, Share2, Upload } from '@lucide/vue'
import { isShareUiEnabled } from '@/services/share/client'
import { isSyncUiEnabled } from '@/services/sync/client'
import { useEditorStore } from '@/stores/editor'
import { useExportStore } from '@/stores/export'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)
const { t } = useI18n()

const editorStore = useEditorStore()
const exportStore = useExportStore()
const uiStore = useUIStore()

const { isOpenPostSlider, isOpenFolderPanel } = storeToRefs(uiStore)
const { toggleShowTemplateDialog, toggleShowImportMdDialog, toggleShowSyncDialog, toggleShowEditorStateDialog, toggleShowPreferencesDialog, openShareDialog, openPdfExportDialog } = uiStore
const showSyncUi = isSyncUiEnabled()
const showShareUi = isShareUiEnabled()

function openEditorStateDialog() {
  toggleShowEditorStateDialog(true)
}

function openPreferencesDialog() {
  toggleShowPreferencesDialog(true)
}

function openTemplateDialog() {
  toggleShowTemplateDialog(true)
}

function exportEditorContent2HTML() {
  exportStore.exportEditorContent2HTML()
}

function exportEditorContent2PureHTML() {
  exportStore.exportEditorContent2PureHTML(editorStore.getContent())
}

function exportEditorContent2MD() {
  exportStore.exportEditorContent2MD(editorStore.getContent())
}

function downloadAsCardImage() {
  exportStore.downloadAsCardImage()
}

function exportEditorContent2PDF() {
  openPdfExportDialog()
}
</script>

<template>
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      {{ t('menu.file') }}
    </MenubarSubTrigger>
    <MenubarSubContent class="min-w-56">
      <MenubarItem @click="isOpenFolderPanel = !isOpenFolderPanel">
        <FolderOpen class="mr-2 size-4" />
        {{ t('menu.localFolder') }}
      </MenubarItem>

      <MenubarSeparator />

      <MenubarSub>
        <MenubarSubTrigger>
          <Upload class="mr-2 size-4" />
          {{ t('menu.import') }}
        </MenubarSubTrigger>
        <MenubarSubContent class="min-w-56">
          <MenubarItem @click="toggleShowImportMdDialog(true)">
            <FileText class="mr-2 size-4" />
            {{ t('menu.importMarkdown') }}
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSub>
        <MenubarSubTrigger>
          <Download class="mr-2 size-4" />
          {{ t('menu.export') }}
        </MenubarSubTrigger>
        <MenubarSubContent class="min-w-56">
          <MenubarItem @click="exportEditorContent2MD()">
            <FileText class="mr-2 size-4" />
            {{ t('menu.exportMarkdown') }}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="exportEditorContent2HTML()">
            <FileCode class="mr-2 size-4" />
            {{ t('menu.exportHtml') }}
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2PureHTML()">
            <FileCode class="mr-2 size-4" />
            {{ t('menu.exportHtmlNoStyle') }}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="exportEditorContent2PDF()">
            <FileText class="mr-2 size-4" />
            {{ t('menu.exportPdf') }}
          </MenubarItem>
          <MenubarItem @click="downloadAsCardImage()">
            <Download class="mr-2 size-4" />
            {{ t('menu.exportPng') }}
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <MenubarItem @click="openTemplateDialog()">
        <Package class="mr-2 size-4" />
        {{ t('menu.templateManage') }}
      </MenubarItem>

      <MenubarItem @click="isOpenPostSlider = !isOpenPostSlider">
        <FolderKanban class="mr-2 size-4" />
        {{ t('menu.contentManage') }}
      </MenubarItem>

      <template v-if="showSyncUi || showShareUi">
        <MenubarSeparator />
        <MenubarItem v-if="showSyncUi" @click="toggleShowSyncDialog(true)">
          <Cloud class="mr-2 size-4" />
          {{ t('menu.cloudSync') }}
        </MenubarItem>
        <MenubarItem v-if="showShareUi" @click="openShareDialog()">
          <Share2 class="mr-2 size-4" />
          {{ t('menu.sharePreview') }}
        </MenubarItem>
      </template>

      <MenubarSeparator />

      <MenubarItem @click="openPreferencesDialog()">
        <Settings class="mr-2 size-4" />
        {{ t('menu.preferences') }}
      </MenubarItem>

      <MenubarItem @click="openEditorStateDialog()">
        <FileCog class="mr-2 size-4" />
        {{ t('menu.importExportConfig') }}
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <MenubarMenu v-else>
    <MenubarTrigger>
      {{ t('menu.file') }}
    </MenubarTrigger>
    <MenubarContent class="min-w-56" align="start">
      <MenubarItem @click="isOpenFolderPanel = !isOpenFolderPanel">
        <FolderOpen class="mr-2 size-4" />
        {{ t('menu.localFolder') }}
      </MenubarItem>

      <MenubarSeparator />

      <MenubarSub>
        <MenubarSubTrigger>
          <Upload class="mr-2 size-4" />
          {{ t('menu.import') }}
        </MenubarSubTrigger>
        <MenubarSubContent class="min-w-56">
          <MenubarItem @click="toggleShowImportMdDialog(true)">
            <FileText class="mr-2 size-4" />
            {{ t('menu.importMarkdown') }}
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSub>
        <MenubarSubTrigger>
          <Download class="mr-2 size-4" />
          {{ t('menu.export') }}
        </MenubarSubTrigger>
        <MenubarSubContent class="min-w-56">
          <MenubarItem @click="exportEditorContent2MD()">
            <FileText class="mr-2 size-4" />
            {{ t('menu.exportMarkdown') }}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="exportEditorContent2HTML()">
            <FileCode class="mr-2 size-4" />
            {{ t('menu.exportHtml') }}
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2PureHTML()">
            <FileCode class="mr-2 size-4" />
            {{ t('menu.exportHtmlNoStyle') }}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="exportEditorContent2PDF()">
            <FileText class="mr-2 size-4" />
            {{ t('menu.exportPdf') }}
          </MenubarItem>
          <MenubarItem @click="downloadAsCardImage()">
            <Download class="mr-2 size-4" />
            {{ t('menu.exportPng') }}
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <MenubarItem @click="openTemplateDialog()">
        <Package class="mr-2 size-4" />
        {{ t('menu.templateManage') }}
      </MenubarItem>

      <MenubarItem @click="isOpenPostSlider = !isOpenPostSlider">
        <FolderKanban class="mr-2 size-4" />
        {{ t('menu.contentManage') }}
      </MenubarItem>

      <template v-if="showSyncUi || showShareUi">
        <MenubarSeparator />
        <MenubarItem v-if="showSyncUi" @click="toggleShowSyncDialog(true)">
          <Cloud class="mr-2 size-4" />
          {{ t('menu.cloudSync') }}
        </MenubarItem>
        <MenubarItem v-if="showShareUi" @click="openShareDialog()">
          <Share2 class="mr-2 size-4" />
          {{ t('menu.sharePreview') }}
        </MenubarItem>
      </template>

      <MenubarSeparator />

      <MenubarItem @click="openPreferencesDialog()">
        <Settings class="mr-2 size-4" />
        {{ t('menu.preferences') }}
      </MenubarItem>

      <MenubarItem @click="openEditorStateDialog()">
        <FileCog class="mr-2 size-4" />
        {{ t('menu.importExportConfig') }}
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
