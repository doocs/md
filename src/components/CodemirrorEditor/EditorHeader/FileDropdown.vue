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
  <DropdownMenu>
    <DropdownMenuTrigger>
      文件
      <el-icon class="ml-2">
        <ElIconArrowDown />
      </el-icon>
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
