<script setup lang="ts">
import { useStore } from '@/stores'
import { addPrefix } from '@/utils'
import { useStorage } from '@vueuse/core'
import {
  ArrowUpNarrowWide,
  Download,
  FileCode,
  FileCog,
  FolderPlus,
  Upload,
} from 'lucide-vue-next'
import { ref } from 'vue'

const store = useStore()
const {
  isDark,
  isEditOnLeft,
} = storeToRefs(store)

const {
  exportEditorContent2HTML,
  exportEditorContent2MD,
  importMarkdownContent,
  dowloadAsCardImage,
} = store

const editorStateDialogVisible = ref(false)

/* ----------------------------------------------------------------------
 * Folder helpers (reuse Sidebar state)
 * -------------------------------------------------------------------- */
const isOpenAddFolderDialog = ref(false)
const addFolderInputVal = ref(``)

function addFolder() {
  if (!addFolderInputVal.value.trim())
    return toast.error(`文件夹名称不可为空`)
  if (store.folders.some(f => f.name === addFolderInputVal.value.trim()))
    return toast.error(`文件夹名称已存在`)
  store.addFolder(addFolderInputVal.value.trim())
  isOpenAddFolderDialog.value = false
  toast.success(`文件夹新增成功`)
}

/* ----------------------------------------------------------------------
 * Sort helpers
 * -------------------------------------------------------------------- */
const sortMode = useStorage(addPrefix(`sort_mode`), `create-old-new`) as Ref<string>
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      文件
    </MenubarTrigger>
    <MenubarContent align="start">
      <!-- -------- Markdown import / export -------- -->
      <MenubarItem @click="importMarkdownContent()">
        <Upload class="mr-2 size-4" /> 导入 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2MD()">
        <Download class="mr-2 size-4" /> 导出 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2HTML()">
        <FileCode class="mr-2 size-4" /> 导出 .html
      </MenubarItem>
      <MenubarItem @click="dowloadAsCardImage()">
        <Download class="mr-2 size-4" /> 导出 .png
      </MenubarItem>

      <MenubarSeparator />

      <!-- -------- 新建文件夹 -------- -->
      <MenubarItem @click="isOpenAddFolderDialog = true">
        <FolderPlus class="mr-2 size-4" /> 新建文件夹
      </MenubarItem>

      <!-- -------- 排序 -------- -->
      <MenubarSub>
        <MenubarSubTrigger>
          <ArrowUpNarrowWide class="mr-2 size-4" /> 排序
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarRadioGroup v-model="sortMode">
            <MenubarRadioItem value="A-Z">
              文件名（A-Z）
            </MenubarRadioItem>
            <MenubarRadioItem value="Z-A">
              文件名（Z-A）
            </MenubarRadioItem>
            <MenubarSeparator />
            <MenubarRadioItem value="update-new-old">
              编辑时间（新→旧）
            </MenubarRadioItem>
            <MenubarRadioItem value="update-old-new">
              编辑时间（旧→新）
            </MenubarRadioItem>
            <MenubarSeparator />
            <MenubarRadioItem value="create-new-old">
              创建时间（新→旧）
            </MenubarRadioItem>
            <MenubarRadioItem value="create-old-new">
              创建时间（旧→新）
            </MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarSubContent>
      </MenubarSub>

      <MenubarSeparator />

      <MenubarItem @click="editorStateDialogVisible = true">
        <FileCog class="mr-2 size-4" /> 导入/导出项目配置
      </MenubarItem>
      <MenubarSeparator />
      <MenubarCheckboxItem v-model:checked="isDark">
        深色模式
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem v-model:checked="isEditOnLeft">
        左侧编辑
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>

  <!-- 新建文件夹弹窗放在全局根位置以便菜单触发 -->
  <Dialog v-model:open="isOpenAddFolderDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>新增文件夹</DialogTitle>
        <DialogDescription>请输入文件夹名称</DialogDescription>
      </DialogHeader>
      <Input v-model="addFolderInputVal" @keyup.enter="addFolder" />
      <DialogFooter>
        <Button @click="addFolder">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
