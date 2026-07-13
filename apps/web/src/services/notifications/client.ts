import { MdApiClient } from '@/services/account/client'
import { isAccountConfigured } from '@/services/account/config'

export type NotificationType
  = `marketplace_pending`
    | `marketplace_approved`
    | `marketplace_rejected`

export interface NotificationPayload {
  itemId: string
  itemType: `theme` | `component`
  name: string
  slug: string
  rejectReason?: string | null
}

export interface NotificationItem {
  id: string
  type: NotificationType
  payload: NotificationPayload
  readAt: number | null
  createdAt: number
}

export interface NotificationListResponse {
  items: NotificationItem[]
  total: number
  page: number
  pageSize: number
}

export function isNotificationsConfigured(): boolean {
  return isAccountConfigured()
}

export class NotificationsClient extends MdApiClient {
  list(params: { page?: number, pageSize?: number } = {}): Promise<NotificationListResponse> {
    const q = new URLSearchParams()
    if (params.page)
      q.set(`page`, String(params.page))
    if (params.pageSize)
      q.set(`pageSize`, String(params.pageSize))
    const qs = q.toString()
    return this.request<NotificationListResponse>(`GET`, `/notifications${qs ? `?${qs}` : ``}`)
  }

  unreadCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>(`GET`, `/notifications/unread-count`)
  }

  markRead(id: string): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(`POST`, `/notifications/${encodeURIComponent(id)}/read`)
  }

  markAllRead(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(`POST`, `/notifications/read-all`)
  }

  clearAll(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(`DELETE`, `/notifications`)
  }
}
