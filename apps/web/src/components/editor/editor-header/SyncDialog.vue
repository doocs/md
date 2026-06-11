<script setup lang="ts">
import { Cloud, Loader2, LogIn, LogOut, RefreshCw } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSyncStore } from '@/stores/sync'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

const authStore = useAuthStore()
const syncStore = useSyncStore()

const { user, isConfigured, isLoggedIn } = storeToRefs(authStore)
const { status, lastError, lastSyncAt, autoSyncEnabled, needsRefresh, isSyncing } = storeToRefs(syncStore)

const lastSyncText = computed(() => {
  if (!lastSyncAt.value)
    return `从未同步`
  return new Date(lastSyncAt.value).toLocaleString(`zh-cn`)
})

function onUpdate(val: boolean) {
  if (!val)
    emit(`close`)
}

function handleLogin() {
  authStore.login()
}

function handleLogout() {
  authStore.logout()
  syncStore.reset()
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
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Cloud class="size-5" />
          云同步
        </DialogTitle>
        <DialogDescription>
          多设备同步文章与设置，不含密钥。
        </DialogDescription>
      </DialogHeader>

      <!-- 未配置后端 -->
      <div v-if="!isConfigured" class="text-muted-foreground py-6 text-center text-sm">
        云同步服务未配置（缺少 <code>VITE_SYNC_API_URL</code>），请联系部署方启用。
      </div>

      <!-- 未登录 -->
      <div v-else-if="!isLoggedIn" class="flex flex-col items-center gap-4 py-6">
        <p class="text-muted-foreground text-sm">
          登录后即可开启云同步
        </p>
        <Button class="gap-2" @click="handleLogin">
          <LogIn class="size-4" />
          使用 GitHub 登录
        </Button>
      </div>

      <!-- 已登录 -->
      <div v-else class="space-y-4 py-2">
        <div class="flex items-center gap-3">
          <img
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user?.login"
            class="size-10 rounded-full"
          >
          <div class="flex-1">
            <div class="text-sm font-medium">
              {{ user?.name || user?.login }}
            </div>
            <div class="text-muted-foreground text-xs">
              上次同步：{{ lastSyncText }}
            </div>
          </div>
          <Button variant="ghost" size="icon" title="退出登录" @click="handleLogout">
            <LogOut class="size-4" />
          </Button>
        </div>

        <div class="flex items-center justify-between">
          <Label for="auto-sync" class="text-sm">自动同步</Label>
          <Switch id="auto-sync" v-model="autoSyncEnabled" />
        </div>

        <div v-if="needsRefresh" class="bg-muted text-muted-foreground flex items-center justify-between gap-2 rounded-md p-2 text-xs">
          <span>部分设置已从云端更新，刷新后生效</span>
          <Button size="sm" variant="outline" @click="handleReload">
            刷新
          </Button>
        </div>

        <Button class="w-full gap-2" :disabled="isSyncing" @click="handleSync">
          <Loader2 v-if="isSyncing" class="size-4 animate-spin" />
          <RefreshCw v-else class="size-4" />
          {{ isSyncing ? '同步中…' : '立即同步' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
