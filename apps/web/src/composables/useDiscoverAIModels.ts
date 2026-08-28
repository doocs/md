import type { Ref } from 'vue'
import type { OpenAIModelListResponse } from '@/lib/ai-models'
import { DEFAULT_SERVICE_TYPE } from '@md/shared/constants'
import { computed, onUnmounted, ref, watch } from 'vue'
import { t } from '@/i18n/translate'
import {
  filterDiscoveredModels,
  formatDiscoverErrorDetail,
  parseOpenAIModelIds,
} from '@/lib/ai-models'
import { buildAIHeaders, resolveEndpointUrl, useAIFetch } from './useAIFetch'

export function canDiscoverAIModels(endpoint: string, apiKey: string, serviceType: string): boolean {
  if (serviceType === DEFAULT_SERVICE_TYPE)
    return false
  if (!endpoint.trim() || !apiKey.trim())
    return false
  try {
    void new URL(endpoint)
    return true
  }
  catch {
    return false
  }
}

export function useDiscoverAIModels(options: {
  endpoint: Ref<string>
  apiKey: Ref<string>
  serviceType: Ref<string>
  kind: `chat` | `image`
}) {
  const { endpoint, apiKey, serviceType, kind } = options
  const { fetchGET } = useAIFetch()
  const discoveredModels = ref<string[]>([])
  const discovering = ref(false)
  const abortController = ref<AbortController | null>(null)
  const messagePrefix = kind === `image` ? `ai.imageConfig` : `ai.config`

  const canDiscover = computed(() =>
    canDiscoverAIModels(endpoint.value, apiKey.value, serviceType.value),
  )

  function abort() {
    abortController.value?.abort()
    abortController.value = null
  }

  function resetDiscovered() {
    abort()
    discoveredModels.value = []
    discovering.value = false
  }

  watch(serviceType, () => {
    resetDiscovered()
  })

  onUnmounted(abort)

  async function discover(): Promise<string> {
    abort()
    const request = new AbortController()
    abortController.value = request
    discovering.value = true

    try {
      const url = resolveEndpointUrl(endpoint.value, `models`)
      const headers = buildAIHeaders(apiKey.value, serviceType.value)
      const res = await fetchGET<OpenAIModelListResponse>(url, headers, request.signal)

      if (abortController.value !== request)
        return ``

      if (!res.ok) {
        return t(`${messagePrefix}.discoverModelsFailed`, {
          status: res.status,
          statusText: res.statusText,
          errorText: formatDiscoverErrorDetail(res.errorText),
        })
      }

      const ids = filterDiscoveredModels(parseOpenAIModelIds(res.data), kind)
      discoveredModels.value = ids

      if (ids.length === 0)
        return t(`${messagePrefix}.discoverModelsEmpty`)

      return t(`${messagePrefix}.discoverModelsSuccess`, { count: ids.length })
    }
    catch (error) {
      if ((error as Error).name === `AbortError` || abortController.value !== request)
        return ``
      return t(`${messagePrefix}.discoverModelsFailedMessage`, { message: (error as Error).message })
    }
    finally {
      if (abortController.value === request) {
        discovering.value = false
        abortController.value = null
      }
    }
  }

  return {
    discoveredModels,
    discovering,
    canDiscover,
    discover,
    resetDiscovered,
  }
}
