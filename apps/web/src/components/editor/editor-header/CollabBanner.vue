<script setup lang="ts">
import { Loader2, Users, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'

const collabStore = useCollabStore()
const uiStore = useUIStore()

const { isCollabMode, role, document, isReadOnly, status, lastError } = storeToRefs(collabStore)

const roleLabel: Record<string, string> = {
  owner: `所有者`,
  editor: `编辑者`,
  viewer: `查看者`,
}

function openManage() {
  uiStore.toggleShowCollabDialog(true)
}

async function handleExit() {
  await collabStore.exitCollab()
  toast.success(`已退出协作`)
}
</script>

<template>
  <div
    v-if="isCollabMode"
    class="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2 text-sm"
  >
    <div class="flex min-w-0 flex-1 items-center gap-2">
      <Users class="size-4 shrink-0 text-primary" />
      <span class="truncate font-medium">
        协作中：{{ document?.title?.trim() || '无标题' }}
      </span>
      <span class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
        {{ roleLabel[role ?? ''] ?? role }}
        <template v-if="isReadOnly"> · 只读</template>
      </span>
      <Loader2 v-if="status === 'syncing'" class="size-3.5 animate-spin text-muted-foreground" />
      <span v-else-if="status === 'error'" class="text-xs text-destructive" :title="lastError">
        同步失败
      </span>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <Button size="sm" variant="outline" @click="openManage">
        管理
      </Button>
      <Button size="sm" variant="ghost" @click="handleExit">
        <X class="mr-1 size-3.5" />
        退出
      </Button>
    </div>
  </div>
</template>
