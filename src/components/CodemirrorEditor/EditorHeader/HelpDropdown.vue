<script setup>
import { ref } from 'vue'

import AboutDialog from './AboutDialog.vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const props = defineProps([`isOpen`, `clickTrigger`, `openDropdown`, `updateOpen`])

const aboutDialogVisible = ref(false)
</script>

<template>
  <DropdownMenu :open="props.isOpen" @update:open="props.updateOpen">
    <DropdownMenuTrigger
      class="flex items-center p-2 px-4 hover:bg-gray-2 dark:hover:bg-stone-9"
      :class="{
        'bg-gray-2': props.isOpen,
        'dark:bg-stone-9': props.isOpen,
      }"
      @click="props.clickTrigger()"
      @mouseenter="props.openDropdown()"
    >
      帮助
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
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
