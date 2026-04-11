<script setup lang="ts">
import { highlightPendingBlocks, hljs } from '@md/core'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'

defineProps<{
  backLight: boolean
  isCoping: boolean
  onContentClick: (event: MouseEvent) => void
}>()

const renderStore = useRenderStore()
const uiStore = useUIStore()

const { output } = storeToRefs(renderStore)
const { isMobile, viewMode, previewDevice } = storeToRefs(uiStore)

const effectivePreviewWidth = computed(() => {
  if (isMobile.value)
    return `w-full`
  return previewDevice.value === `mobile` ? `w-[375px]` : `w-full`
})

const previewRef = useTemplateRef<HTMLDivElement>(`previewRef`)

watch(output, () => {
  nextTick(() => {
    const outputElement = document.getElementById(`output`)
    if (outputElement) {
      highlightPendingBlocks(hljs, outputElement)
    }
  })
})

defineExpose({
  previewRef,
})
</script>

<template>
  <div v-show="viewMode !== 'edit'" class="relative h-full overflow-x-hidden">
    <div
      id="preview"
      ref="previewRef"
      class="preview-wrapper w-full p-5 flex justify-center"
    >
      <div
        id="output-wrapper"
        class="w-full max-w-full"
        :class="{ output_night: !backLight }"
      >
        <div
          class="preview border-x shadow-xl mx-auto"
          :class="[
            effectivePreviewWidth,
            effectivePreviewWidth === 'w-[375px]' ? 'max-w-full' : '',
          ]"
        >
          <section id="output" class="w-full" @click="onContentClick" v-html="output" />
          <div v-if="isCoping" class="loading-mask">
            <div class="loading-mask-box">
              <div class="loading__img" />
              <span>正在生成</span>
            </div>
          </div>
        </div>
      </div>
      <BackTop
        target="preview"
        :right="isMobile ? 24 : 20"
        :bottom="isMobile ? 90 : 20"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
@import url('../../assets/less/app.less');
</style>

<style lang="less" scoped>
#output-wrapper {
  position: relative;
  user-select: text;
  height: 100%;
}

.loading-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));

  .loading-mask-box {
    position: sticky;
    top: 50%;
    transform: translateY(-50%);

    .loading__img {
      width: 75px;
      height: 75px;
      background: url('../../assets/images/favicon.png') no-repeat;
      margin: 1em auto;
      background-size: cover;
    }
  }
}

.preview-wrapper {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

:deep(.preview-table) {
  border-spacing: 0;
}
</style>
