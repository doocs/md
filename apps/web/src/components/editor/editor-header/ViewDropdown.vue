<script setup lang="ts">
import { widthOptions } from '@md/shared/configs'
import { FileCode, Monitor, Moon, Palette, PanelLeft, Smartphone, Sun } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)

const uiStore = useUIStore()
const themeStore = useThemeStore()

const { isDark, isEditOnLeft, isShowCssEditor, isOpenRightSlider } = storeToRefs(uiStore)
const { previewWidth } = storeToRefs(themeStore)

// Get mobile and desktop width values
const mobileWidth = widthOptions[0].value
const desktopWidth = widthOptions[1].value

// Set preview mode
function setPreviewMode(width: string) {
  themeStore.previewWidth = width
}
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

      <!-- 编辑模式子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <PanelLeft class="mr-2 h-4 w-4" />
          编辑模式
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarCheckboxItem :checked="isEditOnLeft" @click="isEditOnLeft = true">
            左侧编辑
          </MenubarCheckboxItem>
          <MenubarCheckboxItem :checked="!isEditOnLeft" @click="isEditOnLeft = false">
            右侧编辑
          </MenubarCheckboxItem>
        </MenubarSubContent>
      </MenubarSub>

      <!-- 预览模式子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <component :is="previewWidth === mobileWidth ? Smartphone : Monitor" class="mr-2 h-4 w-4" />
          预览模式
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarCheckboxItem :checked="previewWidth === mobileWidth" @click="setPreviewMode(mobileWidth)">
            移动端
          </MenubarCheckboxItem>
          <MenubarCheckboxItem :checked="previewWidth === desktopWidth" @click="setPreviewMode(desktopWidth)">
            电脑端
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
            移入触发
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

      <!-- 编辑模式子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <PanelLeft class="mr-2 h-4 w-4" />
          编辑模式
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarCheckboxItem :checked="isEditOnLeft" @click="isEditOnLeft = true">
            左侧编辑
          </MenubarCheckboxItem>
          <MenubarCheckboxItem :checked="!isEditOnLeft" @click="isEditOnLeft = false">
            右侧编辑
          </MenubarCheckboxItem>
        </MenubarSubContent>
      </MenubarSub>

      <!-- 预览模式子菜单 -->
      <MenubarSub>
        <MenubarSubTrigger>
          <component :is="previewWidth === mobileWidth ? Smartphone : Monitor" class="mr-2 h-4 w-4" />
          预览模式
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarCheckboxItem :checked="previewWidth === mobileWidth" @click="setPreviewMode(mobileWidth)">
            移动端
          </MenubarCheckboxItem>
          <MenubarCheckboxItem :checked="previewWidth === desktopWidth" @click="setPreviewMode(desktopWidth)">
            电脑端
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
            移入触发
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
