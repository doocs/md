<script setup lang="ts">
import { widthOptions } from '@md/shared/configs'
import { Moon, Sun } from 'lucide-vue-next'
import { useDisplayStore, useStore } from '@/stores'

const store = useStore()
const displayStore = useDisplayStore()

const { isDark } = storeToRefs(store)

function customStyle() {
  displayStore.toggleShowCssEditor()
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
            'border-black dark:border-white border-2': store.isEditOnLeft,
          }" @click="!store.isEditOnLeft && store.toggleEditOnLeft()"
        >
          左侧
        </Button>
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': !store.isEditOnLeft,
          }" @click="store.isEditOnLeft && store.toggleEditOnLeft()"
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
            'border-black dark:border-white border-2': store.previewWidth === value,
          }" @click="store.previewWidthChanged(value)"
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
            'border-black dark:border-white border-2': displayStore.isShowCssEditor,
          }" @click="!displayStore.isShowCssEditor && customStyle()"
        >
          开启
        </Button>
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': !displayStore.isShowCssEditor,
          }" @click="displayStore.isShowCssEditor && customStyle()"
        >
          关闭
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
          }" @click="store.toggleDark(false)"
        >
          <Sun class="h-4 w-4" />
        </Button>
        <Button
          class="w-full" variant="outline" :class="{
            'border-black dark:border-white border-2': isDark,
          }" @click="store.toggleDark(true)"
        >
          <Moon class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
