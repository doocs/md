import { imageServiceOptions } from '@md/shared/configs'
import {
  DEFAULT_SERVICE_KEY,
  DEFAULT_SERVICE_TYPE,
} from '@md/shared/constants'
import { store } from '@/utils/storage'

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
  const endpoint = customRef<string>((track, trigger) => {
    let cachedEndpoint = ``

    // 异步加载初始值
    const loadEndpoint = async () => {
      if (type.value === `custom`) {
        cachedEndpoint = await store.get(`openai_image_endpoint_${type.value}`) || ``
      }
      else {
        const svc = imageServiceOptions.find(s => s.value === type.value) ?? imageServiceOptions[0]
        cachedEndpoint = svc.endpoint
      }
    }
    loadEndpoint()

    return {
      get() {
        track()
        return cachedEndpoint
      },
      set(val: string) {
        cachedEndpoint = val
        trigger()

        if (type.value === `custom`) {
          store.set(`openai_image_endpoint_${type.value}`, val)
        }
      },
    }
  })

  // 模型名称（由 watch(type) 自动初始化）
  const model = ref<string>(``)

  // ==================== API Key 管理 ====================

  // API Key（按服务类型分别持久化）
  const apiKey = customRef<string>((track, trigger) => {
    let cachedKey = ``

    // 异步加载初始值
    store.get(`openai_image_key_${type.value}`).then((value) => {
      cachedKey = value || DEFAULT_SERVICE_KEY
    })

    return {
      get() {
        track()
        return cachedKey
      },
      set(val: string) {
        cachedKey = val
        trigger()

        if (type.value !== DEFAULT_SERVICE_TYPE) {
          store.set(`openai_image_key_${type.value}`, val)
        }
      },
    }
  })

  // ==================== 响应式逻辑 ====================

  // 监听服务类型变化，自动同步模型
  watch(
    type,
    async (newType) => {
      const svc = imageServiceOptions.find(s => s.value === newType) ?? imageServiceOptions[0]

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
    },
    { immediate: true }, // 首次加载时也执行
  )

  // 监听模型变化，持久化存储
  watch(model, async (val) => {
    await store.set(`openai_image_model_${type.value}`, val)
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
