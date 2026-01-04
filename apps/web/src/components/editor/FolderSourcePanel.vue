<script setup lang="ts">
import {
  FolderClosed,
  FolderOpen,
  FolderPlus,
  FolderTree as FolderTreeIcon,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-vue-next'
import { useFolderFileSync } from '@/composables/useFolderFileSync'
import { useFolderSourceStore } from '@/stores/folderSource'
import { usePostStore } from '@/stores/post'
import FolderTree from './FolderTree.vue'

const folderSourceStore = useFolderSourceStore()
const postStore = usePostStore()
const { setCurrentFilePath } = useFolderFileSync()

const {
  currentFolderHandle,
  fileTree,
  selectedFilePath,
  isLoading,
  loadError,
  isFileSystemAPISupported,
} = storeToRefs(folderSourceStore)

const expandedPaths = ref<Set<string>>(new Set())

function handleToggleExpand(path: string) {
  if (expandedPaths.value.has(path)) {
    expandedPaths.value.delete(path)
  }
  else {
    expandedPaths.value.add(path)
  }
  // 触发响应式更新
  expandedPaths.value = new Set(expandedPaths.value)
}

async function handleSelectFolder() {
  await folderSourceStore.selectFolder()
  // 等待下一个 tick，确保 fileTree 已经更新
  await nextTick()
  // 展开根节点
  if (fileTree.value.length > 0) {
    expandedPaths.value.add(fileTree.value[0].path)
  }
}

async function handleRefreshFolder() {
  if (currentFolderHandle.value) {
    await folderSourceStore.loadFileTree(currentFolderHandle.value.handle)
  }
}

function handleCloseFolder() {
  folderSourceStore.closeFolder()
  expandedPaths.value.clear()
  setCurrentFilePath(null)
}

async function handleOpenFile(node: any) {
  try {
    const content = await folderSourceStore.readFile(node.path)
    // 从文件名中提取标题（移除 .md 扩展名）
    const title = node.name.replace(/\.md$/i, ``)

    // 创建新文章并设置内容
    postStore.addPost(title)
    postStore.updatePostContent(postStore.currentPostId, content)

    // 记录当前文件路径以便自动同步
    setCurrentFilePath(node.path)

    toast.success(`已加载文件: ${node.name}`)
  }
  catch (error) {
    console.error(`打开文件失败:`, error)
  }
}
</script>

<template>
  <div class="folder-source-panel h-full flex flex-col">
    <!-- 头部工具栏 -->
    <div class="panel-header sticky top-0 z-10 bg-background border-b p-2">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold flex items-center gap-2">
          <FolderTreeIcon class="h-4 w-4" />
          本地文件夹
        </h3>
        <Button
          v-if="currentFolderHandle"
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0"
          @click="handleCloseFolder"
        >
          <X class="h-3 w-3" />
        </Button>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          class="flex-1 text-xs"
          :disabled="isLoading || !isFileSystemAPISupported"
          @click="handleSelectFolder"
        >
          <FolderPlus v-if="!isLoading" class="h-3 w-3 mr-1" />
          <Loader2 v-else class="h-3 w-3 mr-1 animate-spin" />
          打开文件夹
        </Button>

        <Button
          v-if="currentFolderHandle"
          variant="outline"
          size="sm"
          class="text-xs"
          :disabled="isLoading"
          @click="handleRefreshFolder"
        >
          <RefreshCw class="h-3 w-3" :class="{ 'animate-spin': isLoading }" />
        </Button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="panel-content flex-1 overflow-y-auto p-2">
      <!-- 不支持 API 的提示 -->
      <div
        v-if="!isFileSystemAPISupported"
        class="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground"
      >
        <FolderClosed class="h-12 w-12 mb-2 opacity-50" />
        <p class="text-sm">
          您的浏览器不支持本地文件夹访问
        </p>
        <p class="text-xs mt-1">
          请使用 Chrome、Edge 或 Opera 浏览器
        </p>
      </div>

      <!-- 加载中 -->
      <div
        v-else-if="isLoading"
        class="flex flex-col items-center justify-center h-full"
      >
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
        <p class="text-sm text-muted-foreground mt-2">
          加载中...
        </p>
      </div>

      <!-- 错误提示 -->
      <div
        v-else-if="loadError"
        class="flex flex-col items-center justify-center h-full text-center p-4 text-destructive"
      >
        <p class="text-sm">
          {{ loadError }}
        </p>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!currentFolderHandle"
        class="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground"
      >
        <FolderOpen class="h-12 w-12 mb-2 opacity-50" />
        <p class="text-sm">
          未打开文件夹
        </p>
        <p class="text-xs mt-1">
          点击上方按钮打开本地文件夹
        </p>
      </div>

      <!-- 文件树 -->
      <div v-else class="file-tree-container">
        <div class="text-xs text-muted-foreground mb-2 px-2">
          {{ currentFolderHandle.name }}
        </div>
        <FolderTree
          :nodes="fileTree"
          :selected-path="selectedFilePath"
          :expanded-paths="expandedPaths"
          @select="handleOpenFile"
          @toggle-expand="handleToggleExpand"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-source-panel {
  background-color: hsl(var(--background));
}

.panel-header {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.panel-content {
  min-height: 0;
}

.file-tree-container {
  min-height: 100%;
}
</style>
