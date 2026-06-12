import type { CreateShareRequest, CreateShareResponse } from './types'
import { ApiError, MdApiClient } from '@/services/account/client'
import { isAccountConfigured, MD_API_URL } from '@/services/account/config'

export function isShareConfigured(): boolean {
  return isAccountConfigured()
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
  create(payload: CreateShareRequest): Promise<CreateShareResponse> {
    return this.request<CreateShareResponse>(`POST`, `/share`, payload)
  }
}

export { ApiError as ShareApiError }
