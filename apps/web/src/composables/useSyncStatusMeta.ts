import type { Component } from 'vue'
import { AlertCircle, CloudCheck, CloudOff, Loader2 } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useSyncStore } from '@/stores/sync'

export type SyncUiState = `syncing` | `synced` | `error` | `pending`

export interface SyncStatusMeta {
  label: string
  hint: string
  dotClass: string
  icon: Component
  iconClass: string
  footerIconClass: string
}

function buildSyncStatusMeta(
  state: SyncUiState,
  lastError: string | null,
  errorHint: `detail` | `generic`,
): SyncStatusMeta {
  switch (state) {
    case `syncing`:
      return {
        label: `同步中`,
        hint: `正在与云端交换数据…`,
        dotClass: `bg-primary animate-pulse`,
        icon: Loader2,
        iconClass: `text-primary animate-spin`,
        footerIconClass: `text-primary animate-spin`,
      }
    case `synced`:
      return {
        label: `已同步`,
        hint: `本地内容与云端一致`,
        dotClass: `bg-green-500`,
        icon: CloudCheck,
        iconClass: `text-green-600 dark:text-green-400`,
        footerIconClass: `text-green-500`,
      }
    case `error`:
      return {
        label: `同步失败`,
        hint: errorHint === `generic`
          ? `同步失败，请查看下方详情`
          : (lastError || `请稍后重试`),
        dotClass: `bg-destructive`,
        icon: AlertCircle,
        iconClass: `text-destructive`,
        footerIconClass: `text-destructive`,
      }
    default:
      return {
        label: `待同步`,
        hint: `本地有未上传的更改`,
        dotClass: `bg-amber-500`,
        icon: CloudOff,
        iconClass: `text-amber-600 dark:text-amber-400`,
        footerIconClass: `text-amber-500`,
      }
  }
}

export function useSyncStatusMeta(options?: { errorHint?: `detail` | `generic` }) {
  const syncStore = useSyncStore()
  const { syncState, lastError, isSyncing } = storeToRefs(syncStore)
  const errorHint = options?.errorHint ?? `detail`

  const syncStatusMeta = computed(() =>
    buildSyncStatusMeta(syncState.value, lastError.value, errorHint),
  )

  const syncTooltip = computed(() => {
    switch (syncState.value) {
      case `syncing`:
        return `同步中…`
      case `synced`:
        return `已同步`
      case `error`:
        return `同步失败，点击重试`
      default:
        return `有未同步的更改`
    }
  })

  return {
    syncState,
    lastError,
    isSyncing,
    syncStatusMeta,
    syncTooltip,
  }
}
