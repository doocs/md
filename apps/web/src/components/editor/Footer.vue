<script setup lang="ts">
import { BookOpen, Clock, FileText, Keyboard, Pilcrow, Type } from 'lucide-vue-next'
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

// 监听编辑器变化，更新光标位置
let cleanupFns: (() => void)[] = []

watch(editor, (view, _, onCleanup) => {
  // 清理上次的事件监听
  cleanupFns.forEach(fn => fn())
  cleanupFns = []

  if (!view)
    return

  // 初始化
  updateCursorInfo(view)

  const onKeyUp = () => updateCursorInfo(view)
  const onMouseUp = () => updateCursorInfo(view)

  view.dom.addEventListener(`keyup`, onKeyUp)
  view.dom.addEventListener(`mouseup`, onMouseUp)

  cleanupFns.push(
    () => view.dom.removeEventListener(`keyup`, onKeyUp),
    () => view.dom.removeEventListener(`mouseup`, onMouseUp),
  )

  onCleanup(() => {
    cleanupFns.forEach(fn => fn())
    cleanupFns = []
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
</script>

<template>
  <footer
    class="flex select-none items-center px-3 py-1 text-xs text-muted-foreground"
  >
    <!-- 左侧：光标位置 & 选区 -->
    <div class="flex items-center gap-3">
      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="flex cursor-default items-center gap-1 tabular-nums">
              <Keyboard class="size-3 opacity-60" />
              行 {{ cursorLine }}，列 {{ cursorCol }}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6">
            <p>光标位置（共 {{ totalLines }} 行）</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <span
        v-if="selectionLength > 0"
        class="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary tabular-nums"
      >
        已选 {{ selectionLength }} 字符
      </span>
    </div>

    <!-- 中间弹性间距 -->
    <div class="flex-1" />

    <!-- 右侧：统计信息 -->
    <div class="flex items-center gap-3">
      <!-- 保存状态 -->
      <TooltipProvider v-if="displaySavedTime" :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="flex cursor-default items-center gap-1 opacity-70 transition-opacity hover:opacity-100">
              <FileText class="size-3" />
              {{ displaySavedTime }}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6">
            <p>上次修改时间</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <span class="text-border">·</span>

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="flex cursor-default items-center gap-1 tabular-nums">
              <Pilcrow class="size-3 opacity-60" />
              {{ readingTime.words }}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6">
            <p>词数</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="flex cursor-default items-center gap-1 tabular-nums">
              <Type class="size-3 opacity-60" />
              {{ readingTime.chars }}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6">
            <p>字符数</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="flex cursor-default items-center gap-1 tabular-nums">
              <Clock class="size-3 opacity-60" />
              {{ readingTime.minutes }} 分钟
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6">
            <p>预计阅读时间</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="flex cursor-default items-center gap-1 tabular-nums">
              <BookOpen class="size-3 opacity-60" />
              {{ totalLines }}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6">
            <p>总行数</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </footer>
</template>
