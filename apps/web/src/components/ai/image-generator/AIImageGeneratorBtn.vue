<script setup lang="ts">
import { Image as ImageIcon } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'
import AIImageGeneratorPanel from './AIImageGeneratorPanel.vue'

defineProps<{
  isMobile: boolean
  showEditor: boolean
}>()

const uiStore = useUIStore()
const { aiImageDialogVisible } = storeToRefs(uiStore)
const { toggleAIImageDialog } = uiStore
</script>

<template>
  <button
    v-if="!isMobile || (isMobile && showEditor)"
    class="bg-primary absolute top-16 z-49 flex items-center justify-center rounded-full p-3 text-white shadow-lg transition active:scale-95 hover:scale-105 dark:bg-gray-700 dark:text-white dark:ring-2 dark:ring-white/30"
    :class="isMobile ? 'right-4' : 'right-6'"
    aria-label="AI 文生图"
    @click="() => toggleAIImageDialog(true)"
  >
    <ImageIcon class="h-5 w-5" />
  </button>

  <!-- 文生图面板 -->
  <AIImageGeneratorPanel v-model:open="aiImageDialogVisible" />
</template>
