<script setup lang="ts">
import { AlertCircle, Cloud, CloudOff, Loader2, LogIn, RefreshCw } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import CloudFeatureState from '@/components/editor/editor-header/cloud/CloudFeatureState.vue'
import PanelCard from '@/components/shared/panel-dialog/PanelCard.vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useSyncStatusMeta } from '@/composables/useSyncStatusMeta'
import { isSyncConfigured } from '@/services/sync/client'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { useSyncStore } from '@/stores/sync'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t } = useI18n()
const authStore = useAuthStore()
const syncStore = useSyncStore()
const uiStore = useUIStore()
const localeStore = useLocaleStore()

const { isLoggedIn } = storeToRefs(authStore)
const { status, lastError, lastSyncAt, isSyncing, syncState } = storeToRefs(syncStore)
const { locale } = storeToRefs(localeStore)
const { syncStatusMeta } = useSyncStatusMeta({ errorHint: `generic` })

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})

const lastSyncText = computed(() => {
  if (!lastSyncAt.value)
    return t(`sync.neverSynced`)
  return new Date(lastSyncAt.value).toLocaleString(locale.value, {
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
    toast.error(t(`sync.syncFailed`, { message: lastError.value }))
  else
    toast.success(t(`sync.syncSuccess`))
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('sync.title')"
    :description="t('sync.description')"
    :icon="Cloud"
  >
    <CloudFeatureState
      v-if="!isSyncConfigured()"
      :icon="CloudOff"
      :title="t('sync.notConfiguredTitle')"
      :description="t('sync.notConfiguredDescription')"
      compact
    />

    <CloudFeatureState
      v-else-if="!isLoggedIn"
      :icon="Cloud"
      :title="t('sync.loginTitle')"
      :action-label="t('common.login')"
      :action-icon="LogIn"
      @action="openAccountDialog"
    />

    <div v-else class="space-y-4 px-4 py-4 sm:px-6">
      <PanelCard>
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
            {{ t('sync.lastSync', { time: lastSyncText }) }}
          </p>
        </div>
      </PanelCard>

      <Alert v-if="syncState === 'error' && lastError" variant="destructive" class="py-3">
        <AlertCircle class="size-4" />
        <AlertDescription class="text-xs leading-relaxed">
          {{ lastError }}
        </AlertDescription>
      </Alert>

      <Button class="h-10 w-full gap-2" :disabled="isSyncing" @click="handleSync">
        <Loader2 v-if="isSyncing" class="size-4 animate-spin" />
        <RefreshCw v-else class="size-4" />
        {{ isSyncing ? t('sync.syncing') : t('sync.syncNow') }}
      </Button>
    </div>
  </PanelDialog>
</template>
