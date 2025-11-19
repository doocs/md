<script setup lang="ts">
import { FileCode, Moon, Palette, PanelLeft, Sun } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)

const uiStore = useUIStore()

const { isDark, isEditOnLeft, isShowCssEditor, isOpenRightSlider } = storeToRefs(uiStore)
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      视图
    </MenubarSubTrigger>
    <MenubarSubContent>
      <MenubarCheckboxItem v-model:checked="isDark">
        <component :is="isDark ? Moon : Sun" class="mr-2 h-4 w-4" />
        深色模式
      </MenubarCheckboxItem>
      <MenubarCheckboxItem v-model:checked="isEditOnLeft">
        <PanelLeft class="mr-2 h-4 w-4" />
        左侧编辑
      </MenubarCheckboxItem>

      <MenubarSeparator />

      <MenubarCheckboxItem v-model:checked="isOpenRightSlider">
        <Palette class="mr-2 h-4 w-4" />
        样式面板
      </MenubarCheckboxItem>
      <MenubarCheckboxItem v-model:checked="isShowCssEditor">
        <FileCode class="mr-2 h-4 w-4" />
        CSS 编辑器
      </MenubarCheckboxItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      视图
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarCheckboxItem v-model:checked="isDark">
        <component :is="isDark ? Moon : Sun" class="mr-2 h-4 w-4" />
        深色模式
      </MenubarCheckboxItem>
      <MenubarCheckboxItem v-model:checked="isEditOnLeft">
        <PanelLeft class="mr-2 h-4 w-4" />
        左侧编辑
      </MenubarCheckboxItem>

      <MenubarSeparator />

      <MenubarCheckboxItem v-model:checked="isOpenRightSlider">
        <Palette class="mr-2 h-4 w-4" />
        样式面板
      </MenubarCheckboxItem>
      <MenubarCheckboxItem v-model:checked="isShowCssEditor">
        <FileCode class="mr-2 h-4 w-4" />
        CSS 编辑器
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
</template>
