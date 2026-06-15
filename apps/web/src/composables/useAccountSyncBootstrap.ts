import { isAccountConfigured } from '@/services/account/config'
import { isSyncUiEnabled } from '@/services/sync/client'

/** 初始化账户与云同步（需在 Pinia 就绪后调用） */
export function useAccountSyncBootstrap() {
  const authStore = useAuthStore()
  const syncStore = useSyncStore()

  onMounted(async () => {
    if (isAccountConfigured())
      await authStore.bootstrap()

    if (!isSyncUiEnabled() || !authStore.isLoggedIn)
      return

    syncStore.startAutoSyncWatcher()
    void syncStore.sync()
  })
}
