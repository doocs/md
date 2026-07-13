import type {
  MarketplaceItemDetail,
  MarketplaceItemType,
  MarketplaceListParams,
  MarketplaceListResponse,
  MyMarketplaceResponse,
  PublishComponentPayload,
  PublishThemePayload,
  UpdateMarketplacePayload,
} from './types'
import { t } from '@/i18n/translate'
import { ApiError, MdApiClient } from '@/services/account/client'
import { isAccountConfigured } from '@/services/account/config'

export function isMarketplaceConfigured(): boolean {
  return isAccountConfigured()
}

export function isMarketplaceUiEnabled(): boolean {
  const flag = import.meta.env.VITE_MARKETPLACE_UI_ENABLED
  if (flag === `false` || flag === `0`)
    return false
  return isMarketplaceConfigured()
}

/** Map API error codes to localized user-facing messages. */
export function getMarketplaceErrorMessage(error: unknown, fallbackKey = `marketplace.publishFailed`): string {
  if (error instanceof ApiError) {
    switch (error.message) {
      case `slug_taken`:
        return t(`marketplace.validation.slugTaken`)
      case `rate_limited`: {
        const limit = typeof error.body?.limit === `number` ? error.body.limit : null
        return limit != null
          ? t(`marketplace.validation.rateLimitedWithLimit`, { limit })
          : t(`marketplace.validation.rateLimited`)
      }
      case `unauthorized`:
      case `invalid_token`:
        return t(`marketplace.validation.unauthorized`)
      case `forbidden`:
        return t(`marketplace.validation.forbidden`)
      case `payload_too_large`:
        return t(`marketplace.validation.payloadTooLarge`)
      case `css_import_forbidden`:
      case `css_external_url_forbidden`:
        return t(`marketplace.validation.cssUnsafe`)
      case `unsafe_component_template`:
        return t(`marketplace.validation.templateUnsafe`)
      case `invalid_slug`:
        return t(`marketplace.validation.slugInvalid`)
      case `invalid_name`:
        return t(`marketplace.validation.nameRequired`)
      case `invalid_css`:
        return t(`marketplace.validation.cssRequired`)
      case `invalid_component_name`:
        return t(`marketplace.validation.componentNameInvalid`)
      case `invalid_component_template`:
        return t(`marketplace.validation.templateRequired`)
      case `invalid_version`:
        return t(`marketplace.validation.versionInvalid`)
      case `version_not_increased`:
        return t(`marketplace.validation.versionNotIncreased`)
      case `version_required`:
        return t(`marketplace.validation.versionRequired`)
      default:
        if (error.message && error.message !== `Conflict` && error.message !== `Bad Request`)
          return error.message
    }
  }
  return t(fallbackKey)
}

export function getMarketplaceErrorCode(error: unknown): string | null {
  if (error instanceof ApiError && typeof error.message === `string`)
    return error.message
  return null
}

function toQuery(params: MarketplaceListParams = {}): string {
  const search = new URLSearchParams()
  if (params.q)
    search.set(`q`, params.q)
  if (params.sort)
    search.set(`sort`, params.sort)
  if (params.page)
    search.set(`page`, String(params.page))
  if (params.pageSize)
    search.set(`pageSize`, String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ``
}

export class MarketplaceClient extends MdApiClient {
  listThemes(params?: MarketplaceListParams): Promise<MarketplaceListResponse> {
    return this.request<MarketplaceListResponse>(`GET`, `/marketplace/themes${toQuery(params)}`)
  }

  listComponents(params?: MarketplaceListParams): Promise<MarketplaceListResponse> {
    return this.request<MarketplaceListResponse>(`GET`, `/marketplace/components${toQuery(params)}`)
  }

  get(id: string): Promise<MarketplaceItemDetail> {
    return this.request<MarketplaceItemDetail>(`GET`, `/marketplace/${id}`)
  }

  install(id: string): Promise<MarketplaceItemDetail> {
    return this.request<MarketplaceItemDetail>(`POST`, `/marketplace/${id}/install`)
  }

  listMine(): Promise<MyMarketplaceResponse> {
    return this.request<MyMarketplaceResponse>(`GET`, `/marketplace/me`)
  }

  publishTheme(payload: PublishThemePayload): Promise<MarketplaceItemDetail> {
    return this.request<MarketplaceItemDetail>(`POST`, `/marketplace/themes`, payload)
  }

  publishComponent(payload: PublishComponentPayload): Promise<MarketplaceItemDetail> {
    return this.request<MarketplaceItemDetail>(`POST`, `/marketplace/components`, payload)
  }

  update(id: string, payload: UpdateMarketplacePayload): Promise<MarketplaceItemDetail> {
    return this.request<MarketplaceItemDetail>(`PATCH`, `/marketplace/${id}`, payload)
  }

  remove(id: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>(`DELETE`, `/marketplace/${id}`)
  }

  listPending(params?: MarketplaceListParams & { type?: MarketplaceItemType }): Promise<MarketplaceListResponse & { items: MarketplaceItemDetail[] }> {
    const search = new URLSearchParams()
    if (params?.type)
      search.set(`type`, params.type)
    if (params?.page)
      search.set(`page`, String(params.page))
    if (params?.pageSize)
      search.set(`pageSize`, String(params.pageSize))
    const qs = search.toString()
    return this.request(`GET`, `/marketplace/admin/pending${qs ? `?${qs}` : ``}`)
  }

  approve(id: string): Promise<MarketplaceItemDetail> {
    return this.request<MarketplaceItemDetail>(`POST`, `/marketplace/admin/${id}/approve`)
  }

  reject(id: string, reason?: string): Promise<MarketplaceItemDetail> {
    return this.request<MarketplaceItemDetail>(`POST`, `/marketplace/admin/${id}/reject`, { reason })
  }
}

export { ApiError as MarketplaceApiError }
