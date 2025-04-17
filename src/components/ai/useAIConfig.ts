import { computed } from 'vue'

export function useAIConfig() {
  const type = computed(() => localStorage.getItem(`openai_type`) || `deepseek`)
  const endpoint = computed(() => localStorage.getItem(`openai_endpoint`) || `https://api.deepseek.com/v1`)
  const apiKey = computed(() => localStorage.getItem(`openai_key_${type.value}`) || ``)
  const model = computed(() => localStorage.getItem(`openai_model`) || ``)

  return {
    type,
    apiKey,
    endpoint,
    model,
  }
}
