import { computed } from 'vue'

export function useAIConfig() {
  const type = computed(() => localStorage.getItem(`openai_type`) || `deepseek`)
  const endpoint = computed(() => localStorage.getItem(`openai_endpoint`) || `https://api.deepseek.com/v1`)
  const apiKey = computed(() => localStorage.getItem(`openai_key_${type.value}`) || ``)
  const model = computed(() => localStorage.getItem(`openai_model`) || ``)
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
