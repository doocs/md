<script setup lang="ts">
import type { MarkdownHeading } from '@/lib/markdown/headings'
import { StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { ArrowUpDown, BookOpen, ChevronRight, ChevronsUpDown, Clock, Columns2, Ellipsis, Eye, FileText, Keyboard, ListTree, LogIn, Monitor, Moon, PenLine, Pilcrow, Search, Share2, Smartphone, Sun, Type, User } from '@lucide/vue'
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
import { useSyncFooterMeta } from '@/composables/useSyncStatusMeta'
import { getLocaleOption, getNextLocale } from '@/i18n/constants'
import { formatRelativeTime } from '@/lib/format/relative-time'
import {
  clampGoToLineValue,
  findOutlineFocusIndex,
  jumpToLine,
  moveOutlineFocusIndex,
} from '@/lib/markdown/headingNavigation'
import { computeHeadingBreadcrumbs, extractMarkdownHeadings } from '@/lib/markdown/headings'
import { isAccountUiEnabled } from '@/services/account/config'
import { isShareUiEnabled } from '@/services/share/client'
import { isSyncUiEnabled } from '@/services/sync/client'
import { useAuthStore } from '@/stores/auth'
import { useEditorStore } from '@/stores/editor'
import { useLocaleStore } from '@/stores/locale'
import { usePostStore } from '@/stores/post'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'

const renderStore = useRenderStore()
const editorStore = useEditorStore()
const postStore = usePostStore()
const uiStore = useUIStore()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { readingTime } = storeToRefs(renderStore)
const { editor } = storeToRefs(editorStore)
const { currentPost } = storeToRefs(postStore)
const { isDark } = storeToRefs(uiStore)
const { isMobile, viewMode, previewDevice, enableScrollSync } = storeToRefs(uiStore)
const { isLoggedIn } = storeToRefs(authStore)
const { locale } = storeToRefs(localeStore)
const showAccountUi = isAccountUiEnabled()
const showSyncUi = isSyncUiEnabled()
const showShareUi = isShareUiEnabled()
const { syncFooterIcon, syncFooterIconClass, syncTooltip } = useSyncFooterMeta()

const isMoreOpen = ref(false)
const { t, locale: i18nLocale } = useI18n()

const currentLocaleOption = computed(() => getLocaleOption(locale.value))

const nextLocaleOption = computed(() => getLocaleOption(getNextLocale(locale.value)))

const languageTooltip = computed(() => {
  void i18nLocale.value
  return t(`footer.switchToLanguage`, { language: t(nextLocaleOption.value.labelKey) })
})

const accountTooltip = computed(() => {
  if (!isLoggedIn.value)
    return t(`footer.loginAccount`)
  return t(`footer.accountWithLogin`, { login: authStore.user?.login ?? '' })
})

function openAccountDialog() {
  isMoreOpen.value = false
  uiStore.toggleShowAccountDialog(true)
}

function openSyncDialog() {
  isMoreOpen.value = false
  uiStore.toggleShowSyncDialog(true)
}

function openShareDialog() {
  isMoreOpen.value = false
  uiStore.openShareDialog()
}

function toggleTheme() {
  isMoreOpen.value = false
  uiStore.toggleDark()
}

function toggleLanguage() {
  isMoreOpen.value = false
  localeStore.cycleLocale()
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
    const node = map.get(p.id)
    if (!node)
      continue
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
  const target = clampGoToLineValue(goToLineInput.value, totalLines.value)
  jumpToLine(view as EditorView, target)
  isGoToLineActive.value = false
  updateCursorInfo(view as EditorView, { rebuildHeadings: true })
}

function cancelGoToLine() {
  isGoToLineActive.value = false
  editor.value?.focus()
}

// 监听编辑器变化，更新光标位置
const attachedViews = new WeakSet()

// 大纲 & 面包屑
const breadcrumbs = ref<MarkdownHeading[]>([])
const allHeadings = ref<MarkdownHeading[]>([])
const isOutlineOpen = ref(false)
const outlineScrollRef = ref<HTMLElement | null>(null)
const outlineFocusIndex = ref(-1)

function updateCursorInfo(view: EditorView, options: { rebuildHeadings?: boolean } = {}) {
  const state = view.state
  const main = state.selection.main
  const line = state.doc.lineAt(main.head)
  cursorLine.value = line.number
  cursorCol.value = main.head - line.from + 1
  totalLines.value = state.doc.lines
  selectionLength.value = Math.abs(main.to - main.from)

  if (options.rebuildHeadings) {
    allHeadings.value = extractMarkdownHeadings(state.doc)
  }
  breadcrumbs.value = computeHeadingBreadcrumbs(allHeadings.value, line.number)
}

watch(editor, (view) => {
  if (!view || attachedViews.has(view))
    return

  attachedViews.add(view)

  // 初始化一次
  updateCursorInfo(view as EditorView, { rebuildHeadings: true })

  const extension = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      updateCursorInfo(update.view, { rebuildHeadings: true })
    }
    else if (update.selectionSet) {
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
      updateCursorInfo(editor.value as EditorView, { rebuildHeadings: true })
    }
  })
})

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
    syncOutlineFocusIndex()
    nextTick(() => {
      outlineScrollRef.value?.focus()
      const el = outlineScrollRef.value?.querySelector(`[data-outline-index="${outlineFocusIndex.value}"]`)
        ?? outlineScrollRef.value?.querySelector(`[data-active="true"]`)
      el?.scrollIntoView({ block: `nearest` })
    })
  }
})

function jumpToHeading(line: number) {
  const view = editor.value
  if (!view)
    return
  jumpToLine(view as EditorView, line)
  updateCursorInfo(view as EditorView)
}

watch(() => uiStore.goToLineRequest, () => {
  if (isGoToLineActive.value)
    return
  openGoToLine()
})

function syncOutlineFocusIndex() {
  outlineFocusIndex.value = findOutlineFocusIndex(allHeadings.value, activeHeadingLine.value)
}

function scrollOutlineFocusIntoView() {
  nextTick(() => {
    const container = outlineScrollRef.value
    if (!container || outlineFocusIndex.value < 0)
      return
    const el = container.querySelector(`[data-outline-index="${outlineFocusIndex.value}"]`)
    el?.scrollIntoView({ block: `nearest` })
  })
}

function handleOutlineKeydown(event: KeyboardEvent) {
  if (allHeadings.value.length === 0)
    return

  const key = event.key
  if (key === `Escape`) {
    isOutlineOpen.value = false
    editor.value?.focus()
    event.preventDefault()
    return
  }

  if (key === `Enter`) {
    const item = allHeadings.value[outlineFocusIndex.value]
    if (item)
      jumpToHeadingAndClose(item.line)
    event.preventDefault()
    return
  }

  if (key === `ArrowUp` || key === `ArrowDown` || key === `Home` || key === `End`) {
    outlineFocusIndex.value = moveOutlineFocusIndex(
      allHeadings.value,
      outlineFocusIndex.value,
      key,
    )
    scrollOutlineFocusIntoView()
    event.preventDefault()
  }
}

// 上次保存时间
const savedTimeAgo = computed(() => {
  void locale.value
  if (!currentPost.value?.updateDatetime)
    return ``
  return formatRelativeTime(currentPost.value.updateDatetime)
})

function relativeTime(datetime: string | Date) {
  void locale.value
  return formatRelativeTime(datetime)
}

// 每 10 秒刷新一次相对时间（页面不可见时暂停）
const refreshKey = ref(0)
const REFRESH_INTERVAL_MS = 10_000
let refreshTimer: ReturnType<typeof setInterval> | null = null

function startRefreshTimer() {
  refreshTimer = setInterval(() => {
    if (!document.hidden) {
      refreshKey.value++
    }
  }, REFRESH_INTERVAL_MS)
}

startRefreshTimer()
onUnmounted(() => {
  if (refreshTimer)
    clearInterval(refreshTimer)
})

// 强制 computed 依赖 refreshKey 与 locale
const displaySavedTime = computed(() => {
  // eslint-disable-next-line ts/no-unused-expressions
  refreshKey.value
  void locale.value
  return savedTimeAgo.value
})

// 右侧统计项
const stats = computed(() => [
  { icon: Pilcrow, value: readingTime.value.words, tooltip: t(`footer.wordCount`) },
  { icon: Type, value: readingTime.value.chars, tooltip: t(`footer.charCount`) },
  { icon: Clock, value: t(`footer.readingTimeMinutes`, { minutes: readingTime.value.minutes }), tooltip: t(`footer.estimatedReadingTime`) },
  { icon: BookOpen, value: totalLines.value, tooltip: t(`footer.totalLines`) },
])

const allViewModes = computed(() => [
  { key: `edit` as const, icon: PenLine, label: t(`footer.viewEdit`) },
  { key: `split` as const, icon: Columns2, label: t(`footer.viewSplit`) },
  { key: `preview` as const, icon: Eye, label: t(`footer.viewPreview`) },
])
const viewModes = computed(() =>
  isMobile.value ? allViewModes.value.filter(m => m.key !== `split`) : allViewModes.value,
)

// 是否显示设备切换（双屏/预览模式 + 非真实移动端）
const showDeviceToggle = computed(() => viewMode.value !== `edit` && !isMobile.value)
</script>

<template>
  <footer
    class="flex select-none items-center overflow-hidden px-3 py-1 text-xs text-muted-foreground max-md:px-4 max-md:py-1.5 max-md:pb-[max(0.375rem,env(safe-area-inset-bottom,0px))]"
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
              <span class="hidden sm:inline">{{ t('footer.lineCol', { line: cursorLine, col: cursorCol }) }}</span>
              <span class="sm:hidden">{{ cursorLine }}:{{ cursorCol }}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
            <p>{{ t('footer.cursorPosition', { total: totalLines }) }}</p>
          </TooltipContent>
        </Tooltip>

        <span
          v-if="selectionLength > 0"
          class="hidden items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary tabular-nums sm:flex"
        >
          {{ t('footer.selectedChars', { count: selectionLength }) }}
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
                <span class="truncate">{{ currentPost?.title || t('common.unnamed') }}</span>
                <ChevronsUpDown class="size-3 shrink-0 opacity-40" />
              </button>
            </TooltipTrigger>
            <TooltipContent v-if="!isSwitcherOpen" side="top" :side-offset="6" class="text-xs text-muted-foreground">
              <p>{{ t('footer.switchDocument') }}</p>
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
              :placeholder="t('footer.searchDocuments')"
              @keydown.escape="isSwitcherOpen = false"
            >
          </div>
          <div class="max-h-52 overflow-y-auto py-1">
            <div v-if="filteredPosts.length === 0" class="px-3 py-4 text-center text-xs text-muted-foreground">
              {{ t('footer.noMatchingDocuments') }}
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
              <span class="shrink-0 text-[10px] opacity-50">{{ relativeTime(post.updateDatetime) }}</span>
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
                <span v-else class="hidden opacity-50 sm:inline">{{ t('footer.outline') }}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent v-if="!isOutlineOpen" side="top" :side-offset="6" class="text-xs text-muted-foreground">
              <p>{{ t('footer.outlineTooltip') }}</p>
            </TooltipContent>
          </Tooltip>
        </PopoverTriggerPrimitive>
        <PopoverContent
          side="top"
          :side-offset="8"
          align="center"
          class="w-72 p-0"
        >
          <div class="flex items-center justify-between border-b px-3 py-2">
            <span class="text-xs font-medium tracking-wide text-muted-foreground">{{ t('footer.outline') }}</span>
            <span class="text-[10px] tabular-nums text-muted-foreground/50">{{ t('footer.headingCount', { count: allHeadings.length }) }}</span>
          </div>
          <div
            ref="outlineScrollRef"
            tabindex="-1"
            class="max-h-72 overflow-y-auto overflow-x-hidden py-1 outline-none"
            @keydown.stop="handleOutlineKeydown"
          >
            <template v-if="allHeadings.length > 0">
              <button
                v-for="(item, index) in allHeadings"
                :key="item.line"
                :data-outline-index="index"
                :data-active="activeHeadingLine === item.line"
                class="group flex w-full items-start px-2 py-1 text-left text-[13px] transition-colors hover:bg-accent"
                :class="[
                  activeHeadingLine === item.line ? 'bg-accent/60' : '',
                  outlineFocusIndex === index ? 'bg-accent/40 ring-1 ring-primary/30' : '',
                ]"
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
              {{ t('footer.noHeadings') }}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <!-- 桌面端占位 flex-1 -->
      <div class="hidden min-w-0 flex-1 sm:block" />

      <!-- 右侧：统计信息 -->
      <div class="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3.5">
        <!-- 视图模式切换 -->
        <div class="flex items-center gap-0.5 rounded-md border border-border/60 p-0.5">
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
              :aria-label="previewDevice === 'desktop' ? t('footer.mobilePreview') : t('footer.desktopPreview')"
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
            <p>{{ previewDevice === 'desktop' ? t('footer.mobilePreview') : t('footer.desktopPreview') }}</p>
          </TooltipContent>
        </Tooltip>

        <!-- 同步滚动（双屏模式下可用，真实移动端隐藏） -->
        <Tooltip v-if="!isMobile && viewMode === 'split'">
          <TooltipTrigger as-child>
            <button
              :aria-label="enableScrollSync ? t('footer.disableScrollSync') : t('footer.enableScrollSync')"
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
            <p>{{ enableScrollSync ? t('footer.disableScrollSync') : t('footer.enableScrollSync') }}</p>
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
            <p>{{ t('footer.lastModified') }}</p>
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

        <!-- 账户 & 同步 & 分享 & 主题（桌面端） -->
        <div class="hidden items-center gap-0.5 sm:flex">
          <template v-if="showAccountUi">
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  :aria-label="t('common.account')"
                  class="flex cursor-pointer items-center rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
                  :class="isLoggedIn ? 'text-primary' : ''"
                  @click="openAccountDialog"
                >
                  <img
                    v-if="isLoggedIn && authStore.user?.avatar"
                    :src="authStore.user.avatar"
                    :alt="authStore.user.login"
                    class="size-3 rounded-full"
                  >
                  <User v-else-if="isLoggedIn" class="size-3" />
                  <LogIn v-else class="size-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
                <p>{{ accountTooltip }}</p>
              </TooltipContent>
            </Tooltip>
          </template>

          <template v-if="showSyncUi">
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  :aria-label="t('menu.cloudSync')"
                  class="flex cursor-pointer items-center rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
                  @click="openSyncDialog"
                >
                  <component
                    :is="syncFooterIcon"
                    class="size-3"
                    :class="syncFooterIconClass"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
                <p>{{ isLoggedIn ? syncTooltip : t('menu.cloudSync') }}</p>
              </TooltipContent>
            </Tooltip>
          </template>

          <template v-if="showShareUi">
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  :aria-label="t('menu.sharePreview')"
                  class="flex cursor-pointer items-center rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
                  @click="openShareDialog"
                >
                  <Share2 class="size-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
                <p>{{ t('menu.sharePreview') }}</p>
              </TooltipContent>
            </Tooltip>
          </template>

          <Tooltip>
            <TooltipTrigger as-child>
              <button
                :aria-label="t('footer.toggleLanguage')"
                class="flex cursor-pointer items-center rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
                @click="toggleLanguage"
              >
                <span class="min-w-3 text-center text-[10px] font-semibold leading-none tracking-wide">
                  {{ currentLocaleOption.shortLabel }}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
              <p>{{ languageTooltip }}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <button
                :aria-label="t('footer.toggleDarkMode')"
                class="flex cursor-pointer items-center rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
                :class="isDark ? 'text-foreground' : ''"
                @click="toggleTheme"
              >
                <Moon v-if="isDark" class="size-3" />
                <Sun v-else class="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="6" class="text-xs text-muted-foreground">
              <p>{{ isDark ? t('common.lightMode') : t('common.darkMode') }}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <!-- 移动端：更多操作 -->
        <Popover v-model:open="isMoreOpen">
          <PopoverTriggerPrimitive as-child>
            <button
              :aria-label="t('common.moreActions')"
              class="flex cursor-pointer items-center rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground sm:hidden"
            >
              <Ellipsis class="size-3" />
            </button>
          </PopoverTriggerPrimitive>
          <PopoverContent side="top" :side-offset="8" align="end" class="w-48 p-1">
            <button
              v-if="showAccountUi"
              class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent"
              @click="openAccountDialog"
            >
              <img
                v-if="isLoggedIn && authStore.user?.avatar"
                :src="authStore.user.avatar"
                :alt="authStore.user.login"
                class="size-3 rounded-full"
              >
              <User v-else-if="isLoggedIn" class="size-3 shrink-0" />
              <LogIn v-else class="size-3 shrink-0" />
              <span class="min-w-0 flex-1 truncate">{{ accountTooltip }}</span>
            </button>
            <button
              v-if="showSyncUi"
              class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent"
              @click="openSyncDialog"
            >
              <component
                :is="syncFooterIcon"
                class="size-3 shrink-0"
                :class="syncFooterIconClass"
              />
              <span>{{ isLoggedIn ? syncTooltip : t('menu.cloudSync') }}</span>
            </button>
            <button
              v-if="showShareUi"
              class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent"
              @click="openShareDialog"
            >
              <Share2 class="size-3 shrink-0" />
              <span>{{ t('menu.sharePreview') }}</span>
            </button>
            <button
              class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent"
              @click="toggleLanguage"
            >
              <span class="inline-flex size-3 shrink-0 items-center justify-center text-[10px] font-semibold leading-none">
                {{ currentLocaleOption.shortLabel }}
              </span>
              <span>{{ languageTooltip }}</span>
            </button>
            <button
              class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent"
              @click="toggleTheme"
            >
              <Moon v-if="isDark" class="size-3 shrink-0" />
              <Sun v-else class="size-3 shrink-0" />
              <span>{{ isDark ? t('common.lightMode') : t('common.darkMode') }}</span>
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  </footer>
</template>
