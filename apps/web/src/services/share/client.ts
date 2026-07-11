import type { CreateShareRequest, CreateShareResponse, ListSharesResponse } from './types'
import type { AccountUser } from '@/services/account/types'
import { ApiError, MdApiClient } from '@/services/account/client'
import { isAccountConfigured, MD_API_URL } from '@/services/account/config'

export function isShareConfigured(): boolean {
  return isAccountConfigured()
}

/** Whether user has active Pro (share "My shares" and related features). */
export function isShareProUser(user: Pick<AccountUser, `plan` | `planExpiresAt`> | null | undefined): boolean {
  if (!user || user.plan !== `pro`)
    return false
  return user.planExpiresAt != null && user.planExpiresAt > Date.now()
}

/** Whether to show share entry in UI. */
export function isShareUiEnabled(): boolean {
  const flag = import.meta.env.VITE_SHARE_UI_ENABLED
  if (flag === `false` || flag === `0`)
    return false
  return isShareConfigured()
}

export function getSharePageUrl(id: string): string {
  return `${MD_API_URL}/s/${id}`
}

export class ShareClient extends MdApiClient {
  list(): Promise<ListSharesResponse> {
    return this.request<ListSharesResponse>(`GET`, `/share`)
  }

  create(payload: CreateShareRequest): Promise<CreateShareResponse> {
    return this.request<CreateShareResponse>(`POST`, `/share`, payload)
  }

  revoke(id: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>(`DELETE`, `/share/${id}`)
  }
}

export { ApiError as ShareApiError }
