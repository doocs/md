<script setup lang="ts">
import { Bot, Image as ImageIcon, Wand2 } from '@lucide/vue'
import { defineAsyncComponent } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { AIPolishPopover } from './tool-box'

defineProps<{
  isMobile: boolean
  showEditor: boolean
}>()
const AIAssistantPanel = defineAsyncComponent(() => import('./chat-box/AIAssistantPanel.vue'))
const AIImageGeneratorPanel = defineAsyncComponent(() => import('./image-generator/AIImageGeneratorPanel.vue'))

const SELECTION_HINT_TIMEOUT_MS = 3000

const uiStore = useUIStore()
const { aiDialogVisible, aiImageDialogVisible } = storeToRefs(uiStore)
const { toggleAIDialog, toggleAIImageDialog } = uiStore

const editorStore = useEditorStore()
const { editor } = storeToRefs(editorStore)

const { hasShownAIToolboxHint } = storeToRefs(uiStore)
const { t } = useI18n()

// Toolbar: false = docked strip only, true = expanded with AI icons
const isExpanded = ref(false)

const toolBoxVisible = ref(false)

const showSelectionHint = ref(false)
let selectionHintTimer: NodeJS.Timeout | null = null
let lastSelectedText = ``

function getSelectedText() {
  try {
    if (!editor.value)
      return ``
    const selection = editor.value.state.selection.main
    return editor.value.state.doc.sliceString(selection.from, selection.to).trim()
  }
  catch {
    return ``
  }
}

function checkSelectionAndUpdateHint() {
  if (hasShownAIToolboxHint.value) {
    return
  }

  const selected = getSelectedText()

  if (selected !== lastSelectedText) {
    lastSelectedText = selected

    if (selectionHintTimer) {
      clearTimeout(selectionHintTimer)
      selectionHintTimer = null
    }

    if (selected && !isExpanded.value) {
      showSelectionHint.value = true

      hasShownAIToolboxHint.value = true

      selectionHintTimer = setTimeout(() => {
        showSelectionHint.value = false
      }, SELECTION_HINT_TIMEOUT_MS)
    }
    else {
      showSelectionHint.value = false
    }
  }
}

const hasSelectedText = computed(() => {
  if (!editor.value || !isExpanded.value)
    return false
  return getSelectedText().length > 0
})

const currentSelectedText = computed(() => {
  return toolBoxVisible.value ? getSelectedText() : ``
})

function toggleExpanded() {
  isExpanded.value = !isExpanded.value

  if (isExpanded.value) {
    showSelectionHint.value = false
    if (selectionHintTimer) {
      clearTimeout(selectionHintTimer)
      selectionHintTimer = null
    }
  }
}

function openAIChat() {
  toggleAIDialog(true)
}

function openAIImageGenerator() {
  toggleAIImageDialog(true)
}

function openAIToolBox() {
  toolBoxVisible.value = true
}

onMounted(() => {
  // Use selectionchange instead of polling to detect selection changes
  const handleSelectionChange = () => {
    checkSelectionAndUpdateHint()
  }
  document.addEventListener(`selectionchange`, handleSelectionChange)

  const handleInteraction = (e: Event) => {
    if (!isExpanded.value)
      return

    const target = e.target as Element
    if (!target)
      return

    const toolbar = document.querySelector(`.editor-ai-toolbar`)

    if (toolbar && toolbar.contains(target))
      return

    // Regions that should not collapse the toolbar
    const excludeSelectors = [
      `dialog`,
      `.popover`,
      `.modal`,
      `[role="dialog"]`,
      `nav`,
      `.menu`,
      `.dropdown`,
      `.tooltip`,
      `.floating`,
      `.ai-assistant-panel`,
      `.ai-image-generator-panel`,
    ]

    const shouldNotCollapse = excludeSelectors.some(selector => target.closest(selector))

    if (!shouldNotCollapse) {
      isExpanded.value = false
    }
  }

  document.addEventListener(`click`, handleInteraction, true)
  document.addEventListener(`touchstart`, handleInteraction, true)

  onUnmounted(() => {
    document.removeEventListener(`click`, handleInteraction, true)
    document.removeEventListener(`touchstart`, handleInteraction, true)
    document.removeEventListener(`selectionchange`, handleSelectionChange)

    if (selectionHintTimer) {
      clearTimeout(selectionHintTimer)
      selectionHintTimer = null
    }
  })
})
</script>

<template>
  <!-- @mousedown.prevent keeps editor focus and selection highlight -->
  <div
    v-if="(!isMobile || (isMobile && showEditor))"
    class="editor-ai-toolbar absolute top-1/2 -translate-y-1/2 right-0 z-30 transition-all duration-300 ease-out"
    @mousedown.prevent
  >
    <div
      v-if="!isExpanded"
      role="button"
      tabindex="0"
      class="w-5 h-16 bg-gradient-to-b from-blue-500/90 to-purple-500/90 hover:from-blue-600/95 hover:to-purple-600/95 dark:from-blue-400/90 dark:to-purple-400/90 dark:hover:from-blue-500/95 dark:hover:to-purple-500/95 backdrop-blur-lg border-l border-y border-blue-300/50 dark:border-blue-600/50 cursor-pointer transition-all duration-200 flex items-center justify-center rounded-l-lg shadow-lg group utools-sidebar-edge"
      :class="{ 'animate-pulse-hint': showSelectionHint }"
      :title="t('ai.toolbar.expand')"
      :aria-label="t('ai.toolbar.expand')"
      :aria-expanded="false"
      @click="toggleExpanded"
      @keydown.enter.prevent="toggleExpanded"
      @keydown.space.prevent="toggleExpanded"
    >
      <Bot class="h-4 w-4 text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />

      <Transition name="hint-fade">
        <div
          v-if="showSelectionHint"
          class="hint-bubble absolute right-full mr-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-bounce-gentle z-50"
          style="top: 50%; transform: translateY(-50%);"
        >
          <div class="relative flex items-center gap-2">
            <Wand2 class="h-4 w-4" />
            <span>{{ t('ai.toolbar.openToolboxHint') }}</span>
            <div class="hint-arrow absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-purple-500" />
          </div>
        </div>
      </Transition>
    </div>

    <div
      v-else
      class="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-l border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden transition-all duration-300 w-12 rounded-l-md"
      :style="{ height: 'auto' }"
    >
      <div class="flex flex-col py-2 gap-2">
        <div class="flex flex-col items-center gap-1 px-1">
          <button
            type="button"
            class="group relative w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center utools-ai-button"
            :title="t('ai.toolbar.assistant')"
            :aria-label="t('ai.toolbar.assistant')"
            @click="openAIChat"
          >
            <Bot class="h-4 w-4" />
          </button>

          <span class="text-[9px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">
            {{ t('ai.toolbar.assistantLabel') }}
          </span>
        </div>

        <div class="mx-1.5">
          <div class="h-px bg-gray-200/50 dark:bg-gray-700/50" />
        </div>

        <div class="flex flex-col items-center gap-1 px-1">
          <button
            type="button"
            class="group relative w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center utools-ai-button"
            :title="t('ai.toolbar.imageGen')"
            :aria-label="t('ai.toolbar.imageGen')"
            @click="openAIImageGenerator"
          >
            <ImageIcon class="h-4 w-4" />
          </button>

          <span class="text-[9px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">
            {{ t('ai.toolbar.imageGenLabel') }}
          </span>
        </div>

        <div v-if="hasSelectedText && isExpanded" class="mx-1.5">
          <div class="h-px bg-gray-200/50 dark:bg-gray-700/50" />
        </div>

        <div v-if="hasSelectedText && isExpanded" class="flex flex-col items-center gap-1 px-1">
          <button
            type="button"
            class="group relative w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center utools-ai-button"
            :title="t('ai.toolbar.toolbox')"
            :aria-label="t('ai.toolbar.toolbox')"
            @click="openAIToolBox"
          >
            <Wand2 class="h-4 w-4" />
          </button>

          <span class="text-[9px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">
            {{ t('ai.toolbar.toolboxLabel') }}
          </span>
        </div>
      </div>
    </div>

    <AIAssistantPanel v-if="aiDialogVisible" v-model:open="aiDialogVisible" />
    <AIImageGeneratorPanel v-if="aiImageDialogVisible" v-model:open="aiImageDialogVisible" />

    <AIPolishPopover
      v-model:open="toolBoxVisible"
      :selected-text="currentSelectedText"
      :is-mobile="isMobile"
    />
  </div>
</template>

<style scoped>
.editor-ai-toolbar {
  z-index: 30;
  contain: layout style;
  pointer-events: auto;
  max-width: calc(100% - 0.5rem);
}

.editor-ai-toolbar > div {
  height: auto;
  min-height: fit-content;
}

.editor-ai-toolbar .absolute {
  overflow: visible;
}

@keyframes pulse-hint {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

.animate-pulse-hint {
  animation: pulse-hint 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes bounce-gentle {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-4px);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 1s ease-in-out infinite;
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.hint-fade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.hint-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.hint-fade-enter-to,
.hint-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .editor-ai-toolbar {
    transform: translateY(-50%);
    transform-origin: right center;
  }

  .editor-ai-toolbar .lucide {
    width: 1.125rem !important; /* h-4.5 w-4.5 */
    height: 1.125rem !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transform {
    transition: none !important;
  }

  .hover\:scale-105:hover,
  .active\:scale-95:active {
    transform: none !important;
  }

  .backdrop-blur-lg {
    backdrop-filter: none;
  }
}

@media (max-height: 500px) {
  .min-h-\[120px\] {
    min-height: 80px;
  }

  .min-h-\[80px\] {
    min-height: 60px;
  }
}

@supports (backdrop-filter: blur(16px)) {
  .backdrop-blur-lg {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
}

.bg-gradient-to-br {
  background-attachment: fixed;
}

.group:hover > div {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.is-utools .utools-sidebar-edge {
  background: rgb(0 0 0 / 0.9) !important;
  border-color: rgb(0 0 0 / 0.5) !important;
}

.is-utools .utools-sidebar-edge:hover {
  background: rgb(0 0 0 / 0.95) !important;
}

.is-utools.dark .utools-sidebar-edge {
  background: rgb(255 255 255 / 0.9) !important;
  border-color: rgb(255 255 255 / 0.5) !important;
}

.is-utools.dark .utools-sidebar-edge:hover {
  background: rgb(255 255 255 / 0.95) !important;
}

.is-utools.dark .utools-sidebar-edge .lucide {
  color: rgb(0 0 0) !important;
}

.is-utools .hint-bubble {
  background: rgb(0 0 0 / 0.9) !important;
  background-image: none !important;
  color: rgb(255 255 255) !important;
}

.is-utools.dark .hint-bubble {
  background: rgb(255 255 255 / 0.9) !important;
  background-image: none !important;
  color: rgb(0 0 0) !important;
}

.is-utools .hint-arrow {
  border-left-color: rgb(0 0 0 / 0.9) !important;
}

.is-utools.dark .hint-arrow {
  border-left-color: rgb(255 255 255 / 0.9) !important;
}

@keyframes pulse-hint-utools {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
  }
}

@keyframes pulse-hint-utools-dark {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 255, 255, 0);
  }
}

.is-utools .animate-pulse-hint {
  animation: pulse-hint-utools 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.is-utools.dark .animate-pulse-hint {
  animation: pulse-hint-utools-dark 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.is-utools .utools-ai-button {
  background: rgb(0 0 0 / 0.85) !important;
  background-image: none !important;
}

.is-utools .utools-ai-button:hover {
  background: rgb(0 0 0 / 0.95) !important;
  background-image: none !important;
}

.is-utools.dark .utools-ai-button {
  background: rgb(255 255 255 / 0.85) !important;
  background-image: none !important;
  color: rgb(0 0 0) !important;
}

.is-utools.dark .utools-ai-button:hover {
  background: rgb(255 255 255 / 0.95) !important;
  background-image: none !important;
}

.is-utools.dark .utools-ai-button .lucide {
  color: rgb(0 0 0) !important;
}
</style>
