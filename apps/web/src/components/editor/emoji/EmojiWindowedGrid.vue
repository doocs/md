<script setup lang="ts" generic="T">
const props = withDefaults(defineProps<{
  items: T[]
  columns: number
  getKey: (item: T) => string
  gridClass: string
}>(), {})

const OVERSCAN = 4
const WINDOW_THRESHOLD = 48

const rootRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const startRow = ref(0)
const visibleRows = ref(16)
const rowHeight = ref(40)

const shouldWindow = computed(() => props.items.length > WINDOW_THRESHOLD)
const cols = computed(() => Math.max(props.columns, 1))
const totalRows = computed(() => Math.ceil(props.items.length / cols.value))

const windowedItems = computed(() => {
  if (!shouldWindow.value)
    return props.items
  const start = startRow.value * cols.value
  const end = Math.min(props.items.length, start + visibleRows.value * cols.value)
  return props.items.slice(start, end)
})
const showAppend = computed(() => {
  if (!shouldWindow.value)
    return true
  return startRow.value * cols.value + windowedItems.value.length >= props.items.length
})
const renderedRows = computed(() =>
  Math.ceil((windowedItems.value.length + (showAppend.value ? 1 : 0)) / cols.value),
)
const topPx = computed(() => shouldWindow.value ? startRow.value * rowHeight.value : 0)
const bottomPx = computed(() => {
  if (!shouldWindow.value)
    return 0
  return Math.max(0, (totalRows.value - startRow.value - renderedRows.value) * rowHeight.value)
})

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if (overflowY === `auto` || overflowY === `scroll`)
      return node
    node = node.parentElement
  }
  return null
}

function measureRowHeight(): number {
  const grid = gridRef.value
  const first = grid?.firstElementChild as HTMLElement | undefined
  if (!grid || !first)
    return rowHeight.value
  const gap = Number.parseFloat(getComputedStyle(grid).rowGap) || 0
  const next = first.getBoundingClientRect().height + gap
  return Number.isFinite(next) && next > 0 ? next : rowHeight.value
}

function updateWindow(): void {
  const root = rootRef.value
  if (!root || !shouldWindow.value)
    return
  const scroll = findScrollParent(root)
  if (!scroll)
    return

  rowHeight.value = measureRowHeight()

  const rootOffset = root.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop
  const y = scroll.scrollTop - rootOffset
  const maxStart = Math.max(0, totalRows.value - 1)
  startRow.value = Math.min(maxStart, Math.max(0, Math.floor(y / rowHeight.value) - OVERSCAN))
  visibleRows.value = Math.ceil(scroll.clientHeight / rowHeight.value) + OVERSCAN * 2
}

let scrollParent: HTMLElement | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  scrollParent = findScrollParent(rootRef.value)
  scrollParent?.addEventListener(`scroll`, updateWindow, { passive: true })
  resizeObserver = new ResizeObserver(() => updateWindow())
  if (rootRef.value)
    resizeObserver.observe(rootRef.value)
  nextTick(updateWindow)
})

onBeforeUnmount(() => {
  scrollParent?.removeEventListener(`scroll`, updateWindow)
  resizeObserver?.disconnect()
})

watch(() => [props.items.length, props.columns], () => {
  startRow.value = 0
  nextTick(updateWindow)
})
</script>

<template>
  <div ref="rootRef">
    <div v-if="shouldWindow && topPx" :style="{ height: `${topPx}px` }" />
    <div ref="gridRef" :class="[gridClass, shouldWindow ? 'content-start' : '']">
      <slot v-for="item in windowedItems" :key="getKey(item)" :item="item" />
      <slot v-if="showAppend" name="append" />
    </div>
    <div v-if="shouldWindow && bottomPx" :style="{ height: `${bottomPx}px` }" />
  </div>
</template>
