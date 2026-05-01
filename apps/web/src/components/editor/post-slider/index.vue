<script setup lang="ts">
import { CheckSquare, ChevronsDownUp, ChevronsUpDown, Ellipsis, FileText, Plus, Regex, Replace, ReplaceAll, Search, X } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useUIStore } from '@/stores/ui'
import { addPrefix, downloadMD, exportPostsAsZip } from '@/utils'
import { store } from '@/utils/storage'

const uiStore = useUIStore()
const { isMobile, isOpenPostSlider } = storeToRefs(uiStore)

const postStore = usePostStore()
const { posts } = storeToRefs(postStore)

const editorStore = useEditorStore()
const { editor } = storeToRefs(editorStore)

// 控制是否启用动画
const enableAnimation = ref(false)

// 监听 PostSlider 开关状态变化
watch(isOpenPostSlider, () => {
  if (isMobile.value) {
    // 在移动端，用户操作时启用动画
    enableAnimation.value = true
  }
})

// 监听设备类型变化，重置动画状态
watch(isMobile, () => {
  enableAnimation.value = false
})

/* ============ 新增内容 ============ */
const parentId = ref<string | null>(null)
const isOpenAddDialog = ref(false)
const addPostInputVal = ref(``)
watch(isOpenAddDialog, (o) => {
  if (o) {
    addPostInputVal.value = ``
    parentId.value = null
  }
})

function openAddPostDialog(id: string) {
  isOpenAddDialog.value = true
  nextTick(() => {
    parentId.value = id
  })
}

function addPost() {
  if (!addPostInputVal.value.trim())
    return toast.error(`内容标题不可为空`)
  postStore.addPost(addPostInputVal.value.trim(), parentId.value)
  isOpenAddDialog.value = false
  toast.success(`内容新增成功`)
}

/* ============ 重命名 / 删除 / 历史 对象 ============ */
const editId = ref<string | null>(null)
const isOpenEditDialog = ref(false)
const renamePostInputVal = ref(``)

function startRenamePost(id: string) {
  editId.value = id
  renamePostInputVal.value = postStore.getPostById(id)!.title
  isOpenEditDialog.value = true
}
function renamePost() {
  if (!renamePostInputVal.value.trim()) {
    return toast.error(`内容标题不可为空`)
  }

  if (renamePostInputVal.value === postStore.getPostById(editId.value!)?.title) {
    isOpenEditDialog.value = false
    return
  }

  postStore.renamePost(editId.value!, renamePostInputVal.value.trim())
  toast.success(`内容重命名成功`)
  isOpenEditDialog.value = false
}

const delId = ref<string | null>(null)
const isOpenDelPostConfirmDialog = ref(false)
const delRecursive = ref(false)

const delConfirmText = computed(() => {
  const title = postStore.getPostById(delId.value || ``)?.title ?? ``
  const short = title.length > 20 ? `${title.slice(0, 20)}…` : title
  return `此操作将删除「${short}」，是否继续？`
})

const hasSubPosts = computed(() => {
  if (!delId.value)
    return false
  return posts.value.some(p => p.parentId === delId.value)
})

function startDelPost(id: string) {
  delId.value = id
  delRecursive.value = false
  isOpenDelPostConfirmDialog.value = true
}
function delPost() {
  postStore.delPost(delId.value!, delRecursive.value)
  isOpenDelPostConfirmDialog.value = false
  toast.success(`内容删除成功`)
}

/* ============ 历史记录 ============ */
const isOpenHistoryDialog = ref(false)
const currentPostId = ref<string | null>(null)
const currentHistoryIndex = ref(0)
const historyViewMode = ref<'content' | 'diff'>(`content`)
const compareTargetIndex = ref(`1`)

function openHistoryDialog(id: string) {
  currentPostId.value = id
  currentHistoryIndex.value = 0
  historyViewMode.value = `content`
  compareTargetIndex.value = `1`
  isOpenHistoryDialog.value = true
}

const currentHistoryList = computed(() => {
  return postStore.getPostById(currentPostId.value!)?.history ?? []
})

// 当选中版本与对比目标冲突时，自动调整对比目标
watch(currentHistoryIndex, (idx) => {
  if (Number(compareTargetIndex.value) === idx) {
    const len = currentHistoryList.value.length
    compareTargetIndex.value = String(idx + 1 < len ? idx + 1 : Math.max(0, idx - 1))
  }
})

function recoverHistory() {
  const post = postStore.getPostById(currentPostId.value!)
  if (!post) {
    isOpenHistoryDialog.value = false
    return
  }

  const content = post.history[currentHistoryIndex.value].content
  post.content = content
  const ed = toRaw(editor.value!)
  ed.dispatch({
    changes: { from: 0, to: ed.state.doc.length, insert: content },
  })
  toast.success(`记录恢复成功`)
  isOpenHistoryDialog.value = false
}

/* ============ 全局搜索与替换 ============ */
const isSearching = ref(false)
const searchQuery = ref(``)
const searchInputRef = ref<HTMLInputElement | null>(null)
const replaceQuery = ref(``)
const showReplace = ref(true)
const isRegex = ref(false)
const isCaseSensitive = ref(false)

function toggleSearch() {
  isSearching.value = !isSearching.value
  if (isSearching.value) {
    nextTick(() => searchInputRef.value?.focus())
  }
  else {
    searchQuery.value = ``
    replaceQuery.value = ``
    showReplace.value = false
  }
}

function closeSearch() {
  isSearching.value = false
  searchQuery.value = ``
  replaceQuery.value = ``
  showReplace.value = false
}

interface HighlightPart {
  text: string
  highlight: boolean
}

function getSearchRegex(query: string): RegExp | null {
  if (!query.trim())
    return null
  try {
    if (isRegex.value) {
      return new RegExp(query, `gm${isCaseSensitive.value ? `` : `i`}`)
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)
    return new RegExp(escaped, `gm${isCaseSensitive.value ? `` : `i`}`)
  }
  catch {
    return null
  }
}

function highlightParts(text: string, query: string): HighlightPart[] {
  if (!query)
    return [{ text, highlight: false }]
  const regex = getSearchRegex(query)
  if (!regex)
    return [{ text, highlight: false }]
  const parts: HighlightPart[] = []
  let lastIndex = 0
  let match = regex.exec(text)
  while (match !== null) {
    if (match.index > lastIndex)
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false })
    parts.push({ text: match[0], highlight: true })
    lastIndex = match.index + match[0].length
    if (match[0].length === 0)
      regex.lastIndex++
    match = regex.exec(text)
  }
  if (lastIndex < text.length)
    parts.push({ text: text.slice(lastIndex), highlight: false })
  return parts
}

function getContentSnippet(content: string, query: string): string {
  if (!query.trim())
    return ``
  const regex = getSearchRegex(query)
  if (!regex)
    return ``
  const match = regex.exec(content)
  if (!match)
    return ``
  const idx = match.index
  const matchLen = match[0].length
  const start = Math.max(0, idx - 20)
  const end = Math.min(content.length, idx + matchLen + 40)
  let snippet = content.slice(start, end).replace(/\n/g, ` `)
  if (start > 0)
    snippet = `…${snippet}`
  if (end < content.length)
    snippet = `${snippet}…`
  return snippet
}

const searchResults = computed(() => {
  const q = searchQuery.value.trim()
  if (!q)
    return []
  const regex = getSearchRegex(q)
  if (!regex)
    return []
  return posts.value
    .filter(post => regex.test(post.title) || regex.test(post.content))
    .map((post) => {
      const snippet = getContentSnippet(post.content, searchQuery.value.trim())
      return {
        ...post,
        titleParts: highlightParts(post.title, searchQuery.value.trim()),
        snippetParts: snippet ? highlightParts(snippet, searchQuery.value.trim()) : [],
      }
    })
})

const totalMatches = computed(() => {
  const q = searchQuery.value.trim()
  if (!q)
    return 0
  const regex = getSearchRegex(q)
  if (!regex)
    return 0
  let count = 0
  posts.value.forEach((post) => {
    const titleMatches = (post.title.match(regex) || []).length
    regex.lastIndex = 0
    const contentMatches = (post.content.match(regex) || []).length
    regex.lastIndex = 0
    count += titleMatches + contentMatches
  })
  return count
})

function replaceInText(text: string, search: string, replace: string): string {
  const regex = getSearchRegex(search)
  if (!regex)
    return text
  return text.replace(regex, replace)
}

function replaceFirst() {
  const q = searchQuery.value.trim()
  if (!q)
    return
  const regex = getSearchRegex(q)
  if (!regex)
    return
  for (const post of posts.value) {
    regex.lastIndex = 0
    if (regex.test(post.title)) {
      regex.lastIndex = 0
      postStore.renamePost(post.id, replaceInText(post.title, q, replaceQuery.value))
      toast.success(`已替换 1 处`)
      return
    }
    regex.lastIndex = 0
    if (regex.test(post.content)) {
      regex.lastIndex = 0
      postStore.updatePostContent(post.id, replaceInText(post.content, q, replaceQuery.value))
      if (postStore.currentPostId === post.id && editor.value) {
        const ed = toRaw(editor.value)
        ed.dispatch({
          changes: { from: 0, to: ed.state.doc.length, insert: post.content },
        })
      }
      toast.success(`已替换 1 处`)
      return
    }
  }
}

function replaceAll() {
  const q = searchQuery.value.trim()
  if (!q)
    return
  const regex = getSearchRegex(q)
  if (!regex)
    return
  let count = 0
  posts.value.forEach((post) => {
    regex.lastIndex = 0
    const titleMatches = (post.title.match(regex) || []).length
    regex.lastIndex = 0
    const contentMatches = (post.content.match(regex) || []).length
    if (titleMatches > 0) {
      regex.lastIndex = 0
      postStore.renamePost(post.id, replaceInText(post.title, q, replaceQuery.value))
      count += titleMatches
    }
    if (contentMatches > 0) {
      regex.lastIndex = 0
      const newContent = replaceInText(post.content, q, replaceQuery.value)
      postStore.updatePostContent(post.id, newContent)
      if (postStore.currentPostId === post.id && editor.value) {
        const ed = toRaw(editor.value)
        ed.dispatch({
          changes: { from: 0, to: ed.state.doc.length, insert: newContent },
        })
      }
      count += contentMatches
    }
  })
  if (count > 0)
    toast.success(`已替换 ${count} 处`)
}

/* ============ 排序 ============ */
const sortMode = store.reactive(addPrefix(`sort_mode`), `create-old-new`)
const sortedPosts = computed(() => {
  return [...posts.value].sort((a, b) => {
    switch (sortMode.value) {
      case `A-Z`:
        return a.title.localeCompare(b.title)
      case `Z-A`:
        return b.title.localeCompare(a.title)
      case `update-new-old`:
        return +new Date(b.updateDatetime) - +new Date(a.updateDatetime)
      case `update-old-new`:
        return +new Date(a.updateDatetime) - +new Date(b.updateDatetime)
      case `create-new-old`:
        return +new Date(b.createDatetime) - +new Date(a.createDatetime)
      default:
        /* create-old-new */
        return +new Date(a.createDatetime) - +new Date(b.createDatetime)
    }
  })
})

/* ============ 拖拽功能 ============ */
const dragover = ref(false)
const dragSourceId = ref<string | null>(null)
const dropTargetId = ref<string | null>(null)

/* ============ 选择模式 ============ */
const isSelectMode = ref(false)
const selectedPostIds = ref<string[]>([])

const allSelected = computed(
  () => posts.value.length > 0 && selectedPostIds.value.length === posts.value.length,
)

const selectProps = computed(() => ({
  isSelectMode: isSelectMode.value,
  selectedIds: selectedPostIds.value,
  onToggleSelect: toggleSelectPost,
}))

function toggleSelectMode() {
  isSelectMode.value = !isSelectMode.value
  selectedPostIds.value = []
}

function toggleSelectPost(id: string) {
  const idx = selectedPostIds.value.indexOf(id)
  if (idx === -1)
    selectedPostIds.value.push(id)
  else
    selectedPostIds.value.splice(idx, 1)
}

function selectAll() {
  selectedPostIds.value = posts.value.map(p => p.id)
}

function clearSelection() {
  selectedPostIds.value = []
}

async function exportSelected() {
  if (!selectedPostIds.value.length)
    return
  const toExport = selectedPostIds.value.map((id) => {
    const p = postStore.getPostById(id)!
    return { title: p.title, content: p.content }
  })
  if (toExport.length === 1) {
    downloadMD(toExport[0].content, toExport[0].title)
  }
  else {
    await exportPostsAsZip(toExport)
  }
  isSelectMode.value = false
  selectedPostIds.value = []
}

const isOpenBatchDelConfirmDialog = ref(false)

const batchDelConfirmText = computed(() => {
  const n = selectedPostIds.value.length
  return n === 1
    ? `此操作将删除「${postStore.getPostById(selectedPostIds.value[0])?.title ?? ``}」，是否继续？`
    : `此操作将删除已选的 ${n} 篇内容，是否继续？`
})

function batchDeleteSelected() {
  const ids = [...selectedPostIds.value]
  ids.forEach(id => postStore.delPost(id))
  toast.success(`已删除 ${ids.length} 篇内容`)
  isOpenBatchDelConfirmDialog.value = false
  isSelectMode.value = false
  selectedPostIds.value = []
}

/* ============ 批量复制 ============ */
function duplicateSelected() {
  if (!selectedPostIds.value.length)
    return
  selectedPostIds.value.forEach((id) => {
    const p = postStore.getPostById(id)!
    postStore.addPost(`${p.title} 副本`, p.parentId ?? null)
    // 覆盖刚创建的那篇内容
    const newPost = posts.value[posts.value.length - 1]
    postStore.updatePostContent(newPost.id, p.content)
  })
  toast.success(`已复制 ${selectedPostIds.value.length} 篇内容`)
  isSelectMode.value = false
  selectedPostIds.value = []
}

/* ============ 合并为一篇 ============ */
const isOpenMergeDialog = ref(false)
const mergeTitle = ref(``)

function openMergeDialog() {
  if (selectedPostIds.value.length < 2)
    return
  const titles = selectedPostIds.value.map(id => postStore.getPostById(id)!.title)
  mergeTitle.value = titles.join(` + `)
  isOpenMergeDialog.value = true
}

function mergeSelected() {
  if (!mergeTitle.value.trim())
    return toast.error(`合并标题不可为空`)
  const parts = selectedPostIds.value.map((id) => {
    const p = postStore.getPostById(id)!
    return `## ${p.title}\n\n${p.content}`
  })
  const mergedContent = parts.join(`\n\n---\n\n`)
  postStore.addPost(mergeTitle.value.trim(), null)
  const newPost = posts.value[posts.value.length - 1]
  postStore.updatePostContent(newPost.id, mergedContent)
  toast.success(`已合并为「${mergeTitle.value.trim()}」`)
  isOpenMergeDialog.value = false
  isSelectMode.value = false
  selectedPostIds.value = []
}

function handleDrop(targetId: string | null) {
  const sourceId = dragSourceId.value
  if (!sourceId) {
    return
  }

  // 递归检索 ID，是不是父文件拖拽到了子文件上面
  const isParent = (id: string | null | undefined) => {
    if (!id) {
      return false
    }

    const post = postStore.getPostById(id)
    if (!post) {
      return false
    }

    if (post.parentId === sourceId) {
      return true
    }

    return isParent(post.parentId)
  }

  if (isParent(targetId)) {
    toast.error(`不能将内容拖拽到其子内容下面`)
  }
  else if (sourceId !== targetId) {
    postStore.updatePostParentId(sourceId, targetId || null)
  }

  dragSourceId.value = null
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleDragEnd() {
  dragSourceId.value = null
  dropTargetId.value = null
  dragover.value = false
}
</script>

<template>
  <!-- 移动端遮罩层 -->
  <Transition name="fade">
    <div
      v-if="isMobile && isOpenPostSlider"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      @click="isOpenPostSlider = false"
    />
  </Transition>

  <!-- 侧栏容器 -->
  <div
    class="h-full w-full overflow-hidden"
    :class="{
      'fixed top-0 left-0 z-55 w-full bg-background border-r border-border shadow-xl': isMobile,
      'animate-slider': isMobile && enableAnimation,
      'bg-background transition-colors duration-200': !isMobile,
      'bg-primary/5 outline-2 outline-dashed outline-primary/30': !isMobile && dragover,
    }"
    :style="{
      transform: isMobile && isOpenPostSlider ? 'translateX(0)'
        : isMobile && !isOpenPostSlider ? 'translateX(-100%)'
          : undefined,
    }"
    @dragover.prevent="dragover = true"
    @dragleave.prevent="dragover = false"
    @dragend="handleDragEnd"
  >
    <nav
      class="h-full flex flex-col overflow-hidden"
      @dragover="handleDragOver"
      @drop.prevent="handleDrop(null)"
    >
      <!-- 标题栏 -->
      <div class="flex items-center h-10 px-3 shrink-0">
        <span class="inline-flex items-center text-muted-foreground select-none">
          <FileText class="size-4" />
        </span>
        <span
          v-if="posts.length"
          class="ml-1.5 inline-flex items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-medium tabular-nums text-muted-foreground min-w-[18px] h-[18px]"
        >
          {{ posts.length }}
        </span>
        <span class="flex-1" />

        <!-- 搜索 -->
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          :class="{ 'text-primary bg-primary/10': isSearching }"
          @click="toggleSearch"
        >
          <Search class="size-4" />
        </button>

        <!-- 多选 -->
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          :class="{ 'text-primary bg-primary/10': isSelectMode }"
          :title="isSelectMode ? '退出选择' : '多选操作'"
          @click="toggleSelectMode"
        >
          <CheckSquare class="size-4" />
        </button>

        <!-- 新增 -->
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          @click="isOpenAddDialog = true"
        >
          <Plus class="size-4" />
        </button>

        <!-- 更多操作 -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150">
              <Ellipsis class="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">
              排序方式
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup v-model="sortMode">
              <DropdownMenuRadioItem value="A-Z">
                文件名（A-Z）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Z-A">
                文件名（Z-A）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="update-new-old">
                编辑时间（新→旧）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="update-old-new">
                编辑时间（旧→新）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="create-new-old">
                创建时间（新→旧）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="create-old-new">
                创建时间（旧→新）
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="postStore.collapseAllPosts">
              <ChevronsDownUp class="mr-2 size-4" />
              全部收起
            </DropdownMenuItem>
            <DropdownMenuItem @click="postStore.expandAllPosts">
              <ChevronsUpDown class="mr-2 size-4" />
              全部展开
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- 关闭 -->
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 ml-0.5"
          @click="isOpenPostSlider = false"
        >
          <X class="size-4" />
        </button>
      </div>

      <!-- 搜索栏 -->
      <div v-if="isSearching" class="px-2 pb-1.5 shrink-0 space-y-1">
        <div class="relative">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            class="w-full h-8 rounded-md border border-border bg-background px-2.5 pr-20 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            placeholder="搜索"
            @keydown.escape="closeSearch"
          >
          <div class="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              class="inline-flex items-center justify-center size-5 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
              :class="{ 'text-primary bg-primary/10': isRegex }"
              title="正则表达式"
              @click="isRegex = !isRegex"
            >
              <Regex class="size-3" />
            </button>
            <button
              class="inline-flex items-center justify-center size-5 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
              :class="{ 'text-primary bg-primary/10': isCaseSensitive }"
              title="区分大小写"
              @click="isCaseSensitive = !isCaseSensitive"
            >
              <span class="text-[10px] font-bold">Aa</span>
            </button>
            <button
              v-if="searchQuery"
              class="inline-flex items-center justify-center size-5 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
              @click="searchQuery = ''"
            >
              <X class="size-3" />
            </button>
          </div>
        </div>

        <!-- 替换栏 -->
        <div class="relative">
          <input
            v-model="replaceQuery"
            class="w-full h-8 rounded-md border border-border bg-background px-2.5 pr-16 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            placeholder="替换为…"
          >
          <div class="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              class="inline-flex items-center justify-center size-5 rounded text-muted-foreground/50 hover:text-foreground transition-colors disabled:opacity-35"
              title="替换一处"
              :disabled="!searchQuery || totalMatches === 0"
              @click="replaceFirst"
            >
              <Replace class="size-3" />
            </button>
            <button
              class="inline-flex items-center justify-center size-5 rounded text-muted-foreground/50 hover:text-foreground transition-colors disabled:opacity-35"
              title="全部替换"
              :disabled="!searchQuery || totalMatches === 0"
              @click="replaceAll"
            >
              <ReplaceAll class="size-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="isSearching && searchQuery.trim()" class="flex-1 overflow-y-auto px-1.5 py-0.5 thin-scrollbar">
        <!-- 匹配统计 -->
        <div v-if="totalMatches > 0" class="px-2 py-1 text-xs text-muted-foreground/60">
          共 {{ totalMatches }} 处匹配，{{ searchResults.length }} 篇内容
        </div>
        <template v-if="searchResults.length">
          <a
            v-for="result in searchResults"
            :key="result.id"
            class="group relative flex w-full cursor-pointer flex-col gap-0.5 rounded-lg px-2 py-[7px] text-[13px] leading-snug transition-all duration-150 ease-out"
            :class="{
              'bg-accent text-accent-foreground font-medium': postStore.currentPostId === result.id,
              'text-foreground/70 hover:text-foreground hover:bg-accent/50': postStore.currentPostId !== result.id,
            }"
            @click="postStore.currentPostId = result.id; closeSearch()"
          >
            <span
              v-if="postStore.currentPostId === result.id"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary"
            />
            <span class="truncate select-none">
              <template v-for="(part, i) in result.titleParts" :key="i">
                <mark v-if="part.highlight" class="bg-primary/20 text-inherit rounded-sm px-px">{{ part.text }}</mark>
                <span v-else>{{ part.text }}</span>
              </template>
            </span>
            <span
              v-if="result.snippetParts.length"
              class="text-[11px] text-muted-foreground/60 truncate"
            >
              <template v-for="(part, i) in result.snippetParts" :key="i">
                <mark v-if="part.highlight" class="bg-primary/20 text-inherit rounded-sm px-px">{{ part.text }}</mark>
                <span v-else>{{ part.text }}</span>
              </template>
            </span>
          </a>
        </template>
        <div v-else class="flex flex-col items-center justify-center gap-2 py-12 px-6">
          <Search class="size-5 text-muted-foreground/30" />
          <p class="text-xs text-muted-foreground/50">
            没有匹配的内容
          </p>
        </div>
      </div>

      <!-- 内容列表 -->
      <div v-else class="flex-1 overflow-y-auto px-1.5 py-0.5 thin-scrollbar">
        <PostItem
          v-if="sortedPosts.length"
          :parent-id="null"
          :sorted-posts="sortedPosts"
          :actions="{
            startRenamePost,
            openHistoryDialog,
            startDelPost,
            openAddPostDialog,
          }"
          :drag="{
            dragSourceId,
            dropTargetId,
            setDragSourceId: (id: string | null) => (dragSourceId = id),
            setDropTargetId: (id: string | null) => (dropTargetId = id),
            handleDrop,
            handleDragEnd,
          }"
          :select="selectProps"
        />

        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center gap-4 py-20 px-6">
          <div class="flex items-center justify-center size-12 rounded-xl bg-muted/50">
            <FileText class="size-6 text-muted-foreground/40" />
          </div>
          <div class="text-center space-y-1">
            <p class="text-sm font-medium text-muted-foreground/60">
              暂无内容
            </p>
            <p class="text-xs text-muted-foreground/40">
              点击上方 + 按钮创建
            </p>
          </div>
        </div>
      </div>

      <!-- 选择模式底部操作栏 -->
      <Transition name="slide-up">
        <div
          v-if="isSelectMode"
          class="shrink-0 border-t border-border bg-background px-3 pt-2 pb-3 space-y-2"
        >
          <!-- 选中信息行 -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-muted-foreground">
              已选
              <strong class="text-foreground font-semibold">{{ selectedPostIds.length }}</strong>
              篇
            </span>
            <div class="flex items-center gap-2 text-muted-foreground">
              <button
                class="hover:text-foreground transition-colors"
                @click="allSelected ? clearSelection() : selectAll()"
              >
                {{ allSelected ? '取消全选' : '全选' }}
              </button>
              <span class="opacity-30">·</span>
              <button class="hover:text-foreground transition-colors" @click="toggleSelectMode">
                完成
              </button>
            </div>
          </div>
          <!-- 操作工具栏 -->
          <div class="flex">
            <!-- 导出 -->
            <button
              class="flex flex-1 items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
              title="导出"
              :disabled="!selectedPostIds.length"
              @click="exportSelected"
            >
              <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <!-- 复制 -->
            <button
              class="flex flex-1 items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
              title="复制"
              :disabled="!selectedPostIds.length"
              @click="duplicateSelected"
            >
              <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <!-- 合并 -->
            <button
              class="flex flex-1 items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
              :title="selectedPostIds.length < 2 ? '至少选择 2 篇才能合并' : '合并'"
              :disabled="selectedPostIds.length < 2"
              @click="openMergeDialog"
            >
              <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" /><path d="M16 6h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3" /><line x1="12" y1="2" x2="12" y2="22" />
              </svg>
            </button>
            <!-- 分隔 -->
            <div class="mx-1 self-center h-5 w-px bg-border/60 shrink-0" />
            <!-- 删除 -->
            <button
              class="flex flex-1 items-center justify-center rounded-md py-2 text-destructive/60 transition-colors hover:bg-destructive/8 hover:text-destructive disabled:pointer-events-none disabled:opacity-35"
              :title="selectedPostIds.length >= posts.length ? '至少保留一篇内容' : '删除'"
              :disabled="!selectedPostIds.length || selectedPostIds.length >= posts.length"
              @click="isOpenBatchDelConfirmDialog = true"
            >
              <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </nav>
  </div>

  <!-- 新增弹窗 -->
  <Dialog v-model:open="isOpenAddDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>新增内容</DialogTitle>
        <DialogDescription>请输入内容名称</DialogDescription>
      </DialogHeader>
      <Input v-model="addPostInputVal" placeholder="输入标题…" @keyup.enter="addPost" />
      <DialogFooter>
        <Button @click="addPost">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 重命名弹窗 -->
  <Dialog v-model:open="isOpenEditDialog">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>编辑内容名称</DialogTitle>
        <DialogDescription>请输入新的内容名称</DialogDescription>
      </DialogHeader>
      <Input v-model="renamePostInputVal" @keyup.enter="renamePost" />
      <DialogFooter>
        <Button variant="outline" @click="isOpenEditDialog = false">
          取消
        </Button>
        <Button @click="renamePost">
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 删除确认 -->
  <AlertDialog v-model:open="isOpenDelPostConfirmDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>提示</AlertDialogTitle>
        <AlertDialogDescription>{{ delConfirmText }}</AlertDialogDescription>
      </AlertDialogHeader>
      <div v-if="hasSubPosts" class="flex items-center gap-2 mt-2">
        <input
          id="del-recursive"
          v-model="delRecursive"
          type="checkbox"
          class="size-3.5 rounded border-border accent-primary cursor-pointer"
        >
        <label
          for="del-recursive"
          class="text-xs text-muted-foreground select-none cursor-pointer hover:text-foreground transition-colors"
        >
          同时删除所有子内容
        </label>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="delPost">
          确定
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- 合并弹窗 -->
  <Dialog v-model:open="isOpenMergeDialog">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>合并为一篇</DialogTitle>
        <DialogDescription>将选中的 {{ selectedPostIds.length }} 篇内容按顺序合并，请为合并结果命名</DialogDescription>
      </DialogHeader>
      <Input v-model="mergeTitle" placeholder="输入合并后的标题…" @keyup.enter="mergeSelected" />
      <DialogFooter>
        <Button variant="outline" @click="isOpenMergeDialog = false">
          取消
        </Button>
        <Button @click="mergeSelected">
          合并
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 批量删除确认 -->
  <AlertDialog v-model:open="isOpenBatchDelConfirmDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>提示</AlertDialogTitle>
        <AlertDialogDescription>{{ batchDelConfirmText }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="batchDeleteSelected"
        >
          确定删除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- 历史记录 -->
  <Dialog v-model:open="isOpenHistoryDialog">
    <DialogContent class="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>历史记录</DialogTitle>
        <DialogDescription>每隔 30 秒自动保存，最多保留 10 条</DialogDescription>
      </DialogHeader>

      <div class="h-[50vh] flex gap-3">
        <!-- 左侧时间轴 -->
        <ul class="w-[160px] shrink-0 space-y-0.5 overflow-y-auto thin-scrollbar">
          <li
            v-for="(item, idx) in currentHistoryList"
            :key="item.datetime"
            class="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
            :class="{ 'bg-primary/8 text-primary font-medium': currentHistoryIndex === idx }"
            @click="currentHistoryIndex = idx"
          >
            <span class="text-xs leading-snug">{{ item.datetime }}</span>
          </li>
        </ul>

        <Separator orientation="vertical" />

        <!-- 右侧内容（带 Tabs） -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <Tabs v-model="historyViewMode" class="flex flex-col h-full">
            <TabsList class="shrink-0 w-fit">
              <TabsTrigger value="content">
                原文
              </TabsTrigger>
              <TabsTrigger value="diff">
                版本对比
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" class="flex-1 overflow-y-auto mt-2">
              <div class="rounded-lg bg-muted/30 p-4 h-full overflow-y-auto">
                <pre class="whitespace-pre-wrap text-sm leading-relaxed break-all font-[inherit]">{{ currentHistoryList[currentHistoryIndex]?.content ?? '' }}</pre>
              </div>
            </TabsContent>

            <TabsContent value="diff" class="flex-1 overflow-hidden mt-2">
              <div class="flex items-center gap-2 mb-2 text-xs text-muted-foreground shrink-0">
                <span>对比：</span>
                <Select v-model="compareTargetIndex">
                  <SelectTrigger class="h-7 w-auto text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="(item, idx) in currentHistoryList"
                      :key="idx"
                      :value="String(idx)"
                      :disabled="idx === currentHistoryIndex"
                    >
                      {{ item.datetime }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <span>→</span>
                <span class="font-medium text-foreground">{{ currentHistoryList[currentHistoryIndex]?.datetime ?? '' }}</span>
              </div>

              <div class="flex-1 overflow-hidden rounded-lg border h-[calc(100%-2.5rem)]">
                <VersionDiffViewer
                  :old-text="currentHistoryList[Number(compareTargetIndex)]?.content ?? ''"
                  :new-text="currentHistoryList[currentHistoryIndex]?.content ?? ''"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DialogFooter>
        <AlertDialog>
          <AlertDialogTrigger><Button>恢 复</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>提示</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将用该记录替换当前文章内容，是否继续？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction @click="recoverHistory">
                恢 复
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* 移动端侧边栏动画 */
.animate-slider {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* 细滚动条 — 默认隐藏，hover 时显示 */
.thin-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
.thin-scrollbar:hover {
  scrollbar-color: hsl(var(--border)) transparent;
}

/* 遮罩动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 底部操作栏动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
