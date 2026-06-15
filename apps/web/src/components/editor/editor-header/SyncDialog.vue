<script setup lang="ts">
import { AlertCircle, Cloud, CloudOff, Loader2, LogIn, RefreshCw } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import CloudPanelCard from '@/components/editor/editor-header/cloud-panel/CloudPanelCard.vue'
import CloudPanelDialog from '@/components/editor/editor-header/cloud-panel/CloudPanelDialog.vue'
import CloudPanelState from '@/components/editor/editor-header/cloud-panel/CloudPanelState.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useSyncStatusMeta } from '@/composables/useSyncStatusMeta'
import { isSyncConfigured } from '@/services/sync/client'
import { useAuthStore } from '@/stores/auth'
import { useSyncStore } from '@/stores/sync'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const authStore = useAuthStore()
const syncStore = useSyncStore()
const uiStore = useUIStore()

const { isLoggedIn } = storeToRefs(authStore)
const { status, lastError, lastSyncAt, isSyncing, syncState } = storeToRefs(syncStore)
const { syncStatusMeta } = useSyncStatusMeta({ errorHint: `generic` })

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
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

function openAccountDialog() {
  dialogOpen.value = false
  uiStore.toggleShowAccountDialog(true)
}

async function handleSync() {
  await syncStore.sync()
  if (status.value === `error`)
    toast.error(`同步失败：${lastError.value}`)
  else
    toast.success(`同步完成`)
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
      action-label="登录"
      :action-icon="LogIn"
      @action="openAccountDialog"
    />

    <div v-else class="space-y-4 px-4 py-4 sm:px-6">
      <CloudPanelCard>
        <template #leading>
          <div
            class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border/60"
          >
            <component
              :is="syncStatusMeta.icon"
              class="size-4"
              :class="syncStatusMeta.iconClass"
            />
          </div>
        </template>

        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 text-sm font-medium">
              <span class="size-2 rounded-full" :class="syncStatusMeta.dotClass" />
              {{ syncStatusMeta.label }}
            </span>
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground">
            {{ syncStatusMeta.hint }}
          </p>
          <p class="text-xs tabular-nums text-muted-foreground/80">
            上次同步：{{ lastSyncText }}
          </p>
        </div>
      </CloudPanelCard>

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
