<script setup lang="ts">
import DiffMatchPatch from 'diff-match-patch'

const props = defineProps<{
  oldText: string
  newText: string
}>()

interface DiffSpan {
  type: 'equal' | 'insert' | 'delete'
  text: string
}

interface DiffLine {
  rowType: 'equal' | 'insert' | 'delete'
  spans: DiffSpan[]
}

const dmp = new DiffMatchPatch()

const diffLines = computed<DiffLine[]>(() => {
  const diffs = dmp.diff_main(props.oldText, props.newText)
  dmp.diff_cleanupSemantic(diffs)

  const lines: DiffLine[] = []
  let currentSpans: DiffSpan[] = []

  function pushLine() {
    if (currentSpans.length === 0)
      return
    const types = new Set(currentSpans.map(s => s.type))
    types.delete(`equal`)
    const rowType: DiffLine['rowType']
      = types.size === 0
        ? `equal`
        : types.has(`delete`) && !types.has(`insert`)
          ? `delete`
          : types.has(`insert`) && !types.has(`delete`)
            ? `insert`
            : (currentSpans.find(s => s.type !== `equal`)?.type ?? `equal`)
    lines.push({ rowType, spans: [...currentSpans] })
    currentSpans = []
  }

  for (const [op, text] of diffs) {
    const type: DiffSpan['type']
      = op === DiffMatchPatch.DIFF_EQUAL
        ? `equal`
        : op === DiffMatchPatch.DIFF_INSERT
          ? `insert`
          : `delete`

    const subLines = text.split(`\n`)
    for (let i = 0; i < subLines.length; i++) {
      if (i > 0)
        pushLine()
      const seg = subLines[i]
      if (seg.length > 0)
        currentSpans.push({ type, text: seg })
    }
  }
  if (currentSpans.length > 0)
    pushLine()

  return lines
})

const stats = computed(() => {
  let ins = 0
  let del = 0
  for (const line of diffLines.value) {
    if (line.rowType === `insert`)
      ins++
    else if (line.rowType === `delete`)
      del++
  }
  return { ins, del }
})

const isIdentical = computed(() => stats.value.ins === 0 && stats.value.del === 0)

const lineNumbers = computed(() => {
  let oldNo = 0
  let newNo = 0
  return diffLines.value.map((line) => {
    if (line.rowType === `equal`) {
      oldNo++
      newNo++
      return { old: oldNo, new: newNo }
    }
    if (line.rowType === `delete`) {
      oldNo++
      return { old: oldNo, new: null }
    }
    newNo++
    return { old: null, new: newNo }
  })
})

// ---- minimap ----
const scrollContainer = ref<HTMLElement | null>(null)
const minimapRef = ref<HTMLElement | null>(null)
const viewportTop = ref(0)
const viewportHeight = ref(100)

function updateViewport() {
  const el = scrollContainer.value
  if (!el)
    return
  const { scrollTop, scrollHeight, clientHeight } = el
  if (scrollHeight <= 0)
    return
  viewportTop.value = (scrollTop / scrollHeight) * 100
  viewportHeight.value = (clientHeight / scrollHeight) * 100
}

function onMinimapClick(e: MouseEvent) {
  const el = scrollContainer.value
  const mm = minimapRef.value
  if (!el || !mm)
    return
  const rect = mm.getBoundingClientRect()
  const ratio = (e.clientY - rect.top) / rect.height
  el.scrollTop = ratio * el.scrollHeight - el.clientHeight / 2
}

onMounted(() => {
  nextTick(updateViewport)
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 统计 -->
    <div class="flex items-center gap-3 px-3 py-1.5 border-b text-xs text-muted-foreground shrink-0">
      <span class="flex-1" />
      <span class="text-green-600 dark:text-green-400">+{{ stats.ins }}</span>
      <span class="text-red-600 dark:text-red-400">-{{ stats.del }}</span>
    </div>

    <!-- 无差异 -->
    <div v-if="isIdentical" class="flex-1 flex items-center justify-center text-sm text-muted-foreground">
      两个版本内容完全相同
    </div>

    <!-- 差异内容 -->
    <div v-else class="flex-1 flex overflow-hidden">
      <!-- 主内容 -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto thin-scrollbar" @scroll="updateViewport">
        <div class="font-mono text-xs leading-5">
          <div
            v-for="(line, idx) in diffLines"
            :key="idx"
            class="flex"
            :class="{
              'bg-green-500/8': line.rowType === 'insert',
              'bg-red-500/8': line.rowType === 'delete',
            }"
          >
            <span
              class="select-none shrink-0 w-8 text-right pr-1 text-muted-foreground/30"
              :class="{ 'text-red-500/40': line.rowType === 'delete' }"
            >{{ lineNumbers[idx].old ?? '' }}</span>
            <span
              class="select-none shrink-0 w-8 text-right pr-1.5 text-muted-foreground/30 border-r border-border/50"
              :class="{ 'text-green-500/40': line.rowType === 'insert' }"
            >{{ lineNumbers[idx].new ?? '' }}</span>
            <span
              class="select-none shrink-0 w-5 text-center text-muted-foreground/40"
              :class="{
                'text-green-600/60 dark:text-green-400/60': line.rowType === 'insert',
                'text-red-600/60 dark:text-red-400/60': line.rowType === 'delete',
              }"
            >{{ line.rowType === 'insert' ? '+' : line.rowType === 'delete' ? '−' : '' }}</span>
            <pre class="flex-1 px-2 whitespace-pre-wrap break-all"><template v-for="(span, si) in line.spans" :key="si"><span :class="{ 'bg-green-500/20 rounded-sm': span.type === 'insert', 'bg-red-500/20 rounded-sm line-through decoration-red-500/40': span.type === 'delete' }">{{ span.text }}</span></template><span v-if="line.spans.length === 0" /></pre>
          </div>
        </div>
      </div>

      <!-- 缩略图 -->
      <div
        ref="minimapRef"
        class="shrink-0 w-[18px] border-l border-border/50 relative cursor-pointer select-none bg-muted/20"
        @click="onMinimapClick"
      >
        <!-- 变更标记 -->
        <div class="absolute inset-0 flex flex-col">
          <div
            v-for="(line, idx) in diffLines"
            :key="idx"
            class="flex-1 min-h-px"
            :class="{
              'bg-green-500/70': line.rowType === 'insert',
              'bg-red-500/70': line.rowType === 'delete',
            }"
          />
        </div>
        <!-- 视口指示器 -->
        <div
          class="absolute left-0 right-0 border border-foreground/20 bg-foreground/5 rounded-sm pointer-events-none transition-[top,height] duration-100"
          :style="{ top: `${viewportTop}%`, height: `${Math.max(viewportHeight, 4)}%` }"
        />
      </div>
    </div>
  </div>
</template>
