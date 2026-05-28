<script setup lang="ts">
import type { EditorView } from '@codemirror/view'
import { ArrowUpDown, BookOpen, Clock, Columns2, Eye, FileText, Monitor, Moon, PenLine, Pilcrow, Smartphone, Sun, Type } from 'lucide-vue-next'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useRefreshTimer } from '@/composables/useRefreshTimer'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'
import { formatRelativeTime } from '@/utils/time'

const renderStore = useRenderStore()
const editorStore = useEditorStore()
const postStore = usePostStore()
const uiStore = useUIStore()
const { readingTime } = storeToRefs(renderStore)
const { editor } = storeToRefs(editorStore)
const { currentPost } = storeToRefs(postStore)
const { isDark } = storeToRefs(uiStore)
const { isMobile, viewMode, previewDevice, enableScrollSync } = storeToRefs(uiStore)

// 上次保存时间
const savedTimeAgo = computed(() => {
  if (!currentPost.value?.updateDatetime)
    return ``
  return formatRelativeTime(currentPost.value.updateDatetime)
})

// 每 10 秒刷新一次相对时间（页面不可见时暂停）
const refreshKey = useRefreshTimer()

const displaySavedTime = computed(() => {
  // eslint-disable-next-line ts/no-unused-expressions
  refreshKey.value
  return savedTimeAgo.value
})

// 总行数（从 editor 获取）
const totalLines = computed(() => {
  const view = editor.value as EditorView | null
  if (!view)
    return 1
  return view.state.doc.lines
})

// 右侧统计项
const stats = computed(() => [
  { icon: Pilcrow, value: readingTime.value.words, tooltip: `词数` },
  { icon: Type, value: readingTime.value.chars, tooltip: `字符数` },
  { icon: Clock, value: `${readingTime.value.minutes} 分钟`, tooltip: `预计阅读时间` },
  { icon: BookOpen, value: totalLines.value, tooltip: `总行数` },
])

// 视图模式选项
const allViewModes = [
  { key: `edit` as const, icon: PenLine, label: `编辑` },
  { key: `split` as const, icon: Columns2, label: `双屏` },
  { key: `preview` as const, icon: Eye, label: `预览` },
]
const viewModes = computed(() =>
  isMobile.value ? allViewModes.filter(m => m.key !== `split`) : allViewModes,
)

// 是否显示设备切换（双屏/预览模式 + 非真实移动端）
const showDeviceToggle = computed(() => viewMode.value !== `edit` && !isMobile.value)
</script>

<template>
  <div class="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
    <!-- 视图模式切换 -->
    <div class="flex items-center rounded-md border border-border/60 p-0.5">
      <Tooltip v-for="mode in viewModes" :key="mode.key">
        <TooltipTrigger as-child>
          <button
            :aria-label="mode.label"
            class="flex cursor-pointer items-center rounded-sm px-1.5 py-0.5 transition-all duration-200"
            :class="viewMode === mode.key
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
            @click="uiStore.setViewMode(mode.key)"
          >
            <component :is="mode.icon" class="size-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
          <p>{{ mode.label }}</p>
        </TooltipContent>
      </Tooltip>
    </div>

    <!-- 设备切换（双屏/预览下可用，真实移动端隐藏） -->
    <Tooltip v-if="!isMobile">
      <TooltipTrigger as-child>
        <button
          :aria-label="previewDevice === 'desktop' ? '移动端预览' : '桌面端预览'"
          class="flex cursor-pointer items-center rounded-sm px-1.5 py-0.5 transition-all duration-200"
          :class="showDeviceToggle
            ? 'text-muted-foreground hover:bg-accent hover:text-foreground opacity-100'
            : 'pointer-events-none opacity-0'"
          @click="uiStore.togglePreviewDevice()"
        >
          <Monitor v-if="previewDevice === 'desktop'" class="size-3" />
          <Smartphone v-else class="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
        <p>{{ previewDevice === 'desktop' ? '移动端预览' : '桌面端预览' }}</p>
      </TooltipContent>
    </Tooltip>

    <!-- 同步滚动（双屏模式下可用，真实移动端隐藏） -->
    <Tooltip v-if="!isMobile && viewMode === 'split'">
      <TooltipTrigger as-child>
        <button
          :aria-label="enableScrollSync ? '关闭同步滚动' : '开启同步滚动'"
          class="flex cursor-pointer items-center rounded-sm px-1.5 py-0.5 transition-all duration-200"
          :class="enableScrollSync
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
          @click="uiStore.toggleScrollSync()"
        >
          <ArrowUpDown class="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
        <p>{{ enableScrollSync ? '关闭同步滚动' : '开启同步滚动' }}</p>
      </TooltipContent>
    </Tooltip>

    <span class="hidden text-border sm:block">·</span>

    <!-- 保存状态（小屏隐藏） -->
    <Tooltip v-if="displaySavedTime">
      <TooltipTrigger as-child>
        <span class="hidden cursor-default items-center gap-1 opacity-70 transition-opacity hover:opacity-100 sm:flex">
          <FileText class="size-3" />
          {{ displaySavedTime }}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
        <p>上次修改时间</p>
      </TooltipContent>
    </Tooltip>

    <span class="hidden text-border sm:block">·</span>

    <!-- 统计项（小屏隐藏） -->
    <Tooltip v-for="stat in stats" :key="stat.tooltip">
      <TooltipTrigger as-child>
        <span class="hidden cursor-default items-center gap-1 tabular-nums sm:flex">
          <component :is="stat.icon" class="size-3 opacity-60" />
          {{ stat.value }}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
        <p>{{ stat.tooltip }}</p>
      </TooltipContent>
    </Tooltip>

    <span class="hidden text-border sm:block">·</span>

    <!-- 深浅色切换 -->
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          class="flex cursor-pointer items-center rounded p-0.5 transition-colors hover:bg-accent hover:text-foreground"
          :class="isDark ? 'text-foreground' : ''"
          @click="uiStore.toggleDark()"
        >
          <Moon v-if="isDark" class="size-3" />
          <Sun v-else class="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
        <p>{{ isDark ? '浅色模式' : '深色模式' }}</p>
      </TooltipContent>
    </Tooltip>
  </div>
</template>
