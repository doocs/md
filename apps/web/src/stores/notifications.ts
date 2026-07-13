import type { NotificationItem } from '@/services/notifications/client'
import { isNotificationsConfigured, NotificationsClient } from '@/services/notifications/client'
import { useAuthStore } from '@/stores/auth'

export const useNotificationsStore = defineStore(`notifications`, () => {
  const authStore = useAuthStore()
  const items = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const fetched = ref(false)

  const client = computed(() => new NotificationsClient(() => authStore.token || null))

  function resetLocal() {
    items.value = []
    unreadCount.value = 0
    fetched.value = false
  }

  async function fetchOnce(): Promise<void> {
    if (!isNotificationsConfigured() || !authStore.isLoggedIn)
      return

    loading.value = true
    try {
      const [listRes, countRes] = await Promise.all([
        client.value.list({ page: 1, pageSize: 30 }),
        client.value.unreadCount(),
      ])
      items.value = listRes.items
      unreadCount.value = countRes.count
      fetched.value = true
    }
    catch {
      // Keep previous state on transient failures
    }
    finally {
      loading.value = false
    }
  }

  async function markRead(id: string): Promise<void> {
    const item = items.value.find(n => n.id === id)
    const wasUnread = item && item.readAt == null
    try {
      await client.value.markRead(id)
      if (item && item.readAt == null)
        item.readAt = Date.now()
      if (wasUnread && unreadCount.value > 0)
        unreadCount.value -= 1
    }
    catch { /* ignore */ }
  }

  async function markAllRead(): Promise<void> {
    try {
      await client.value.markAllRead()
      const now = Date.now()
      for (const item of items.value) {
        item.readAt ??= now
      }
      unreadCount.value = 0
    }
    catch { /* ignore */ }
  }

  async function clearAll(): Promise<void> {
    try {
      await client.value.clearAll()
      items.value = []
      unreadCount.value = 0
      fetched.value = true
    }
    catch { /* ignore */ }
  }

  return {
    items,
    unreadCount,
    loading,
    fetched,
    clear: resetLocal,
    fetchOnce,
    markRead,
    markAllRead,
    clearAll,
  }
})
