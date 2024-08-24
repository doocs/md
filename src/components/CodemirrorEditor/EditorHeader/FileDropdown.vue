<script setup>
import { storeToRefs } from 'pinia'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  <DropdownMenu :open="props.isOpen" @update:open="props.updateOpen">
    <DropdownMenuTrigger
      class="flex items-center p-2 px-4 hover:bg-gray-2 hover:dark:bg-gray-2"
      :class="{
        'bg-gray-2': props.isOpen,
        'dark:bg-stone-9': props.isOpen,
      }"
      @click="props.clickTrigger()"
      @mouseenter="props.openDropdown()"
    >
      文件
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem @click="importMarkdownContent()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconUpload />
        </el-icon>
        导入 .md
      </DropdownMenuItem>
      <DropdownMenuItem @click="exportEditorContent2MD()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconDownload />
        </el-icon>
        导出 .md
      </DropdownMenuItem>
      <DropdownMenuItem @click="exportEditorContent2HTML()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconDocument />
        </el-icon>
        导出 .html
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="toggleDark()">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isDark }">
          <ElIconCheck />
        </el-icon>
        深色模式
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="toggleEditOnLeft()">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isEditOnLeft }">
          <ElIconCheck />
        </el-icon>
        左侧编辑
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
