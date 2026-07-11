export interface RequestConfig {
  url?: string
  method?: string
  headers?: Record<string, string>
  data?: unknown
  timeout?: number
}

async function request<T = unknown>(config: RequestConfig): Promise<T> {
  const method = (config.method || `GET`).toUpperCase()
  const url = config.url || ``
  const headers: Record<string, string> = { ...config.headers }
  const controller = new AbortController()
  const timeout = config.timeout ?? 30_000
  const timer = setTimeout(() => controller.abort(), timeout)

  let body: BodyInit | undefined
  if (config.data !== undefined && method !== `GET` && method !== `HEAD`) {
    if (typeof FormData !== `undefined` && config.data instanceof FormData) {
      body = config.data
      // Browser sets multipart boundary; drop explicit multipart Content-Type
      for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === `content-type` && headers[key].includes(`multipart/form-data`))
          delete headers[key]
      }
    }
    else if (typeof config.data === `object` && config.data !== null && !(config.data instanceof Blob) && !(config.data instanceof ArrayBuffer)) {
      body = JSON.stringify(config.data)
      if (!Object.keys(headers).some(k => k.toLowerCase() === `content-type`))
        headers[`Content-Type`] = `application/json`
    }
    else {
      body = config.data as BodyInit
    }
  }

  try {
    const res = await globalThis.fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    })

    const contentType = res.headers.get(`content-type`) || ``
    const data = contentType.includes(`application/json`)
      ? await res.json()
      : await res.text()

    if (!res.ok) {
      const err = Object.assign(new Error(`Request failed with status ${res.status}`), {
        response: { status: res.status, data },
        data,
        status: res.status,
      })
      return Promise.reject(err)
    }

    // Match previous axios interceptor: reject empty bodies
    if (data === null || data === undefined || data === ``)
      return Promise.reject(new Error(`Empty response`))

    return data as T
  }
  finally {
    clearTimeout(timer)
  }
}

function createMethod(method: string) {
  return <T = unknown>(url: string, data?: unknown, config?: Omit<RequestConfig, `url` | `method` | `data`>) =>
    request<T>({ ...config, url, method, data })
}

interface FetchCallable {
  // Two type params kept for call-site compatibility (request body / response)
  <_TReq = unknown, TRes = unknown>(config: RequestConfig): Promise<TRes>
  <_TReq = unknown, TRes = unknown>(url: string, config?: RequestConfig): Promise<TRes>
  get: <T = unknown>(url: string, config?: Omit<RequestConfig, `url` | `method` | `data`>) => Promise<T>
  post: <T = unknown>(url: string, data?: unknown, config?: Omit<RequestConfig, `url` | `method` | `data`>) => Promise<T>
  put: <T = unknown>(url: string, data?: unknown, config?: Omit<RequestConfig, `url` | `method` | `data`>) => Promise<T>
  delete: <T = unknown>(url: string, config?: Omit<RequestConfig, `url` | `method` | `data`>) => Promise<T>
  patch: <T = unknown>(url: string, data?: unknown, config?: Omit<RequestConfig, `url` | `method` | `data`>) => Promise<T>
  request: typeof request
}

const service = (async function fetchLike(
  urlOrConfig: string | RequestConfig,
  maybeConfig?: RequestConfig,
): Promise<unknown> {
  if (typeof urlOrConfig === `string`)
    return request({ ...maybeConfig, url: urlOrConfig })
  return request(urlOrConfig)
}) as FetchCallable

service.get = createMethod(`GET`)
service.post = createMethod(`POST`)
service.put = createMethod(`PUT`)
service.delete = createMethod(`DELETE`)
service.patch = createMethod(`PATCH`)
service.request = request

export default service
