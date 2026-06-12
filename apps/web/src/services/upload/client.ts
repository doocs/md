import { isAccountConfigured, MD_API_URL } from '@/services/account/config'

export class UploadApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: Record<string, unknown>,
  ) {
    super(message)
    this.name = `UploadApiError`
  }
}

/** 构建时开关：与 md-api 的 UPLOAD_ENABLED 同步，开启时默认图床走 Worker 上传 */
export function isUploadViaApiEnabled(): boolean {
  if (!isAccountConfigured())
    return false
  const flag = import.meta.env.VITE_UPLOAD_VIA_API
  return flag === `true` || flag === `1`
}

function uploadFilename(file: File): string {
  const name = file.name?.trim()
  if (name && name.includes(`.`) && !name.endsWith(`.blob`))
    return name

  const subtype = file.type?.split(`/`)[1]?.split(`+`)[0]
  if (subtype === `jpeg`)
    return `image.jpg`
  if (subtype)
    return `image.${subtype}`

  return `image.png`
}

export async function uploadImageViaApi(file: File, token?: string | null): Promise<string> {
  const formData = new FormData()
  formData.append(`file`, file, uploadFilename(file))

  const headers: Record<string, string> = {}
  if (token)
    headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${MD_API_URL}/upload`, {
    method: `POST`,
    headers,
    body: formData,
  })

  if (!res.ok) {
    let message = res.statusText
    let body: Record<string, unknown> | undefined
    try {
      body = await res.json() as Record<string, unknown>
      if (typeof body.message === `string`)
        message = body.message
      else if (typeof body.error === `string`)
        message = body.error
    }
    catch { /* ignore */ }
    throw new UploadApiError(res.status, message, body)
  }

  const data = await res.json() as { url?: string }
  if (!data.url)
    throw new UploadApiError(res.status, `upload_failed`)

  return data.url
}

export function isUploadDisabledError(err: unknown): boolean {
  return err instanceof UploadApiError
    && (err.status === 404 || err.body?.error === `upload_disabled`)
}
