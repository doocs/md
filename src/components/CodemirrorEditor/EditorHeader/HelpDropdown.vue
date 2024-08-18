<script setup>
import { ref } from 'vue'

import AboutDialog from './AboutDialog.vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const aboutDialogVisible = ref(false)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="flex items-center">
      帮助
      <el-icon class="ml-2">
        <ElIconArrowDown />
      </el-icon>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem @click="aboutDialogVisible = true">
        <el-icon class="mr-2 h-4 w-4" />
        <span>关于</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <AboutDialog
    :visible="aboutDialogVisible"
    @close="aboutDialogVisible = false"
  />
</template>
