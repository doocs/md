<script setup lang="ts">
import {
  ChevronRight,
  Edit3,
  Ellipsis,
  FileDown,
  FileInput,
  History,
  Package,
  PlusSquare,
  Trash2,
} from 'lucide-vue-next'
import { usePostStore } from '@/stores/post'
import { useTemplateStore } from '@/stores/template'
import { useUIStore } from '@/stores/ui'
import { downloadMD } from '@/utils'

interface Post {
  id: string
  title: string
  content: string
  history: {
    datetime: string
    content: string
  }[]
  createDatetime: Date
  updateDatetime: Date
  // 父标签
  parentId?: string | null
  // 展开状态
  collapsed?: boolean
}

const props = defineProps<{
  // 父文章的 ID，如果值是 null，则日表示这是第一层文件
  parentId: string | null
  // 排序好的文章列表
  sortedPosts: Post[]
  // 开始重命名文章
  startRenamePost: (id: string) => void
  // 打开历史记录对话框
  openHistoryDialog: (id: string) => void
  // 开始删除文章
  startDelPost: (id: string) => void
  // 拖拽目的地 ID
  dropTargetId: string | null
  // 设置拖拽目的地
  setDropTargetId: (id: string | null) => void
  // 被拖拽对象
  dragSourceId: string | null
  // 设置被拖拽对象
  setDragSourceId: (id: string | null) => void
  handleDrop: (targetId: string | null) => void
  handleDragEnd: () => void
  // 以添加子文章的方式打开对话框
  openAddPostDialog: (parentId: string) => void
  // 选择模式
  isSelectMode?: boolean
  // 已选 ID 列表
  selectedIds?: string[]
  // 切换选中
  onToggleSelect?: (id: string) => void
}>()

const postStore = usePostStore()
const templateStore = useTemplateStore()
const uiStore = useUIStore()
const { posts, currentPostId } = storeToRefs(postStore)
const { toggleShowTemplateDialog } = uiStore

/* ============ 新增内容 ============ */
const isOpenAddDialog = ref(false)
const addPostInputVal = ref(``)
watch(isOpenAddDialog, (o) => {
  if (o)
    addPostInputVal.value = ``
})

// 新增：拖拽开始时记录ID并设置数据
function handleDragStart(id: string, e: DragEvent) {
  props.setDragSourceId(id)
  e.dataTransfer?.setData(`text/plain`, id)
  e.dataTransfer!.effectAllowed = `move` // 明确拖拽效果
}

/* ============ 折叠展开 ============ */
function togglePostExpanded(postId: string) {
  const targetPost = posts.value.find(p => p.id === postId)
  if (targetPost) {
    targetPost.collapsed = !targetPost.collapsed
  }
}

/*
 * 判断文章是否有子文章
 */
function isHasChild(postId: string) {
  return props.sortedPosts.some(p => p.parentId === postId)
}

/*
 * 保存为模板
 */
function saveAsTemplate(postId: string) {
  const post = posts.value.find(p => p.id === postId)
  if (!post)
    return

  templateStore.createTemplate({
    name: post.title,
    content: post.content,
    description: `从「${post.title}」创建于 ${new Date().toLocaleString('zh-CN')}`,
  })
}

/*
 * 应用模板
 */
function applyTemplate(postId: string) {
  currentPostId.value = postId
  toggleShowTemplateDialog(true)
}
</script>

<template>
  <div v-for="post in props.sortedPosts.filter(p => (props.parentId == null && p.parentId == null) || p.parentId === props.parentId)" :key="post.id">
    <!-- 文章项容器 -->
    <a
      class="post-item group relative flex w-full cursor-pointer items-center gap-1 rounded-lg px-2 py-[7px] text-[13px] leading-snug transition-all duration-150 ease-out"
      :class="{
        'bg-accent text-accent-foreground font-medium active-item': !props.isSelectMode && currentPostId === post.id,
        'text-foreground/70 hover:text-foreground hover:bg-accent/50': props.isSelectMode ? true : currentPostId !== post.id,
        'opacity-30': props.dragSourceId === post.id,
        'ring-1 ring-primary/40 ring-inset bg-primary/5': props.dropTargetId === post.id,
      }"
      :draggable="!props.isSelectMode"
      @dragstart="!props.isSelectMode && handleDragStart(post.id, $event)"
      @dragend="props.handleDragEnd"
      @drop.prevent="!props.isSelectMode && props.handleDrop(post.id)"
      @dragover.stop.prevent="!props.isSelectMode && props.setDropTargetId(post.id)"
      @dragleave.prevent="props.setDropTargetId(null)"
      @click="props.isSelectMode ? props.onToggleSelect?.(post.id) : (currentPostId = post.id)"
    >
      <!-- 活动指示条 -->
      <span
        v-if="!props.isSelectMode && currentPostId === post.id"
        class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary"
      />

      <!-- 选择模式复选框 -->
      <span
        v-if="props.isSelectMode"
        class="flex shrink-0 items-center justify-center size-5"
        @click.stop="props.onToggleSelect?.(post.id)"
      >
        <span
          class="flex items-center justify-center size-4 rounded border transition-colors duration-150"
          :class="props.selectedIds?.includes(post.id)
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-border bg-background'"
        >
          <svg v-if="props.selectedIds?.includes(post.id)" class="size-2.5" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </span>

      <!-- 折叠展开图标 -->
      <button
        v-if="!props.isSelectMode"
        class="flex shrink-0 items-center justify-center size-5 rounded text-muted-foreground/50 transition-colors duration-150"
        :class="{
          'hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5': isHasChild(post.id),
          'invisible': !isHasChild(post.id),
        }"
        @click.stop="isHasChild(post.id) && togglePostExpanded(post.id)"
      >
        <ChevronRight
          class="size-3.5 transition-transform duration-200 ease-out"
          :class="{ 'rotate-90': !post.collapsed }"
        />
      </button>

      <span class="flex-1 truncate select-none">{{ post.title }}</span>

      <!-- 上下文菜单 — hover 时渐入 -->
      <DropdownMenu v-if="!props.isSelectMode">
        <DropdownMenuTrigger as-child>
          <button
            class="ml-auto flex shrink-0 items-center justify-center size-6 rounded-md text-muted-foreground/40 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 data-[state=open]:opacity-100 data-[state=open]:text-foreground"
            @click.stop
          >
            <Ellipsis class="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-40">
          <DropdownMenuItem @click.stop="props.openAddPostDialog(post.id)">
            <PlusSquare class="mr-2 size-4" /> 新增内容
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="props.startRenamePost(post.id)">
            <Edit3 class="mr-2 size-4" /> 重命名
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="props.openHistoryDialog(post.id)">
            <History class="mr-2 size-4" /> 历史记录
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click.stop="downloadMD(post.content, post.title)">
            <FileDown class="mr-2 size-4" /> 导出 .md
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click.stop="saveAsTemplate(post.id)">
            <Package class="mr-2 size-4" /> 存储为模板
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="applyTemplate(post.id)">
            <FileInput class="mr-2 size-4" /> 应用模板
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-if="posts.length > 1"
            class="text-destructive focus:text-destructive"
            @click.stop="props.startDelPost(post.id)"
          >
            <Trash2 class="mr-2 size-4" /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </a>

    <!-- 子级树 -->
    <div
      v-if="isHasChild(post.id) && !post.collapsed"
      class="ml-[18px] border-l border-border/40 pl-2 py-0.5"
    >
      <PostItem
        :parent-id="post.id"
        :sorted-posts="props.sortedPosts"
        :start-rename-post="props.startRenamePost"
        :open-history-dialog="props.openHistoryDialog"
        :start-del-post="props.startDelPost"
        :drag-source-id="props.dragSourceId"
        :set-drag-source-id="props.setDragSourceId"
        :drop-target-id="props.dropTargetId"
        :set-drop-target-id="props.setDropTargetId"
        :handle-drag-end="props.handleDragEnd"
        :handle-drop="props.handleDrop"
        :open-add-post-dialog="props.openAddPostDialog"
        :is-select-mode="props.isSelectMode"
        :selected-ids="props.selectedIds"
        :on-toggle-select="props.onToggleSelect"
      />
    </div>
  </div>
</template>
