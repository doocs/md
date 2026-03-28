<script setup lang="ts">
import { ChevronsDownUp, ChevronsUpDown, Ellipsis, FileText, Plus, X } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useUIStore } from '@/stores/ui'
import { addPrefix } from '@/utils'
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
  if (posts.value.some(post => post.title === addPostInputVal.value.trim()))
    return toast.error(`内容标题已存在`)
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

  if (
    posts.value.some(
      post => post.title === renamePostInputVal.value.trim() && post.id !== editId.value,
    )
  ) {
    return toast.error(`内容标题已存在`)
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

const delConfirmText = computed(() => {
  const title = postStore.getPostById(delId.value || ``)?.title ?? ``
  const short = title.length > 20 ? `${title.slice(0, 20)}…` : title
  return `此操作将删除「${short}」，是否继续？`
})

function startDelPost(id: string) {
  delId.value = id
  isOpenDelPostConfirmDialog.value = true
}
function delPost() {
  postStore.delPost(delId.value!)
  isOpenDelPostConfirmDialog.value = false
  toast.success(`内容删除成功`)
}

/* ============ 历史记录 ============ */
const isOpenHistoryDialog = ref(false)
const currentPostId = ref<string | null>(null)
const currentHistoryIndex = ref(0)

function openHistoryDialog(id: string) {
  currentPostId.value = id
  currentHistoryIndex.value = 0
  isOpenHistoryDialog.value = true
}
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
      'fixed top-0 left-0 z-55 w-[85vw] max-w-xs bg-background border-r border-border shadow-xl': isMobile,
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

        <!-- 移动端关闭 -->
        <button
          v-if="isMobile"
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 ml-0.5"
          @click="isOpenPostSlider = false"
        >
          <X class="size-4" />
        </button>
      </div>

      <!-- 内容列表 -->
      <div class="flex-1 overflow-y-auto px-1.5 py-0.5 thin-scrollbar">
        <PostItem
          v-if="sortedPosts.length"
          :parent-id="null"
          :sorted-posts="sortedPosts"
          :start-rename-post="startRenamePost"
          :open-history-dialog="openHistoryDialog"
          :start-del-post="startDelPost"
          :drop-target-id="dropTargetId"
          :set-drop-target-id="(id: string | null) => (dropTargetId = id)"
          :drag-source-id="dragSourceId"
          :set-drag-source-id="(id: string | null) => (dragSourceId = id)"
          :handle-drop="handleDrop"
          :handle-drag-end="handleDragEnd"
          :open-add-post-dialog="openAddPostDialog"
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
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="delPost">
          确定
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
            v-for="(item, idx) in postStore.getPostById(currentPostId!)?.history"
            :key="item.datetime"
            class="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
            :class="{ 'bg-primary/8 text-primary font-medium': currentHistoryIndex === idx }"
            @click="currentHistoryIndex = idx"
          >
            <span class="text-xs leading-snug">{{ item.datetime }}</span>
          </li>
        </ul>

        <Separator orientation="vertical" />

        <!-- 右侧内容 -->
        <div class="flex-1 overflow-y-auto rounded-lg bg-muted/30 p-4">
          <pre class="whitespace-pre-wrap text-sm leading-relaxed break-all font-[inherit]">{{ postStore.getPostById(currentPostId!)?.history[currentHistoryIndex].content ?? '' }}</pre>
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
</style>
