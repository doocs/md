import { isAccountConfigured } from '@/services/account/config'
import { isSyncUiEnabled } from '@/services/sync/client'
import { useNotificationsStore } from '@/stores/notifications'

/** Bootstrap account and cloud sync (call after Pinia is ready). */
export function useAccountSyncBootstrap() {
  const authStore = useAuthStore()
  const syncStore = useSyncStore()
  const notificationsStore = useNotificationsStore()
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

  async function ensureNotifications(): Promise<void> {
    if (!authStore.isLoggedIn) {
      notificationsStore.clear()
      return
    }
    await notificationsStore.fetchOnce()
  }

  onMounted(async () => {
    if (isAccountConfigured())
      await authStore.bootstrap()

    await ensureCloudSync()
    await ensureNotifications()
  })

  watch(() => authStore.isLoggedIn, (loggedIn) => {
    if (loggedIn) {
      void ensureCloudSync()
      void ensureNotifications()
    }
    else {
      notificationsStore.clear()
    }
  })
}
