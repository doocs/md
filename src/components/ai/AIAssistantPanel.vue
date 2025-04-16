<script setup lang="ts">
import { useAIConfig } from '@/components/ai/useAIConfig'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { nextTick, onMounted, ref } from 'vue'

const dialogVisible = ref(false)
const input = ref(``)
interface ChatMessage {
  role: `user` | `assistant` | `system`
  content: string
}

const messages = ref<ChatMessage[]>([])
const configVisible = ref(false)
const loading = ref(false)
const memoryKey = `ai_memory_context`

const { apiKey, endpoint, model } = useAIConfig()

onMounted(() => {
  const saved = localStorage.getItem(memoryKey)
  if (saved)
    messages.value = JSON.parse(saved) as ChatMessage[]
  if (messages.value.length === 0) {
    messages.value = [
      { role: `assistant`, content: `你好，我是 AI 助手，有什么可以帮你的？` },
    ]
  }
})

function handleConfigSaved() {
  configVisible.value = false
}

async function scrollToBottom() {
  await nextTick()
  const container = document.querySelector(`.chat-container`)
  if (container)
    container.scrollTop = container.scrollHeight
}

async function sendMessage() {
  if (!input.value.trim() || loading.value)
    return

  loading.value = true
  const userInput = input.value.trim()
  messages.value.push({ role: `user`, content: userInput })
  input.value = ``

  const replyMessage: ChatMessage = { role: `assistant`, content: `` }
  messages.value.push(replyMessage)
  await scrollToBottom()

  const payload = {
    model: model.value,
    messages: [
      { role: `system`, content: `你是一个专业的 Markdown 编辑器助手，请用简洁中文回答。` },
      ...messages.value.slice(-10),
    ],
    temperature: 0.7,
    stream: true,
  }

  try {
    const res = await fetch(`${endpoint.value}/chat/completions`, {
      method: `POST`,
      headers: {
        'Authorization': `Bearer ${apiKey.value}`,
        'Content-Type': `application/json`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok || !res.body)
      throw new Error(`响应错误：${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder(`utf-8`)
    let done = false
    let partial = ``

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      partial += decoder.decode(value || new Uint8Array(), { stream: true })

      const lines = partial.split(`\n`).filter(l => l.trim() !== ``)
      partial = lines.pop() || ``

      for (const line of lines) {
        if (line.startsWith(`data:`)) {
          const data = line.slice(5).trim()
          if (data === `[DONE]`)
            break
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              const index = messages.value.length - 1
              messages.value[index].content += delta
              await scrollToBottom()
            }
          }
          catch (e) {
            console.log(e)
          }
        }
      }
    }
  }
  catch (e) {
    const index = messages.value.length - 1
    messages.value[index].content = `❌ ${(e as Error).message}`
  }
  finally {
    localStorage.setItem(memoryKey, JSON.stringify(messages.value))
    loading.value = false
  }
}

function clearMessages() {
  messages.value = [
    { role: `assistant`, content: `你好，我是 AI 助手，有什么可以帮你的？` },
  ]
  input.value = ``
  localStorage.removeItem(memoryKey)
}
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogTrigger>
      <Button variant="outline">
        AI 助手
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader class="flex items-center justify-between">
        <DialogTitle>AI 对话</DialogTitle>
        <button @click="configVisible = !configVisible">
          <span class="text-xl">⚙️</span>
        </button>
      </DialogHeader>

      <AIConfig v-if="configVisible" class="mb-4 border rounded-md p-4" @saved="handleConfigSaved" />

      <div
        v-if="!configVisible"
        class="space-y-2 chat-container mb-4 max-h-60 overflow-y-auto text-sm"
      >
        <div v-for="(msg, index) in messages" :key="index + msg.content.length">
          <div :class="msg.role === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-700'">
            <span class="font-medium">{{ msg.role === 'user' ? '你' : 'AI' }}：</span>
            {{ msg.content }}
          </div>
        </div>
      </div>

      <div v-if="!configVisible">
        <Textarea v-model="input" placeholder="说点什么..." rows="3" class="mb-2" />

        <DialogFooter class="flex justify-between">
          <Button variant="ghost" @click="clearMessages">
            清 空
          </Button>
          <Button :disabled="!input.trim() || loading" @click="sendMessage">
            {{ loading ? '发送中...' : '发 送' }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
