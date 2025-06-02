<script setup lang="ts">
import { useStore } from '@/stores'
import {
  ChevronRight,
  Edit3,
  Ellipsis,
  History,
  Trash,
} from 'lucide-vue-next'

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
  isExpanded?: boolean
}

const props = defineProps<{
  startRenamePost: (id: string) => void
  openHistoryDialog: (id: string) => void
  startDelPost: (id: string) => void
  dropId: string | null
  setDropId: (id: string | null) => void
  dragPostId: string | null
  setDragPostId: (id: string | null) => void
  sortedPosts: Post[]
  parentId: string | null
  handleDragEnd: () => void
}>()

const store = useStore()

/* ============ 新增内容 ============ */
const isOpenAddDialog = ref(false)
const addPostInputVal = ref(``)
watch(isOpenAddDialog, (o) => {
  if (o)
    addPostInputVal.value = ``
})

// 新增：拖拽开始时记录ID并设置数据
function handleDragStart(id: string, e: DragEvent) {
  props.setDragPostId(id)
  e.dataTransfer?.setData(`text/plain`, id)
  e.dataTransfer!.effectAllowed = `move` // 明确拖拽效果
}

function handleDrop(targetId: string | null) {
  const sourceId = props.dragPostId
  if (!sourceId) {
    return
  }

  if (sourceId === targetId) {
    // 拖拽到自身
    props.setDragPostId(null)
    return
  }

  if (targetId) {
    // 拖拽到具体文章项
    store.updatePostParentId(sourceId, targetId)
    toast.success(
      `文章「${store.getPostById(sourceId)?.title}」已移动到「${
        store.getPostById(targetId)?.title
      }」下`,
    )
  }
  else {
    // 拖拽到空白区域（解除父子关系）
    store.updatePostParentId(sourceId, null) // 假设store支持传入null清除parentId
    toast.success(`文章「${store.getPostById(sourceId)?.title}」已回归全局列表`)
  }

  props.setDragPostId(null)
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
  <div v-for="post in props.sortedPosts.filter(p => (props.parentId == null && p.parentId == null) || p.parentId === props.parentId)" :key="post.id">
    <!-- 根文章外层容器 -->
    <a
      class="hover:bg-primary hover:text-primary-foreground w-full inline-flex cursor-pointer items-center gap-2 rounded p-2 text-sm transition-colors"
      :class="{
        'bg-primary text-primary-foreground shadow': store.currentPostId === post.id,
        'bg-yellow-100 dark:bg-yellow-900/30': props.dragPostId === post.id,
        'opacity-50': props.dragPostId === post.id,
        'outline-2 outline-dashed outline-primary  border-gray-200 bg-gray-400/50 dark:border-gray-200 dark:bg-gray-500/50':
          props.dropId === post.id,
      }"
      draggable="true"
      @dragstart="handleDragStart(post.id, $event)"
      @dragend="props.handleDragEnd"
      @drop.prevent="handleDrop(post.id)"
      @dragover.stop="handleDragOver($event), props.setDropId(post.id)"
      @dragleave.prevent="props.setDropId(null)"
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
          <Button size="xs" variant="ghost" class="ml-auto px-1.5">
            <Ellipsis class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click.stop="props.startRenamePost(post.id)">
            <Edit3 class="mr-2 size-4" /> 重命名
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="props.openHistoryDialog(post.id)">
            <History class="mr-2 size-4" /> 历史记录
          </DropdownMenuItem>
          <DropdownMenuItem
            v-if="store.posts.length > 1"
            @click.stop="props.startDelPost(post.id)"
          >
            <Trash class="mr-2 size-4" /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </a>

    <div
      v-if="post.isExpanded"
      class="space-y-1 ml-4 mt-1 border-l-2 border-gray-300 pl-1 dark:border-gray-700"
    >
      <span
        v-if="!props.sortedPosts.some((p) => p.parentId === post.id)"
        class="ml-2 text-xs"
      >
        暂无内容
      </span>
      <PostItem
        v-else
        :parent-id="post.id"
        :sorted-posts="props.sortedPosts"
        :start-rename-post="props.startRenamePost"
        :open-history-dialog="props.openHistoryDialog"
        :start-del-post="props.startDelPost"
        :drag-post-id="props.dragPostId"
        :set-drag-post-id="props.setDragPostId"
        :drop-id="props.dropId"
        :set-drop-id="props.setDropId"
        :handle-drag-end="props.handleDragEnd"
      />
    </div>
  </div>
</template>
