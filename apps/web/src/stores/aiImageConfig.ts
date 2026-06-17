import { imageServiceOptions } from '@md/shared/configs'
import {
  DEFAULT_SERVICE_KEY,
  DEFAULT_SERVICE_TYPE,
} from '@md/shared/constants'
import { store } from '@/storage'

/**
 * AI 图片生成配置 Store
 * 负责管理 AI 图片生成服务的配置，包括服务类型、尺寸、质量等参数
 */
export const useAIImageConfigStore = defineStore(`AIImageConfig`, () => {
  // ==================== 全局配置 ====================

  // 服务类型
  const type = store.reactive<string>(`openai_image_type`, DEFAULT_SERVICE_TYPE)

  // 图片尺寸
  const size = store.reactive<string>(`openai_image_size`, `1024x1024`)

  // 图片质量
  const quality = store.reactive<string>(`openai_image_quality`, `standard`)

  // 图片风格
  const style = store.reactive<string>(`openai_image_style`, `natural`)

  // ==================== 服务相关字段 ====================

  // 服务端点（支持自定义服务）
  const endpoint = ref<string>(``)

  // 异步加载初始端点（捕获 type 防止竞态覆盖）
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

  // 模型名称（由 watch(type) 自动初始化）
  const model = ref<string>(``)

  // ==================== API Key 管理 ====================

  // API Key（按服务类型分别持久化）
  const apiKey = ref<string>(DEFAULT_SERVICE_KEY)

  // 异步加载初始值（捕获 type 防止竞态覆盖）
  Promise.resolve().then(async () => {
    const capturedType = type.value
    const value = await store.get(`openai_image_key_${capturedType}`)
    if (type.value === capturedType) {
      apiKey.value = value || DEFAULT_SERVICE_KEY
    }
  })

  // ==================== 响应式逻辑 ====================

  // 监听服务类型变化，自动同步端点、模型和 API Key
  watch(
    type,
    async (newType) => {
      const svc = imageServiceOptions.find(s => s.value === newType) ?? imageServiceOptions[0]

      // 同步端点
      if (newType === `custom`) {
        const endpointValue = await store.get(`openai_image_endpoint_${newType}`)
        endpoint.value = endpointValue || ``
      }
      else {
        endpoint.value = svc.endpoint
      }

      if (newType === `custom`) {
        // 自定义服务：从存储读取模型
        const savedModel = await store.get(`openai_image_model_${newType}`) || ``
        model.value = savedModel
      }
      else {
        // 预设服务：读取已保存的模型，如果不存在或不在列表中，则使用默认模型
        const saved = await store.get(`openai_image_model_${newType}`) || ``
        model.value = svc.models.includes(saved) ? saved : svc.models[0]

        // 如果需要回退到默认模型，则保存
        if (!svc.models.includes(saved) && svc.models[0]) {
          await store.set(`openai_image_model_${newType}`, svc.models[0])
        }
      }

      // 加载对应服务的 API Key
      const keyValue = await store.get(`openai_image_key_${newType}`)
      apiKey.value = keyValue || DEFAULT_SERVICE_KEY
    },
    { immediate: true }, // 首次加载时也执行
  )

  // 监听模型变化，持久化存储
  watch(model, async (val) => {
    await store.set(`openai_image_model_${type.value}`, val)
  })

  // 监听 API Key 变化，持久化存储（仅非默认服务类型）
  watch(apiKey, async (val) => {
    if (type.value !== DEFAULT_SERVICE_TYPE) {
      await store.set(`openai_image_key_${type.value}`, val)
    }
  })

  // 监听端点变化，持久化存储（仅自定义服务类型）
  watch(endpoint, async (val) => {
    if (type.value === `custom`) {
      await store.set(`openai_image_endpoint_${type.value}`, val)
    }
  })

  // ==================== Actions ====================

  /**
   * 重置所有配置到默认值
   */
  const reset = async () => {
    type.value = DEFAULT_SERVICE_TYPE
    size.value = `1024x1024`
    quality.value = `standard`
    style.value = `natural`

    // 清理所有服务相关的持久化数据
    await Promise.all(
      imageServiceOptions.map(async ({ value }) => {
        await store.remove(`openai_image_key_${value}`)
        await store.remove(`openai_image_model_${value}`)
        await store.remove(`openai_image_endpoint_${value}`)
      }),
    )
  }

  return {
    // State
    type,
    endpoint,
    model,
    size,
    quality,
    style,
    apiKey,

    // Actions
    reset,
  }
})

// 默认导出（向后兼容）
export default useAIImageConfigStore
