<script setup lang="ts">
import { Info } from '@lucide/vue'
import { DEFAULT_SERVICE_TYPE } from '@md/shared/constants'
import { PasswordInput } from '@/components/ui/password-input'
import { buildAIHeaders, resolveEndpointUrl, useAIFetch } from '@/composables/useAIFetch'
import { useLocalizedAIServiceOptions } from '@/composables/useLocalizedAIServices'
import useAIConfigStore from '@/stores/aiConfig'

const emit = defineEmits([`saved`])

const AIConfigStore = useAIConfigStore()
const { type, endpoint, model, apiKey, temperature, maxToken } = storeToRefs(AIConfigStore)
const { t } = useI18n()

const { loading, fetchJSON } = useAIFetch()
const testResult = ref(``)
const localizedAIServices = useLocalizedAIServiceOptions()

const currentService = computed(
  () => localizedAIServices.value.serviceOptions.find(s => s.value === type.value)
    || localizedAIServices.value.serviceOptions[0],
)

watch(type, () => {
  testResult.value = ``
})

watch(model, () => {
  testResult.value = ``
})

function saveConfig(emitEvent = true) {
  if (emitEvent) {
    testResult.value = t('ai.config.saved')
    emit(`saved`)
  }
}

function clearConfig() {
  AIConfigStore.reset()
  testResult.value = t('ai.config.cleared')
}

async function testConnection() {
  testResult.value = ``
  loading.value = true

  const headers = buildAIHeaders(apiKey.value, type.value)

  try {
    const url = resolveEndpointUrl(endpoint.value, `chat`)

    const payload = {
      model: model.value,
      messages: [{ role: `user`, content: `ping` }],
      temperature: 0,
      max_tokens: 1,
      stream: false,
    }

    const res = await fetchJSON(url, headers, payload)

    if (res.ok) {
      testResult.value = t('ai.config.testSuccess')
      saveConfig(false)
    }
    else {
      try {
        const { error } = JSON.parse(res.errorText)
        if (
          res.status === 404
          && (error?.code === `ModelNotOpen`
            || /not activated|未开通/i.test(error?.message))
        ) {
          testResult.value = t('ai.config.modelNotActivated', { model: model.value })
          saveConfig(false)
          return
        }
      }
      catch {}
      testResult.value = t('ai.config.testFailed', { status: res.status, statusText: res.statusText, errorText: res.errorText })
    }
  }
  catch (err) {
    testResult.value = t('ai.config.testFailedMessage', { message: (err as Error).message })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="custom-scroll space-y-4 max-h-[calc(100dvh-10rem)] overflow-y-auto text-xs sm:max-h-none sm:text-sm">
    <div class="font-medium">
      {{ t('ai.config.title') }}
    </div>

    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.config.serviceType') }}</Label>
      <Select v-model="type">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ currentService.label }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="service in localizedAIServices.serviceOptions"
            :key="service.value"
            :value="service.value"
          >
            {{ service.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="type !== DEFAULT_SERVICE_TYPE">
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.config.apiEndpoint') }}</Label>
      <Input
        v-model="endpoint"
        :placeholder="t('ai.config.apiEndpointPlaceholder')"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <div v-if="type !== DEFAULT_SERVICE_TYPE">
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.config.apiKey') }}</Label>
      <PasswordInput
        v-model="apiKey"
        :placeholder="t('ai.config.apiKeyPlaceholder')"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.config.modelName') }}</Label>
      <Select v-if="currentService.models.length > 0" v-model="model">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ model || t('ai.config.selectModel') }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="_model in currentService.models"
            :key="_model"
            :value="_model"
          >
            {{ _model }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Input
        v-else
        v-model="model"
        :placeholder="t('ai.config.modelPlaceholder')"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <div>
      <Label class="mb-1 flex items-center gap-1 text-sm font-medium">
        {{ t('ai.config.temperature') }}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Info class="text-gray-500" :size="16" />
            </TooltipTrigger>
            <TooltipContent side="top" class="z-[250]">
              <div>{{ t('ai.config.temperatureHint') }}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <Input
        v-model.number="temperature"
        type="number"
        step="0.1"
        min="0"
        max="2"
        :placeholder="t('ai.config.temperaturePlaceholder')"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t('ai.config.maxTokens') }}</Label>
      <Input
        v-model.number="maxToken"
        type="number"
        min="1"
        max="32768"
        :placeholder="t('ai.config.maxTokensPlaceholder')"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <div class="mt-2 flex flex-col gap-2 sm:flex-row">
      <Button size="sm" @click="saveConfig">
        {{ t('common.save') }}
      </Button>
      <Button size="sm" variant="ghost" @click="clearConfig">
        {{ t('common.clear') }}
      </Button>
      <Button
        size="sm"
        variant="outline"
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

<style scoped>
@reference 'tailwindcss';

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
@media (pointer: coarse) {
  .custom-scroll::-webkit-scrollbar {
    width: 3px;
  }
}

.custom-scroll::-webkit-scrollbar-thumb {
  @apply rounded-full bg-gray-400/40 hover:bg-gray-400/60;
  @apply dark:bg-gray-500/40 dark:hover:bg-gray-500/70;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175 / 0.4) transparent;
}
.dark .custom-scroll {
  scrollbar-color: rgb(107 114 128 / 0.4) transparent;
}
</style>
