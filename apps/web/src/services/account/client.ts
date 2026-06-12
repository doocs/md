import type { AccountUser } from './types'
import { MD_API_URL } from './config'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: Record<string, unknown>,
  ) {
    super(message)
    this.name = `ApiError`
  }
}

/** md-api 通用客户端（账户、云同步等接口共用鉴权） */
export class MdApiClient {
  constructor(private getToken: () => string | null) {}

  protected async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (body !== undefined)
      headers[`Content-Type`] = `application/json`
    if (token)
      headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${MD_API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      let message = res.statusText
      let body: Record<string, unknown> | undefined
      try {
        body = await res.json() as Record<string, unknown>
        if (typeof body?.error === `string`)
          message = body.error
      }
      catch { /* ignore */ }
      throw new ApiError(res.status, message, body)
    }

    return res.json() as Promise<T>
  }

  me(): Promise<AccountUser> {
    return this.request<AccountUser>(`GET`, `/me`)
  }
}
