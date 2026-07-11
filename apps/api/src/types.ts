export interface Env {
  DB: D1Database
  ASSETS: Fetcher
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  JWT_SECRET: string
  /** Frontend origin(s) for OAuth redirect and CORS allowlist; comma-separated */
  APP_URL: string
  /** Afdian creator user_id (developer dashboard) */
  AFDIAN_USER_ID?: string
  /** Afdian API token, injected via wrangler secret */
  AFDIAN_API_TOKEN?: string
  /** Afdian API base URL; default https://afdian.com/api/open */
  AFDIAN_API_BASE?: string
  /** plan_id values eligible for Pro, comma-separated; empty accepts all paid plans */
  AFDIAN_PRO_PLAN_IDS?: string
  /**
   * Afdian webhook path token, injected via wrangler secret.
   * When set, callback URL must be `/webhooks/afdian/<token>`; missing or mismatched requests are rejected.
   * Prevents arbitrary calls / abuse on the public endpoint (order verification still uses the Afdian API).
   */
  AFDIAN_WEBHOOK_TOKEN?: string
  /** Enable image upload API (`true` / `1`) */
  UPLOAD_ENABLED?: string
  /** Upload backend: `github` (default) or `r2` */
  UPLOAD_BACKEND?: string
  /** GitHub image host username */
  UPLOAD_GITHUB_USERNAME?: string
  /** GitHub repo list, comma-separated (e.g. `img0,img1`); empty uses img0–img19 */
  UPLOAD_GITHUB_REPO_LIST?: string
  /** GitHub branch; default `main` */
  UPLOAD_GITHUB_BRANCH?: string
  /** Replace GitHub URLs with jsDelivr CDN; default true */
  UPLOAD_GITHUB_USE_CDN?: string
  /** GitHub PAT list, comma-separated (wrangler secret) */
  UPLOAD_GITHUB_TOKENS_BUCKETIO?: string
  /** R2 public URL prefix, e.g. `https://images.example.com` */
  UPLOAD_R2_PUBLIC_URL?: string
  /** R2 image bucket binding (required when UPLOAD_BACKEND=r2) */
  UPLOAD_IMAGES?: R2Bucket
}

export interface JwtPayload {
  sub: string // internal user id
  login: string
  exp: number
}

export interface UserRow {
  id: string
  github_id: number
  login: string
  name: string | null
  avatar: string | null
  created_at: number
  plan: string
  plan_expires_at: number | null
}

/** Sync document (shared frontend/backend contract); timestamps are epoch ms */
export interface SyncDocument {
  id: string
  title: string
  content: string
  parentId: string | null
  history: { datetime: string, content: string }[]
  createDatetime: number
  updateDatetime: number
  deleted: boolean
}

/** Sync setting (shared frontend/backend contract); value is the raw localStorage string */
export interface SyncSetting {
  key: string
  value: string | null
  updatedAt: number
}

export interface PullResponse {
  documents: SyncDocument[]
  settings: SyncSetting[]
  cursor: number
}

export interface PushRequest {
  documents?: SyncDocument[]
  settings?: SyncSetting[]
}

export interface PushResponse {
  /** Documents newer on the server after merge (client should overwrite local copies) */
  documents: SyncDocument[]
  settings: SyncSetting[]
  cursor: number
}
