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

const { isDark, isShowCssEditor, isOpenRightSlider } = storeToRefs(uiStore)
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      视图
    </MenubarSubTrigger>
    <MenubarSubContent>
      <!-- 外观子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <component :is="isDark ? Moon : Sun" class="mr-2 h-4 w-4" />
          外观
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarCheckboxItem :checked="!isDark" @click="isDark = false">
            浅色模式
          </MenubarCheckboxItem>
          <MenubarCheckboxItem :checked="isDark" @click="isDark = true">
            深色模式
          </MenubarCheckboxItem>
        </MenubarSubContent>
      </MenubarSub>

      <!-- 浮动目录子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <PanelLeft class="mr-2 h-4 w-4" />
          浮动目录
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarCheckboxItem
            :checked="uiStore.isShowFloatingToc && uiStore.isPinFloatingToc"
            @click="() => { uiStore.isShowFloatingToc = true; uiStore.isPinFloatingToc = true }"
          >
            常驻显示
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            :checked="uiStore.isShowFloatingToc && !uiStore.isPinFloatingToc"
            @click="() => { uiStore.isShowFloatingToc = true; uiStore.isPinFloatingToc = false }"
          >
            点击展开
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            :checked="!uiStore.isShowFloatingToc"
            @click="() => { uiStore.isShowFloatingToc = false }"
          >
            隐藏
          </MenubarCheckboxItem>
        </MenubarSubContent>
      </MenubarSub>

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
      <!-- 外观子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <component :is="isDark ? Moon : Sun" class="mr-2 h-4 w-4" />
          外观
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarCheckboxItem :checked="!isDark" @click="isDark = false">
            浅色模式
          </MenubarCheckboxItem>
          <MenubarCheckboxItem :checked="isDark" @click="isDark = true">
            深色模式
          </MenubarCheckboxItem>
        </MenubarSubContent>
      </MenubarSub>

      <!-- 浮动目录子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <PanelLeft class="mr-2 h-4 w-4" />
          浮动目录
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarCheckboxItem
            :checked="uiStore.isShowFloatingToc && uiStore.isPinFloatingToc"
            @click="() => { uiStore.isShowFloatingToc = true; uiStore.isPinFloatingToc = true }"
          >
            常驻显示
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            :checked="uiStore.isShowFloatingToc && !uiStore.isPinFloatingToc"
            @click="() => { uiStore.isShowFloatingToc = true; uiStore.isPinFloatingToc = false }"
          >
            点击展开
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            :checked="!uiStore.isShowFloatingToc"
            @click="() => { uiStore.isShowFloatingToc = false }"
          >
            隐藏
          </MenubarCheckboxItem>
        </MenubarSubContent>
      </MenubarSub>

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
