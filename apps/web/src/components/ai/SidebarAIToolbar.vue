<script setup lang="ts">
import { Bot, Image as ImageIcon, Settings2, Wand2 } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import AIAssistantPanel from './chat-box/AIAssistantPanel.vue'
import AIImageGeneratorPanel from './image-generator/AIImageGeneratorPanel.vue'
import { AIPolishPopover } from './tool-box'

defineProps<{
  isMobile: boolean
  showEditor: boolean
}>()

const uiStore = useUIStore()
const { aiDialogVisible, aiImageDialogVisible } = storeToRefs(uiStore)
const { toggleAIDialog, toggleAIImageDialog } = uiStore

const editorStore = useEditorStore()
const { editor } = storeToRefs(editorStore)

const { hasShownAIToolboxHint } = storeToRefs(uiStore)

// 工具栏状态：false=默认(只显示贴边栏), true=展开(显示AI图标)
const isExpanded = ref(false) // 默认收起状态

// AI 工具箱相关状态
const toolBoxVisible = ref(false)

// 是否显示选中文本提示动画
const showSelectionHint = ref(false)
let selectionHintTimer: NodeJS.Timeout | null = null
let selectionCheckInterval: NodeJS.Timeout | null = null
let lastSelectedText = ``

// 检查选中文本的函数
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

// 检查并更新选中文本提示
function checkSelectionAndUpdateHint() {
  // 如果已经显示过提示，就不再显示
  if (hasShownAIToolboxHint.value) {
    return
  }

  const selected = getSelectedText()

  // 如果选中状态发生变化
  if (selected !== lastSelectedText) {
    lastSelectedText = selected

    // 清除之前的定时器
    if (selectionHintTimer) {
      clearTimeout(selectionHintTimer)
      selectionHintTimer = null
    }

    // 如果有选中文本且工具栏未展开
    if (selected && !isExpanded.value) {
      showSelectionHint.value = true

      // 标记已经显示过提示
      hasShownAIToolboxHint.value = true

      // 3秒后自动隐藏提示
      selectionHintTimer = setTimeout(() => {
        showSelectionHint.value = false
      }, 3000)
    }
    else {
      showSelectionHint.value = false
    }
  }
}

// 动态计算是否有选中文本
const hasSelectedText = computed(() => {
  if (!editor.value || !isExpanded.value)
    return false
  return getSelectedText().length > 0
})

// 当打开工具箱时，获取当前选中的文本
const currentSelectedText = computed(() => {
  return toolBoxVisible.value ? getSelectedText() : ``
})

// 切换展开/收起状态
function toggleExpanded() {
  isExpanded.value = !isExpanded.value

  // 展开后隐藏提示
  if (isExpanded.value) {
    showSelectionHint.value = false
    if (selectionHintTimer) {
      clearTimeout(selectionHintTimer)
      selectionHintTimer = null
    }
  }
}

// 打开AI助手
function openAIChat() {
  toggleAIDialog(true)
}

// 打开AI文生图
function openAIImageGenerator() {
  toggleAIImageDialog(true)
}

// 打开AI工具箱
function openAIToolBox() {
  toolBoxVisible.value = true
}

// 监听编辑区点击，自动收起工具栏
onMounted(() => {
  // 启动定时检查选中文本
  selectionCheckInterval = setInterval(() => {
    checkSelectionAndUpdateHint()
  }, 300) // 每300ms检查一次

  const handleInteraction = (e: Event) => {
    // 只有在展开状态才需要处理
    if (!isExpanded.value)
      return

    const target = e.target as Element
    if (!target)
      return

    const toolbar = document.querySelector(`.editor-ai-toolbar`)

    // 如果点击的是工具栏及其子元素，不处理
    if (toolbar && toolbar.contains(target))
      return

    // 排除不应该收起的区域
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

  // 同时监听点击和触摸事件，覆盖桌面端和移动端
  document.addEventListener(`click`, handleInteraction, true)
  document.addEventListener(`touchstart`, handleInteraction, true)

  onUnmounted(() => {
    document.removeEventListener(`click`, handleInteraction, true)
    document.removeEventListener(`touchstart`, handleInteraction, true)

    // 清理定时器
    if (selectionHintTimer) {
      clearTimeout(selectionHintTimer)
      selectionHintTimer = null
    }

    // 清理轮询
    if (selectionCheckInterval) {
      clearInterval(selectionCheckInterval)
      selectionCheckInterval = null
    }
  })
})
</script>

<template>
  <!-- 编辑区内侧AI工具栏 -->
  <div
    v-if="(!isMobile || (isMobile && showEditor))"
    class="editor-ai-toolbar absolute top-1/2 -translate-y-1/2 right-0 z-30 transition-all duration-300 ease-out"
  >
    <!-- 默认状态：贴边栏 -->
    <div
      v-if="!isExpanded"
      class="w-5 h-16 bg-gradient-to-b from-blue-500/90 to-purple-500/90 hover:from-blue-600/95 hover:to-purple-600/95 dark:from-blue-400/90 dark:to-purple-400/90 dark:hover:from-blue-500/95 dark:hover:to-purple-500/95 backdrop-blur-lg border-l border-y border-blue-300/50 dark:border-blue-600/50 cursor-pointer transition-all duration-200 flex items-center justify-center rounded-l-lg shadow-lg group utools-sidebar-edge"
      :class="{ 'animate-pulse-hint': showSelectionHint }"
      title="展开AI工具栏"
      @click="toggleExpanded"
    >
      <Settings2 class="h-4 w-4 text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />

      <!-- 选中文本提示气泡 -->
      <Transition name="hint-fade">
        <div
          v-if="showSelectionHint"
          class="hint-bubble absolute right-full mr-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-bounce-gentle z-50"
          style="top: 50%; transform: translateY(-50%);"
        >
          <div class="relative flex items-center gap-2">
            <Wand2 class="h-4 w-4" />
            <span>点击打开 AI 工具箱</span>
            <!-- 箭头 -->
            <div class="hint-arrow absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-purple-500" />
          </div>
        </div>
      </Transition>
    </div>

    <!-- 展开状态：显示AI图标 -->
    <div
      v-else
      class="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-l border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden transition-all duration-300 w-12 rounded-l-md"
      :style="{ height: 'auto' }"
    >
      <!-- 展开状态的AI按钮 -->
      <div class="flex flex-col py-2 gap-2">
        <!-- AI助手按钮 -->
        <div class="flex flex-col items-center gap-1 px-1">
          <button
            class="group relative w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center utools-ai-button"
            title="AI助手"
            @click="openAIChat"
          >
            <Bot class="h-4 w-4" />
          </button>

          <!-- 标签 -->
          <span class="text-[9px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">
            助手
          </span>
        </div>

        <!-- 分割线 -->
        <div class="mx-1.5">
          <div class="h-px bg-gray-200/50 dark:bg-gray-700/50" />
        </div>

        <!-- AI文生图按钮 -->
        <div class="flex flex-col items-center gap-1 px-1">
          <button
            class="group relative w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center utools-ai-button"
            title="AI文生图"
            @click="openAIImageGenerator"
          >
            <ImageIcon class="h-4 w-4" />
          </button>

          <!-- 标签 -->
          <span class="text-[9px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">
            文生图
          </span>
        </div>

        <!-- 分割线 -->
        <div v-if="hasSelectedText && isExpanded" class="mx-1.5">
          <div class="h-px bg-gray-200/50 dark:bg-gray-700/50" />
        </div>

        <!-- AI工具箱按钮 (只有选中文本且展开时才显示) -->
        <div v-if="hasSelectedText && isExpanded" class="flex flex-col items-center gap-1 px-1">
          <button
            class="group relative w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center utools-ai-button"
            title="AI工具箱"
            @click="openAIToolBox"
          >
            <Wand2 class="h-4 w-4" />
          </button>

          <!-- 标签 -->
          <span class="text-[9px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">
            工具箱
          </span>
        </div>
      </div>
    </div>

    <!-- AI面板组件 -->
    <AIAssistantPanel v-model:open="aiDialogVisible" />
    <AIImageGeneratorPanel v-model:open="aiImageDialogVisible" />

    <!-- AI工具箱弹窗 -->
    <AIPolishPopover
      v-model:open="toolBoxVisible"
      :selected-text="currentSelectedText"
      :is-mobile="isMobile"
    />
  </div>
</template>

<style scoped>
/* 确保工具栏与编辑器完美集成 */
.editor-ai-toolbar {
  z-index: 30;
  contain: layout style;
  pointer-events: auto;
  max-width: calc(100% - 0.5rem);
}

/* 工具栏自适应高度 */
.editor-ai-toolbar > div {
  height: auto;
  min-height: fit-content;
}

/* 确保按钮悬浮提示正确显示 */
.editor-ai-toolbar .absolute {
  overflow: visible;
}

/* 选中文本时的脉冲动画 */
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

/* 提示气泡的轻微弹跳动画 */
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

/* 提示气泡淡入淡出过渡 */
.hint-fade-enter-active,
.hint-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .editor-ai-toolbar {
    transform: translateY(-50%);
    transform-origin: right center;
  }

  /* 移动端图标稍微再大一点 */
  .editor-ai-toolbar .lucide {
    width: 1.125rem !important; /* h-4.5 w-4.5 */
    height: 1.125rem !important;
  }
}

/* 提高可访问性 */
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

/* 确保在小屏幕上不会遮挡内容 */
@media (max-height: 500px) {
  .min-h-\[120px\] {
    min-height: 80px;
  }

  .min-h-\[80px\] {
    min-height: 60px;
  }
}

/* 毛玻璃效果优化 */
@supports (backdrop-filter: blur(16px)) {
  .backdrop-blur-lg {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
}

/* 确保渐变按钮在深色模式下显示正确 */
.bg-gradient-to-br {
  background-attachment: fixed;
}

/* 悬浮提示样式优化 */
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

/* uTools 插件模式下使用黑白风格 */
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

/* uTools 模式下提示气泡使用黑白风格 */
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

/* uTools 模式下脉冲动画使用黑白风格 */
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

/* uTools 模式下 AI 按钮使用黑白风格 */
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
