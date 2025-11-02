<script setup lang="ts">
import { widthOptions } from '@md/shared/configs'
import { Moon, Sun } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const themeStore = useThemeStore()
const { previewWidth } = storeToRefs(themeStore)

const uiStore = useUIStore()
const { isDark, isEditOnLeft } = storeToRefs(uiStore)
const { toggleDark, toggleEditOnLeft } = uiStore

const editorStore = useEditorStore()
const renderStore = useRenderStore()

function previewWidthChanged(newWidth: string) {
  themeStore.previewWidth = newWidth
  // Trigger editor refresh after preview width changed
  editorRefresh()
}

function editorRefresh() {
  themeStore.updateCodeTheme()

  const raw = editorStore.getContent()
  renderStore.render(raw, {
    isCiteStatus: themeStore.isCiteStatus,
    legend: themeStore.legend,
    isUseIndent: themeStore.isUseIndent,
    isUseJustify: themeStore.isUseJustify,
    isCountStatus: themeStore.isCountStatus,
    isMacCodeBlock: themeStore.isMacCodeBlock,
    isShowLineNumber: themeStore.isShowLineNumber,
  })
}

function customStyle() {
  uiStore.toggleShowCssEditor()
}
</script>

<template>
  <div class="theme-customizer space-y-4">
    <div class="space-y-2 hidden sm:block">
      <h2 class="text-sm font-medium">
        编辑区位置
      </h2>
      <div class="grid grid-cols-2 justify-items-center gap-2">
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': isEditOnLeft,
          }" @click="!isEditOnLeft && toggleEditOnLeft()"
        >
          左侧
        </Button>
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': !isEditOnLeft,
          }" @click="isEditOnLeft && toggleEditOnLeft()"
        >
          右侧
        </Button>
      </div>
    </div>
    <div class="space-y-2 hidden sm:block">
      <h2 class="text-sm font-medium">
        预览模式
      </h2>
      <div class="grid grid-cols-2 justify-items-center gap-2">
        <Button
          v-for="{ label, value } in widthOptions" :key="value" class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': previewWidth === value,
          }" @click="previewWidthChanged(value)"
        >
          {{ label }}
        </Button>
      </div>
    </div>
    <div class="space-y-2">
      <h2 class="text-sm font-medium">
        自定义 CSS 面板
      </h2>
      <div class="grid grid-cols-2 justify-items-center gap-2">
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': uiStore.isShowCssEditor,
          }" @click="!uiStore.isShowCssEditor && customStyle()"
        >
          开启
        </Button>
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': !uiStore.isShowCssEditor,
          }" @click="uiStore.isShowCssEditor && customStyle()"
        >
          关闭
        </Button>
      </div>
    </div>
    <div class="space-y-2">
      <h2 class="text-sm font-medium">
        浮动目录
      </h2>
      <div class="grid grid-cols-2 justify-items-center gap-2">
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': uiStore.isPinFloatingToc,
          }" @click="!uiStore.isPinFloatingToc && uiStore.togglePinFloatingToc()"
        >
          常驻显示
        </Button>
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': !uiStore.isPinFloatingToc,
          }" @click="uiStore.isPinFloatingToc && uiStore.togglePinFloatingToc()"
        >
          移入触发
        </Button>
      </div>
    </div>
    <div class="space-y-2">
      <h2 class="text-sm font-medium">
        模式
      </h2>
      <div class="grid grid-cols-2 justify-items-center gap-2">
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': !isDark,
          }" @click="toggleDark(false)"
        >
          <Sun class="h-4 w-4" />
        </Button>
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': isDark,
          }" @click="toggleDark(true)"
        >
          <Moon class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
