import { imageServiceOptions } from '@md/shared/configs'
import {
  DEFAULT_SERVICE_KEY,
  DEFAULT_SERVICE_TYPE,
} from '@md/shared/constants'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export default defineStore(`AIImageConfig`, () => {
  const type = useStorage<string>(`openai_image_type`, DEFAULT_SERVICE_TYPE)
  const size = useStorage<string>(`openai_image_size`, `1024x1024`)
  const quality = useStorage<string>(`openai_image_quality`, `standard`)
  const style = useStorage<string>(`openai_image_style`, `natural`)

  const endpoint = ref<string>(``)
  const model = ref<string>(``)

  const apiKey = useStorage<string>(`openai_image_key_${type.value}`, DEFAULT_SERVICE_KEY)
  watch(
    type,
    (newType) => {
      const svc = imageServiceOptions.find(s => s.value === newType) ?? imageServiceOptions[0]
      endpoint.value = svc.endpoint
      const serviceModel = useStorage<string>(`openai_image_model_${newType}`, svc.models[0])
      model.value = svc.models.includes(serviceModel.value) ? serviceModel.value : svc.models[0]
    },
    { immediate: true },
  )

  function reset() {
    type.value = DEFAULT_SERVICE_TYPE
    size.value = `1024x1024`
    quality.value = `standard`
    style.value = `natural`
    apiKey.value = DEFAULT_SERVICE_KEY
  }

  return {
    type,
    endpoint,
    model,
    size,
    quality,
    style,
    apiKey,
    reset,
  }
})
