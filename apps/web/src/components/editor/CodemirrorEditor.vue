<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import EditorPanel from '@/components/editor/EditorPanel.vue'
import PreviewPanel from '@/components/editor/PreviewPanel.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { useCursorSync } from '@/composables/useCursorSync'
import { useScrollSync } from '@/composables/useScrollSync'
import { useUIStore } from '@/stores/ui'

const PostSlider = defineAsyncComponent(() => import('@/components/editor/post-slider/index.vue'))
const FolderSourcePanel = defineAsyncComponent(() => import('@/components/editor/folder-source-panel/index.vue'))
const UploadImgDialog = defineAsyncComponent(() => import('@/components/editor/dialogs/UploadImgDialog.vue'))
const InsertFormDialog = defineAsyncComponent(() => import('@/components/editor/dialogs/InsertFormDialog.vue'))
const ImportMarkdownDialog = defineAsyncComponent(() => import('@/components/editor/dialogs/ImportMarkdownDialog.vue'))
const LocalImageUploadDialog = defineAsyncComponent(() => import('@/components/editor/dialogs/LocalImageUploadDialog.vue'))
const FormulaEditorDialog = defineAsyncComponent(() => import('@/components/editor/dialogs/FormulaEditorDialog.vue'))
const TemplateDialog = defineAsyncComponent(() => import('@/components/editor/dialogs/TemplateDialog.vue'))
const CustomComponentDialog = defineAsyncComponent(() => import('@/components/editor/dialogs/CustomComponentDialog.vue'))

const uiStore = useUIStore()

const {
  isMobile,
  isOpenPostSlider,
  isOpenFolderPanel,
  isOpenRightSlider,
  viewMode,
  enableScrollSync,
  isShowUploadImgDialog,
  isShowInsertFormDialog,
  isShowImportMdDialog,
  isShowLocalImageUpload,
  isShowFormulaEditorDialog,
  isShowTemplateDialog,
  isShowComponentDialog,
} = storeToRefs(uiStore)

// --- 子组件引用 ---
const editorPanelCompRef = ref<InstanceType<typeof EditorPanel> | null>(null)
const previewPanelCompRef = ref<InstanceType<typeof PreviewPanel> | null>(null)

// 从子组件获取 codeMirrorView 和 previewRef (使用 getter 避免 DeepReadonly 类型问题)
const getEditorView = () => editorPanelCompRef.value?.codeMirrorView ?? null
const getPreviewContainer = () => previewPanelCompRef.value?.previewRef ?? null

// --- 点击预览内容跳转到编辑器对应位置 ---
const { handlePreviewContentClick } = useCursorSync(getEditorView)

// --- 滚动同步 ---
useScrollSync(getEditorView, getPreviewContainer, enableScrollSync)

// --- 复制状态 ---
const backLight = ref(false)
const isCoping = ref(false)
let copyEndTimer: ReturnType<typeof setTimeout> | null = null

function startCopy() {
  backLight.value = true
  isCoping.value = true
}

function endCopy() {
  backLight.value = false
  if (copyEndTimer) {
    clearTimeout(copyEndTimer)
  }
  copyEndTimer = setTimeout(() => {
    isCoping.value = false
    copyEndTimer = null
  }, 800)
}

onUnmounted(() => {
  if (copyEndTimer) {
    clearTimeout(copyEndTimer)
    copyEndTimer = null
  }
})

// --- 上传图片透传 ---
function handleUploadImage(file: File, cb?: any, applyUrl?: boolean) {
  editorPanelCompRef.value?.uploadImage(file, cb, applyUrl)
}

// --- 面板尺寸配置 ---
const hasSidePanel = computed(() => !isMobile.value && (isOpenRightSlider.value || uiStore.isShowCssEditor))

const editorPanelConfig = computed(() => {
  const mode = viewMode.value
  if (mode === `preview`) {
    return { min: 0, max: 0 }
  }
  if (mode === `edit`) {
    return hasSidePanel.value ? { min: 30, max: 85 } : { min: 100, max: 100 }
  }
  if (isMobile.value)
    return { min: 30, max: 70 }
  return { min: 15, max: 85 }
})

const previewPanelConfig = computed(() => {
  const mode = viewMode.value
  if (mode === `edit`) {
    return { min: 0, max: 0 }
  }
  if (mode === `preview`) {
    return hasSidePanel.value ? { min: 20, max: 75 } : { min: 100, max: 100 }
  }
  if (isMobile.value)
    return { min: 30, max: 70 }
  return { min: 15, max: 85 }
})

const editorResizablePanelRef = ref<InstanceType<typeof ResizablePanel> | null>(null)
const previewResizablePanelRef = ref<InstanceType<typeof ResizablePanel> | null>(null)
const postSliderPanelRef = ref<InstanceType<typeof ResizablePanel> | null>(null)
const cssEditorPanelRef = ref<InstanceType<typeof ResizablePanel> | null>(null)
const rightSliderPanelRef = ref<InstanceType<typeof ResizablePanel> | null>(null)

function redistributePanelSizes() {
  const cssTarget = !isMobile.value && uiStore.isShowCssEditor ? 25 : 0
  const rightTarget = !isMobile.value && isOpenRightSlider.value ? 30 : 0
  const contentSpace = 100 - cssTarget - rightTarget

  const mode = viewMode.value
  if (mode === `edit`) {
    editorResizablePanelRef.value?.resize(contentSpace)
    previewResizablePanelRef.value?.resize(0)
  }
  else if (mode === `preview`) {
    editorResizablePanelRef.value?.resize(0)
    previewResizablePanelRef.value?.resize(contentSpace)
  }
  else {
    const half = contentSpace / 2
    editorResizablePanelRef.value?.resize(half)
    previewResizablePanelRef.value?.resize(half)
  }

  cssEditorPanelRef.value?.resize(cssTarget)
  rightSliderPanelRef.value?.resize(rightTarget)
}

watch(viewMode, () => {
  nextTick(redistributePanelSizes)
})

watch(() => uiStore.isShowCssEditor, () => {
  nextTick(redistributePanelSizes)
})

watch(isOpenRightSlider, () => {
  nextTick(redistributePanelSizes)
})

watch(isOpenPostSlider, (open) => {
  if (isMobile.value)
    return
  nextTick(() => {
    postSliderPanelRef.value?.resize(open ? 20 : 0)
  })
})

watch(isMobile, (mobile) => {
  if (mobile)
    postSliderPanelRef.value?.resize(0)
  else if (isOpenPostSlider.value)
    nextTick(() => postSliderPanelRef.value?.resize(20))
})

onMounted(() => {
  nextTick(() => {
    redistributePanelSizes()
    if (!isMobile.value && isOpenPostSlider.value)
      postSliderPanelRef.value?.resize(20)
  })
})

// --- 进度条 ---
const isImgLoading = computed(() => editorPanelCompRef.value?.isImgLoading ?? false)
</script>

<template>
  <div class="container flex flex-col">
    <Progress v-if="isImgLoading" indeterminate class="absolute left-0 right-0 rounded-none" style="height: 2px;" />
    <EditorHeader
      @start-copy="startCopy"
      @end-copy="endCopy"
    />

    <main class="container-main flex flex-1 flex-col">
      <div
        class="container-main-section border-radius-10 relative flex flex-1 overflow-hidden border-x border-b"
      >
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            ref="postSliderPanelRef"
            class="post-slider-panel"
            :default-size="!isMobile && isOpenPostSlider ? 20 : 0"
            :max-size="!isMobile && isOpenPostSlider ? 30 : 0"
            :min-size="!isMobile && isOpenPostSlider ? 18 : 0"
          >
            <PostSlider v-if="isOpenPostSlider" />
          </ResizablePanel>
          <ResizableHandle class="hidden md:block" />
          <ResizablePanel
            class="folder-panel"
            :default-size="!isMobile && isOpenFolderPanel ? 15 : 0"
            :max-size="!isMobile && isOpenFolderPanel ? 25 : 0"
            :min-size="!isMobile && isOpenFolderPanel ? 10 : 0"
          >
            <FolderSourcePanel v-if="isOpenFolderPanel" />
          </ResizablePanel>
          <ResizableHandle v-if="!isMobile && isOpenFolderPanel" class="hidden md:block" />

          <!-- 主内容区域 (嵌套灵动布局) -->
          <ResizablePanel :min-size="30">
            <ResizablePanelGroup direction="horizontal">
              <!-- Markdown 编辑器 -->
              <ResizablePanel
                ref="editorResizablePanelRef"
                :order="1"
                :default-size="viewMode === 'preview' ? 0 : viewMode === 'edit' ? 100 : 50"
                :min-size="editorPanelConfig.min"
                :max-size="editorPanelConfig.max"
                collapsible
                :collapsed-size="0"
              >
                <EditorPanel ref="editorPanelCompRef" />
              </ResizablePanel>
              <ResizableHandle v-show="viewMode === 'split'" />

              <!-- 预览区 -->
              <ResizablePanel
                ref="previewResizablePanelRef"
                :order="2"
                :default-size="viewMode === 'edit' ? 0 : viewMode === 'preview' ? 100 : 50"
                :min-size="previewPanelConfig.min"
                :max-size="previewPanelConfig.max"
                collapsible
                :collapsed-size="0"
              >
                <PreviewPanel
                  ref="previewPanelCompRef"
                  :back-light="backLight"
                  :is-coping="isCoping"
                  :on-content-click="handlePreviewContentClick"
                />
              </ResizablePanel>

              <!-- CSS 编辑器面板 -->
              <ResizableHandle v-show="!isMobile && uiStore.isShowCssEditor" class="hidden md:block" />
              <ResizablePanel
                ref="cssEditorPanelRef"
                :order="3"
                :default-size="0"
                :min-size="!isMobile && uiStore.isShowCssEditor ? 10 : 0"
                :max-size="!isMobile && uiStore.isShowCssEditor ? 60 : 0"
                collapsible
                :collapsed-size="0"
              >
                <CssEditor v-if="!isMobile" />
              </ResizablePanel>

              <!-- 样式面板 -->
              <ResizableHandle v-show="!isMobile && isOpenRightSlider" class="hidden md:block right-slider-handle" />
              <ResizablePanel
                ref="rightSliderPanelRef"
                class="right-slider-panel"
                :order="4"
                :default-size="0"
                :min-size="!isMobile && isOpenRightSlider ? 25 : 0"
                :max-size="!isMobile && isOpenRightSlider ? 60 : 0"
                collapsible
                :collapsed-size="0"
              >
                <RightSlider v-if="!isMobile" />
              </ResizablePanel>
            </ResizablePanelGroup>

            <!-- 移动端：CssEditor 和 RightSlider 作为浮层 -->
            <template v-if="isMobile">
              <CssEditor />
              <RightSlider />
            </template>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <UploadImgDialog v-if="isShowUploadImgDialog" @upload-image="handleUploadImage" />

      <InsertFormDialog v-if="isShowInsertFormDialog" />

      <ImportMarkdownDialog v-if="isShowImportMdDialog" />

      <LocalImageUploadDialog v-if="isShowLocalImageUpload" />

      <FormulaEditorDialog v-if="isShowFormulaEditorDialog" />

      <TemplateDialog v-if="isShowTemplateDialog" />

      <CustomComponentDialog v-if="isShowComponentDialog" />
    </main>

    <Footer />
  </div>
</template>

<style lang="less" scoped>
@import url('../../assets/less/app.less');
</style>

<style lang="less" scoped>
.container {
  height: 100vh;
  min-width: 100%;
  padding: 0;
}

.container-main {
  overflow: hidden;
}

.right-slider-panel {
  transition: flex-grow 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.post-slider-panel {
  transition: flex-grow 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.folder-panel {
  transition: flex-grow 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.right-slider-handle {
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
