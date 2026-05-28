<script setup lang="ts">
import { StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { ChevronRight, ChevronsUpDown, FileText, Keyboard, ListTree, Search } from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger as PopoverTriggerPrimitive,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { formatRelativeTime } from '@/utils/time'

const editorStore = useEditorStore()
const postStore = usePostStore()
const { editor } = storeToRefs(editorStore)
const { currentPost } = storeToRefs(postStore)

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
  const target = Math.max(1, Math.min(Number.parseInt(goToLineInput.value) || 1, totalLines.value))
  const line = view.state.doc.line(target)
  view.dispatch({
    selection: { anchor: line.from },
    scrollIntoView: true,
  })
  view.focus()
  isGoToLineActive.value = false
  updateCursorInfo(view as EditorView)
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
  updateCursorInfo(view as EditorView)

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
      updateCursorInfo(editor.value as EditorView)
    }
  })
})

function updateCursorInfo(view: EditorView) {
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

function updateHeadingsAndBreadcrumb(doc: { lines: number, line: (n: number) => { text: string } }, currentLine: number) {
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
  updateCursorInfo(view as EditorView)
}
</script>

<template>
  <div class="flex flex-1 min-w-0 items-center gap-2 sm:gap-3">
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
  </div>
</template>
