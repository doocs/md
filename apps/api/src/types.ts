export interface Env {
  DB: D1Database
  ASSETS: Fetcher
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  JWT_SECRET: string
  /** 前端地址，用于 OAuth 回跳与 CORS 白名单，多个用英文逗号分隔 */
  APP_URL: string
  /** 爱发电创作者 user_id（开发者后台） */
  AFDIAN_USER_ID?: string
  /** 爱发电 API Token，通过 wrangler secret 注入 */
  AFDIAN_API_TOKEN?: string
  /** 爱发电 API 基址，默认 https://afdian.com/api/open */
  AFDIAN_API_BASE?: string
  /** 可开通 Pro 的方案 plan_id，逗号分隔；留空则接受所有已付款方案 */
  AFDIAN_PRO_PLAN_IDS?: string
  /**
   * 爱发电 Webhook 路径密钥，通过 wrangler secret 注入。
   * 配置后回调地址须为 `/webhooks/afdian/<token>`，缺失或不匹配则拒绝。
   * 用于防止公开端点被任意调用 / 刷量（验单仍以爱发电 API 为准）。
   */
  AFDIAN_WEBHOOK_TOKEN?: string
  /** 是否开启图床上传 API（`true` / `1`） */
  UPLOAD_ENABLED?: string
  /** 上传后端：`github`（默认）或 `r2` */
  UPLOAD_BACKEND?: string
  /** GitHub 图床用户名 */
  UPLOAD_GITHUB_USERNAME?: string
  /** GitHub 仓库列表，逗号分隔，如 `img0,img1`；留空则使用 img0–img19 */
  UPLOAD_GITHUB_REPO_LIST?: string
  /** GitHub 分支，默认 `main` */
  UPLOAD_GITHUB_BRANCH?: string
  /** 是否将 GitHub 链接替换为 jsDelivr CDN，默认 true */
  UPLOAD_GITHUB_USE_CDN?: string
  /** GitHub PAT 列表，逗号分隔（wrangler secret） */
  UPLOAD_GITHUB_TOKENS_BUCKETIO?: string
  /** R2 公开访问 URL 前缀，如 `https://images.example.com` */
  UPLOAD_R2_PUBLIC_URL?: string
  /** R2 图床 bucket 绑定（UPLOAD_BACKEND=r2 时需要） */
  UPLOAD_IMAGES?: R2Bucket
}

export interface JwtPayload {
  sub: string // 内部 user id
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

/** 同步用文档（前后端共享契约），时间字段统一为 epoch ms */
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

/** 同步用设置项（前后端共享契约，value 为 localStorage 原始字符串） */
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
  /** 服务端合并后较新的文档（客户端需用其覆盖本地） */
  documents: SyncDocument[]
  settings: SyncSetting[]
  cursor: number
}
