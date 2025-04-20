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
import { onMounted, reactive, ref, watch } from 'vue'

const emit = defineEmits([`saved`])

const serviceOptions = [
  {
    value: `deepseek`,
    label: `DeepSeek`,
    endpoint: `https://api.deepseek.com/v1`,
    models: [`deepseek-chat`, `deepseek-reasoner`],
  },
  {
    value: `openai`,
    label: `OpenAI`,
    endpoint: `https://api.openai.com/v1`,
    models: [`gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-4-turbo`, `gpt-4o`, `gpt-3.5-turbo`],
  },
  {
    value: `qwen`,
    label: `通义千问`,
    endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1`,
    models: [
      `qwen-plus`,
      `qwen-max`,
      `qwen-turbo`,
      `qwen-math-plus`,
      `qwen-math-turbo`,
      `qwen-coder-plus`,
      `qwen-coder-turbo`,
      `qwen-vl-plus`,
      `qwen-vl-max`,
    ],
  },
  {
    value: `custom`,
    label: `自定义服务`,
    endpoint: ``,
    models: [],
  },
]

const config = reactive({
  type: `deepseek`,
  endpoint: ``,
  apiKey: ``,
  model: ``,
  temperature: 1,
  maxToken: 1024,
})

const loading = ref(false)
const testResult = ref(``)

// 获取当前服务配置
function currentService() {
  return serviceOptions.find(service => service.value === config.type) || serviceOptions[0]
}

// 初始化配置
function initConfigFromStorage() {
  const savedType = localStorage.getItem(`openai_type`) || `deepseek`
  const service = serviceOptions.find(s => s.value === savedType) || serviceOptions[0]

  config.type = savedType
  config.endpoint = localStorage.getItem(`openai_endpoint`) || service.endpoint
  config.apiKey = localStorage.getItem(`openai_key_${savedType}`) || ``
  config.model = service.models.includes(localStorage.getItem(`openai_model`) || ``)
    ? localStorage.getItem(`openai_model`)!
    : service.models[0] || ``
  config.temperature = Number(localStorage.getItem(`openai_temperature`) || 1)
  config.maxToken = Number(localStorage.getItem(`openai_max_token`) || 1024)
}

onMounted(() => {
  initConfigFromStorage()
})

// 服务类型变化时自动更新 endpoint、model 和 API Key
watch(() => config.type, () => {
  const service = currentService()
  config.endpoint = service.endpoint
  const savedModel = localStorage.getItem(`openai_model`)
  if (savedModel && service.models.includes(savedModel)) {
    config.model = savedModel
  }
  else {
    config.model = service.models[0] || ``
  }
  config.apiKey = localStorage.getItem(`openai_key_${config.type}`) || ``
})

// 保存配置
function saveConfig() {
  localStorage.setItem(`openai_type`, config.type)
  localStorage.setItem(`openai_endpoint`, config.endpoint)
  localStorage.setItem(`openai_key_${config.type}`, config.apiKey)
  localStorage.setItem(`openai_model`, config.model)
  localStorage.setItem(`openai_temperature`, config.temperature.toString())
  localStorage.setItem(`openai_max_token`, config.maxToken.toString())
  testResult.value = `✅ 配置已保存`
  emit(`saved`)
}

// 清空配置
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

// 测试连接
async function testConnection() {
  testResult.value = ``
  loading.value = true
  try {
    const res = await window.fetch(`${config.endpoint}/models`, {
      method: `GET`,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    })
    testResult.value = res.ok ? `✅ 测试成功，API 可用` : `❌ 测试失败：${res.statusText}`
  }
  catch (e) {
    console.error(e)
    testResult.value = `❌ 网络错误或配置有误`
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4 text-sm">
    <div class="text-gray-800 font-medium">
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
          <SelectItem v-for="service in serviceOptions" :key="service.value" :value="service.value">
            {{ service.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- API 端点 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">API 端点</Label>
      <Input
        v-model="config.endpoint" placeholder="输入 API 端点 URL"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- API 密钥 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">API 密钥</Label>
      <Input
        v-model="config.apiKey" type="password" placeholder="sk-..."
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
          <SelectItem v-for="model in currentService().models" :key="model" :value="model">
            {{ model }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Input
        v-else v-model="config.model" placeholder="输入模型名称"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- 温度 -->
    <div>
      <Label class="mb-1 block text-sm font-medium">温度</Label>
      <Input
        v-model.number="config.temperature" type="number" step="0.1" min="0" max="2" placeholder="0 ~ 2，默认 1"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- 最大 Token -->
    <div>
      <Label class="mb-1 block text-sm font-medium">最大 Token 数</Label>
      <Input
        v-model.number="config.maxToken" type="number" min="1" max="32768" placeholder="比如 1024"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="mt-2 flex gap-2">
      <Button size="sm" @click="saveConfig">
        保存
      </Button>
      <Button size="sm" variant="ghost" @click="clearConfig">
        清空
      </Button>
      <Button size="sm" variant="outline" :disabled="loading" @click="testConnection">
        {{ loading ? '测试中...' : '测试连接' }}
      </Button>
    </div>

    <!-- 测试结果 -->
    <div v-if="testResult" class="mt-1 text-xs text-gray-500">
      {{ testResult }}
    </div>
  </div>
</template>
