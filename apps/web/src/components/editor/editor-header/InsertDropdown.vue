<script setup lang="ts">
import { Contact, Image, Table } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)
const uiStore = useUIStore()

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog, toggleShowInsertMpCardDialog } = uiStore
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      插入
    </MenubarSubTrigger>
    <MenubarSubContent class="w-52">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <Image class="mr-2 h-4 w-4" />
        插入图片
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <Table class="mr-2 h-4 w-4" />
        插入表格
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertMpCardDialog()">
        <Contact class="mr-2 h-4 w-4" />
        公众号名片
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      插入
    </MenubarTrigger>
    <MenubarContent class="w-52" align="start">
      <MenubarItem @click="toggleShowUploadImgDialog()">
        <Image class="mr-2 h-4 w-4" />
        插入图片
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertFormDialog()">
        <Table class="mr-2 h-4 w-4" />
        插入表格
      </MenubarItem>
      <MenubarItem @click="toggleShowInsertMpCardDialog()">
        <Contact class="mr-2 h-4 w-4" />
        公众号名片
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
