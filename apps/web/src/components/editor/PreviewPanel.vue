<script setup lang="ts">
import type { DiagramDownloadOverlay } from '@/lib/preview/diagram-download'
import { highlightPendingBlocks, hljs } from '@md/core'
import { setupDiagramDownloadOverlay } from '@/lib/preview/diagram-download'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  backLight: boolean
  isCoping: boolean
  onContentClick: (event: MouseEvent) => void
}>()

const { t } = useI18n()
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

let diagramOverlay: DiagramDownloadOverlay | null = null

// Pause bar injection for the entire duration of isCoping so that
// processClipboardContent mutations never re-inject bars, and resume
// after the copy pipeline resets the DOM.
watch(() => props.isCoping, (coping) => {
  if (coping) {
    diagramOverlay?.pause()
  }
  else {
    nextTick(() => diagramOverlay?.resume())
  }
})

onMounted(() => {
  nextTick(() => {
    const outputEl = document.getElementById(`output`)
    if (outputEl) {
      diagramOverlay = setupDiagramDownloadOverlay(outputEl)
    }
  })
})

onUnmounted(() => {
  diagramOverlay?.cleanup()
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
              <span>{{ t('common.generating') }}</span>
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

<style>
/* Diagram download overlay — unscoped to affect v-html content */
.mermaid-diagram,
.plantuml-diagram {
  position: relative;
}

.diagram-download-bar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 4px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-6px);
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0s 0.18s;
}

.mermaid-diagram:hover .diagram-download-bar,
.plantuml-diagram:hover .diagram-download-bar,
.mermaid-diagram:focus-within .diagram-download-bar,
.plantuml-diagram:focus-within .diagram-download-bar {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0s;
}

.diagram-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.88);
  color: #444;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1), 0 0 0 0.5px rgba(0, 0, 0, 0.06);
  transition: background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, transform 0.1s ease;
  user-select: none;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1;
  white-space: nowrap;
}

.diagram-download-btn:hover {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.14), 0 0 0 0.5px rgba(0, 0, 0, 0.08);
  color: #111;
}

.diagram-download-btn:active {
  transform: scale(0.95);
}

.diagram-download-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.diagram-btn-loading {
  letter-spacing: 0.1em;
  opacity: 0.7;
}

/* Dark mode */
.output_night .diagram-download-btn {
  background: rgba(30, 32, 38, 0.88);
  border-color: rgba(255, 255, 255, 0.1);
  color: #b8bcc8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), 0 0 0 0.5px rgba(255, 255, 255, 0.04);
}

.output_night .diagram-download-btn:hover {
  background: rgba(50, 53, 62, 0.96);
  border-color: rgba(255, 255, 255, 0.18);
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
</style>
