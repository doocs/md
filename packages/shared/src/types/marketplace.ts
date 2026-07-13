/**
 * Marketplace item contracts shared by API and web clients.
 */

export type MarketplaceItemType = `theme` | `component`
export type MarketplaceItemStatus = `draft` | `pending` | `approved` | `rejected`
export type MarketplaceSort = `popular` | `newest`

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
  /** Theme CSS string, or JSON string of component definition */
  payload: string
  /** Theme-only preview sample; null/empty means use system default article */
  sampleMarkdown?: string | null
}

export interface MarketplaceListResponse {
  items: MarketplaceItemSummary[]
  total: number
  page: number
  pageSize: number
}

export interface MarketplaceComponentPayload {
  name: string
  description?: string
  template: string
  props: {
    name: string
    description?: string
    default?: string
    required?: boolean
    type?: `string` | `number` | `boolean` | `array`
  }[]
  example?: string
}

/** Locally installed marketplace theme (persisted + synced). */
export interface InstalledMarketplaceTheme {
  marketplaceId: string
  slug: string
  name: string
  description: string
  version: string
  coverUrl: string | null
  primaryColor: string | null
  css: string
  authorLogin: string
  installedAt: number
}

/** Locally installed marketplace component metadata (full def lives in custom components). */
export interface InstalledMarketplaceComponent {
  marketplaceId: string
  slug: string
  name: string
  description: string
  version: string
  componentName: string
  authorLogin: string
  installedAt: number
}

/** Theme key for marketplace installs: `mp:<uuid>` */
export function marketplaceThemeKey(marketplaceId: string): string {
  return `mp:${marketplaceId}`
}

export function isMarketplaceThemeKey(theme: string): boolean {
  return theme.startsWith(`mp:`)
}

export function parseMarketplaceThemeId(theme: string): string | null {
  if (!isMarketplaceThemeKey(theme))
    return null
  return theme.slice(3) || null
}
