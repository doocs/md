<script setup lang="ts">
import { useDisplayStore } from '@/stores'
import { TableIcon, UploadCloudIcon } from 'lucide-vue-next'

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog } = useDisplayStore()
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      编辑
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <UploadCloudIcon class="mr-2 h-4 w-4" />
        上传图片
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <TableIcon class="mr-2 h-4 w-4" />
        插入表格
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
