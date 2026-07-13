export type MarketplaceItemType = `theme` | `component`
export type MarketplaceItemStatus = `draft` | `pending` | `approved` | `rejected`
export type MarketplaceSort = `popular` | `newest`

export interface MarketplaceItemRow {
  id: string
  type: MarketplaceItemType
  author_id: string
  slug: string
  name: string
  description: string
  version: string
  cover_url: string | null
  primary_color: string | null
  /** Theme preview sample Markdown; null means client uses system default */
  sample_markdown: string | null
  payload: string
  status: MarketplaceItemStatus
  reject_reason: string | null
  download_count: number
  created_at: number
  updated_at: number
  published_at: number | null
}

export interface MarketplaceAuthorInfo {
  id: string
  login: string
  name: string | null
  avatar: string | null
}

export interface MarketplaceItemSummary {
  id: string
  type: MarketplaceItemType
  slug: string
  name: string
  description: string
  version: string
  coverUrl: string | null
  primaryColor: string | null
  status: MarketplaceItemStatus
  rejectReason?: string | null
  downloadCount: number
  createdAt: number
  updatedAt: number
  publishedAt: number | null
  author: MarketplaceAuthorInfo
}

export interface MarketplaceItemDetail extends MarketplaceItemSummary {
  payload: string
  /** Theme-only; null/empty means preview with system default article */
  sampleMarkdown: string | null
}

export interface MarketplaceListResponse {
  items: MarketplaceItemSummary[]
  total: number
  page: number
  pageSize: number
}

export interface PublishThemeRequest {
  slug: string
  name: string
  description?: string
  version?: string
  coverUrl?: string | null
  primaryColor?: string | null
  /** Custom preview Markdown; omit/null/empty = system default */
  sampleMarkdown?: string | null
  css: string
}

export interface PublishComponentRequest {
  slug: string
  name: string
  description?: string
  version?: string
  coverUrl?: string | null
  /** Component definition JSON (name, template, props, example, description) */
  component: {
    name: string
    description?: string
    template: string
    props: unknown[]
    example?: string
  }
}

export interface UpdateMarketplaceItemRequest {
  name?: string
  description?: string
  version?: string
  coverUrl?: string | null
  primaryColor?: string | null
  sampleMarkdown?: string | null
  css?: string
  component?: PublishComponentRequest[`component`]
}

export interface RejectMarketplaceItemRequest {
  reason?: string
}
