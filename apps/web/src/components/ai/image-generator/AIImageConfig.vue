<script setup lang="ts">
import { Info } from '@lucide/vue'
import { DEFAULT_SERVICE_TYPE } from '@md/shared/constants'
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
import { useLocalizedAIServiceOptions } from '@/composables/useLocalizedAIServices'
import useAIImageConfigStore from '@/stores/aiImageConfig'

/* -------------------------- 基础数据 -------------------------- */

const emit = defineEmits([`saved`])

const AIImageConfigStore = useAIImageConfigStore()
const { type, endpoint, model, apiKey, size, quality, style } = storeToRefs(AIImageConfigStore)
const { t } = useI18n()

/** UI 状态 */
const { loading, fetchJSON } = useAIFetch()
const testResult = ref(``)
const localizedAIServices = useLocalizedAIServiceOptions()

/** 当前服务信息 */
const currentService = computed(
  () => localizedAIServices.value.imageServiceOptions.find(s => s.value === type.value)
    || localizedAIServices.value.imageServiceOptions[0],
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
    testResult.value = t('ai.imageConfig.incompleteConfig')
    return
  }

  if (type.value !== DEFAULT_SERVICE_TYPE && !apiKey.value.trim()) {
    testResult.value = t('ai.imageConfig.apiKeyRequired')
    return
  }

  try {
    // eslint-disable-next-line no-new
    new URL(endpoint.value)
  }
  catch {
    testResult.value = t('ai.imageConfig.invalidEndpoint')
    return
  }

  testResult.value = t('ai.imageConfig.saved')
  emit(`saved`)
}

function clearConfig() {
  AIImageConfigStore.reset()
  testResult.value = t('ai.imageConfig.cleared')
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
      testResult.value = t('ai.imageConfig.connectionSuccess')
    }
    else {
      testResult.value = t('ai.imageConfig.connectionFailed', { message: `${res.status} ${res.errorText}` })
    }
  }
  catch (error) {
    testResult.value = t('ai.imageConfig.connectionFailed', { message: (error as Error).message })
  }
  finally {
    loading.value = false
  }
}

/* -------------------------- 图像尺寸选项 -------------------------- */

const sizeOptions = computed(() => [
  { label: t('ai.imageConfig.sizeSquare'), value: `1024x1024` },
  { label: t('ai.imageConfig.sizeLandscape'), value: `1792x1024` },
  { label: t('ai.imageConfig.sizePortrait'), value: `1024x1792` },
])

const qualityOptions = computed(() => [
  { label: t('ai.imageConfig.qualityStandard'), value: `standard` },
  { label: t('ai.imageConfig.qualityHd'), value: `hd` },
])

const styleOptions = computed(() => [
  { label: t('ai.imageConfig.styleNatural'), value: `natural` },
  { label: t('ai.imageConfig.styleVivid'), value: `vivid` },
])
</script>

<template>
  <div class="space-y-4 max-w-full">
    <div class="text-lg font-semibold border-b pb-2">
      {{ t('ai.imageConfig.title') }}
    </div>

    <!-- 服务商选择 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.provider') }}</Label>
      <Select v-model="type">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ currentService.label }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in localizedAIServices.imageServiceOptions"
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
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.apiEndpoint') }}</Label>
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
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.model') }}</Label>
      <Select v-if="type !== 'custom' && currentService.models.length > 0" v-model="model">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ model || t('ai.imageConfig.selectModel') }}
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
        :placeholder="t('ai.imageConfig.modelPlaceholder')"
      >
    </div>

    <!-- 图像尺寸 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.imageSize') }}</Label>
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
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.imageQuality') }}</Label>
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
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.imageStyle') }}</Label>
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
          {{ t('ai.imageConfig.defaultServiceTitle') }}
        </p>
        <p>{{ t('ai.imageConfig.defaultServiceDesc') }}</p>
      </div>
    </div>

    <!-- 自定义服务说明 -->
    <div v-else-if="type === 'custom'" class="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-md text-sm">
      <Info class="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
      <div class="text-orange-700 dark:text-orange-300">
        <p class="font-medium">
          {{ t('ai.imageConfig.customServiceTitle') }}
        </p>
        <p>{{ t('ai.imageConfig.customServiceDesc') }}</p>
        <p class="mt-1 text-xs">
          {{ t('ai.imageConfig.endpointExample') }}
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
        {{ t('ai.imageConfig.saveConfig') }}
      </Button>
      <Button
        variant="outline"
        type="button"
        class="flex-1 min-w-[80px]"
        @click="clearConfig"
      >
        {{ t('common.clear') }}
      </Button>
      <Button
        size="sm"
        variant="outline"
        class="flex-1 min-w-[100px]"
        :disabled="loading"
        @click="testConnection"
      >
        {{ loading ? t('common.testing') : t('common.testConnection') }}
      </Button>
    </div>

    <!-- 测试结果显示 -->
    <div v-if="testResult" class="mt-1 text-xs text-gray-500">
      {{ testResult }}
    </div>
  </div>
</template>
