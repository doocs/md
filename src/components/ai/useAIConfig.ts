import { computed } from 'vue'

export function useAIConfig() {
  const apiKey = computed(() => localStorage.getItem(`openai_key`) || ``)
  const endpoint = computed(() => localStorage.getItem(`openai_endpoint`) || `https://api.openai.com/v1`)
  const model = computed(() => localStorage.getItem(`openai_model`) || `gpt-3.5-turbo`)

  return {
    apiKey,
    endpoint,
    model,
  }
}
