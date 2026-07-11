import type { ActivateProResponse, PullResponse, PushRequest, PushResponse } from './types'
import { MdApiClient } from '@/services/account/client'
import { isAccountConfigured } from '@/services/account/config'

/** Afdian creator page URL for Pro upgrade. */
export const AFDIAN_PAGE_URL = (import.meta.env.VITE_AFDIAN_PAGE_URL ?? ``).replace(/\/$/, ``)

export function isSyncConfigured(): boolean {
  return isAccountConfigured()
}

/** Whether to show cloud sync entry in UI. */
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
