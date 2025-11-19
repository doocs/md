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
      <MenubarItem @click="isDark = !isDark">
        <component :is="isDark ? Sun : Moon" class="mr-2 h-4 w-4" />
        {{ isDark ? '浅色模式' : '深色模式' }}
      </MenubarItem>
      <MenubarItem @click="isEditOnLeft = !isEditOnLeft">
        <PanelLeft class="mr-2 h-4 w-4" />
        {{ isEditOnLeft ? '右侧编辑' : '左侧编辑' }}
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="isOpenRightSlider = !isOpenRightSlider">
        <Palette class="mr-2 h-4 w-4" />
        样式面板
      </MenubarItem>
      <MenubarItem @click="isShowCssEditor = !isShowCssEditor">
        <FileCode class="mr-2 h-4 w-4" />
        CSS 编辑器
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      视图
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="isDark = !isDark">
        <component :is="isDark ? Sun : Moon" class="mr-2 h-4 w-4" />
        {{ isDark ? '浅色模式' : '深色模式' }}
      </MenubarItem>
      <MenubarItem @click="isEditOnLeft = !isEditOnLeft">
        <PanelLeft class="mr-2 h-4 w-4" />
        {{ isEditOnLeft ? '右侧编辑' : '左侧编辑' }}
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="isOpenRightSlider = !isOpenRightSlider">
        <Palette class="mr-2 h-4 w-4" />
        样式面板
      </MenubarItem>
      <MenubarItem @click="isShowCssEditor = !isShowCssEditor">
        <FileCode class="mr-2 h-4 w-4" />
        CSS 编辑器
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
