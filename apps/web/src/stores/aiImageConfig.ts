import { imageServiceOptions } from '@md/shared/configs'
import {
  DEFAULT_SERVICE_KEY,
  DEFAULT_SERVICE_TYPE,
} from '@md/shared/constants'
import { store } from '@/storage'

/** AI image generation configuration: provider, size, quality, API keys. */
export const useAIImageConfigStore = defineStore(`AIImageConfig`, () => {
  const type = store.reactive<string>(`openai_image_type`, DEFAULT_SERVICE_TYPE)

  const size = store.reactive<string>(`openai_image_size`, `1024x1024`)

  const quality = store.reactive<string>(`openai_image_quality`, `standard`)

  const style = store.reactive<string>(`openai_image_style`, `natural`)

  const endpoint = ref<string>(``)

  // Capture type on load to avoid async race overwriting a newer selection
  Promise.resolve().then(async () => {
    const capturedType = type.value
    if (capturedType === `custom`) {
      const value = await store.get(`openai_image_endpoint_${capturedType}`)
      if (type.value === capturedType) {
        endpoint.value = value || ``
      }
    }
    else {
      const svc = imageServiceOptions.find(s => s.value === capturedType) ?? imageServiceOptions[0]
      if (type.value === capturedType) {
        endpoint.value = svc.endpoint
      }
    }
  })

  const model = ref<string>(``)

  const apiKey = ref<string>(DEFAULT_SERVICE_KEY)

  Promise.resolve().then(async () => {
    const capturedType = type.value
    const value = await store.get(`openai_image_key_${capturedType}`)
    if (type.value === capturedType) {
      apiKey.value = value || DEFAULT_SERVICE_KEY
    }
  })

  watch(
    type,
    async (newType) => {
      const svc = imageServiceOptions.find(s => s.value === newType) ?? imageServiceOptions[0]

      if (newType === `custom`) {
        const endpointValue = await store.get(`openai_image_endpoint_${newType}`)
        endpoint.value = endpointValue || ``
      }
      else {
        endpoint.value = svc.endpoint
      }

      if (newType === `custom`) {
        const savedModel = await store.get(`openai_image_model_${newType}`) || ``
        model.value = savedModel
      }
      else {
        const saved = await store.get(`openai_image_model_${newType}`) || ``
        model.value = svc.models.includes(saved) ? saved : svc.models[0]

        if (!svc.models.includes(saved) && svc.models[0]) {
          await store.set(`openai_image_model_${newType}`, svc.models[0])
        }
      }

      const keyValue = await store.get(`openai_image_key_${newType}`)
      apiKey.value = keyValue || DEFAULT_SERVICE_KEY
    },
    { immediate: true },
  )

  watch(model, async (val) => {
    await store.set(`openai_image_model_${type.value}`, val)
  })

  watch(apiKey, async (val) => {
    if (type.value !== DEFAULT_SERVICE_TYPE) {
      await store.set(`openai_image_key_${type.value}`, val)
    }
  })

  watch(endpoint, async (val) => {
    if (type.value === `custom`) {
      await store.set(`openai_image_endpoint_${type.value}`, val)
    }
  })

  const reset = async () => {
    type.value = DEFAULT_SERVICE_TYPE
    size.value = `1024x1024`
    quality.value = `standard`
    style.value = `natural`

    await Promise.all(
      imageServiceOptions.map(async ({ value }) => {
        await store.remove(`openai_image_key_${value}`)
        await store.remove(`openai_image_model_${value}`)
        await store.remove(`openai_image_endpoint_${value}`)
      }),
    )
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

export default useAIImageConfigStore
