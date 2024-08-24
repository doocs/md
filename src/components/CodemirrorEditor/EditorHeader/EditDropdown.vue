<script setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useStore } from '@/stores'

const props = defineProps([`isOpen`, `clickTrigger`, `openDropdown`, `updateOpen`])

const store = useStore()

const {
  toggleShowInsertFormDialog,
  toggleShowUploadImgDialog,
} = store
</script>

<template>
  <DropdownMenu :open="props.isOpen" @update:open="props.updateOpen">
    <DropdownMenuTrigger
      class="flex items-center p-2 px-4"
      :class="{
        'bg-gray-2': props.isOpen,
        'dark:bg-stone-9': props.isOpen,
      }"
      @click="props.clickTrigger()"
      @mouseenter="props.openDropdown()"
    >
      编辑
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem @click="toggleShowUploadImgDialog()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconUpload />
        </el-icon>
        上传图片
      </DropdownMenuItem>
      <DropdownMenuItem @click="toggleShowInsertFormDialog()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconGrid />
        </el-icon>
        插入表格
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
