<script setup lang="ts">
import { Bot } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

defineProps<{
  isMobile: boolean
  showEditor: boolean
}>()

const uiStore = useUIStore()
const { aiDialogVisible } = storeToRefs(uiStore)
const { toggleAIDialog } = uiStore
</script>

<template>
  <button
    v-if="!isMobile || (isMobile && showEditor)"
    class="bg-primary absolute top-4 z-49 flex items-center justify-center rounded-full p-3 text-white shadow-lg transition active:scale-95 hover:scale-105 dark:bg-gray-700 dark:text-white dark:ring-2 dark:ring-white/30"
    :class="isMobile ? 'right-4' : 'right-6'"
    aria-label="AI 助手"
    @click="() => toggleAIDialog(true)"
  >
    <Bot class="h-5 w-5" />
  </button>
  <AIAssistantPanel v-model:open="aiDialogVisible" />
</template>
