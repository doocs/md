<script setup lang="ts">
import { useStore } from '@/stores'
import { addPrefix } from '@/utils'
import { ArrowUpNarrowWide, ChevronsDownUp, ChevronsUpDown, PlusSquare } from 'lucide-vue-next'

const store = useStore()

/* ============ 新增内容 ============ */
const parentId = ref<string | null>(null)
const isOpenAddDialog = ref(false)
const addPostInputVal = ref(``)
watch(isOpenAddDialog, (o) => {
  if (o) {
    addPostInputVal.value = ``
  }
})

function openAddPostDialog(id: string) {
  parentId.value = id
  isOpenAddDialog.value = true
}

function addPost() {
  if (!addPostInputVal.value.trim())
    return toast.error(`内容标题不可为空`)
  if (store.posts.some(post => post.title === addPostInputVal.value.trim()))
    return toast.error(`内容标题已存在`)
  store.addPost(addPostInputVal.value.trim(), parentId.value)
  isOpenAddDialog.value = false
  toast.success(`内容新增成功`)
}

/* ============ 重命名 / 删除 / 历史 对象 ============ */
const editId = ref<string | null>(null)
const isOpenEditDialog = ref(false)
const renamePostInputVal = ref(``)

function startRenamePost(id: string) {
  editId.value = id
  renamePostInputVal.value = store.getPostById(id)!.title
  isOpenEditDialog.value = true
}
function renamePost() {
  if (!renamePostInputVal.value.trim()) {
    return toast.error(`内容标题不可为空`)
  }

  if (
    store.posts.some(
      post => post.title === renamePostInputVal.value.trim() && post.id !== editId.value,
    )
  ) {
    return toast.error(`内容标题已存在`)
  }

  if (renamePostInputVal.value === store.getPostById(editId.value!)?.title) {
    isOpenEditDialog.value = false
    return
  }

  store.renamePost(editId.value!, renamePostInputVal.value.trim())
  toast.success(`内容重命名成功`)
  isOpenEditDialog.value = false
}

const delId = ref<string | null>(null)
const isOpenDelPostConfirmDialog = ref(false)

const delConfirmText = computed(() => {
  const title = store.getPostById(delId.value || ``)?.title ?? ``
  const short = title.length > 20 ? `${title.slice(0, 20)}…` : title
  return `此操作将删除「${short}」，是否继续？`
})

function startDelPost(id: string) {
  delId.value = id
  isOpenDelPostConfirmDialog.value = true
}
function delPost() {
  store.delPost(delId.value!)
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
  const post = store.getPostById(currentPostId.value!)
  if (!post) {
    isOpenHistoryDialog.value = false
    return
  }

  const content = post.history[currentHistoryIndex.value].content
  post.content = content
  toRaw(store.editor!).setValue(content)
  toast.success(`记录恢复成功`)
  isOpenHistoryDialog.value = false
}

/* ============ 排序 ============ */
const sortMode = useStorage(addPrefix(`sort_mode`), `create-old-new`)
const sortedPosts = computed(() => {
  return [...store.posts].sort((a, b) => {
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

    const post = store.getPostById(id)
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
    store.updatePostParentId(sourceId, targetId || null)
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
  <!-- 侧栏外框 -->
  <div
    class="h-full w-full overflow-hidden border-2 border-dashed bg-gray/20 transition-colors duration-300 dark:bg-[#191c20]"
    :class="{
      'border-gray-700 bg-gray-400/50 dark:border-gray-200 dark:bg-gray-500/50': dragover,
    }"
    @dragover.prevent="dragover = true"
    @dragleave.prevent="dragover = false"
    @dragend="handleDragEnd"
  >
    <nav
      class="space-y-1 h-full flex flex-col border-r-2 border-gray/20 py-2 transition-transform"
      :class="{
        'translate-x-100': store.isOpenPostSlider,
        '-translate-x-full': !store.isOpenPostSlider,
      }"
      @dragover="handleDragOver"
      @drop.prevent="handleDrop(null)"
    >
      <!-- 顶部：新增 + 排序按钮 -->
      <div class="space-x-4 mb-2 flex justify-center">
        <!-- 新增 -->
        <Dialog v-model:open="isOpenAddDialog">
          <DialogTrigger>
            <TooltipProvider :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="xs" class="h-max p-1">
                    <PlusSquare class="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  新增内容
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增内容</DialogTitle>
              <DialogDescription>请输入内容名称</DialogDescription>
            </DialogHeader>
            <Input v-model="addPostInputVal" @keyup.enter="addPost" />
            <DialogFooter>
              <Button @click="addPost">
                确 定
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <!-- 排序 -->
        <DropdownMenu>
          <DropdownMenuTrigger>
            <TooltipProvider :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="xs" class="h-max p-1">
                    <ArrowUpNarrowWide class="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  排序模式
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup v-model="sortMode">
              <DropdownMenuRadioItem value="A-Z">
                文件名（A-Z）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Z-A">
                文件名（Z-A）
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="update-new-old">
                编辑时间（新→旧）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="update-old-new">
                编辑时间（旧→新）
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="create-new-old">
                创建时间（新→旧）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="create-old-new">
                创建时间（旧→新）
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="xs" class="h-max p-1" @click="store.collapseAllPosts">
                <ChevronsDownUp class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              全部收起
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="xs" class="h-max p-1" @click="store.expandAllPosts">
                <ChevronsUpDown class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              全部展开
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <!-- 列表 -->
      <div class="space-y-1 px-1">
        <!-- 包裹根文章和子文章，保持间距 -->
        <PostItem
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
      </div>

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
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- 历史记录 -->
      <Dialog v-model:open="isOpenHistoryDialog">
        <DialogContent class="max-w-max">
          <DialogHeader>
            <DialogTitle>历史记录</DialogTitle>
            <DialogDescription>每隔 30 秒自动保存，最多保留 10 条</DialogDescription>
          </DialogHeader>

          <div class="h-[50vh] flex">
            <!-- 左侧时间轴 -->
            <ul class="space-y-2 w-[150px]">
              <li
                v-for="(item, idx) in store.getPostById(currentPostId!)?.history"
                :key="item.datetime"
                class="hover:text-primary-foreground hover:bg-primary/90 h-8 w-full inline-flex cursor-pointer items-center gap-2 rounded px-2 text-sm transition-colors"
                :class="{
                  'bg-primary text-primary-foreground shadow-lg dark:border dark:border-primary':
                    currentHistoryIndex === idx,
                  'dark:bg-gray/30 dark:text-primary-foreground-dark dark:border-primary-dark':
                    currentHistoryIndex === idx,
                }"
                @click="currentHistoryIndex = idx"
              >
                {{ item.datetime }}
              </li>
            </ul>

            <Separator orientation="vertical" class="mx-2" />

            <!-- 右侧内容 -->
            <div class="space-y-2 max-h-full w-[500px] overflow-y-auto">
              <p
                v-for="(line, idx) in (store.getPostById(currentPostId!)?.history[currentHistoryIndex].content ?? '').split('\\n')"
                :key="idx"
              >
                {{ line }}
              </p>
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
    </nav>
  </div>
</template>
