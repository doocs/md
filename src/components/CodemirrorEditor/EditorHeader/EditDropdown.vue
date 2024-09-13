<script setup>
import { useStore } from '@/stores'

const props = defineProps([`isOpen`, `clickTrigger`, `openDropdown`, `updateOpen`])

const store = useStore()

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog } = store
</script>

<template>
  <MenubarMenu :open="props.isOpen" @update:open="props.updateOpen">
    <MenubarTrigger
      @click="props.clickTrigger()"
      @mouseenter="props.openDropdown()"
    >
      编辑
    </MenubarTrigger>
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
