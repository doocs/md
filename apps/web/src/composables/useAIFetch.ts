/**
 * Build common AI API request headers.
 */
export function buildAIHeaders(apiKey: string, serviceType: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': `application/json` }
  if (apiKey && serviceType !== `default`)
    headers.Authorization = `Bearer ${apiKey}`
  return headers
}

/**
 * Resolve the full endpoint URL by appending the appropriate API path
 * if it is not already present.
 */
export function resolveEndpointUrl(endpoint: string, kind: `chat` | `image`): string {
  const url = new URL(endpoint)
  // Normalize trailing slashes so endsWith checks work reliably
  url.pathname = url.pathname.replace(/\/+$/, ``)
  if (kind === `chat`) {
    if (!url.pathname.endsWith(`/chat/completions`))
      url.pathname += `/chat/completions`
  }
  else {
    if (!url.pathname.includes(`/images/`) && !url.pathname.endsWith(`/images/generations`))
      url.pathname += `/images/generations`
  }
  return url.toString()
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
  ): Promise<{ ok: boolean, status: number, statusText: string, data: T | null, errorText: string }> {
    const res = await window.fetch(url, {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
      signal,
    })

    if (res.ok) {
      const data = await res.json()
      return { ok: true, status: res.status, statusText: res.statusText, data, errorText: `` }
    }

    const errorText = await res.text()
    return { ok: false, status: res.status, statusText: res.statusText, data: null, errorText }
  }

  return { loading, abortController, abort, fetchSSE, fetchJSON }
}
