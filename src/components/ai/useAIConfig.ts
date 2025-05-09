import { serviceOptions } from '@/config/ai-services'
import { computed } from 'vue'

export function useAIConfig() {
  const defaultService = serviceOptions[0]
  const type = computed(() => localStorage.getItem(`openai_type`) || defaultService.value)
  const endpoint = computed(() => localStorage.getItem(`openai_endpoint`) || defaultService.endpoint)
  const apiKey = computed(() => localStorage.getItem(`openai_key_${type.value}`) || ``)
  const model = computed(() => localStorage.getItem(`openai_model`) || defaultService.models[0])
  const temperature = computed(() => Number(localStorage.getItem(`openai_temperature`) || 1))
  const maxToken = computed(() => Number(localStorage.getItem(`openai_max_token`) || 1024))

  return {
    type,
    apiKey,
    endpoint,
    model,
    temperature,
    maxToken,
  }
}
