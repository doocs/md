<script setup lang="ts">
import type { FileSystemNode } from '@/stores/folderSource'
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from 'lucide-vue-next'

interface Props {
  nodes: FileSystemNode[]
  selectedPath?: string
  expandedPaths?: Set<string>
  level?: number
}

interface Emits {
  (e: 'select', node: FileSystemNode): void
  (e: 'toggleExpand', path: string): void
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  expandedPaths: () => new Set<string>(),
})

const emit = defineEmits<Emits>()

const isSelected = (path: string) => props.selectedPath === path

const isExpanded = (path: string) => props.expandedPaths.has(path)

function handleNodeClick(node: FileSystemNode, event: MouseEvent) {
  event.stopPropagation()
  if (node.type === `file`) {
    emit(`select`, node)
  }
  else {
    emit(`toggleExpand`, node.path)
  }
}

function handleToggleClick(node: FileSystemNode, event: MouseEvent) {
  event.stopPropagation()
  if (node.type === `directory`) {
    emit(`toggleExpand`, node.path)
  }
}
</script>

<template>
  <div class="folder-tree">
    <template v-for="node in nodes" :key="node.path">
      <!-- 节点本身 -->
      <div
        class="tree-node"
        :class="{
          selected: isSelected(node.path),
          directory: node.type === 'directory',
          file: node.type === 'file',
        }"
        :style="{ paddingLeft: `${level * 16 + 8}px` }"
        @click="handleNodeClick(node, $event)"
      >
        <!-- 展开/折叠图标 -->
        <span
          v-if="node.type === 'directory'"
          class="toggle-icon"
          @click="handleToggleClick(node, $event)"
        >
          <ChevronRight v-if="!isExpanded(node.path)" class="h-4 w-4" />
          <ChevronDown v-else class="h-4 w-4" />
        </span>
        <span v-else class="toggle-icon-placeholder" />

        <!-- 文件/文件夹图标 -->
        <span class="node-icon">
          <Folder v-if="node.type === 'directory' && !isExpanded(node.path)" class="h-4 w-4" />
          <FolderOpen v-else-if="node.type === 'directory' && isExpanded(node.path)" class="h-4 w-4" />
          <File v-else class="h-4 w-4" />
        </span>

        <!-- 节点名称 -->
        <span class="node-name" :title="node.name">
          {{ node.name }}
        </span>
      </div>

      <!-- 递归渲染子节点（紧接在父节点之后） -->
      <FolderTree
        v-if="node.type === 'directory' && isExpanded(node.path) && node.children"
        :nodes="node.children"
        :selected-path="selectedPath"
        :expanded-paths="expandedPaths"
        :level="level + 1"
        @select="emit('select', $event)"
        @toggle-expand="emit('toggleExpand', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.folder-tree {
  user-select: none;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node:hover {
  background-color: hsl(var(--accent) / 0.1);
}

.tree-node.selected {
  background-color: hsl(var(--accent) / 0.2);
  font-weight: 500;
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.toggle-icon-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.node-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: hsl(var(--muted-foreground));
}

.tree-node.selected .node-icon {
  color: hsl(var(--primary));
}

.node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node.directory .node-name {
  font-weight: 500;
}
</style>
