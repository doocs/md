<script setup lang="ts">
import JSZip from 'jszip'
import { ArrowUpNarrowWide, ChevronsDownUp, ChevronsUpDown, FolderDown, Layers, PlusSquare, X } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useUIStore } from '@/stores/ui'
import { addPrefix, sanitizeTitle, store } from '@/utils'

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
/* ============ 多选模式 ============ */
const isOpenMultipleMode = ref(false)
/** 选中的文章 ID 集合 */
const selectedPosts = ref<Set<string>>(new Set())
/** 开启多选模式（如果未开启） */
function openMultipleModeIfClosed() {
  if (!isOpenMultipleMode.value) {
    isOpenMultipleMode.value = true
  }
}
/** 如果没有选中任何文章，则关闭多选模式 */
function closeMultipleModeIfNoSelection() {
  if (selectedPosts.value.size === 0) {
    isOpenMultipleMode.value = false
  }
}
watch(isOpenMultipleMode, (o) => {
  if (!o) {
    clearSelection()
  }
})

function togglePostSelection(postId: string) {
  if (selectedPosts.value.has(postId)) {
    selectedPosts.value.delete(postId)
  }
  else {
    selectedPosts.value.add(postId)
  }
}

function selectAllPosts() {
  if (!isOpenMultipleMode.value) {
    return
  }
  selectedPosts.value.clear()
  posts.value.forEach((post) => {
    selectedPosts.value.add(post.id)
  })
}
function clearSelection() {
  selectedPosts.value.clear()
}
function toggleSelectAllPosts() {
  if (!isOpenMultipleMode.value) {
    isOpenMultipleMode.value = true
  }
  if (selectedPosts.value.size === posts.value.length) {
    clearSelection()
  }
  else {
    selectAllPosts()
  }
}
/** 批量导出为.md */
async function handleExportAsMD() {
  if (selectedPosts.value.size === 0) {
    toast.error(`请选择要导出的文章`)
    return
  }

  const exportPromise = async () => {
    const zip = new JSZip()
    const filePathMap = new Map<string, number>() // 用于处理文件名冲突
    let exportedCount = 0
    let skippedCount = 0

    // 构建父级路径映射（用于保持文件夹结构）
    const buildPath = (postId: string, pathMap: Map<string, string>): string => {
      if (pathMap.has(postId)) {
        return pathMap.get(postId)!
      }

      const post = postStore.getPostById(postId)
      if (!post) {
        return ``
      }

      const safeTitle = sanitizeTitle(post.title)
      if (!post.parentId || !selectedPosts.value.has(post.parentId)) {
        // 如果没有父级或父级未被选中，直接返回文件名
        pathMap.set(postId, safeTitle)
        return safeTitle
      }

      // 递归构建父级路径
      const parentPath = buildPath(post.parentId, pathMap)
      const fullPath = parentPath ? `${parentPath}/${safeTitle}` : safeTitle
      pathMap.set(postId, fullPath)
      return fullPath
    }

    const pathMap = new Map<string, string>()

    // 先处理所有父级文章，确保文件夹结构正确
    const sortedPostIds = Array.from(selectedPosts.value).sort((a, b) => {
      const postA = postStore.getPostById(a)
      const postB = postStore.getPostById(b)
      // 有父级的排在后面
      if (postA?.parentId && !postB?.parentId)
        return 1
      if (!postA?.parentId && postB?.parentId)
        return -1
      return 0
    })

    // 遍历选中的文章ID，添加到ZIP
    for (const postId of sortedPostIds) {
      const post = postStore.getPostById(postId)
      if (!post) {
        skippedCount++
        continue
      }

      if (!post.content || post.content.trim() === ``) {
        skippedCount++
        continue
      }

      // 构建文件路径（保持文件夹结构）
      const basePath = buildPath(postId, pathMap)
      let filePath = `${basePath}.md`

      // 处理文件名冲突
      if (filePathMap.has(filePath)) {
        const count = filePathMap.get(filePath)! + 1
        filePathMap.set(filePath, count)
        const pathParts = basePath.split(`/`)
        const fileName = pathParts.pop() || basePath
        const dirPath = pathParts.join(`/`)
        filePath = dirPath ? `${dirPath}/${fileName} (${count}).md` : `${fileName} (${count}).md`
      }
      else {
        filePathMap.set(filePath, 0)
      }

      try {
        zip.file(filePath, post.content)
        exportedCount++
      }
      catch (error) {
        console.warn(`添加文件失败: ${filePath}`, error)
        skippedCount++
      }
    }

    if (exportedCount === 0) {
      throw new Error(`没有可导出的文章内容`)
    }

    // 生成ZIP文件（使用更高效的压缩选项）
    const blob = await zip.generateAsync({
      type: `blob`,
      compression: `DEFLATE`,
      compressionOptions: { level: 6 },
      streamFiles: true, // 流式处理，提高大文件性能
    })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement(`a`)
    a.href = url
    const timestamp = new Date().toLocaleDateString(`zh-CN`, {
      year: `numeric`,
      month: `2-digit`,
      day: `2-digit`,
    }).replace(/\//g, `-`)
    a.download = `批量导出-${timestamp}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // 释放内存
    URL.revokeObjectURL(url)

    // 返回成功消息（包含详细信息）
    const message = skippedCount > 0
      ? `成功导出 ${exportedCount} 篇文章，跳过 ${skippedCount} 篇空文章`
      : `成功导出 ${exportedCount} 篇文章`

    // 导出完成后关闭多选模式并清空选择
    isOpenMultipleMode.value = false
    selectedPosts.value.clear()

    return message
  }

  // 使用 toast.promise 显示加载、成功和失败状态
  toast.promise(exportPromise(), {
    loading: `正在导出 ${selectedPosts.value.size} 篇文章...`,
    success: (message: string) => message,
    error: (error: Error) => `批量导出失败: ${error.message || `未知错误`}`,
  })
}
</script>

<template>
  <!-- 移动端遮罩层 -->
  <div
    v-if="isMobile && isOpenPostSlider"
    class="fixed inset-0 bg-black/50 z-40"
    @click="isOpenPostSlider = false"
  />

  <!-- 侧栏容器 -->
  <div
    class="h-full w-full overflow-hidden mobile-drawer"
    :class="{
      // 移动端样式
      'fixed top-0 left-0 z-55 bg-background border-r shadow-lg': isMobile,
      'animate': isMobile && enableAnimation,
      // 桌面端样式
      'border-2 border-[#0000] border-dashed bg-gray/20 transition-colors': !isMobile,
      'border-gray-700 bg-gray-400/50 dark:border-gray-200 dark:bg-gray-500/50': !isMobile && dragover,
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
      class="h-full flex flex-col transition-transform overflow-hidden"
      :class="{ 'p-2': isMobile }"
      @dragover="handleDragOver"
      @drop.prevent="handleDrop(null)"
    >
      <!-- 移动端标题栏 -->
      <div v-if="isMobile" class="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b mb-2 bg-background">
        <h2 class="text-lg font-semibold">
          内容管理
        </h2>
        <Button variant="ghost" size="sm" @click="isOpenPostSlider = false">
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- 顶部：新增 + 排序按钮 -->
      <div class="space-x-4 mb-2 flex justify-center shrink-0 py-2">
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
          <DropdownMenuContent
            :on-select="() => {
              // 阻止默认关闭（返回 false 可阻止关闭）
              return false
            }"
          >
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
              <Button variant="ghost" size="xs" class="h-max p-1" @click="postStore.collapseAllPosts">
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
              <Button variant="ghost" size="xs" class="h-max p-1" @click="postStore.expandAllPosts">
                <ChevronsUpDown class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              全部展开
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <TooltipProvider :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="xs" class="h-max p-1" @click="toggleSelectAllPosts">
                    <Layers class="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  全选/取消全选
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuTrigger>
        </DropdownMenu>

        <TooltipProvider v-if="isOpenMultipleMode" :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="xs" class="h-max p-1" @click="handleExportAsMD">
                <FolderDown class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              批量导出为.md
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <!-- 列表 -->
      <div class="flex-1 overflow-y-auto space-y-1 px-1">
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
          :is-open-multiple-mode="isOpenMultipleMode"
          :selected-posts="selectedPosts"
          :toggle-post-selection="togglePostSelection"
          :open-multiple-mode-if-closed="openMultipleModeIfClosed"
          :close-multiple-mode-if-no-selection="closeMultipleModeIfNoSelection"
        />
      </div>
    </nav>
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
    <DialogContent class="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>历史记录</DialogTitle>
        <DialogDescription>每隔 30 秒自动保存，最多保留 10 条</DialogDescription>
      </DialogHeader>

      <div class="h-[50vh] flex">
        <!-- 左侧时间轴 -->
        <ul class="space-y-1.5 w-[180px]">
          <li
            v-for="(item, idx) in postStore.getPostById(currentPostId!)?.history"
            :key="item.datetime"
            class="min-h-[2.75rem] w-full inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors leading-tight"
            :class="[
              // eslint-disable-next-line vue/prefer-separate-static-class
              'hover:bg-primary hover:text-primary-foreground',
              {
                'bg-primary text-primary-foreground shadow-sm':
                  currentHistoryIndex === idx,
              },
            ]"
            @click="currentHistoryIndex = idx"
          >
            <span class="break-words w-full">{{ item.datetime }}</span>
          </li>
        </ul>

        <Separator orientation="vertical" class="mx-2" />

        <!-- 右侧内容 -->
        <div class="space-y-2 max-h-full flex-1 overflow-y-auto">
          <div
            class="whitespace-pre-wrap p-2"
            style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-all; hyphens: auto;"
          >
            {{ postStore.getPostById(currentPostId!)?.history[currentHistoryIndex].content ?? '' }}
          </div>
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
/* 移动端侧边栏动画 - 只有添加了 animate 类才启用 */
.mobile-drawer.animate {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
