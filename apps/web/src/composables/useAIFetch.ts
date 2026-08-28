/**
 * Build common AI API request headers.
 */
export function buildAIHeaders(apiKey: string, serviceType: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': `application/json` }
  if (apiKey && serviceType !== `default`)
    headers.Authorization = `Bearer ${apiKey}`
  return headers
}

const CHAT_COMPLETIONS_PATH = `/chat/completions`
const IMAGE_GENERATIONS_PATH = `/images/generations`
const MODELS_PATH = `/models`

function stripSuffix(pathname: string, suffix: string): string {
  if (!pathname.endsWith(suffix))
    return pathname
  return pathname.slice(0, -suffix.length)
}

/**
 * Resolve the full endpoint URL by appending the appropriate API path
 * if it is not already present.
 */
export function resolveEndpointUrl(endpoint: string, kind: `chat` | `image` | `models`): string {
  const url = new URL(endpoint)
  // Normalize trailing slashes so endsWith checks work reliably
  let pathname = url.pathname.replace(/\/+$/, ``)
  if (kind === `chat`) {
    if (!pathname.endsWith(CHAT_COMPLETIONS_PATH))
      pathname += CHAT_COMPLETIONS_PATH
  }
  else if (kind === `image`) {
    if (!pathname.includes(`/images/`) && !pathname.endsWith(IMAGE_GENERATIONS_PATH))
      pathname += IMAGE_GENERATIONS_PATH
  }
  else {
    pathname = stripSuffix(pathname, CHAT_COMPLETIONS_PATH)
    pathname = stripSuffix(pathname, IMAGE_GENERATIONS_PATH)
    if (!pathname.endsWith(MODELS_PATH))
      pathname += MODELS_PATH
  }
  url.pathname = pathname || `/`
  return url.toString()
}

interface AIJSONResponse<T> {
  ok: boolean
  status: number
  statusText: string
  data: T | null
  errorText: string
}

export async function readAIJSONResponse<T>(res: Response): Promise<AIJSONResponse<T>> {
  const body = await res.text()
  if (!res.ok)
    return { ok: false, status: res.status, statusText: res.statusText, data: null, errorText: body }

  try {
    return { ok: true, status: res.status, statusText: res.statusText, data: JSON.parse(body) as T, errorText: `` }
  }
  catch {
    return { ok: false, status: res.status, statusText: res.statusText, data: null, errorText: body || `Invalid JSON response` }
  }
}

export interface SSECallbacks {
  onDelta: (content: string) => void
  onReasoningDelta?: (reasoning: string) => void
  onDone?: () => void
}

/**
 * Composable that manages an AbortController-backed fetch lifecycle.
 */
export function useAIFetch() {
  const loading = ref(false)
  const abortController = ref<AbortController | null>(null)

  function abort() {
    abortController.value?.abort()
    abortController.value = null
    loading.value = false
  }

  /**
   * Perform a streaming SSE fetch to a chat-completions endpoint and
   * invoke callbacks for each delta chunk.
   */
  async function fetchSSE(
    url: string,
    headers: Record<string, string>,
    payload: Record<string, unknown>,
    callbacks: SSECallbacks,
  ) {
    abortController.value = new AbortController()
    loading.value = true

    try {
      const res = await window.fetch(url, {
        method: `POST`,
        headers,
        body: JSON.stringify(payload),
        signal: abortController.value.signal,
      })

      if (!res.ok || !res.body)
        throw new Error(`响应错误：${res.status} ${res.statusText}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder(`utf-8`)
      let buffer = ``

      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          callbacks.onDone?.()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(`\n`)
        buffer = lines.pop() || ``

        for (const line of lines) {
          if (!line.trim() || line.trim() === `data: [DONE]`)
            continue
          try {
            const json = JSON.parse(line.replace(/^data: /, ``))
            const delta = json.choices?.[0]?.delta || {}
            if (delta.content)
              callbacks.onDelta(delta.content)
            if (delta.reasoning_content)
              callbacks.onReasoningDelta?.(delta.reasoning_content)
          }
          catch {}
        }
      }
    }
    catch (e) {
      if ((e as Error).name === `AbortError`)
        return
      throw e
    }
    finally {
      loading.value = false
      abortController.value = null
    }
  }

  /**
   * Perform a regular (non-streaming) JSON fetch and return the parsed response.
   */
  async function fetchJSON<T = any>(
    url: string,
    headers: Record<string, string>,
    payload: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<AIJSONResponse<T>> {
    const res = await window.fetch(url, {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
      signal,
    })

    return readAIJSONResponse<T>(res)
  }

  async function fetchGET<T = any>(
    url: string,
    headers: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<AIJSONResponse<T>> {
    const res = await window.fetch(url, { method: `GET`, headers, signal })
    return readAIJSONResponse<T>(res)
  }

  return { loading, abortController, abort, fetchSSE, fetchJSON, fetchGET }
}
