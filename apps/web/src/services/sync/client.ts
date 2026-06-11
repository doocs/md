import type { ActivateProResponse, PullResponse, PushRequest, PushResponse } from './types'
import { ApiError, MdApiClient } from '@/services/account/client'
import { isAccountConfigured, MD_API_URL } from '@/services/account/config'

/** @deprecated 使用 MD_API_URL */
export const SYNC_API_URL = MD_API_URL

/** 爱发电创作者主页，用于 Pro 升级跳转 */
export const AFDIAN_PAGE_URL = (import.meta.env.VITE_AFDIAN_PAGE_URL ?? ``).replace(/\/$/, ``)

export function isSyncConfigured(): boolean {
  return isAccountConfigured()
}

/** 是否在 UI 中展示云同步入口 */
export function isSyncUiEnabled(): boolean {
  const flag = import.meta.env.VITE_SYNC_UI_ENABLED
  if (flag === `false` || flag === `0`)
    return false
  return isSyncConfigured()
}

/** @deprecated 使用 ApiError */
export { ApiError as SyncApiError }

export class SyncClient extends MdApiClient {
  pull(since: number): Promise<PullResponse> {
    return this.request<PullResponse>(`GET`, `/sync/pull?since=${since}`)
  }

  push(payload: PushRequest): Promise<PushResponse> {
    return this.request<PushResponse>(`POST`, `/sync/push`, payload)
  }

  activatePro(orderNo: string): Promise<ActivateProResponse> {
    return this.request<ActivateProResponse>(`POST`, `/sync/activate`, { orderNo })
  }
}
