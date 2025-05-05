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
import { DEFAULT_SERVICE_ENDPOINT, type ServiceOption, serviceOptions } from '@/config/ai-services'

import { onMounted, reactive, ref, watch } from 'vue'

const emit = defineEmits([`saved`])

const config = reactive<{
  type: ServiceOption[`value`]
  endpoint: string
  apiKey: string
  model: string
  temperature: number
  maxToken: number
}>({
  type: `default`,
  endpoint: ``,
  apiKey: ``,
  model: ``,
  temperature: 1,
  maxToken: 1024,
})

const loading = ref(false)
const testResult = ref(``)

function currentService() {
  return serviceOptions.find(service => service.value === config.type) || serviceOptions[0]
}

function initConfigFromStorage() {
  const savedType = localStorage.getItem(`openai_type`) || `default`
  const service = serviceOptions.find(s => s.value === savedType) || serviceOptions[0]

  config.type = savedType
  if (savedType === `default`) {
    config.endpoint = DEFAULT_SERVICE_ENDPOINT
  }
  else {
    config.endpoint = localStorage.getItem(`openai_endpoint`) || service.endpoint
  }
  config.apiKey = localStorage.getItem(`openai_key_${savedType}`) || ``

  const savedModel = localStorage.getItem(`openai_model`)
  config.model = savedModel && service.models.includes(savedModel) ? savedModel : (service.models[0] || ``)

  config.temperature = Number(localStorage.getItem(`openai_temperature`) || 1)
  config.maxToken = Number(localStorage.getItem(`openai_max_token`) || 1024)
}

onMounted(() => {
  initConfigFromStorage()
})

// 监听模型变化
watch(() => config.model, () => {
  testResult.value = `` // ✅ 模型变化时，重置测试结果
})

watch(() => config.type, () => {
  const service = currentService()
  if (config.type === `default`) {
    config.endpoint = DEFAULT_SERVICE_ENDPOINT
    config.model = service.models[0] || ``
  }
  else {
    const savedModel = localStorage.getItem(`openai_model`)
    config.endpoint = service.endpoint
    config.model = savedModel && service.models.includes(savedModel) ? savedModel : (service.models[0] || ``)
    config.apiKey = localStorage.getItem(`openai_key_${config.type}`) || ``
  }
  testResult.value = `` // ✅ 服务变化时，重置测试结果
})

function saveConfig(emitEvent = true) {
  localStorage.setItem(`openai_type`, config.type)
  localStorage.setItem(`openai_endpoint`, config.endpoint)
  localStorage.setItem(`openai_key_${config.type}`, config.apiKey)
  localStorage.setItem(`openai_model`, config.model)
  localStorage.setItem(`openai_temperature`, config.temperature.toString())
  localStorage.setItem(`openai_max_token`, config.maxToken.toString())

  if (emitEvent) {
    testResult.value = `✅ 配置已保存`
    emit(`saved`)
  }
}

function clearConfig() {
  localStorage.removeItem(`openai_type`)
  localStorage.removeItem(`openai_endpoint`)
  localStorage.removeItem(`openai_model`)
  localStorage.removeItem(`openai_temperature`)
  localStorage.removeItem(`openai_max_token`)
  serviceOptions.forEach((service) => {
    localStorage.removeItem(`openai_key_${service.value}`)
  })

  initConfigFromStorage()
  testResult.value = `🗑️ 当前 AI 配置已清除`
}

async function testConnection() {
  testResult.value = ``
  loading.value = true

  const headers: Record<string, string> = {
    'Content-Type': `application/json`,
  }
  if (config.apiKey && config.type !== `default`) {
    headers.Authorization = `Bearer ${config.apiKey}`
  }

  try {
    const url = new URL(config.endpoint)
    if (!url.pathname.endsWith(`/chat/completions`)) {
      url.pathname = url.pathname.replace(/\/?$/, `/chat/completions`)
    }

    const payload = {
      model: config.model || (currentService().models[0] || ``),
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
            {{ currentService().label }}
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
      <Select v-if="currentService().models.length > 0" v-model="config.model">
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ config.model || '请选择模型' }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="model in currentService().models"
            :key="model"
            :value="model"
          >
            {{ model }}
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
      <Label class="mb-1 block text-sm font-medium">温度</Label>
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
