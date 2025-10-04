import { serviceOptions } from '@md/shared/configs'
import {
  DEFAULT_SERVICE_KEY,
  DEFAULT_SERVICE_MAX_TOKEN,
  DEFAULT_SERVICE_TEMPERATURE,
  DEFAULT_SERVICE_TYPE,
} from '@md/shared/constants'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export default defineStore(`AIConfig`, () => {
  const type = useStorage<string>(`openai_type`, DEFAULT_SERVICE_TYPE)
  const temperature = useStorage<number>(`openai_temperature`, DEFAULT_SERVICE_TEMPERATURE)
  const maxToken = useStorage<number>(`openai_max_token`, DEFAULT_SERVICE_MAX_TOKEN)

  const endpoint = ref<string>(``)
  const model = ref<string>(``)

  const apiKey = useStorage<string>(`openai_key_${type.value}`, DEFAULT_SERVICE_KEY)

  watch(
    type,
    (newType) => {
      const svc = serviceOptions.find(s => s.value === newType) ?? serviceOptions[0]
      endpoint.value = svc.endpoint
      const serviceModel = useStorage<string>(`openai_model_${newType}`, svc.models[0])
      model.value = svc.models.includes(serviceModel.value) ? serviceModel.value : svc.models[0]
    },
    { immediate: true },
  )

  function reset() {
    type.value = DEFAULT_SERVICE_TYPE
    temperature.value = DEFAULT_SERVICE_TEMPERATURE
    maxToken.value = DEFAULT_SERVICE_MAX_TOKEN
    apiKey.value = DEFAULT_SERVICE_KEY
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
