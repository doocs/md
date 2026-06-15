import type { ActivateProResponse, PullResponse, PushRequest, PushResponse } from './types'
import { MdApiClient } from '@/services/account/client'
import { isAccountConfigured } from '@/services/account/config'

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
