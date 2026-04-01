<script setup lang='ts'>
import { GripVertical, ListTree, Pin, PinOff } from 'lucide-vue-next'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'

const renderStore = useRenderStore()
const uiStore = useUIStore()
const { isPinFloatingToc, isShowFloatingToc, isMobile } = storeToRefs(uiStore)

const isOpen = ref(false)
const panelRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const containerRef = ref<HTMLElement | null>(null)
const dragHandleRef = ref<HTMLElement | null>(null)

const isPanelVisible = computed(() => isOpen.value || isPinFloatingToc.value)

// 拖拽支持
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const hasCustomPosition = ref(false)

function initDrag() {
  if (!containerRef.value)
    return

  let startX = 0
  let startY = 0
  let startPosX = 0
  let startPosY = 0

  function onPointerDown(e: PointerEvent) {
    // 只响应拖拽手柄区域
    if (!dragHandleRef.value?.contains(e.target as Node))
      return

    e.preventDefault()
    isDragging.value = true
    startX = e.clientX
    startY = e.clientY

    const container = containerRef.value!
    const parent = container.offsetParent as HTMLElement
    if (!hasCustomPosition.value && parent) {
      // 首次拖拽：从右上角绝对定位切换到 left/top 定位
      const rect = container.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()
      position.value = {
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top,
      }
      hasCustomPosition.value = true
    }

    startPosX = position.value.x
    startPosY = position.value.y

    document.addEventListener(`pointermove`, onPointerMove)
    document.addEventListener(`pointerup`, onPointerUp)
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging.value || !containerRef.value)
      return

    const parent = containerRef.value.offsetParent as HTMLElement
    if (!parent)
      return

    const dx = e.clientX - startX
    const dy = e.clientY - startY

    const parentRect = parent.getBoundingClientRect()
    const elRect = containerRef.value.getBoundingClientRect()

    let newX = startPosX + dx
    let newY = startPosY + dy

    // 限制在父容器内
    newX = Math.max(0, Math.min(newX, parentRect.width - elRect.width))
    newY = Math.max(0, Math.min(newY, parentRect.height - elRect.height))

    position.value = { x: newX, y: newY }
  }

  function onPointerUp() {
    isDragging.value = false
    document.removeEventListener(`pointermove`, onPointerMove)
    document.removeEventListener(`pointerup`, onPointerUp)
  }

  containerRef.value.addEventListener(`pointerdown`, onPointerDown)

  return () => {
    containerRef.value?.removeEventListener(`pointerdown`, onPointerDown)
  }
}

let cleanupDrag: (() => void) | undefined

watch(containerRef, (el) => {
  cleanupDrag?.()
  if (el) {
    cleanupDrag = initDrag()
  }
})

onUnmounted(() => {
  cleanupDrag?.()
})

// 面板关闭时重置位置
watch(isPanelVisible, (visible) => {
  if (!visible) {
    hasCustomPosition.value = false
  }
})

// 点击外部关闭（非固定模式）
onClickOutside(panelRef, () => {
  if (!isPinFloatingToc.value && !isDragging.value) {
    isOpen.value = false
  }
}, { ignore: [triggerRef] })

function handleToggle() {
  if (isPinFloatingToc.value) {
    isPinFloatingToc.value = false
    isOpen.value = false
  }
  else {
    isOpen.value = !isOpen.value
  }
}

function handlePin() {
  isPinFloatingToc.value = !isPinFloatingToc.value
  if (isPinFloatingToc.value) {
    isOpen.value = false
  }
}

function handleItemClick(url: string, title: string, level: number) {
  if (isDragging.value)
    return
  const id = url.replace(`#`, ``)
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: `smooth`, block: `start` })
  }

  window.dispatchEvent(new CustomEvent(`floating-toc:select`, {
    detail: { url, title, level },
  }))

  if (!isPinFloatingToc.value) {
    isOpen.value = false
  }
}

// 标题级别对应的样式
function getLevelStyle(level: number) {
  const indent = (level - 1) * 12
  return { paddingLeft: `${indent}px` }
}

function getLevelClass(level: number) {
  if (level === 1)
    return `font-semibold text-foreground`
  if (level === 2)
    return `font-medium text-foreground/90`
  return `text-muted-foreground`
}

const containerStyle = computed(() => {
  if (!hasCustomPosition.value)
    return {}
  return {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    right: `auto`,
  }
})
</script>

<template>
  <!-- 触发按钮 - 与 BackTop 垂直对齐 -->
  <Button
    v-show="isShowFloatingToc"
    ref="triggerRef"
    variant="outline"
    size="icon"
    class="absolute z-50 rounded-full border-border/40 bg-background/60 text-muted-foreground/70 backdrop-blur-sm hover:bg-background/80 hover:text-foreground"
    :class="{ '!bg-accent/80 !text-accent-foreground': isPanelVisible }"
    :style="{ right: `${isMobile ? 24 : 20}px`, top: `${isMobile ? 24 : 20}px` }"
    title="目录大纲"
    @click="handleToggle"
  >
    <ListTree />
  </Button>

  <!-- 可拖拽目录面板 -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-[-8px] scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-[-8px] scale-95"
  >
    <div
      v-if="isPanelVisible"
      ref="containerRef"
      class="absolute z-50 w-64 origin-top-right rounded-lg border bg-popover text-popover-foreground shadow-lg"
      :class="{ 'shadow-xl': isDragging }"
      :style="[
        { right: `${isMobile ? 24 : 20}px`, top: `${isMobile ? 64 : 60}px` },
        containerStyle,
      ]"
    >
      <div ref="panelRef">
        <!-- 面板头部（可拖拽） -->
        <div
          ref="dragHandleRef"
          class="flex items-center justify-between border-b px-3 py-2 select-none"
          :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
        >
          <div class="flex items-center gap-1.5">
            <GripVertical class="size-3.5 text-muted-foreground/50" />
            <span class="text-xs font-medium tracking-wide text-muted-foreground uppercase">目录</span>
          </div>
          <button
            class="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            :title="isPinFloatingToc ? '取消固定' : '固定显示'"
            @click="handlePin"
          >
            <Pin v-if="isPinFloatingToc" class="size-3.5" />
            <PinOff v-else class="size-3.5" />
          </button>
        </div>

        <!-- 目录列表 -->
        <div class="custom-scroll max-h-80 overflow-y-auto overflow-x-hidden p-1.5">
          <template v-if="renderStore.titleList.length > 0">
            <button
              v-for="(item, index) in renderStore.titleList"
              :key="index"
              class="group flex w-full items-start rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
              :style="getLevelStyle(item.level)"
              @click="handleItemClick(item.url, item.title, item.level)"
            >
              <span
                class="mr-2 mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-current opacity-30 transition-opacity group-hover:opacity-70"
                :class="item.level <= 2 ? 'opacity-50' : ''"
              />
              <span
                class="line-clamp-2 leading-snug"
                :class="getLevelClass(item.level)"
              >
                {{ item.title }}
              </span>
            </button>
          </template>
          <div v-else class="px-3 py-6 text-center text-xs text-muted-foreground">
            暂无标题
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
