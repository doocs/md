<script setup lang="ts">
import { useStore } from '@/stores'

const store = useStore()

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog } = store
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger> 编辑 </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconUpload />
        </el-icon>
        上传图片
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconGrid />
        </el-icon>
        插入表格
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
