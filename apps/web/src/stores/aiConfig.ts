import { serviceOptions } from '@md/shared/configs'
import {
  DEFAULT_SERVICE_KEY,
  DEFAULT_SERVICE_MAX_TOKEN,
  DEFAULT_SERVICE_TEMPERATURE,
  DEFAULT_SERVICE_TYPE,
} from '@md/shared/constants'
import { store } from '@/storage'

/** AI service configuration: provider, model, temperature, API keys. */
export const useAIConfigStore = defineStore(`AIConfig`, () => {
  const type = store.reactive<string>(`openai_type`, DEFAULT_SERVICE_TYPE)

  const temperature = store.reactive<number>(`openai_temperature`, DEFAULT_SERVICE_TEMPERATURE)

  const maxToken = store.reactive<number>(`openai_max_token`, DEFAULT_SERVICE_MAX_TOKEN)

  const endpoint = ref<string>(``)

  const model = ref<string>(``)

  const apiKey = ref<string>(DEFAULT_SERVICE_KEY)

  // Capture type on load to avoid async race overwriting a newer selection
  Promise.resolve().then(async () => {
    const capturedType = type.value
    const value = await store.get(`openai_key_${capturedType}`)
    if (type.value === capturedType) {
      apiKey.value = value || DEFAULT_SERVICE_KEY
    }
  })

  watch(
    type,
    async (newType) => {
      const svc = serviceOptions.find(s => s.value === newType) ?? serviceOptions[0]

      endpoint.value = svc.endpoint

      const saved = await store.get(`openai_model_${newType}`) || ``
      model.value = svc.models.includes(saved) ? saved : svc.models[0]

      await store.set(`openai_model_${newType}`, model.value)

      const keyValue = await store.get(`openai_key_${newType}`)
      apiKey.value = keyValue || DEFAULT_SERVICE_KEY
    },
    { immediate: true },
  )

  watch(apiKey, async (val) => {
    if (type.value !== DEFAULT_SERVICE_TYPE) {
      await store.set(`openai_key_${type.value}`, val)
    }
  })

  watch(model, async (val) => {
    await store.set(`openai_model_${type.value}`, val)
  })

  const reset = async () => {
    type.value = DEFAULT_SERVICE_TYPE
    temperature.value = DEFAULT_SERVICE_TEMPERATURE
    maxToken.value = DEFAULT_SERVICE_MAX_TOKEN

    await Promise.all(
      serviceOptions.map(async ({ value }) => {
        await store.remove(`openai_key_${value}`)
        await store.remove(`openai_model_${value}`)
      }),
    )
  }

  return {
    type,
    endpoint,
    model,
    temperature,
    maxToken,
    apiKey,
    reset,
  }
})

export default useAIConfigStore
