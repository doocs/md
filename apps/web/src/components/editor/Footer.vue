<script setup lang="ts">
import { StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { BookOpen, ChevronRight, ChevronsUpDown, Clock, Columns2, Eye, FileText, Keyboard, ListTree, Monitor, Moon, PenLine, Pilcrow, Search, Smartphone, Sun, Type } from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger as PopoverTriggerPrimitive,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'

const renderStore = useRenderStore()
const editorStore = useEditorStore()
const postStore = usePostStore()
const uiStore = useUIStore()
const { readingTime } = storeToRefs(renderStore)
const { editor } = storeToRefs(editorStore)
const { currentPost } = storeToRefs(postStore)
const { isDark } = storeToRefs(uiStore)
const { isMobile, viewMode, previewDevice } = storeToRefs(uiStore)

// 相对时间格式化（复用）
function formatRelativeTime(date: Date | string) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
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
  const days = Math.floor(hours / 24)
  if (days < 30)
    return `${days} 天前`
  return d.toLocaleDateString(`zh-CN`)
}

// 快速文档切换器
const isSwitcherOpen = ref(false)
const switcherQuery = ref(``)
const switcherInputRef = ref<HTMLInputElement | null>(null)

interface TreeNode {
  id: string
  title: string
  updateDatetime: Date
  depth: number
  children: TreeNode[]
}

function buildTree(posts: typeof postStore.posts): TreeNode[] {
  const map = new Map<string, TreeNode>()
  for (const p of posts) {
    map.set(p.id, { id: p.id, title: p.title, updateDatetime: p.updateDatetime, depth: 0, children: [] })
  }
  const roots: TreeNode[] = []
  for (const p of posts) {
    const node = map.get(p.id)!
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children.push(node)
    }
    else {
      roots.push(node)
    }
  }
  // 排序子节点
  function sortChildren(nodes: TreeNode[]) {
    nodes.sort((a, b) => new Date(b.updateDatetime).getTime() - new Date(a.updateDatetime).getTime())
    nodes.forEach(n => sortChildren(n.children))
  }
  sortChildren(roots)
  return roots
}

function flattenTree(nodes: TreeNode[], depth = 0): Array<{ id: string, title: string, updateDatetime: Date, depth: number }> {
  const result: Array<{ id: string, title: string, updateDatetime: Date, depth: number }> = []
  for (const node of nodes) {
    result.push({ id: node.id, title: node.title, updateDatetime: node.updateDatetime, depth })
    if (node.children.length)
      result.push(...flattenTree(node.children, depth + 1))
  }
  return result
}

const flatPosts = computed(() => flattenTree(buildTree(postStore.posts)))

const filteredPosts = computed(() => {
  const q = switcherQuery.value.toLowerCase().trim()
  if (!q)
    return flatPosts.value
  return flatPosts.value.filter(p => p.title.toLowerCase().includes(q))
})

function openSwitcher() {
  isSwitcherOpen.value = true
  switcherQuery.value = ``
  nextTick(() => switcherInputRef.value?.focus())
}

function switchToPost(id: string) {
  postStore.currentPostId = id
  isSwitcherOpen.value = false
  nextTick(() => editor.value?.focus())
}

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
const attachedViews = new WeakSet()

watch(editor, (view) => {
  if (!view || attachedViews.has(view))
    return

  attachedViews.add(view)

  // 初始化一次
  updateCursorInfo(view)

  const extension = EditorView.updateListener.of((update) => {
    // 只在光标或文档变化时更新
    if (update.selectionSet || update.docChanged) {
      updateCursorInfo(update.view)
    }
  })

  view.dispatch({
    effects: StateEffect.appendConfig.of(extension),
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
  updateHeadingsAndBreadcrumb(state.doc, line.number)
}

// 大纲 & 面包屑
interface BreadcrumbItem {
  title: string
  level: number
  line: number
}

const breadcrumbs = ref<BreadcrumbItem[]>([])
const allHeadings = ref<BreadcrumbItem[]>([])
const isOutlineOpen = ref(false)
const outlineScrollRef = ref<HTMLElement | null>(null)

function updateHeadingsAndBreadcrumb(doc: any, currentLine: number) {
  const items: BreadcrumbItem[] = []
  const stack: BreadcrumbItem[] = []
  let codeFenceChar = ``
  let codeFenceCount = 0
  let inFrontMatter = false

  for (let i = 1; i <= doc.lines; i++) {
    const text = doc.line(i).text
    const trimmed = text.trimStart()

    if (i === 1 && trimmed === `---`) {
      inFrontMatter = true
      continue
    }
    if (inFrontMatter) {
      if (trimmed === `---` || trimmed === `...`)
        inFrontMatter = false
      continue
    }

    if (codeFenceChar) {
      const closeMatch = trimmed.match(/^(`{3,}|~{3,})\s*$/)
      if (closeMatch && closeMatch[1][0] === codeFenceChar && closeMatch[1].length >= codeFenceCount) {
        codeFenceChar = ``
        codeFenceCount = 0
      }
      continue
    }
    const openMatch = trimmed.match(/^(`{3,}|~{3,})/)
    if (openMatch) {
      codeFenceChar = openMatch[1][0]
      codeFenceCount = openMatch[1].length
      continue
    }

    const match = text.match(/^(\s{0,3})(#{1,6})\s+(.+)/)
    if (match) {
      const level = match[2].length
      const title = match[3].replace(/\s*#+\s*$/, ``).trim()
      const item = { title, level, line: i }
      items.push(item)

      if (i <= currentLine) {
        while (stack.length > 0 && stack[stack.length - 1].level >= level)
          stack.pop()
        stack.push(item)
      }
    }
  }

  breadcrumbs.value = [...stack]
  allHeadings.value = items
}

const activeHeadingLine = computed(() => {
  if (breadcrumbs.value.length === 0)
    return -1
  return breadcrumbs.value[breadcrumbs.value.length - 1].line
})

function getOutlineLevelClass(level: number) {
  if (level === 1)
    return `font-semibold text-foreground`
  if (level === 2)
    return `font-medium text-foreground/90`
  return `text-muted-foreground`
}

function jumpToHeadingAndClose(line: number) {
  jumpToHeading(line)
  isOutlineOpen.value = false
}

watch(isOutlineOpen, (open) => {
  if (open) {
    nextTick(() => {
      const el = outlineScrollRef.value?.querySelector(`[data-active="true"]`)
      el?.scrollIntoView({ block: `nearest` })
    })
  }
})

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

// 上次保存时间（复用 formatRelativeTime）
const savedTimeAgo = computed(() => {
  if (!currentPost.value?.updateDatetime)
    return ``
  return formatRelativeTime(currentPost.value.updateDatetime)
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
  <footer
    class="flex select-none items-center overflow-hidden px-3 py-1 text-xs text-muted-foreground"
  >
    <TooltipProvider :delay-duration="300">
      <!-- 左侧：光标位置 & 选区 -->
      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
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
              <span class="hidden sm:inline">行 {{ cursorLine }}，列 {{ cursorCol }}</span>
              <span class="sm:hidden">{{ cursorLine }}:{{ cursorCol }}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
            <p>光标位置（共 {{ totalLines }} 行） · 点击跳转</p>
          </TooltipContent>
        </Tooltip>

        <span
          v-if="selectionLength > 0"
          class="hidden items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary tabular-nums sm:flex"
        >
          已选 {{ selectionLength }} 字符
        </span>
      </div>

      <!-- 文档切换器 -->
      <Popover v-model:open="isSwitcherOpen">
        <PopoverTriggerPrimitive as-child>
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                class="ml-1.5 flex max-w-24 shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-foreground sm:ml-2 sm:max-w-36"
                @click="openSwitcher"
              >
                <FileText class="size-3 shrink-0 opacity-60" />
                <span class="truncate">{{ currentPost?.title || '未命名' }}</span>
                <ChevronsUpDown class="size-3 shrink-0 opacity-40" />
              </button>
            </TooltipTrigger>
            <TooltipContent v-if="!isSwitcherOpen" side="top" :side-offset="6" class="text-xs text-muted-foreground">
              <p>切换文档</p>
            </TooltipContent>
          </Tooltip>
        </PopoverTriggerPrimitive>
        <PopoverContent side="top" :side-offset="8" align="start" class="w-64 p-0">
          <div class="flex items-center gap-2 border-b px-3 py-2">
            <Search class="size-3.5 shrink-0 opacity-50" />
            <input
              ref="switcherInputRef"
              v-model="switcherQuery"
              type="text"
              class="h-5 w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="搜索文档..."
              @keydown.escape="isSwitcherOpen = false"
            >
          </div>
          <div class="max-h-52 overflow-y-auto py-1">
            <div v-if="filteredPosts.length === 0" class="px-3 py-4 text-center text-xs text-muted-foreground">
              无匹配文档
            </div>
            <button
              v-for="post in filteredPosts"
              :key="post.id"
              class="flex w-full cursor-pointer items-center gap-2 py-1.5 pr-3 text-left text-xs transition-colors hover:bg-accent"
              :class="post.id === postStore.currentPostId ? 'bg-accent/50 text-foreground' : 'text-muted-foreground'"
              :style="{ paddingLeft: `${12 + post.depth * 16}px` }"
              @click="switchToPost(post.id)"
            >
              <FileText class="size-3 shrink-0 opacity-50" />
              <span class="min-w-0 flex-1 truncate">{{ post.title }}</span>
              <span class="shrink-0 text-[10px] opacity-50">{{ formatRelativeTime(post.updateDatetime) }}</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- 大纲视图 -->
      <Popover v-model:open="isOutlineOpen">
        <PopoverTriggerPrimitive as-child>
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                class="ml-1 flex min-w-0 cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-accent hover:text-foreground sm:mx-3 sm:px-1.5"
                @click="isOutlineOpen = !isOutlineOpen"
              >
                <ListTree class="size-3.5 shrink-0 opacity-60 sm:size-3" />
                <div v-if="breadcrumbs.length" class="hidden min-w-0 items-center gap-0.5 truncate sm:flex">
                  <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.line">
                    <ChevronRight v-if="idx > 0" class="size-3 shrink-0 opacity-30" />
                    <span class="max-w-24 truncate">{{ crumb.title }}</span>
                  </template>
                </div>
                <span v-else class="hidden opacity-50 sm:inline">大纲</span>
              </button>
            </TooltipTrigger>
            <TooltipContent v-if="!isOutlineOpen" side="top" :side-offset="6" class="text-xs text-muted-foreground">
              <p>目录大纲</p>
            </TooltipContent>
          </Tooltip>
        </PopoverTriggerPrimitive>
        <PopoverContent side="top" :side-offset="8" align="center" class="w-72 p-0">
          <div class="flex items-center justify-between border-b px-3 py-2">
            <span class="text-xs font-medium tracking-wide text-muted-foreground">大纲</span>
            <span class="text-[10px] tabular-nums text-muted-foreground/50">{{ allHeadings.length }} 个标题</span>
          </div>
          <div ref="outlineScrollRef" class="max-h-72 overflow-y-auto overflow-x-hidden py-1">
            <template v-if="allHeadings.length > 0">
              <button
                v-for="item in allHeadings"
                :key="item.line"
                :data-active="activeHeadingLine === item.line"
                class="group flex w-full items-start px-2 py-1 text-left text-[13px] transition-colors hover:bg-accent"
                :class="activeHeadingLine === item.line ? 'bg-accent/60' : ''"
                :style="{ paddingLeft: `${8 + (item.level - 1) * 16}px` }"
                @click="jumpToHeadingAndClose(item.line)"
              >
                <span
                  class="mr-2 mt-[7px] inline-block size-1 shrink-0 rounded-full bg-current transition-opacity"
                  :class="activeHeadingLine === item.line ? 'opacity-80' : item.level <= 2 ? 'opacity-40' : 'opacity-20'"
                />
                <span
                  class="line-clamp-1 leading-relaxed"
                  :class="getOutlineLevelClass(item.level)"
                >
                  {{ item.title }}
                </span>
              </button>
            </template>
            <div v-else class="px-3 py-8 text-center text-xs text-muted-foreground">
              暂无标题
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <!-- 桌面端占位 flex-1 -->
      <div class="hidden min-w-0 flex-1 sm:block" />

      <!-- 右侧：统计信息 -->
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
    </TooltipProvider>
  </footer>
</template>
