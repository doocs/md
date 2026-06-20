<script setup lang="ts">
import type { Post, PostItemProps } from '@/types/post'
import {
  ChevronRight,
  Copy,
  Edit3,
  Ellipsis,
  FileDown,
  FileInput,
  History,
  Package,
  PlusSquare,
  Trash2,
} from '@lucide/vue'
import { downloadMD } from '@/services/export'
import { usePostStore } from '@/stores/post'
import { useTemplateStore } from '@/stores/template'
import { useUIStore } from '@/stores/ui'
import {
  getPostSliderDropdownContentProps,
  updatePostSliderMenuOpen,
  usePostSliderMenu,
} from './postSliderMenu'

const props = defineProps<PostItemProps>()
const { t, locale } = useI18n()
const postStore = usePostStore()
const templateStore = useTemplateStore()
const uiStore = useUIStore()
const { posts, currentPostId } = storeToRefs(postStore)
const { isMobile } = storeToRefs(uiStore)
const { toggleShowTemplateDialog } = uiStore
const postSliderMenu = usePostSliderMenu()
const { openMenuKey } = postSliderMenu

const postDropdownProps = computed(() => getPostSliderDropdownContentProps(isMobile.value))

function onPostMenuOpenChange(postId: string, open: boolean) {
  updatePostSliderMenuOpen(postSliderMenu, postId, open)
}

function closePostMenu() {
  postSliderMenu.closeMenu()
}

const { drag, actions } = props
const isSelectMode = computed(() => props.select?.isSelectMode ?? false)
const selectedIds = computed(() => props.select?.selectedIds ?? [])
const onToggleSelect = computed(() => props.select?.onToggleSelect)

function handleRowClick(postId: string) {
  if (isSelectMode.value)
    onToggleSelect.value?.(postId)
  else
    currentPostId.value = postId
}

function handleDragStart(id: string, e: DragEvent) {
  drag.setDragSourceId(id)
  e.dataTransfer?.setData(`text/plain`, id)
  e.dataTransfer!.effectAllowed = `move`
}

function togglePostExpanded(postId: string) {
  const targetPost = posts.value.find(p => p.id === postId)
  if (targetPost) {
    targetPost.collapsed = !targetPost.collapsed
  }
}

function isHasChild(postId: string) {
  return props.sortedPosts.some(p => p.parentId === postId)
}

function saveAsTemplate(postId: string) {
  const post = posts.value.find(p => p.id === postId)
  if (!post)
    return

  templateStore.createTemplate({
    name: post.title,
    content: post.content,
    description: t('post.templateFromPost', { title: post.title, date: new Date().toLocaleString(locale.value) }),
  })
  closePostMenu()
}

function duplicateSingle(postId: string) {
  const p = posts.value.find(p => p.id === postId)
  if (!p)
    return
  postStore.addPost(`${p.title} ${t('post.copySuffix')}`, p.parentId ?? null)
  const newPost = posts.value[posts.value.length - 1]
  postStore.updatePostContent(newPost.id, p.content)
  closePostMenu()
}

function applyTemplate(postId: string) {
  currentPostId.value = postId
  closePostMenu()
  toggleShowTemplateDialog(true)
}

const inlineEditId = ref<string | null>(null)
const inlineEditVal = ref(``)
let inlineInputRef: HTMLInputElement | null = null
function setInlineInputRef(el: unknown) {
  inlineInputRef = el as HTMLInputElement | null
}

function startInlineRename(post: Post) {
  inlineEditId.value = post.id
  inlineEditVal.value = post.title
  nextTick(() => {
    inlineInputRef?.select()
  })
}

function commitInlineRename() {
  const id = inlineEditId.value
  if (!id)
    return
  const trimmed = inlineEditVal.value.trim()
  if (!trimmed) {
    toast.error(t('post.titleRequired'))
    inlineEditId.value = null
    return
  }
  const currentTitle = postStore.getPostById(id)?.title
  if (trimmed !== currentTitle) {
    postStore.renamePost(id, trimmed)
    toast.success(t('post.editSuccess'))
  }
  inlineEditId.value = null
}

function cancelInlineRename() {
  inlineEditId.value = null
}
</script>

<template>
  <div v-for="post in props.sortedPosts.filter(p => (props.parentId == null && p.parentId == null) || p.parentId === props.parentId)" :key="post.id">
    <div
      class="post-item group relative flex w-full items-center gap-1 rounded-lg px-2 py-[7px] text-[13px] leading-snug transition-all duration-150 ease-out"
      :class="{
        'bg-accent text-accent-foreground font-medium active-item': !isSelectMode && currentPostId === post.id,
        'text-foreground/70 hover:text-foreground hover:bg-accent/50': isSelectMode ? true : currentPostId !== post.id,
        'opacity-30': drag.dragSourceId === post.id,
        'ring-1 ring-primary/40 ring-inset bg-primary/5': drag.dropTargetId === post.id,
      }"
      @drop.prevent="!isSelectMode && drag.handleDrop(post.id)"
      @dragover.stop.prevent="!isSelectMode && drag.setDropTargetId(post.id)"
      @dragleave.prevent="drag.setDropTargetId(null)"
    >
      <span
        v-if="!isSelectMode && currentPostId === post.id"
        class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary"
      />

      <div
        class="flex min-w-0 flex-1 cursor-pointer items-center gap-1"
        :draggable="!isSelectMode && inlineEditId !== post.id"
        @dragstart="!isSelectMode && handleDragStart(post.id, $event)"
        @dragend="drag.handleDragEnd"
        @click="handleRowClick(post.id)"
      >
        <span
          v-if="isSelectMode"
          class="flex shrink-0 items-center justify-center size-5"
          @click.stop="onToggleSelect?.(post.id)"
        >
          <span
            class="flex items-center justify-center size-4 rounded border transition-colors duration-150"
            :class="selectedIds?.includes(post.id)
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border bg-background'"
          >
            <svg v-if="selectedIds?.includes(post.id)" class="size-2.5" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </span>

        <button
          v-if="!isSelectMode"
          type="button"
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

        <input
          v-if="inlineEditId === post.id"
          :ref="setInlineInputRef"
          v-model="inlineEditVal"
          class="flex-1 min-w-0 bg-transparent outline-none border-b border-primary text-[13px] leading-snug"
          @click.stop
          @keyup.enter="commitInlineRename"
          @keyup.escape="cancelInlineRename"
          @blur="commitInlineRename"
        >
        <span
          v-else
          class="flex-1 truncate select-none"
          @dblclick.stop="startInlineRename(post)"
        >{{ post.title }}</span>
      </div>

      <DropdownMenu
        v-if="!isSelectMode"
        :open="openMenuKey === post.id"
        @update:open="(open) => onPostMenuOpenChange(post.id, open)"
      >
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="flex shrink-0 items-center justify-center size-6 rounded-md text-muted-foreground/40 transition-all duration-150 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 data-[state=open]:opacity-100 data-[state=open]:text-foreground"
            :class="isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
            @click.stop
          >
            <Ellipsis class="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          :align="isMobile ? 'end' : 'start'"
          v-bind="postDropdownProps"
        >
          <DropdownMenuItem @click.stop="actions.openAddPostDialog(post.id)">
            <PlusSquare class="mr-2 size-4" /> {{ t('post.addPost') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="actions.startRenamePost(post.id)">
            <Edit3 class="mr-2 size-4" /> {{ t('post.menuRename') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="duplicateSingle(post.id)">
            <Copy class="mr-2 size-4" /> {{ t('common.copy') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="actions.openHistoryDialog(post.id)">
            <History class="mr-2 size-4" /> {{ t('common.history') }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click.stop="downloadMD(post.content, post.title); closePostMenu()">
            <FileDown class="mr-2 size-4" /> {{ t('post.exportMd') }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click.stop="saveAsTemplate(post.id)">
            <Package class="mr-2 size-4" /> {{ t('post.saveAsTemplate') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="applyTemplate(post.id)">
            <FileInput class="mr-2 size-4" /> {{ t('post.applyTemplate') }}
          </DropdownMenuItem>
          <DropdownMenuSeparator v-if="posts.length > 1" />
          <DropdownMenuItem
            v-if="posts.length > 1"
            class="text-destructive focus:text-destructive"
            @click.stop="actions.startDelPost(post.id)"
          >
            <Trash2 class="mr-2 size-4" /> {{ t('common.delete') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div
      v-if="isHasChild(post.id) && !post.collapsed"
      class="ml-3 border-l border-border/40 pl-1.5 py-0.5"
    >
      <PostItem
        :parent-id="post.id"
        :sorted-posts="props.sortedPosts"
        :actions="actions"
        :drag="drag"
        :select="select"
      />
    </div>
  </div>
</template>
