let lastQuotaWarnAt = 0

/** 本地存储配额不足时提示（5 秒内去重） */
export function warnStorageQuota(): void {
  const now = Date.now()
  if (now - lastQuotaWarnAt < 5000)
    return
  lastQuotaWarnAt = now
  toast.warning(`本地存储空间不足，部分设置可能无法保存`)
}

export function isStorageQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException))
    return false
  return error.name === `QuotaExceededError` || error.code === 22
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  }
  catch {
    return null
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  }
  catch (error) {
    if (isStorageQuotaError(error))
      warnStorageQuota()
    return false
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  }
  catch {
    return false
  }
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
