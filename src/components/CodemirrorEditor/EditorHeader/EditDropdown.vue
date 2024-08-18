<script setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useStore } from '@/stores'

const store = useStore()

const {
  toggleShowInsertFormDialog,
  toggleShowUploadImgDialog,
} = store
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      编辑
      <el-icon class="ml-2">
        <ElIconArrowDown />
      </el-icon>
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
