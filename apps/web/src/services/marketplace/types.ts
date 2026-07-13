import type {
  InstalledMarketplaceComponent,
  InstalledMarketplaceTheme,
  MarketplaceComponentPayload,
  MarketplaceItemDetail,
  MarketplaceItemSummary,
  MarketplaceItemType,
  MarketplaceListResponse,
  MarketplaceSort,
} from '@md/shared'

export type {
  InstalledMarketplaceComponent,
  InstalledMarketplaceTheme,
  MarketplaceComponentPayload,
  MarketplaceItemDetail,
  MarketplaceItemSummary,
  MarketplaceItemType,
  MarketplaceListResponse,
  MarketplaceSort,
}

export interface MarketplaceListParams {
  q?: string
  sort?: MarketplaceSort
  page?: number
  pageSize?: number
}

export interface PublishThemePayload {
  slug: string
  name: string
  description?: string
  version?: string
  coverUrl?: string | null
  primaryColor?: string | null
  /** Custom preview Markdown; omit/null = system default */
  sampleMarkdown?: string | null
  css: string
}

export interface PublishComponentPayload {
  slug: string
  name: string
  description?: string
  version?: string
  coverUrl?: string | null
  component: MarketplaceComponentPayload
}

export interface UpdateMarketplacePayload {
  name?: string
  description?: string
  version?: string
  coverUrl?: string | null
  primaryColor?: string | null
  sampleMarkdown?: string | null
  css?: string
  component?: MarketplaceComponentPayload
}

export interface MyMarketplaceResponse {
  items: MarketplaceItemSummary[]
}

export type MarketplaceItemTypeFilter = MarketplaceItemType | undefined
