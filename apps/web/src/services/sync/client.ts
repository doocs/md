import type { PullResponse, PushRequest, PushResponse, SyncUser } from './types'

/** 云同步后端地址，通过 VITE_SYNC_API_URL 注入，未配置则视为关闭云同步 */
export const SYNC_API_URL = (import.meta.env.VITE_SYNC_API_URL ?? ``).replace(/\/$/, ``)

export function isSyncConfigured(): boolean {
  return Boolean(SYNC_API_URL)
}

/** 发起 GitHub 登录：跳转到后端 OAuth 入口，并带上当前应用入口 URL 用于登录后回跳 */
export function gotoLogin(): void {
  // 携带完整入口（含 base path，如 `/md/`），避免回跳到站点根路径导致 404
  const entry = `${window.location.origin}${window.location.pathname}`
  const redirect = encodeURIComponent(entry)
  window.location.href = `${SYNC_API_URL}/auth/github?redirect=${redirect}`
}

export class SyncApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = `SyncApiError`
  }
}

export class SyncClient {
  constructor(private getToken: () => string | null) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (body !== undefined)
      headers[`Content-Type`] = `application/json`
    if (token)
      headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${SYNC_API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      let message = res.statusText
      try {
        const data = await res.json() as { error?: string }
        if (data?.error)
          message = data.error
      }
      catch { /* ignore */ }
      throw new SyncApiError(res.status, message)
    }

    return res.json() as Promise<T>
  }

  me(): Promise<SyncUser> {
    return this.request<SyncUser>(`GET`, `/me`)
  }

  pull(since: number): Promise<PullResponse> {
    return this.request<PullResponse>(`GET`, `/sync/pull?since=${since}`)
  }

  push(payload: PushRequest): Promise<PushResponse> {
    return this.request<PushResponse>(`POST`, `/sync/push`, payload)
  }
}
