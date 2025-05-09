<script setup lang="ts">
import { serviceOptions } from '@/config/ai-services'
import { DEFAULT_SERVICE_TYPE } from '@/constants/AIConfig'
import useAIConfigStore from '@/stores/AIConfig'
import { Info } from 'lucide-vue-next'

/* -------------------------- 基础数据 -------------------------- */

const emit = defineEmits([`saved`])

const AIConfigStore = useAIConfigStore()
const { type, endpoint, model, apiKey, temperature, maxToken }
  = storeToRefs(AIConfigStore)

/** 本地草稿 */
const config = reactive({
  type: ``,
  endpoint: ``,
  apiKey: ``,
  model: ``,
  temperature: 1,
  maxToken: 1024,
})

/** UI 状态 */
const loading = ref(false)
const testResult = ref(``)

/** 当前服务信息 */
const currentService = computed(
  () => serviceOptions.find(s => s.value === config.type) || serviceOptions[0],
)

/* -------------------------- 同步函数 -------------------------- */

function pullFromStore() {
  config.type = type.value
  config.endpoint = endpoint.value
  config.apiKey = apiKey.value
  config.model = model.value
  config.temperature = temperature.value
  config.maxToken = maxToken.value
}
pullFromStore() // 首屏同步一次

/* -------------------------- 监听 -------------------------- */

watch(
  () => config.type,
  () => {
    config.endpoint = currentService.value.endpoint
    if (!currentService.value.models.includes(config.model)) {
      config.model = currentService.value.models[0] || ``
    }
    testResult.value = ``
  },
)

watch(() => config.model, () => (testResult.value = ``))

/* -------------------------- 操作 -------------------------- */

function saveConfig(emitEvent = true) {
  AIConfigStore.$patch({
    type: config.type,
    endpoint: config.endpoint,
    model: config.model,
    temperature: config.temperature,
    maxToken: config.maxToken,
  })
  apiKey.value = config.apiKey

  if (emitEvent) {
    testResult.value = `✅ 配置已保存`
    emit(`saved`)
  }
}

function clearConfig() {
  AIConfigStore.reset()
  pullFromStore()
  testResult.value = `🗑️ 当前 AI 配置已清除`
}

async function testConnection() {
  testResult.value = ``
  loading.value = true

  const headers: Record<string, string> = { 'Content-Type': `application/json` }
  if (config.apiKey && config.type !== DEFAULT_SERVICE_TYPE)
    headers.Authorization = `Bearer ${config.apiKey}`

  try {
    const url = new URL(config.endpoint)
    if (!url.pathname.endsWith(`/chat/completions`))
      url.pathname = url.pathname.replace(/\/?$/, `/chat/completions`)

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
      saveConfig(false)
    }
    else {
      const text = await res.text()
      try {
        const { error } = JSON.parse(text)
        if (
          res.status === 404
          && (error?.code === `ModelNotOpen`
            || /not activated|未开通/i.test(error?.message))
        ) {
          testResult.value = `⚠️ 测试成功，但当前模型未开通：${config.model}`
          saveConfig(false)
          return
        }
      }
      catch {}
      testResult.value = `❌ 测试失败：${res.status} ${res.statusText}，${text}`
    }
  }
  catch (err) {
    testResult.value = `❌ 测试失败：${(err as Error).message}`
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
    <div v-if="config.type !== DEFAULT_SERVICE_TYPE">
      <Label class="mb-1 block text-sm font-medium">API 端点</Label>
      <Input
        v-model="config.endpoint"
        placeholder="输入 API 端点 URL"
        class="focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
      />
    </div>

    <!-- API 密钥，仅非 default 显示 -->
    <div v-if="config.type !== DEFAULT_SERVICE_TYPE">
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
