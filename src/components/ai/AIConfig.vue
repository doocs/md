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
      `qwen-vl-max-2025-04-02`,
      `deepseek-v3`,
      `deepseek-r1-distill-llama-70b`,
      `deepseek-r1-distill-qwen-32b`,
      `deepseek-r1-distill-qwen-14b`,
      `deepseek-r1-distill-llama-8b`,
      `deepseek-r1-distill-qwen-1.5b`,
      `deepseek-r1-distill-qwen-7b`,
      `deepseek-r1`,
      `qwen1.5-7b-chat`,
      `qwen-coder-plus-1106`,
      `qwen-coder-plus`,
      `qwen-coder-plus-latest`,
      `qwen2.5-coder-3b-instruct`,
      `qwen2.5-coder-0.5b-instruct`,
      `qwen2.5-coder-14b-instruct`,
      `qwen2.5-coder-32b-instruct`,
      `qwen-coder-turbo-0919`,
      `qwen2.5-0.5b-instruct`,
      `qwen2.5-1.5b-instruct`,
      `qwen2.5-3b-instruct`,
      `qwen2.5-7b-instruct`,
      `qwen2.5-14b-instruct`,
      `qwen2.5-32b-instruct`,
      `qwen2.5-72b-instruct`,
      `qwen2.5-coder-7b-instruct`,
      `qwen2.5-math-1.5b-instruct`,
      `qwen2.5-math-7b-instruct`,
      `qwen2.5-math-72b-instruct`,
      `qwen-turbo-0919`,
      `qwen-turbo-latest`,
      `qwen-plus-0919`,
      `qwen-plus-latest`,
      `qwen-max-0919`,
      `qwen-max-latest`,
      `qwen-coder-turbo`,
      `qwen-coder-turbo-latest`,
      `qwen-math-turbo-0919`,
      `qwen-math-turbo`,
      `qwen-math-turbo-latest`,
      `qwen-math-plus-0919`,
      `qwen-math-plus`,
      `qwen-math-plus-latest`,
      `qwen2-57b-a14b-instruct`,
      `qwen2-72b-instruct`,
      `qwen2-7b-instruct`,
      `qwen2-0.5b-instruct`,
      `qwen2-1.5b-instruct`,
      `qwen-long`,
      `qwen-vl-max`,
      `qwen-vl-plus`,
      `qwen-max-0428`,
      `qwen1.5-110b-chat`,
      `qwen-72b-chat`,
      `codeqwen1.5-7b-chat`,
      `qwen1.5-0.5b-chat`,
      `qwen-1.8b-chat`,
      `qwen-1.8b-longcontext-chat`,
      `qwen-7b-chat`,
      `qwen-14b-chat`,
      `qwen1.5-14b-chat`,
      `qwen1.5-1.8b-chat`,
      `qwen1.5-32b-chat`,
      `qwen1.5-72b-chat`,
      `qwen-max-1201`,
      `qwen-max-longcontext`,
      `qwen-max-0403`,
      `qwen-max-0107`,
      `qwen-turbo`,
      `qwen-max`,
      `qwen-plus`,
    ],
  },
  {
    value: `hunyuan`,
    label: `腾讯混元`,
    endpoint: `https://api.hunyuan.cloud.tencent.com/v1`,
    models: [
      `hunyuan-pro`,
      `hunyuan-vision`,
      `hunyuan-lite`,
      `hunyuan-standard`,
      `hunyuan-standard-32K`,
      `hunyuan-standard-256k`,
      `hunyuan-code`,
      `hunyuan-role`,
      `hunyuan-functioncall`,
      `hunyuan-turbo-vision`,
      `hunyuan-turbo`,
    ],
  },
  {
    value: `doubao`,
    label: `豆包`,
    endpoint: `https://ark.cn-beijing.volces.com/api/v3`,
    models: [
      `doubao-1-5-thinking-pro-250415`,
      `doubao-1-5-thinking-pro-m-250415`,
      `deepseek-r1-250120`,
      `deepseek-r1-distill-qwen-32b-250120`,
      `deepseek-r1-distill-qwen-7b-250120`,
      `deepseek-v3-250324`,
      `deepseek-v3-241226`,
      `doubao-1-5-vision-pro-250328`,
      `doubao-1-5-vision-lite-250315`,
      `doubao-1-5-vision-pro-32k-250115`,
      `doubao-1-5-ui-tars-250328`,
      `doubao-vision-pro-32k-241028`,
      `doubao-vision-lite-32k-241015`,
      `doubao-1-5-pro-32k-250115`,
      `doubao-1-5-pro-256k-250115`,
      `doubao-1-5-lite-32k-250115`,
      `doubao-pro-4k-240515`,
      `doubao-pro-32k-241215`,
      `doubao-pro-32k-240828`,
      `doubao-pro-32k-240615`,
      `doubao-pro-256k-241115`,
      `doubao-lite-4k-character-240828`,
      `doubao-lite-32k-240828`,
      `doubao-lite-32k-character-241015`,
      `doubao-lite-128k-240828`,
      `moonshot-v1-8k`,
      `moonshot-v1-32k`,
      `moonshot-v1-128k`,
    ],
  },
  {
    value: `moonshot`,
    label: `月之暗面`,
    endpoint: `https://api.moonshot.cn/v1`,
    models: [
      `moonshot-v1-8k`,
      `moonshot-v1-32k`,
      `moonshot-v1-128k`,
    ],
  },
  {
    value: `custom`,
    label: `自定义兼容 OpenAI API 的服务`,
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

function currentService() {
  return serviceOptions.find(service => service.value === config.type) || serviceOptions[0]
}

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

watch(() => config.type, () => {
  const service = currentService()
  config.endpoint = service.endpoint
  const savedModel = localStorage.getItem(`openai_model`)
  config.model = savedModel && service.models.includes(savedModel) ? savedModel : (service.models[0] || ``)
  config.apiKey = localStorage.getItem(`openai_key_${config.type}`) || ``
  testResult.value = `` // ✅ 服务变化时，重置测试结果
})

// 监听模型变化
watch(() => config.model, () => {
  testResult.value = `` // ✅ 模型变化时，重置测试结果
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

  try {
    const url = new URL(config.endpoint)
    if (!url.pathname.endsWith(`/chat/completions`)) {
      url.pathname = url.pathname.replace(/\/?$/, `/chat/completions`)
    }

    const payload = {
      model: config.model || (currentService().models[0] || ``),
      messages: [{ role: `user`, content: `hello` }],
      temperature: config.temperature,
      max_tokens: config.maxToken,
      stream: false,
    }

    const res = await window.fetch(url.toString(), {
      method: `POST`,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': `application/json`,
      },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      testResult.value = `✅ 测试成功，/chat/completions 可用`
      saveConfig(false) // ✅ 测试成功后保存，但不触发 saved 事件
    }
    else {
      const text = await res.text()

      // 新增判断：如果是模型未开通
      try {
        const json = JSON.parse(text)
        const errorCode = json?.error?.code || ``
        const errorMessage = json?.error?.message || ``

        if (
          res.status === 404
          && (errorCode === `ModelNotOpen` || errorMessage.includes(`not activated`) || errorMessage.includes(`未开通`))
        ) {
          testResult.value = `⚠️ 测试成功，但当前模型未开通：${config.model}`
          saveConfig(false) // 保存配置，因为接口是正常的
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
    <div>
      <Label class="mb-1 block text-sm font-medium">API 端点</Label>
      <Input
        v-model="config.endpoint"
        placeholder="输入 API 端点 URL"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- API 密钥 -->
    <div>
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
