<script setup lang="ts">
import { AlertCircle, Cloud, CloudCheck, CloudOff, Info, Loader2, LogIn, RefreshCw } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import CloudPanelDialog from '@/components/editor/editor-header/cloud-panel/CloudPanelDialog.vue'
import CloudPanelState from '@/components/editor/editor-header/cloud-panel/CloudPanelState.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
const { status, lastError, lastSyncAt, needsRefresh, isSyncing, syncState } = storeToRefs(syncStore)

const dialogOpen = computed({
  get: () => props.visible,
  set: (val: boolean) => {
    if (!val)
      emit(`close`)
  },
})

const lastSyncText = computed(() => {
  if (!lastSyncAt.value)
    return `从未同步`
  return new Date(lastSyncAt.value).toLocaleString(`zh-CN`, {
    month: `short`,
    day: `numeric`,
    hour: `2-digit`,
    minute: `2-digit`,
  })
})

const syncStatusMeta = computed(() => {
  switch (syncState.value) {
    case `syncing`:
      return {
        label: `同步中`,
        hint: `正在与云端交换数据…`,
        dotClass: `bg-primary animate-pulse`,
        icon: Loader2,
        iconClass: `text-primary animate-spin`,
      }
    case `synced`:
      return {
        label: `已同步`,
        hint: `本地内容与云端一致`,
        dotClass: `bg-green-500`,
        icon: CloudCheck,
        iconClass: `text-green-600 dark:text-green-400`,
      }
    case `error`:
      return {
        label: `同步失败`,
        hint: lastError.value || `请稍后重试`,
        dotClass: `bg-destructive`,
        icon: AlertCircle,
        iconClass: `text-destructive`,
      }
    default:
      return {
        label: `待同步`,
        hint: `本地有未上传的更改`,
        dotClass: `bg-amber-500`,
        icon: CloudOff,
        iconClass: `text-amber-600 dark:text-amber-400`,
      }
  }
})

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
  <CloudPanelDialog
    v-model:open="dialogOpen"
    title="云同步"
    description="多设备同步文章与设置，不含密钥与图床凭证。"
    :icon="Cloud"
  >
    <CloudPanelState
      v-if="!isSyncConfigured()"
      :icon="CloudOff"
      title="云同步未启用"
      description="当前部署未配置同步服务，请联系部署方启用后再试。"
      compact
    />

    <CloudPanelState
      v-else-if="!isLoggedIn"
      :icon="Cloud"
      title="登录后开启云同步"
      description="账户登录后，可将文章与编辑器设置安全同步到云端，并在多设备间保持一致。"
      action-label="前往登录"
      :action-icon="LogIn"
      @action="openAccountDialog"
    />

    <div v-else class="space-y-4 px-4 py-4 sm:px-6">
      <div class="flex items-start gap-3 rounded-xl border bg-muted/20 p-3.5 sm:p-4">
        <div
          class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border/60"
        >
          <component
            :is="syncStatusMeta.icon"
            class="size-4"
            :class="syncStatusMeta.iconClass"
          />
        </div>
        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 text-sm font-medium">
              <span class="size-2 rounded-full" :class="syncStatusMeta.dotClass" />
              {{ syncStatusMeta.label }}
            </span>
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground">
            {{ syncStatusMeta.hint }}
          </p>
        </div>
      </div>

      <div class="grid gap-2 rounded-xl border px-3.5 py-3 text-xs sm:px-4">
        <div class="flex items-center justify-between gap-3">
          <span class="text-muted-foreground">上次同步</span>
          <span class="font-medium tabular-nums">{{ lastSyncText }}</span>
        </div>
        <div class="flex items-center justify-between gap-3">
          <span class="text-muted-foreground">同步范围</span>
          <span class="text-right">文章、编辑器设置</span>
        </div>
      </div>

      <div
        v-if="needsRefresh"
        class="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
      >
        <div class="flex min-w-0 items-start gap-2.5">
          <Info class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p class="text-xs leading-relaxed text-muted-foreground">
            部分设置已从云端更新，刷新页面后生效
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          class="h-8 w-full shrink-0 sm:w-auto"
          @click="handleReload"
        >
          刷新页面
        </Button>
      </div>

      <Alert v-if="syncState === 'error' && lastError" variant="destructive" class="py-3">
        <AlertCircle class="size-4" />
        <AlertDescription class="text-xs leading-relaxed">
          {{ lastError }}
        </AlertDescription>
      </Alert>
    </div>

    <template v-if="isSyncConfigured() && isLoggedIn" #footer>
      <div class="border-t px-4 py-4 sm:px-6">
        <Button class="h-10 w-full gap-2" :disabled="isSyncing" @click="handleSync">
          <Loader2 v-if="isSyncing" class="size-4 animate-spin" />
          <RefreshCw v-else class="size-4" />
          {{ isSyncing ? '同步中…' : '立即同步' }}
        </Button>
      </div>
    </template>
  </CloudPanelDialog>
</template>
