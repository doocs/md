<script setup>
import { storeToRefs } from 'pinia'

import { useStore } from '@/stores'

const props = defineProps([`isOpen`, `clickTrigger`, `openDropdown`, `updateOpen`])

const store = useStore()

const {
  isDark,
  isEditOnLeft,
} = storeToRefs(store)

const {
  toggleDark,
  toggleEditOnLeft,
  exportEditorContent2HTML,
  exportEditorContent2MD,
  importMarkdownContent,
} = store
</script>

<template>
  <MenubarMenu :open="props.isOpen" @update:open="props.updateOpen">
    <MenubarTrigger
      @click="props.clickTrigger()"
      @mouseenter="props.openDropdown()"
    >
      文件
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="importMarkdownContent()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconUpload />
        </el-icon>
        导入 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2MD()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconDownload />
        </el-icon>
        导出 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2HTML()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconDocument />
        </el-icon>
        导出 .html
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="toggleDark()">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isDark }">
          <ElIconCheck />
        </el-icon>
        深色模式
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="toggleEditOnLeft()">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isEditOnLeft }">
          <ElIconCheck />
        </el-icon>
        左侧编辑
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
