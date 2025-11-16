<script setup lang="ts">
import { Download, FileCode, FileCog, FileText, Package, Upload } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { useExportStore } from '@/stores/export'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const emit = defineEmits([`openEditorState`])

const { asSub } = toRefs(props)

const editorStore = useEditorStore()
const exportStore = useExportStore()
const uiStore = useUIStore()

const { isDark, isEditOnLeft, isOpenPostSlider } = storeToRefs(uiStore)
const { toggleShowTemplateDialog } = uiStore

const importMarkdownContent = useImportMarkdownContent()

function openEditorStateDialog() {
  emit(`openEditorState`)
}

function openTemplateDialog() {
  toggleShowTemplateDialog(true)
}

// Export functions
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
  exportStore.exportEditorContent2PDF()
}
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      文件
    </MenubarSubTrigger>
    <MenubarSubContent>
      <!-- 导入子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Upload class="mr-2 size-4" />
          导入
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="importMarkdownContent()">
            <FileText class="mr-2 size-4" />
            导入 .md
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <!-- 导出子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Download class="mr-2 size-4" />
          导出
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="exportEditorContent2MD()">
            <FileText class="mr-2 size-4" />
            导出 .md
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2HTML()">
            <FileCode class="mr-2 size-4" />
            导出 .html
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2PureHTML()">
            <FileCode class="mr-2 size-4" />
            导出 .html（无样式）
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2PDF()">
            <FileText class="mr-2 size-4" />
            导出 .pdf
          </MenubarItem>
          <MenubarItem @click="downloadAsCardImage()">
            <Download class="mr-2 size-4" />
            导出 .png
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <!-- 模板管理 -->
      <MenubarItem @click="openTemplateDialog()">
        <Package class="mr-2 size-4" />
        模板管理
      </MenubarItem>

      <!-- 项目配置 -->
      <MenubarItem @click="openEditorStateDialog()">
        <FileCog class="mr-2 size-4" />
        项目配置
      </MenubarItem>

      <MenubarSeparator />

      <!-- 视图设置 -->
      <MenubarCheckboxItem v-model:checked="isDark">
        深色模式
      </MenubarCheckboxItem>
      <MenubarCheckboxItem v-model:checked="isEditOnLeft">
        左侧编辑
      </MenubarCheckboxItem>
      <MenubarCheckboxItem v-model:checked="isOpenPostSlider">
        内容管理
      </MenubarCheckboxItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      文件
    </MenubarTrigger>
    <MenubarContent align="start">
      <!-- 导入子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Upload class="mr-2 size-4" />
          导入
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="importMarkdownContent()">
            <FileText class="mr-2 size-4" />
            导入 .md
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <!-- 导出子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Download class="mr-2 size-4" />
          导出
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem @click="exportEditorContent2MD()">
            <FileText class="mr-2 size-4" />
            导出 .md
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2HTML()">
            <FileCode class="mr-2 size-4" />
            导出 .html
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2PureHTML()">
            <FileCode class="mr-2 size-4" />
            导出 .html（无样式）
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2PDF()">
            <FileText class="mr-2 size-4" />
            导出 .pdf
          </MenubarItem>
          <MenubarItem @click="downloadAsCardImage()">
            <Download class="mr-2 size-4" />
            导出 .png
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <!-- 模板管理 -->
      <MenubarItem @click="openTemplateDialog()">
        <Package class="mr-2 size-4" />
        模板管理
      </MenubarItem>

      <!-- 项目配置 -->
      <MenubarItem @click="openEditorStateDialog()">
        <FileCog class="mr-2 size-4" />
        项目配置
      </MenubarItem>

      <MenubarSeparator />

      <!-- 视图设置 -->
      <MenubarCheckboxItem v-model:checked="isDark">
        深色模式
      </MenubarCheckboxItem>
      <MenubarCheckboxItem v-model:checked="isEditOnLeft">
        左侧编辑
      </MenubarCheckboxItem>
      <MenubarCheckboxItem v-model:checked="isOpenPostSlider">
        内容管理
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
</template>
