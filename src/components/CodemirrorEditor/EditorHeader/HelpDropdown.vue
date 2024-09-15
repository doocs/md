<script setup>
import { ref } from 'vue'

import AboutDialog from './AboutDialog.vue'

const aboutDialogVisible = ref(false)
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      帮助
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="aboutDialogVisible = true">
        <el-icon class="mr-2 h-4 w-4" />
        <span>关于</span>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>

  <AboutDialog :visible="aboutDialogVisible" @close="aboutDialogVisible = false" />
</template>
