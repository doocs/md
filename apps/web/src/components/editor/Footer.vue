<script setup lang="ts">
import { BookOpen, ChevronRight, Clock, FileText, Keyboard, Pilcrow, Type } from 'lucide-vue-next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'

const renderStore = useRenderStore()
const editorStore = useEditorStore()
const postStore = usePostStore()
const { readingTime } = storeToRefs(renderStore)
const { editor } = storeToRefs(editorStore)
const { currentPost } = storeToRefs(postStore)

// 光标位置
const cursorLine = ref(1)
const cursorCol = ref(1)
const selectionLength = ref(0)
const totalLines = ref(1)

// Go-to-Line
const isGoToLineActive = ref(false)
const goToLineInput = ref(``)
const goToLineRef = ref<HTMLInputElement | null>(null)

function openGoToLine() {
  isGoToLineActive.value = true
  goToLineInput.value = String(cursorLine.value)
  nextTick(() => goToLineRef.value?.select())
}

function goToLine() {
  const view = editor.value
  if (!view)
    return
  const target = Math.max(1, Math.min(Number.parseInt(goToLineInput.value) || 1, totalLines.value))
  const line = view.state.doc.line(target)
  view.dispatch({
    selection: { anchor: line.from },
    scrollIntoView: true,
  })
  view.focus()
  isGoToLineActive.value = false
  updateCursorInfo(view)
}

function cancelGoToLine() {
  isGoToLineActive.value = false
  editor.value?.focus()
}

// 监听编辑器变化，更新光标位置
watch(editor, (view, _, onCleanup) => {
  if (!view)
    return

  updateCursorInfo(view)

  const onKeyUp = () => updateCursorInfo(view)
  const onMouseUp = () => updateCursorInfo(view)

  view.dom.addEventListener(`keyup`, onKeyUp)
  view.dom.addEventListener(`mouseup`, onMouseUp)

  onCleanup(() => {
    view.dom.removeEventListener(`keyup`, onKeyUp)
    view.dom.removeEventListener(`mouseup`, onMouseUp)
  })
}, { immediate: true })

// 切换文章时立即刷新光标及统计信息
watch(currentPost, () => {
  nextTick(() => {
    if (editor.value) {
      updateCursorInfo(editor.value)
    }
  })
})

function updateCursorInfo(view: any) {
  const state = view.state
  const main = state.selection.main
  const line = state.doc.lineAt(main.head)
  cursorLine.value = line.number
  cursorCol.value = main.head - line.from + 1
  totalLines.value = state.doc.lines
  selectionLength.value = Math.abs(main.to - main.from)
  updateBreadcrumb(state.doc, line.number)
}

// TOC 面包屑
interface BreadcrumbItem {
  title: string
  level: number
  line: number
}

const breadcrumbs = ref<BreadcrumbItem[]>([])

function updateBreadcrumb(doc: any, currentLine: number) {
  const stack: BreadcrumbItem[] = []
  for (let i = 1; i <= currentLine; i++) {
    const text = doc.line(i).text
    const match = text.match(/^(#{1,6})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const title = match[2].replace(/\s*#+\s*$/, ``).trim()
      // 弹出所有 >= 当前 level 的项
      while (stack.length > 0 && stack[stack.length - 1].level >= level)
        stack.pop()
      stack.push({ title, level, line: i })
    }
  }
  breadcrumbs.value = stack
}

function jumpToHeading(line: number) {
  const view = editor.value
  if (!view)
    return
  const target = view.state.doc.line(line)
  view.dispatch({
    selection: { anchor: target.from },
    scrollIntoView: true,
  })
  view.focus()
  updateCursorInfo(view)
}

// 上次保存时间（相对时间显示）
const savedTimeAgo = computed(() => {
  if (!currentPost.value?.updateDatetime)
    return ``
  const date = new Date(currentPost.value.updateDatetime)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 10)
    return `刚刚`
  if (seconds < 60)
    return `${seconds} 秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)
    return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return `${hours} 小时前`
  return date.toLocaleDateString(`zh-CN`)
})

// 每 10 秒刷新一次相对时间
const refreshKey = ref(0)
const refreshTimer = setInterval(() => refreshKey.value++, 10_000)
onUnmounted(() => clearInterval(refreshTimer))

// 强制 computed 依赖 refreshKey
const displaySavedTime = computed(() => {
  // eslint-disable-next-line ts/no-unused-expressions
  refreshKey.value
  return savedTimeAgo.value
})

// 右侧统计项
const stats = computed(() => [
  { icon: Pilcrow, value: readingTime.value.words, tooltip: `词数` },
  { icon: Type, value: readingTime.value.chars, tooltip: `字符数` },
  { icon: Clock, value: `${readingTime.value.minutes} 分钟`, tooltip: `预计阅读时间` },
  { icon: BookOpen, value: totalLines.value, tooltip: `总行数` },
])
</script>

<template>
  <footer
    class="flex select-none items-center px-3 py-1 text-xs text-muted-foreground"
  >
    <TooltipProvider :delay-duration="300">
      <!-- 左侧：光标位置 & 选区 -->
      <div class="flex items-center gap-3">
        <!-- Go-to-Line 内联输入 -->
        <span v-if="isGoToLineActive" class="flex items-center gap-1">
          <Keyboard class="size-3 opacity-60" />
          <input
            ref="goToLineRef"
            v-model="goToLineInput"
            type="text"
            inputmode="numeric"
            class="h-4 w-16 rounded border border-primary/40 bg-transparent px-1 text-xs tabular-nums text-foreground outline-none focus:border-primary"
            :placeholder="`1–${totalLines}`"
            @keydown.enter="goToLine"
            @keydown.escape="cancelGoToLine"
            @blur="cancelGoToLine"
          >
        </span>
        <Tooltip v-else>
          <TooltipTrigger as-child>
            <span class="flex cursor-pointer items-center gap-1 tabular-nums transition-colors hover:text-foreground" @click="openGoToLine">
              <Keyboard class="size-3 opacity-60" />
              行 {{ cursorLine }}，列 {{ cursorCol }}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
            <p>光标位置（共 {{ totalLines }} 行） · 点击跳转</p>
          </TooltipContent>
        </Tooltip>

        <span
          v-if="selectionLength > 0"
          class="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary tabular-nums"
        >
          已选 {{ selectionLength }} 字符
        </span>
      </div>

      <!-- 中间：TOC 面包屑 -->
      <div class="mx-3 flex min-w-0 flex-1 items-center justify-center">
        <div v-if="breadcrumbs.length" class="flex min-w-0 items-center gap-0.5 truncate">
          <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.line">
            <ChevronRight v-if="idx > 0" class="size-3 shrink-0 opacity-40" />
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  class="max-w-28 cursor-pointer truncate rounded px-1 py-0.5 transition-colors hover:bg-accent hover:text-foreground"
                  @click="jumpToHeading(crumb.line)"
                >
                  {{ crumb.title }}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
                <p>H{{ crumb.level }} · 第 {{ crumb.line }} 行 · 点击跳转</p>
              </TooltipContent>
            </Tooltip>
          </template>
        </div>
      </div>

      <!-- 右侧：统计信息 -->
      <div class="flex items-center gap-3">
        <!-- 保存状态 -->
        <Tooltip v-if="displaySavedTime">
          <TooltipTrigger as-child>
            <span class="flex cursor-default items-center gap-1 opacity-70 transition-opacity hover:opacity-100">
              <FileText class="size-3" />
              {{ displaySavedTime }}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
            <p>上次修改时间</p>
          </TooltipContent>
        </Tooltip>

        <span class="text-border">·</span>

        <Tooltip v-for="stat in stats" :key="stat.tooltip">
          <TooltipTrigger as-child>
            <span class="flex cursor-default items-center gap-1 tabular-nums">
              <component :is="stat.icon" class="size-3 opacity-60" />
              {{ stat.value }}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
            <p>{{ stat.tooltip }}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  </footer>
</template>
