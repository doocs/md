import type { CreateShareRequest, CreateShareResponse, ListSharesResponse } from './types'
import type { AccountUser } from '@/services/account/types'
import { ApiError, MdApiClient } from '@/services/account/client'
import { isAccountConfigured, MD_API_URL } from '@/services/account/config'

export function isShareConfigured(): boolean {
  return isAccountConfigured()
}

/** 是否为有效 Pro 用户（分享「我的分享」等 Pro 能力） */
export function isShareProUser(user: Pick<AccountUser, `plan` | `planExpiresAt`> | null | undefined): boolean {
  if (!user || user.plan !== `pro`)
    return false
  return user.planExpiresAt != null && user.planExpiresAt > Date.now()
}

/** 是否在 UI 中展示分享入口 */
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
