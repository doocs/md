import { isAccountConfigured } from '@/services/account/config'
import { isSyncUiEnabled } from '@/services/sync/client'

/** Bootstrap account and cloud sync (call after Pinia is ready). */
export function useAccountSyncBootstrap() {
  const authStore = useAuthStore()
  const syncStore = useSyncStore()
  let cloudSyncReady = false

  async function ensureCloudSync(): Promise<void> {
    if (!isSyncUiEnabled() || !authStore.isLoggedIn)
      return

    if (!cloudSyncReady) {
      syncStore.startAutoSyncWatcher()
      cloudSyncReady = true
    }
    void syncStore.sync()
  }

  onMounted(async () => {
    if (isAccountConfigured())
      await authStore.bootstrap()

    await ensureCloudSync()
  })

  watch(() => authStore.isLoggedIn, (loggedIn) => {
    if (loggedIn)
      void ensureCloudSync()
  })
}
