import { serviceOptions } from '@md/shared/config'
import {
  DEFAULT_SERVICE_KEY,
  DEFAULT_SERVICE_MAX_TOKEN,
  DEFAULT_SERVICE_TEMPERATURE,
  DEFAULT_SERVICE_TYPE,
} from '@md/shared/constants'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { customRef, ref, watch } from 'vue'

export default defineStore(`AIConfig`, () => {
  /* ————— 与 service 无关的全局配置 ————— */
  const type = useStorage<string>(`openai_type`, DEFAULT_SERVICE_TYPE)
  const temperature = useStorage<number>(`openai_temperature`, DEFAULT_SERVICE_TEMPERATURE)
  const maxToken = useStorage<number>(`openai_max_token`, DEFAULT_SERVICE_MAX_TOKEN)

  /* ————— 与 service 强相关的字段 ————— */
  const endpoint = ref<string>(``) // 由 watch(type) 初始化
  const model = ref<string>(``) // 同上

  /* ————— apiKey：按 service 前缀持久化 ————— */
  const apiKey = customRef<string>((track, trigger) => ({
    get() {
      track()
      return localStorage.getItem(`openai_key_${type.value}`) || DEFAULT_SERVICE_KEY
    },
    set(val: string) {
      if (type.value !== DEFAULT_SERVICE_TYPE) {
        localStorage.setItem(`openai_key_${type.value}`, val)
      }
      trigger()
    },
  }))

  /* ————————————————— 核心逻辑 ————————————————— */

  // ① type 变化（含首次加载）→ 同步 endpoint & model
  watch(
    type,
    (newType) => {
      const svc = serviceOptions.find(s => s.value === newType) ?? serviceOptions[0]

      // 更新端点
      endpoint.value = svc.endpoint

      // 读取或回退模型
      const saved = localStorage.getItem(`openai_model_${newType}`) || ``
      model.value = svc.models.includes(saved) ? saved : svc.models[0]

      // 如有回退，写回存储保持一致
      localStorage.setItem(`openai_model_${newType}`, model.value)
    },
    { immediate: true }, // ⬅️ 关键：首次也执行
  )

  // ② model 变化 → 持久化到对应 service 键
  watch(model, (val) => {
    localStorage.setItem(`openai_model_${type.value}`, val)
  })

  /* ————— actions ————— */

  function reset() {
    type.value = DEFAULT_SERVICE_TYPE
    temperature.value = DEFAULT_SERVICE_TEMPERATURE
    maxToken.value = DEFAULT_SERVICE_MAX_TOKEN

    // 清理所有 service 相关持久化
    serviceOptions.forEach(({ value }) => {
      localStorage.removeItem(`openai_key_${value}`)
      localStorage.removeItem(`openai_model_${value}`)
    })
  }

  return {
    // state
    type,
    endpoint,
    model,
    temperature,
    maxToken,
    apiKey,

    // actions
    reset,
  }
})
