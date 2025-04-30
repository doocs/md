<script setup lang="ts">
import { useDisplayStore } from '@/stores'
import { Bot } from 'lucide-vue-next'

defineProps<{
  isMobile: boolean
  showEditor: boolean
}>()
const displayStore = useDisplayStore()
const { aiDialogVisible } = storeToRefs(displayStore)
const { toggleAIDialog } = displayStore
</script>

<template>
  <div>
    <button
      v-if="!isMobile || (isMobile && showEditor)"
      class="bg-primary fixed top-16 z-50 flex items-center justify-center rounded-full p-3 text-white shadow-lg transition active:scale-95 hover:scale-105 dark:bg-gray-700 dark:text-white dark:ring-2 dark:ring-white/30"
      :class="{
        'right-6': isMobile,
        'right-51%': !isMobile,
      }"
      aria-label="AI 助手" @click="() => toggleAIDialog(true)"
    >
      <Bot class="h-5 w-5" />
    </button>
    <!-- 挂载 AI 助手面板 -->
    <AIAssistantPanel v-model:open="aiDialogVisible" />
  </div>
</template>
