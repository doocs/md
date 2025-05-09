import { DEFAULT_SERVICE_MODEL, serviceOptions } from '@/config/ai-services'
import { DEFAULT_SERVICE_ENDPOINT, DEFAULT_SERVICE_KEY, DEFAULT_SERVICE_MAX_TOKEN, DEFAULT_SERVICE_TEMPERATURE, DEFAULT_SERVICE_TYPE } from '@/constants/AIConfig'

export default defineStore(`AIConfig`, () => {
  const type = useStorage(`openai_type`, DEFAULT_SERVICE_TYPE)
  const endpoint = useStorage(`openai_endpoint`, DEFAULT_SERVICE_ENDPOINT)
  const model = useStorage(`openai_model`, DEFAULT_SERVICE_MODEL)
  const temperature = useStorage(`openai_temperature`, DEFAULT_SERVICE_TEMPERATURE)
  const maxToken = useStorage(`openai_max_token`, DEFAULT_SERVICE_MAX_TOKEN)

  const apiKey = customRef((track, trigger) => ({
    get() {
      track()
      const key = localStorage.getItem(`openai_key_${type.value}`)
      return key || DEFAULT_SERVICE_KEY
    },
    set(value: string) {
      if (type.value !== DEFAULT_SERVICE_TYPE) {
        localStorage.setItem(`openai_key_${type.value}`, value)
      }
      trigger()
    },
  }))

  function reset() {
    type.value = DEFAULT_SERVICE_TYPE
    endpoint.value = DEFAULT_SERVICE_ENDPOINT
    model.value = DEFAULT_SERVICE_MODEL
    temperature.value = DEFAULT_SERVICE_TEMPERATURE
    maxToken.value = DEFAULT_SERVICE_MAX_TOKEN

    serviceOptions.forEach((service) => {
      localStorage.removeItem(`openai_key_${service.value}`)
    })
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
