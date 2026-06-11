<script setup lang="ts">
import { Cloud, Info, Loader2, LogIn, RefreshCw } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { isSyncConfigured } from '@/services/sync/client'
import { useAuthStore } from '@/stores/auth'
import { useSyncStore } from '@/stores/sync'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

const authStore = useAuthStore()
const syncStore = useSyncStore()
const uiStore = useUIStore()

const { isLoggedIn } = storeToRefs(authStore)
const { status, lastError, lastSyncAt, needsRefresh, isSyncing } = storeToRefs(syncStore)

const lastSyncText = computed(() => {
  if (!lastSyncAt.value)
    return `从未同步`
  return new Date(lastSyncAt.value).toLocaleString(`zh-cn`)
})

function onUpdate(val: boolean) {
  if (!val)
    emit(`close`)
}

function openAccountDialog() {
  emit(`close`)
  uiStore.toggleShowAccountDialog(true)
}

async function handleSync() {
  await syncStore.sync()
  if (status.value === `error`)
    toast.error(`同步失败：${lastError.value}`)
  else
    toast.success(`同步完成`)
}

function handleReload() {
  window.location.reload()
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent class="max-w-md gap-0 p-0">
      <DialogHeader class="space-y-1.5 border-b px-6 py-4">
        <DialogTitle class="flex items-center gap-2">
          <Cloud class="size-5" />
          云同步
        </DialogTitle>
        <DialogDescription>
          多设备同步文章与设置，不含密钥。
        </DialogDescription>
      </DialogHeader>

      <div v-if="!isSyncConfigured()" class="text-muted-foreground px-6 py-8 text-center text-sm">
        云同步服务未配置，请联系部署方启用。
      </div>

      <div v-else-if="!isLoggedIn" class="flex flex-col items-center gap-4 px-6 py-8">
        <p class="text-muted-foreground text-sm">
          请先登录账户
        </p>
        <Button class="gap-2" @click="openAccountDialog">
          <LogIn class="size-4" />
          前往登录
        </Button>
      </div>

      <div v-else class="space-y-4 px-6 py-4">
        <div class="text-muted-foreground rounded-lg border px-3 py-2 text-xs">
          上次同步：{{ lastSyncText }}
        </div>

        <Alert v-if="needsRefresh" class="py-2.5">
          <Info class="size-4" />
          <AlertDescription class="flex items-center justify-between gap-2 text-xs">
            <span>部分设置已从云端更新，刷新后生效</span>
            <Button size="sm" variant="outline" @click="handleReload">
              刷新
            </Button>
          </AlertDescription>
        </Alert>

        <Button class="w-full gap-2" :disabled="isSyncing" @click="handleSync">
          <Loader2 v-if="isSyncing" class="size-4 animate-spin" />
          <RefreshCw v-else class="size-4" />
          {{ isSyncing ? '同步中…' : '手动同步' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
