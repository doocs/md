import { t } from '@/i18n/translate'
import { isAccountConfigured, MD_API_URL } from '@/services/account/config'
import { ACCOUNT_TOKEN_KEY } from '@/services/account/oauth'
import { store } from '@/storage'

class UploadApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: Record<string, unknown>,
  ) {
    super(message)
    this.name = `UploadApiError`
  }
}

function isUploadViaApiEnabled(): boolean {
  if (!isAccountConfigured())
    return false
  const flag = import.meta.env.VITE_UPLOAD_VIA_API
  return flag === `true` || flag === `1`
}

const INVALID_UPLOAD_EXTENSIONS = new Set([`blob`, `bin`, `octet-stream`])

function uploadFilename(file: File): string {
  const name = file.name?.trim() ?? ``
  const dotIndex = name.lastIndexOf(`.`)
  if (dotIndex > 0 && dotIndex < name.length - 1) {
    const ext = name.slice(dotIndex + 1).toLowerCase()
    if (ext && !INVALID_UPLOAD_EXTENSIONS.has(ext))
      return name
  }

  const subtype = file.type?.split(`/`)[1]?.split(`+`)[0]?.toLowerCase()
  if (subtype === `jpeg` || subtype === `jpg`)
    return `image.jpg`
  if (subtype && subtype !== `octet-stream`)
    return `image.${subtype}`

  return `image.png`
}

async function uploadImageViaApi(file: File, token?: string | null): Promise<string> {
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

/** Default image host via md-api; login optional (higher rate limit when logged in). */
export async function uploadDefaultImage(file: File): Promise<string> {
  if (!isUploadViaApiEnabled())
    throw new Error(t('store.uploader.defaultHostRequiresApi'))
  const token = await store.get(ACCOUNT_TOKEN_KEY)
  return await uploadImageViaApi(file, token || undefined)
}
