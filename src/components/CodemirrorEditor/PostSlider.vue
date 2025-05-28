<script setup lang="ts">
import { useStore } from '@/stores'
import { addPrefix } from '@/utils'
import { ArrowUpNarrowWide, ChevronRight, Edit3, Ellipsis, History, Plus, Trash } from 'lucide-vue-next'

const store = useStore()

/* ============ 新增内容 ============ */
const isOpenAddDialog = ref(false)
const addPostInputVal = ref(``)
watch(isOpenAddDialog, (o) => {
  if (o)
    addPostInputVal.value = ``
})

function addPost() {
  if (!addPostInputVal.value.trim())
    return toast.error(`内容标题不可为空`)
  if (store.posts.some(post => post.title === addPostInputVal.value.trim()))
    return toast.error(`内容标题已存在`)
  store.addPost(addPostInputVal.value.trim())
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
  if (!renamePostInputVal.value.trim())
    return toast.error(`内容标题不可为空`)
  if (store.posts.some(post => post.title === renamePostInputVal.value.trim() && post.id !== editId.value))
    return toast.error(`内容标题已存在`)
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
  if (!post)
    return (isOpenHistoryDialog.value = false)
  const content = post.history[currentHistoryIndex.value].content
  post.content = content
  toRaw(store.editor!).setValue(content)
  toast.success(`记录恢复成功`)
  isOpenHistoryDialog.value = false
}

/* ============ 排序 ============ */
const sortMode = useStorage(addPrefix(`sort_mode`), `create-old-new`)
const sortedPosts = computed(() => {
  // 先过滤出 parentId 为空的文章，再排序
  const rootPosts = store.posts.filter(post => !post.parentId) // 过滤条件：parentId 不存在或为 null
  return [...rootPosts].sort((a, b) => {
    switch (sortMode.value) {
      case `A-Z`: return a.title.localeCompare(b.title)
      case `Z-A`: return b.title.localeCompare(a.title)
      case `update-new-old`: return +new Date(b.updateDatetime) - +new Date(a.updateDatetime)
      case `update-old-new`: return +new Date(a.updateDatetime) - +new Date(b.updateDatetime)
      case `create-new-old`: return +new Date(b.createDatetime) - +new Date(a.createDatetime)
      default: /* create-old-new */
        return +new Date(a.createDatetime) - +new Date(b.createDatetime)
    }
  })
})

/* ============ 拖拽功能 ============ */
const dragPostId = ref<string | null>(null)

// 新增：拖拽开始时记录ID并设置数据
function handleDragStart(id: string, e: DragEvent) {
  dragPostId.value = id
  e.dataTransfer?.setData(`text/plain`, id)
  e.dataTransfer!.effectAllowed = `move` // 明确拖拽效果
}

// 新增：拖拽结束时重置状态
function handleDragEnd() {
  dragPostId.value = null
}

// 修改：支持空白区域解除父子关系
function handleDrop(targetId: string | null) { // 允许targetId为null（空白区域）
  const sourceId = dragPostId.value
  if (!sourceId)
    return

  if (sourceId === targetId) { // 拖拽到自身
    dragPostId.value = null
    return
  }

  if (targetId) { // 拖拽到具体文章项
    store.updatePostParentId(sourceId, targetId)
    toast.success(`文章「${store.getPostById(sourceId)?.title}」已移动到「${store.getPostById(targetId)?.title}」下`)
  }
  else { // 拖拽到空白区域（解除父子关系）
    store.updatePostParentId(sourceId, null) // 假设store支持传入null清除parentId
    toast.success(`文章「${store.getPostById(sourceId)?.title}」已回归全局列表`)
  }

  dragPostId.value = null
}

function handleDragOver(e: DragEvent) {
  e.preventDefault() // 允许放置
  // e.dataTransfer?.dropEffect = `move`
}

/* ============ 折叠展开 ============ */
function togglePostExpanded(postId: string) {
  const targetPost = store.posts.find(p => p.id === postId)
  if (targetPost) {
    targetPost.isExpanded = !targetPost.isExpanded
  }
}
</script>

<template>
  <!-- 侧栏外框 -->
  <div
    class="overflow-hidden bg-gray/20 bg-gray/20 transition-width duration-300 dark:bg-[#191c20]"
    :class="{ 'w-0': !store.isOpenPostSlider, 'w-50': store.isOpenPostSlider }"
  >
    <nav
      class="space-y-1 h-full flex flex-col border-r-2 border-gray/20 py-2 transition-transform"
      :class="{ 'translate-x-100': store.isOpenPostSlider, '-translate-x-full': !store.isOpenPostSlider }"
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
                  <Button variant="outline" size="icon">
                    <Plus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  新增文章
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
                  <Button variant="outline" size="icon">
                    <ArrowUpNarrowWide />
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
      </div>

      <!-- 列表 -->
      <div class="space-y-1">
        <!-- 包裹根文章和子文章，保持间距 -->
        <div v-for="post in sortedPosts" :key="post.id">
          <!-- 根文章外层容器 -->
          <a
            href="#"
            class="hover:bg-primary/90 hover:text-primary-foreground dark:hover:border-primary-dark h-8 w-full inline-flex items-center gap-2 rounded px-2 text-sm transition-colors"
            :class="{
              'bg-primary text-primary-foreground shadow-lg dark:border dark:border-primary': store.currentPostId === post.id,
              'dark:bg-gray/30 dark:text-primary-foreground-dark dark:border-primary-dark': store.currentPostId === post.id,
              'bg-yellow-100 dark:bg-yellow-900/30': dragPostId === post.id,
              'opacity-50': dragPostId === post.id,
            }"
            draggable="true"
            @dragstart="handleDragStart(post.id, $event)"
            @dragend="handleDragEnd()"
            @dragover="handleDragOver($event)"
            @drop.prevent="handleDrop(post.id)"
            @click="store.currentPostId = post.id"
          >
            <!-- 折叠展开图标 -->
            <Button
              size="xs"
              variant="ghost"
              class="h-max p-0"
              @click.stop="togglePostExpanded(post.id)"
            >
              <ChevronRight
                class="size-4 transition-transform"
                :class="{ 'rotate-90': post.isExpanded }"
              />
            </Button>

            <span class="line-clamp-1">{{ post.title }}</span>

            <!-- 每条文章操作 -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button size="xs" variant="ghost" class="ml-auto px-1.5"><Ellipsis class="size-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem @click.stop="startRenamePost(post.id)">
                  <Edit3 class="mr-2 size-4" /> 重命名
                </DropdownMenuItem>
                <DropdownMenuItem @click.stop="openHistoryDialog(post.id)">
                  <History class="mr-2 size-4" /> 历史记录
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="store.posts.length > 1"
                  @click.stop="startDelPost(post.id)"
                >
                  <Trash class="mr-2 size-4" /> 删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </a>

          <!-- 子文章渲染区域（仅一层） -->
          <div
            v-if="post.isExpanded"
            class="space-y-1 ml-4 mt-1 border-l-2 border-gray-300 pl-3 dark:border-gray-700"
          >
            <span v-if="store.posts.filter(p => p.parentId === post.id).length === 0" class="text-xs">
              暂无内容
            </span>
            <a
              v-for="childPost in store.posts.filter(p => p.parentId === post.id)"
              :key="childPost.id"
              href="#"
              class="hover:bg-primary/90 hover:text-primary-foreground dark:hover:border-primary-dark h-8 w-full inline-flex items-center gap-2 rounded px-2 text-sm transition-colors"
              :class="{
                'bg-primary text-primary-foreground shadow-lg dark:border dark:border-primary': dragPostId !== childPost.id && store.currentPostId === childPost.id,
                'dark:bg-gray/30 dark:text-primary-foreground-dark dark:border-primary-dark': dragPostId !== childPost.id && store.currentPostId === childPost.id,
                'border-gray-700 bg-gray-400/50 dark:border-gray-200 dark:bg-gray-500/50': dragPostId === childPost.id,
                // 'bg-yellow-100 dark:bg-yellow-900/30': dragPostId === childPost.id,
                'opacity-50': dragPostId === childPost.id,
              }"
              draggable="true"
              @dragstart="handleDragStart(childPost.id, $event)"
              @dragend="handleDragEnd()"
              @dragover="handleDragOver($event)"
              @drop.prevent="handleDrop(childPost.id)"
              @click="store.currentPostId = childPost.id"
            >
              <!-- 子文章折叠图标 -->
              <Button
                size="xs"
                variant="ghost"
                class="h-max p-0"
                @click.stop="togglePostExpanded(childPost.id)"
              >
                <ChevronRight
                  class="size-4 transition-transform"
                  :class="{ 'rotate-90': childPost.isExpanded }"
                />
              </Button>

              <span class="line-clamp-1">{{ childPost.title }}</span>

              <!-- 子文章操作菜单 -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button size="xs" variant="ghost" class="ml-auto px-1.5"><Ellipsis class="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem @click.stop="startRenamePost(childPost.id)">
                    <Edit3 class="mr-2 size-4" /> 重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem @click.stop="openHistoryDialog(childPost.id)">
                    <History class="mr-2 size-4" /> 历史记录
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="store.posts.length > 1"
                    @click.stop="startDelPost(childPost.id)"
                  >
                    <Trash class="mr-2 size-4" /> 删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </a>
          </div>
        </div>
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
                class="hover:bg-primary/90 hover:text-primary-foreground h-8 w-full inline-flex cursor-pointer items-center gap-2 rounded px-2 text-sm transition-colors"
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
                  <AlertDialogDescription>此操作将用该记录替换当前文章内容，是否继续？</AlertDialogDescription>
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
