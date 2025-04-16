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
import { onMounted, reactive, ref } from 'vue'

const emit = defineEmits([`saved`])

const config = reactive({
  type: ``,
  endpoint: ``,
  apiKey: ``,
  model: ``,
})

const loading = ref(false)
const testResult = ref(``)

onMounted(() => {
  config.type = localStorage.getItem(`openai_type`) || `自定义 OpenAI 兼容服务`
  config.endpoint = localStorage.getItem(`openai_endpoint`) || `https://api.openai.com/v1`
  config.apiKey = localStorage.getItem(`openai_key`) || ``
  config.model = localStorage.getItem(`openai_model`) || `gpt-3.5-turbo`
})

function saveConfig() {
  localStorage.setItem(`openai_type`, config.type)
  localStorage.setItem(`openai_endpoint`, config.endpoint)
  localStorage.setItem(`openai_key`, config.apiKey)
  localStorage.setItem(`openai_model`, config.model)
  testResult.value = `✅ 配置已保存`
  emit(`saved`)
}

function clearConfig() {
  localStorage.clear()
  testResult.value = `🗑️ 配置已清除`
}

async function testConnection() {
  testResult.value = ``
  loading.value = true
  try {
    const res = await fetch(`${config.endpoint}/models`, {
      method: `GET`,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    })
    if (res.ok) {
      testResult.value = `✅ 测试成功，API 可用`
    }
    else {
      testResult.value = `❌ 测试失败：${res.statusText}`
    }
  }
  catch (e) {
    console.log(e)
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

    <div>
      <Label class="text-sm font-medium">服务类型</Label>
      <Select v-model="config.type">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="请选择服务类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="自定义 OpenAI 兼容服务">
            自定义 OpenAI 兼容服务
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label class="text-sm font-medium">API 端点</Label>
      <Input v-model="config.endpoint" placeholder="https://api.openai.com/v1" />
    </div>

    <div>
      <Label class="text-sm font-medium">API 密钥</Label>
      <Input v-model="config.apiKey" type="password" placeholder="sk-..." />
    </div>

    <div>
      <Label class="text-sm font-medium">模型名称</Label>
      <Input v-model="config.model" placeholder="gpt-3.5-turbo" />
    </div>

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

    <div v-if="testResult" class="mt-1 text-xs text-gray-500">
      {{ testResult }}
    </div>
  </div>
</template>
