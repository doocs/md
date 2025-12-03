import { serviceOptions } from '@md/shared/configs'
import {
  DEFAULT_SERVICE_KEY,
  DEFAULT_SERVICE_MAX_TOKEN,
  DEFAULT_SERVICE_TEMPERATURE,
  DEFAULT_SERVICE_TYPE,
} from '@md/shared/constants'
import { store } from '@/utils/storage'

/**
 * AI 配置 Store
 * 负责管理 AI 服务的配置，包括服务类型、模型、温度等参数
 */
export const useAIConfigStore = defineStore(`AIConfig`, () => {
  // ==================== 全局配置 ====================

  // 服务类型
  const type = store.reactive<string>(`openai_type`, DEFAULT_SERVICE_TYPE)

  // 温度参数（0-2，控制随机性）
  const temperature = store.reactive<number>(`openai_temperature`, DEFAULT_SERVICE_TEMPERATURE)

  // 最大 token 数
  const maxToken = store.reactive<number>(`openai_max_token`, DEFAULT_SERVICE_MAX_TOKEN)

  // ==================== 服务相关字段 ====================

  // 服务端点（由 watch(type) 自动初始化）
  const endpoint = ref<string>(``)

  // 模型名称（由 watch(type) 自动初始化）
  const model = ref<string>(``)

  // ==================== API Key 管理 ====================

  // 从环境变量获取默认 API Key
  // 支持多种方式：
  // 1. 本地开发：在 .env.local 或 .env 文件中配置 VITE_OPENAI_KEY_<服务类型>
  // 2. Docker 构建：通过 --build-arg 传递环境变量
  // 3. 运行时环境变量：在运行环境中设置
  const getDefaultApiKey = (serviceType: string): string => {
    // 使用服务特定的环境变量，例如 VITE_OPENAI_KEY_openai
    const serviceSpecificKey = import.meta.env[`VITE_OPENAI_KEY_${serviceType}`]
    if (serviceSpecificKey)
      return serviceSpecificKey

    // 如果没有设置环境变量，使用常量默认值
    return DEFAULT_SERVICE_KEY
  }

  // API Key（按服务类型分别持久化）
  const apiKey = customRef<string>((track, trigger) => {
    let cachedKey = ``

    // 加载 API Key 的函数
    const loadApiKey = async (serviceType: string) => {
      const storedValue = await store.get(`openai_key_${serviceType}`)
      // 如果 localStorage 中有值，使用它；否则使用环境变量中的默认值
      cachedKey = storedValue || getDefaultApiKey(serviceType)
      trigger()
    }

    // 异步加载初始值
    loadApiKey(type.value)

    return {
      get() {
        track()
        return cachedKey
      },
      set(val: string) {
        cachedKey = val
        trigger()

        // 保存到 localStorage（用户手动设置或环境变量初始化都会保存）
        // 这样用户可以在界面中看到环境变量提供的默认值，也可以手动修改
        if (type.value !== DEFAULT_SERVICE_TYPE) {
          store.set(`openai_key_${type.value}`, val)
        }
      },
    }
  })

  // ==================== 响应式逻辑 ====================

  // 监听服务类型变化，自动同步端点和模型
  watch(
    type,
    async (newType) => {
      const svc = serviceOptions.find(s => s.value === newType) ?? serviceOptions[0]

      // 更新服务端点
      endpoint.value = svc.endpoint

      // 读取已保存的模型，如果不存在或不在列表中，则使用默认模型
      const saved = await store.get(`openai_model_${newType}`) || ``
      model.value = svc.models.includes(saved) ? saved : svc.models[0]

      // 保存当前模型
      await store.set(`openai_model_${newType}`, model.value)

      // 重新加载当前服务类型的 API Key
      const storedKey = await store.get(`openai_key_${newType}`)
      if (storedKey) {
        // localStorage 中有值，使用它
        apiKey.value = storedKey
      }
      else {
        // localStorage 中没有值，使用环境变量中的默认值
        const envKey = getDefaultApiKey(newType)
        if (envKey) {
          apiKey.value = envKey
        }
        else {
          apiKey.value = DEFAULT_SERVICE_KEY
        }
      }
    },
    { immediate: true }, // 首次加载时也执行
  )

  // 监听模型变化，持久化存储
  watch(model, async (val) => {
    await store.set(`openai_model_${type.value}`, val)
  })

  // ==================== Actions ====================

  /**
   * 重置所有配置到默认值
   */
  const reset = async () => {
    type.value = DEFAULT_SERVICE_TYPE
    temperature.value = DEFAULT_SERVICE_TEMPERATURE
    maxToken.value = DEFAULT_SERVICE_MAX_TOKEN

    // 清理所有服务相关的持久化数据
    await Promise.all(
      serviceOptions.map(async ({ value }) => {
        await store.remove(`openai_key_${value}`)
        await store.remove(`openai_model_${value}`)
      }),
    )
  }

  return {
    // State
    type,
    endpoint,
    model,
    temperature,
    maxToken,
    apiKey,

    // Actions
    reset,
  }
})

// 默认导出（向后兼容）
export default useAIConfigStore
