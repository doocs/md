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

const emit = defineEmits([`saved`])

const AIImageConfigStore = useAIImageConfigStore()
const { type, endpoint, model, apiKey, size, quality, style } = storeToRefs(AIImageConfigStore)
const { t } = useI18n()

const { loading, fetchJSON, fetchGET } = useAIFetch()
const testResult = ref(``)
const discoveredModels = ref<string[]>([])
const discoveringModels = ref(false)

interface ModelListResponse {
  data?: Array<{ id?: unknown }>
}
const localizedAIServices = useLocalizedAIServiceOptions()

const currentService = computed(
  () => localizedAIServices.value.imageServiceOptions.find(s => s.value === type.value)
    || localizedAIServices.value.imageServiceOptions[0],
)

watch(type, () => {
  testResult.value = ``
})

watch(model, () => {
  testResult.value = ``
})

watch(endpoint, () => {
  testResult.value = ``
})

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
    void new URL(endpoint.value)
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
async function discoverModels() {
  discoveringModels.value = true
  testResult.value = ``

  try {
    const url = resolveEndpointUrl(endpoint.value, `models`)
    const headers = buildAIHeaders(apiKey.value, type.value)
    const res = await fetchGET<ModelListResponse>(url, headers)

    if (!res.ok) {
      testResult.value = t('ai.imageConfig.discoverModelsFailed', { status: res.status, statusText: res.statusText })
      return
    }

    discoveredModels.value = (res.data?.data || [])
      .map(item => typeof item.id === `string` ? item.id : ``)
      .filter(Boolean)

    if (discoveredModels.value.length === 0) {
      testResult.value = t('ai.imageConfig.discoverModelsEmpty')
      return
    }

    testResult.value = t('ai.imageConfig.discoverModelsSuccess', { count: discoveredModels.value.length })
  }
  catch (error) {
    testResult.value = t('ai.imageConfig.discoverModelsFailedMessage', { message: (error as Error).message })
  }
  finally {
    discoveringModels.value = false
  }
}

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
    <div class="font-medium">
      {{ t('ai.imageConfig.title') }}
    </div>

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

    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.apiEndpoint') }}</Label>
      <input
        v-model="endpoint"
        type="url"
        class="w-full mt-1 rounded-md border bg-background p-2 transition-colors focus:border-primary focus:ring-2 focus:ring-primary"
        :placeholder="t('ai.imageConfig.apiEndpointPlaceholder')"
        :readonly="type !== 'custom'"
      >
    </div>

    <div v-if="type !== 'default'">
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.apiKey') }}</Label>
      <PasswordInput
        v-model="apiKey"
        class="w-full mt-1 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        :placeholder="t('ai.imageConfig.apiKeyPlaceholder')"
      />
    </div>

    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.imageConfig.model') }}</Label>
      <div class="flex gap-2">
        <input
          v-model="model"
          type="text"
          class="mt-1 min-w-0 flex-1 rounded-md border bg-background p-2 transition-colors focus:border-primary focus:ring-2 focus:ring-primary"
          :placeholder="t('ai.imageConfig.modelPlaceholder')"
        >
        <Button
          size="sm"
          variant="outline"
          :disabled="discoveringModels"
          @click="discoverModels"
        >
          {{ discoveringModels ? t('ai.imageConfig.discoveringModels') : t('ai.imageConfig.discoverModels') }}
        </Button>
      </div>
      <Select v-if="discoveredModels.length > 0" v-model="model">
        <SelectTrigger class="mt-2 w-full">
          <SelectValue :placeholder="t('ai.imageConfig.discoveredModels')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="discoveredModel in discoveredModels" :key="discoveredModel" :value="discoveredModel">
            {{ discoveredModel }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

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

    <div v-if="type === 'default'" class="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md text-sm">
      <Info class="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
      <div class="text-blue-700 dark:text-blue-300">
        <p class="font-medium">
          {{ t('ai.imageConfig.defaultServiceTitle') }}
        </p>
        <p>{{ t('ai.imageConfig.defaultServiceDesc') }}</p>
      </div>
    </div>

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

    <div v-if="testResult" class="mt-1 text-xs text-gray-500">
      {{ testResult }}
    </div>
  </div>
</template>
