<script setup lang="ts">
import { Download, FileCode, FileCog, FileText, FolderKanban, Package, Upload } from 'lucide-vue-next'
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

const { isOpenPostSlider } = storeToRefs(uiStore)
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
    <MenubarSubContent class="w-56">
      <!-- 导入子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Upload class="mr-2 size-4" />
          导入
        </MenubarSubTrigger>
        <MenubarSubContent class="w-56">
          <MenubarItem @click="importMarkdownContent()">
            <FileText class="mr-2 size-4" />
            导入 Markdown
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <!-- 导出子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Download class="mr-2 size-4" />
          导出
        </MenubarSubTrigger>
        <MenubarSubContent class="w-56">
          <MenubarItem @click="exportEditorContent2MD()">
            <FileText class="mr-2 size-4" />
            Markdown 文件
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="exportEditorContent2HTML()">
            <FileCode class="mr-2 size-4" />
            HTML 文件
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2PureHTML()">
            <FileCode class="mr-2 size-4" />
            HTML（无样式）
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="exportEditorContent2PDF()">
            <FileText class="mr-2 size-4" />
            PDF 文档
          </MenubarItem>
          <MenubarItem @click="downloadAsCardImage()">
            <Download class="mr-2 size-4" />
            PNG 图片
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <!-- 模板管理 -->
      <MenubarItem @click="openTemplateDialog()">
        <Package class="mr-2 size-4" />
        模板管理
      </MenubarItem>

      <!-- 内容管理 -->
      <MenubarItem @click="isOpenPostSlider = !isOpenPostSlider">
        <FolderKanban class="mr-2 size-4" />
        内容管理
      </MenubarItem>

      <MenubarSeparator />

      <!-- 项目配置 -->
      <MenubarItem @click="openEditorStateDialog()">
        <FileCog class="mr-2 size-4" />
        项目配置
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      文件
    </MenubarTrigger>
    <MenubarContent class="w-56" align="start">
      <!-- 导入子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Upload class="mr-2 size-4" />
          导入
        </MenubarSubTrigger>
        <MenubarSubContent class="w-56">
          <MenubarItem @click="importMarkdownContent()">
            <FileText class="mr-2 size-4" />
            导入 Markdown
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <!-- 导出子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <Download class="mr-2 size-4" />
          导出
        </MenubarSubTrigger>
        <MenubarSubContent class="w-56">
          <MenubarItem @click="exportEditorContent2MD()">
            <FileText class="mr-2 size-4" />
            Markdown 文件
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="exportEditorContent2HTML()">
            <FileCode class="mr-2 size-4" />
            HTML 文件
          </MenubarItem>
          <MenubarItem @click="exportEditorContent2PureHTML()">
            <FileCode class="mr-2 size-4" />
            HTML（无样式）
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="exportEditorContent2PDF()">
            <FileText class="mr-2 size-4" />
            PDF 文档
          </MenubarItem>
          <MenubarItem @click="downloadAsCardImage()">
            <Download class="mr-2 size-4" />
            PNG 图片
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <!-- 模板管理 -->
      <MenubarItem @click="openTemplateDialog()">
        <Package class="mr-2 size-4" />
        模板管理
      </MenubarItem>

      <!-- 内容管理 -->
      <MenubarItem @click="isOpenPostSlider = !isOpenPostSlider">
        <FolderKanban class="mr-2 size-4" />
        内容管理
      </MenubarItem>

      <MenubarSeparator />

      <!-- 项目配置 -->
      <MenubarItem @click="openEditorStateDialog()">
        <FileCog class="mr-2 size-4" />
        项目配置
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
