<script setup lang="ts">
import { imageServiceOptions } from '@md/shared/configs'
import { DEFAULT_SERVICE_TYPE } from '@md/shared/constants'
import { Info } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import useAIImageConfigStore from '@/stores/AIImageConfig'

/* -------------------------- 基础数据 -------------------------- */

const emit = defineEmits([`saved`])

const AIImageConfigStore = useAIImageConfigStore()
const { type, endpoint, model, apiKey, size, quality, style }
  = storeToRefs(AIImageConfigStore)

/** 本地草稿 */
const config = reactive({
  type: ``,
  endpoint: ``,
  apiKey: ``,
  model: ``,
  size: `1024x1024`,
  quality: `standard`,
  style: `natural`,
})

/** UI 状态 */
const loading = ref(false)
const testResult = ref(``)

/** 当前服务信息 */
const currentService = computed(
  () => imageServiceOptions.find(s => s.value === config.type) || imageServiceOptions[0],
)

/* -------------------------- 同步函数 -------------------------- */

function pullFromStore(): void {
  config.type = type.value
  config.endpoint = endpoint.value
  config.apiKey = apiKey.value
  config.model = model.value
  config.size = size.value
  config.quality = quality.value
  config.style = style.value
}

function pushToStore(): void {
  type.value = config.type
  apiKey.value = config.apiKey
  model.value = config.model
  size.value = config.size
  quality.value = config.quality
  style.value = config.style
}

function handleServiceChange(): void {
  const svc = imageServiceOptions.find(s => s.value === config.type) || imageServiceOptions[0]

  // 更新端点
  config.endpoint = svc.endpoint

  // 读取或回退模型
  const saved = localStorage.getItem(`openai_image_model_${config.type}`) || ``
  config.model = svc.models.includes(saved) ? saved : svc.models[0]

  // 重置 API Key
  config.apiKey = localStorage.getItem(`openai_image_key_${config.type}`) || ``
}

/* -------------------------- 生命周期 -------------------------- */

onMounted(() => {
  pullFromStore()
})

/* -------------------------- 表单提交 -------------------------- */

function saveConfig() {
  if (!config.endpoint.trim() || !config.model.trim()) {
    testResult.value = `❌ 请检查配置项是否完整`
    return
  }

  if (config.type !== DEFAULT_SERVICE_TYPE && !config.apiKey.trim()) {
    testResult.value = `❌ 请输入 API Key`
    return
  }

  try {
    // eslint-disable-next-line no-new
    new URL(config.endpoint)
  }
  catch {
    testResult.value = `❌ 端点格式有误`
    return
  }

  if (config.type === DEFAULT_SERVICE_TYPE) {
    config.apiKey = ``
  }

  pushToStore()
  testResult.value = `✅ 配置已保存`
  emit(`saved`)
}

function clearConfig() {
  AIImageConfigStore.reset()
  pullFromStore()
  testResult.value = `🗑️ 当前 AI 图像配置已清除`
}

async function testConnection() {
  testResult.value = ``
  loading.value = true

  const headers: Record<string, string> = { 'Content-Type': `application/json` }
  if (config.apiKey && config.type !== DEFAULT_SERVICE_TYPE)
    headers.Authorization = `Bearer ${config.apiKey}`

  try {
    const url = new URL(config.endpoint)
    if (!url.pathname.includes(`/images/`) && !url.pathname.endsWith(`/images/generations`)) {
      url.pathname = url.pathname.replace(/\/?$/, `/images/generations`)
    }

    const payload = {
      model: config.model,
      prompt: `test connection`,
      size: config.size,
      quality: config.quality,
      style: config.style,
      n: 1,
    }

    const res = await window.fetch(url.toString(), {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      testResult.value = `✅ 连接成功`
    }
    else {
      const errorText = await res.text()
      testResult.value = `❌ 连接失败：${res.status} ${errorText}`
    }
  }
  catch (error) {
    testResult.value = `❌ 连接失败：${(error as Error).message}`
  }
  finally {
    loading.value = false
  }
}

/* -------------------------- 图像尺寸选项 -------------------------- */

const sizeOptions = [
  { label: `正方形 (1024x1024)`, value: `1024x1024` },
  { label: `横版 (1792x1024)`, value: `1792x1024` },
  { label: `竖版 (1024x1792)`, value: `1024x1792` },
]

const qualityOptions = [
  { label: `标准`, value: `standard` },
  { label: `高清`, value: `hd` },
]

const styleOptions = [
  { label: `自然`, value: `natural` },
  { label: `鲜明`, value: `vivid` },
]
</script>

<template>
  <div class="space-y-4 max-w-full">
    <div class="text-lg font-semibold border-b pb-2">
      AI 图像生成配置
    </div>

    <!-- 服务商选择 -->
    <div>
      <label class="text-sm font-medium">服务商</label>
      <select
        v-model="config.type"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        @change="handleServiceChange"
      >
        <option
          v-for="option in imageServiceOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- 端点配置 -->
    <div>
      <label class="text-sm font-medium">API 端点</label>
      <input
        v-model="config.endpoint"
        type="url"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        placeholder="https://api.openai.com/v1"
        readonly
      >
    </div>

    <!-- API Key -->
    <div v-if="config.type !== 'default'">
      <label class="text-sm font-medium">API Key</label>
      <input
        v-model="config.apiKey"
        type="password"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        placeholder="sk-..."
      >
    </div>

    <!-- 模型选择 -->
    <div>
      <label class="text-sm font-medium">模型</label>
      <select
        v-model="config.model"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
      >
        <option
          v-for="modelName in currentService.models"
          :key="modelName"
          :value="modelName"
        >
          {{ modelName }}
        </option>
      </select>
    </div>

    <!-- 图像尺寸 -->
    <div>
      <label class="text-sm font-medium">图像尺寸</label>
      <select
        v-model="config.size"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
      >
        <option
          v-for="option in sizeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- 图像质量 -->
    <div v-if="config.model.includes('dall-e')">
      <label class="text-sm font-medium">图像质量</label>
      <select
        v-model="config.quality"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
      >
        <option
          v-for="option in qualityOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- 图像风格 -->
    <div v-if="config.model.includes('dall-e')">
      <label class="text-sm font-medium">图像风格</label>
      <select
        v-model="config.style"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
      >
        <option
          v-for="option in styleOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- 说明 -->
    <div v-if="config.type === 'default'" class="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md text-sm">
      <Info class="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
      <div class="text-blue-700 dark:text-blue-300">
        <p class="font-medium">
          默认图像服务
        </p>
        <p>免费使用，无需配置 API Key，支持 Kwai-Kolors/Kolors 模型。</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-wrap gap-2">
      <Button
        type="button"
        class="flex-1 min-w-[100px]"
        @click="saveConfig"
      >
        保存配置
      </Button>
      <Button
        variant="outline"
        type="button"
        class="flex-1 min-w-[80px]"
        @click="clearConfig"
      >
        清空
      </Button>
      <Button
        size="sm"
        variant="outline"
        class="flex-1 min-w-[100px]"
        :disabled="loading"
        @click="testConnection"
      >
        {{ loading ? '测试中...' : '测试连接' }}
      </Button>
    </div>

    <!-- 测试结果显示 -->
    <div v-if="testResult" class="mt-1 text-xs text-gray-500">
      {{ testResult }}
    </div>
  </div>
</template>
