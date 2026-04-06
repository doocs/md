<script setup lang="ts">
import { imageServiceOptions } from '@md/shared/configs'
import { DEFAULT_SERVICE_TYPE } from '@md/shared/constants'
import { Info } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buildAIHeaders, resolveEndpointUrl, useAIFetch } from '@/composables/useAIFetch'
import useAIImageConfigStore from '@/stores/aiImageConfig'

/* -------------------------- 基础数据 -------------------------- */

const emit = defineEmits([`saved`])

const AIImageConfigStore = useAIImageConfigStore()
const { type, endpoint, model, apiKey, size, quality, style } = storeToRefs(AIImageConfigStore)

/** UI 状态 */
const { loading, fetchJSON } = useAIFetch()
const testResult = ref(``)

/** 当前服务信息 */
const currentService = computed(
  () => imageServiceOptions.find(s => s.value === type.value) || imageServiceOptions[0],
)

/* -------------------------- 监听 -------------------------- */

// 监听服务类型变化，清空测试结果
watch(type, () => {
  testResult.value = ``
})

// 监听模型变化，清空测试结果
watch(model, () => {
  testResult.value = ``
})

// 监听端点变化，清空测试结果
watch(endpoint, () => {
  testResult.value = ``
})

/* -------------------------- 表单提交 -------------------------- */

function saveConfig() {
  if (!endpoint.value.trim() || !model.value.trim()) {
    testResult.value = `❌ 请检查配置项是否完整`
    return
  }

  if (type.value !== DEFAULT_SERVICE_TYPE && !apiKey.value.trim()) {
    testResult.value = `❌ 请输入 API Key`
    return
  }

  try {
    // eslint-disable-next-line no-new
    new URL(endpoint.value)
  }
  catch {
    testResult.value = `❌ 端点格式有误`
    return
  }

  testResult.value = `✅ 配置已保存`
  emit(`saved`)
}

function clearConfig() {
  AIImageConfigStore.reset()
  testResult.value = `🗑️ 当前 AI 图像配置已清除`
}

async function testConnection() {
  testResult.value = ``
  loading.value = true

  const headers = buildAIHeaders(apiKey.value, type.value)

  try {
    const url = resolveEndpointUrl(endpoint.value, `image`)

    const payload = {
      model: model.value,
      prompt: `test connection`,
      size: size.value,
      quality: quality.value,
      style: style.value,
      n: 1,
    }

    const res = await fetchJSON(url, headers, payload)

    if (res.ok) {
      testResult.value = `✅ 连接成功`
    }
    else {
      testResult.value = `❌ 连接失败：${res.status} ${res.errorText}`
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
      <Label class="mb-1 block text-sm font-medium">服务商</Label>
      <Select v-model="type">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ currentService.label }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in imageServiceOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- 端点配置 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">API 端点</Label>
      <input
        v-model="endpoint"
        type="url"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        placeholder="https://api.openai.com/v1"
        :readonly="type !== 'custom'"
      >
    </div>

    <!-- API Key -->
    <div v-if="type !== 'default'">
      <Label class="mb-1 block text-sm font-medium">API Key</Label>
      <PasswordInput
        v-model="apiKey"
        class="w-full mt-1 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        placeholder="sk-..."
      />
    </div>

    <!-- 模型选择 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">模型</Label>
      <Select v-if="type !== 'custom' && currentService.models.length > 0" v-model="model">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ model || '请选择模型' }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="modelName in currentService.models"
            :key="modelName"
            :value="modelName"
          >
            {{ modelName }}
          </SelectItem>
        </SelectContent>
      </Select>
      <input
        v-else
        v-model="model"
        type="text"
        class="w-full mt-1 p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        placeholder="输入模型名称，如：dall-e-3"
      >
    </div>

    <!-- 图像尺寸 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">图像尺寸</Label>
      <Select v-model="size">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ sizeOptions.find(opt => opt.value === size)?.label || size }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in sizeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- 图像质量 -->
    <div v-if="model.includes('dall-e')">
      <Label class="mb-1 block text-sm font-medium">图像质量</Label>
      <Select v-model="quality">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ qualityOptions.find(opt => opt.value === quality)?.label || quality }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in qualityOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- 图像风格 -->
    <div v-if="model.includes('dall-e')">
      <Label class="mb-1 block text-sm font-medium">图像风格</Label>
      <Select v-model="style">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ styleOptions.find(opt => opt.value === style)?.label || style }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in styleOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- 说明 -->
    <div v-if="type === 'default'" class="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md text-sm">
      <Info class="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
      <div class="text-blue-700 dark:text-blue-300">
        <p class="font-medium">
          默认图像服务
        </p>
        <p>免费使用，无需配置 API Key，支持 Kwai-Kolors/Kolors 模型。</p>
      </div>
    </div>

    <!-- 自定义服务说明 -->
    <div v-else-if="type === 'custom'" class="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-md text-sm">
      <Info class="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
      <div class="text-orange-700 dark:text-orange-300">
        <p class="font-medium">
          自定义服务
        </p>
        <p>可配置任何兼容 OpenAI 图像生成 API 的服务，如自建的 API 代理或其他第三方服务。</p>
        <p class="mt-1 text-xs">
          端点格式示例：https://your-api.com/v1
        </p>
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
