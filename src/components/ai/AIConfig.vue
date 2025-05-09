<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DEFAULT_SERVICE_MODEL, serviceOptions } from '@/config/ai-services'
import { DEFAULT_SERVICE_ENDPOINT, DEFAULT_SERVICE_KEY, DEFAULT_SERVICE_MAX_TOKEN, DEFAULT_SERVICE_TEMPERATURE, DEFAULT_SERVICE_TYPE } from '@/constants/AIConfig'

import useAIConfigStore from '@/stores/AIConfig'
import { Info } from 'lucide-vue-next'

const emit = defineEmits([`saved`])

const AIConfigStore = useAIConfigStore()
const { type, apiKey, endpoint, model, temperature, maxToken } = storeToRefs(AIConfigStore)

const config = reactive({
  type: type.value,
  endpoint: endpoint.value,
  apiKey: apiKey.value,
  model: model.value,
  temperature: temperature.value,
  maxToken: maxToken.value,
})

const loading = ref(false)
const testResult = ref(``)

const currentService = computed(() => {
  return serviceOptions.find(service => service.value === config.type) || serviceOptions[0]
})

// 监听模型变化
watch(() => config.model, () => {
  testResult.value = `` // ✅ 模型变化时，重置测试结果
})

watch(() => config.type, () => {
  config.endpoint = currentService.value.endpoint
  config.model = model.value && currentService.value.models.includes(model.value) ? model.value : currentService.value.models[0]
  testResult.value = `` // ✅ 服务变化时，重置测试结果
})

function saveConfig(emitEvent = true) {
  type.value = config.type
  endpoint.value = config.endpoint
  apiKey.value = config.apiKey
  model.value = config.model
  temperature.value = config.temperature
  maxToken.value = config.maxToken

  if (emitEvent) {
    testResult.value = `✅ 配置已保存`
    emit(`saved`)
  }
}

function clearConfig() {
  config.type = DEFAULT_SERVICE_TYPE
  config.endpoint = DEFAULT_SERVICE_ENDPOINT
  config.apiKey = DEFAULT_SERVICE_KEY
  config.model = DEFAULT_SERVICE_MODEL
  config.temperature = DEFAULT_SERVICE_TEMPERATURE
  config.maxToken = DEFAULT_SERVICE_MAX_TOKEN

  AIConfigStore.reset()

  testResult.value = `🗑️ 当前 AI 配置已清除`
}

async function testConnection() {
  testResult.value = ``
  loading.value = true

  const headers: Record<string, string> = {
    'Content-Type': `application/json`,
  }
  if (config.apiKey && config.type !== DEFAULT_SERVICE_TYPE) {
    headers.Authorization = `Bearer ${config.apiKey}`
  }

  try {
    const url = new URL(config.endpoint)
    if (!url.pathname.endsWith(`/chat/completions`)) {
      url.pathname = url.pathname.replace(/\/?$/, `/chat/completions`)
    }

    const payload = {
      model: config.model,
      messages: [{ role: `user`, content: `ping` }],
      temperature: 0,
      max_tokens: 1,
      stream: false,
    }

    const res = await window.fetch(url.toString(), {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      testResult.value = `✅ 测试成功，/chat/completions 可用`
      saveConfig(false) // ✅ 测试成功后保存，但不触发 saved 事件
    }
    else {
      const text = await res.text()

      // 如果是模型未开通
      try {
        const json = JSON.parse(text)
        const errorCode = json?.error?.code || ``
        const errorMessage = json?.error?.message || ``

        if (
          res.status === 404
          && (errorCode === `ModelNotOpen`
            || errorMessage.includes(`not activated`)
            || errorMessage.includes(`未开通`))
        ) {
          testResult.value = `⚠️ 测试成功，但当前模型未开通：${config.model}`
          saveConfig(false)
          return
        }
      }
      catch (e) {
        console.log(e)
      }

      testResult.value = `❌ 测试失败：${res.status} ${res.statusText}，${text}`
    }
  }
  catch (e) {
    console.error(e)
    testResult.value = `❌ 测试失败：${(e as Error).message}`
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4 text-sm">
    <div class="font-medium">
      AI 配置
    </div>

    <!-- 服务类型 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">服务类型</Label>
      <Select v-model="config.type">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ currentService.label }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="service in serviceOptions"
            :key="service.value"
            :value="service.value"
          >
            {{ service.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- API 端点 -->
    <div v-if="config.type !== 'default'">
      <Label class="mb-1 block text-sm font-medium">API 端点</Label>
      <Input
        v-model="config.endpoint"
        placeholder="输入 API 端点 URL"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- API 密钥，仅非 default 显示 -->
    <div v-if="config.type !== 'default'">
      <Label class="mb-1 block text-sm font-medium">API 密钥</Label>
      <Input
        v-model="config.apiKey"
        type="password"
        placeholder="sk-..."
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- 模型名称 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">模型名称</Label>
      <Select v-if="currentService.models.length > 0" v-model="config.model">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ config.model || '请选择模型' }}
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
        v-model="config.model"
        placeholder="输入模型名称"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- 温度 temperature -->
    <div>
      <Label class="mb-1 flex items-center gap-1 text-sm font-medium">
        温度
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Info class="text-gray-500" :size="16" />
            </TooltipTrigger>
            <TooltipContent>
              <div>控制输出的随机性：较低的值使输出更确定，较高的值使其更随机。</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <Input
        v-model.number="config.temperature"
        type="number"
        step="0.1"
        min="0"
        max="2"
        placeholder="0 ~ 2，默认 1"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- 最大 Token 数 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">最大 Token 数</Label>
      <Input
        v-model.number="config.maxToken"
        type="number"
        min="1"
        max="32768"
        placeholder="比如 1024"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- 操作按钮区域 -->
    <div class="mt-2 flex gap-2">
      <Button size="sm" @click="saveConfig">
        保存
      </Button>
      <Button size="sm" variant="ghost" @click="clearConfig">
        清空
      </Button>
      <Button
        size="sm"
        variant="outline"
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
