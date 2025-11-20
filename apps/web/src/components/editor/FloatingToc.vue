<script setup lang='ts'>
import { List } from 'lucide-vue-next'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'

const renderStore = useRenderStore()
const uiStore = useUIStore()
const { isPinFloatingToc, isShowFloatingToc } = storeToRefs(uiStore)

const isOpenHeadingSlider = ref(false)
</script>

<template>
  <div
    v-show="isShowFloatingToc"
    class="bg-background absolute left-0 top-0 border rounded-br-lg rounded-tr-lg rounded-bl-lg p-2 text-sm shadow-sm"
    @mouseenter="() => (isOpenHeadingSlider = true)"
    @mouseleave="() => (isOpenHeadingSlider = false)"
  >
    <List class="size-6" />
    <ul
      class="overflow-auto transition-all"
      :class="{
        'max-h-0 w-0': !isOpenHeadingSlider && !isPinFloatingToc,
        'max-h-100 w-60 mt-2': isOpenHeadingSlider || isPinFloatingToc,
      }"
    >
      <li
        v-for="(item, index) in renderStore.titleList"
        :key="index"
        class="line-clamp-1 py-1 leading-6 hover:bg-gray-300 dark:hover:bg-gray-600"
        :style="{ paddingLeft: `${item.level - 0.5}em` }"
      >
        <a :href="item.url">
          {{ item.title }}
        </a>
      </li>
    </ul>
  </div>
</template>
