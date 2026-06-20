import { t } from '@/i18n/translate'

let lastQuotaWarnAt = 0

/** 本地存储配额不足时提示（5 秒内去重） */
export function warnStorageQuota(): void {
  const now = Date.now()
  if (now - lastQuotaWarnAt < 5000)
    return
  lastQuotaWarnAt = now
  toast.warning(t('toast.storageQuota'))
}

export function isStorageQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException))
    return false
  return error.name === `QuotaExceededError` || error.code === 22
}

export function parseStoredValue<T>(raw: string, fallback: T): T {
  if (typeof fallback === `string`)
    return raw as T
  try {
    return JSON.parse(raw) as T
  }
  catch {
    return fallback
  }
}
