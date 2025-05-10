<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useAIConfigStore from '@/stores/AIConfig'
import { Check, Copy, Edit, Pause, Send, Settings, Trash } from 'lucide-vue-next'
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits([`update:open`])
const store = useStore()
const { editor } = storeToRefs(store)

/* ---------- 弹窗开关 ---------- */
const dialogVisible = ref(props.open)
watch(() => props.open, val => (dialogVisible.value = val))
watch(dialogVisible, (val) => {
  emit(`update:open`, val)
  if (val)
    scrollToBottom(true)
})

/* ---------- 输入 & 历史 ---------- */
const input = ref(``)
const inputHistory = ref<string[]>([])
const historyIndex = ref<number | null>(null)

/* ---------- 配置 & 状态 ---------- */
const configVisible = ref(false)
const loading = ref(false)
const fetchController = ref<AbortController | null>(null)
const copiedIndex = ref<number | null>(null)
const memoryKey = `ai_memory_context`
const isQuoteAllContent = ref(false)

interface ChatMessage {
  role: `user` | `assistant` | `system`
  content: string
  reasoning?: string
  done?: boolean
}

const messages = ref<ChatMessage[]>([])
const AIConfigStore = useAIConfigStore()
const { apiKey, endpoint, model, temperature, maxToken, type } = storeToRefs(AIConfigStore)

/* ---------- 初始数据 ---------- */
onMounted(async () => {
  const saved = localStorage.getItem(memoryKey)
  messages.value = saved ? JSON.parse(saved) : getDefaultMessages()
  await scrollToBottom(true)
})
function getDefaultMessages(): ChatMessage[] {
  return [{ role: `assistant`, content: `你好，我是 AI 助手，有什么可以帮你的？` }]
}

/* ---------- 事件 ---------- */
function handleConfigSaved() {
  configVisible.value = false
  scrollToBottom(true)
}
function handleKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229)
    return

  if (e.key === `Enter` && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
  else if (e.key === `ArrowUp`) {
    e.preventDefault()
    if (inputHistory.value.length === 0)
      return
    if (historyIndex.value === null) {
      historyIndex.value = inputHistory.value.length - 1
    }
    else if (historyIndex.value > 0) {
      historyIndex.value--
    }
    input.value = inputHistory.value[historyIndex.value] || ``
  }
  else if (e.key === `ArrowDown`) {
    e.preventDefault()
    if (historyIndex.value === null)
      return
    if (historyIndex.value < inputHistory.value.length - 1) {
      historyIndex.value++
      input.value = inputHistory.value[historyIndex.value] || ``
    }
    else {
      historyIndex.value = null
      input.value = ``
    }
  }
}
async function copyToClipboard(text: string, index: number) {
  try {
    await navigator.clipboard.writeText(text)
    copiedIndex.value = index
    setTimeout(() => (copiedIndex.value = null), 1500)
  }
  catch (err) {
    console.error(`复制失败:`, err)
  }
}
function editMessage(content: string) {
  input.value = content
  historyIndex.value = null
  nextTick(() => {
    const textarea = document.querySelector(`textarea[placeholder*="说些什么" ]`) as HTMLTextAreaElement | null
    textarea?.focus()
    // 将光标置于文本末尾
    if (textarea) {
      const len = textarea.value.length
      textarea.setSelectionRange(len, len)
    }
  })
}
function resetMessages() {
  if (fetchController.value) {
    fetchController.value.abort()
    fetchController.value = null
  }
  messages.value = getDefaultMessages()
  localStorage.setItem(memoryKey, JSON.stringify(messages.value))
  scrollToBottom(true)
}

function pauseStreaming() {
  if (fetchController.value) {
    fetchController.value.abort() // 中断请求
    fetchController.value = null
  }
  loading.value = false // 恢复为非加载态
  // 可选：把最后一条 assistant 设为 done，防止光标闪烁
  const last = messages.value[messages.value.length - 1]
  if (last?.role === `assistant`)
    last.done = true
  scrollToBottom(true)
}

/* ---------- 滚动 ---------- */
async function scrollToBottom(force = false) {
  await nextTick()
  const container = document.querySelector(`.chat-container`)
  if (container) {
    const isNearBottom = (container.scrollTop + container.clientHeight) >= (container.scrollHeight - 50)
    if (force || isNearBottom) {
      container.scrollTop = container.scrollHeight
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
}

/* ---------- 引用全文 ---------- */
function quoteAllContent() {
  isQuoteAllContent.value = !isQuoteAllContent.value
}

/* ---------- 发送消息 ---------- */
async function sendMessage() {
  if (!input.value.trim() || loading.value)
    return

  inputHistory.value.push(input.value.trim())
  historyIndex.value = null

  loading.value = true
  const userInput = input.value.trim()
  messages.value.push({ role: `user`, content: userInput })
  input.value = ``

  const replyMessage: ChatMessage = { role: `assistant`, content: ``, reasoning: ``, done: false }
  messages.value.push(replyMessage)
  const replyMessageProxy = messages.value[messages.value.length - 1]
  await scrollToBottom(true)

  const payload = {
    model: model.value,
    messages: [
      { role: `system`, content: `你是一个专业的 Markdown 编辑器助手，请用简洁中文回答。` },
      ...messages.value
        .slice(-12)
        .filter((msg, idx, arr) =>
          !(idx === arr.length - 1 && msg.role === `assistant` && !msg.done)
          && !(idx === 0 && msg.role === `assistant`),
        )
        .slice(-10),
    ],
    temperature: temperature.value,
    max_tokens: maxToken.value,
    stream: true,
  }

  if (isQuoteAllContent.value) {
    payload.messages.splice(1, 0, { role: `system`, content: `markdown 的全文内容是：${editor.value!.getValue()}` })
  }

  const headers: Record<string, string> = { 'Content-Type': `application/json` }
  if (apiKey.value && type.value !== `default`)
    headers.Authorization = `Bearer ${apiKey.value}`

  fetchController.value = new AbortController()
  const signal = fetchController.value.signal

  try {
    const url = new URL(endpoint.value)
    if (!url.pathname.endsWith(`/chat/completions`))
      url.pathname = url.pathname.replace(/\/?$/, `/chat/completions`)

    const res = await window.fetch(url.toString(), {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
      signal,
    })
    if (!res.ok || !res.body)
      throw new Error(`响应错误：${res.status} ${res.statusText}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder(`utf-8`)
    let buffer = ``

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        const last = messages.value[messages.value.length - 1]
        if (last.role === `assistant`) {
          last.done = true
          await scrollToBottom(true)
        }
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(`\n`)
      buffer = lines.pop() || ``

      for (const line of lines) {
        if (!line.trim() || line.trim() === `data: [DONE]`)
          continue
        try {
          const json = JSON.parse(line.replace(/^data: /, ``))
          const delta = json.choices?.[0]?.delta || {}
          const last = messages.value[messages.value.length - 1]
          if (last !== replyMessageProxy)
            return
          if (delta.content)
            last.content += delta.content
          else if (delta.reasoning_content)
            last.reasoning = (last.reasoning || ``) + delta.reasoning_content
          await scrollToBottom()
        }
        catch (e) {
          console.error(`解析失败:`, e)
        }
      }
    }
  }
  catch (e) {
    if ((e as Error).name === `AbortError`) {
      console.log(`请求中止`)
    }
    else {
      console.error(`请求失败:`, e)
      messages.value[messages.value.length - 1].content = `❌ 请求失败: ${(e as Error).message}`
    }
    await scrollToBottom(true)
  }
  finally {
    localStorage.setItem(memoryKey, JSON.stringify(messages.value))
    loading.value = false
    fetchController.value = null
  }
}
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent class="bg-card text-card-foreground max-w-2xl w-full rounded-xl shadow-xl">
      <DialogHeader class="space-y-1 flex flex-col items-start">
        <div class="space-x-1 flex items-center">
          <DialogTitle>AI 对话</DialogTitle>
          <Button
            title="配置参数"
            aria-label="配置参数"
            variant="ghost"
            size="icon"
            @click="configVisible = !configVisible"
          >
            <Settings class="h-4 w-4" />
          </Button>

          <Button
            title="清空对话内容"
            aria-label="清空对话内容"
            variant="ghost"
            size="icon"
            @click="resetMessages"
          >
            <Trash class="h-4 w-4" />
          </Button>
        </div>
        <p class="text-muted-foreground text-sm">
          使用 AI 助手帮助您编写和优化内容
        </p>
      </DialogHeader>

      <AIConfig
        v-if="configVisible"
        class="mb-4 w-full border rounded-md p-4"
        @saved="handleConfigSaved"
      />

      <div
        v-if="!configVisible"
        class="custom-scroll space-y-3 chat-container mb-4 max-h-[60vh] overflow-y-auto pr-2"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="relative flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="ring-border/20 max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ring-1"
            :class="msg.role === 'user'
              ? 'bg-black text-white dark:bg-primary dark:text-primary-foreground'
              : 'bg-gray-100 text-gray-800 dark:bg-muted/60 dark:text-muted-foreground'"
          >
            <template v-if="msg.reasoning">
              <div class="text-muted-foreground mb-1 italic">
                {{ msg.reasoning }}
              </div>
            </template>
            <div
              class="whitespace-pre-wrap"
              :class="msg.content ? '' : 'animate-pulse text-muted-foreground'"
            >
              {{
                msg.content
                  || (msg.role === 'assistant' && !msg.done ? '思考中…' : '')
              }}
            </div>

            <div
              class="mt-1 flex"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <Button
                v-if="index > 0 && !(msg.role === 'assistant' && index === messages.length - 1 && !msg.done)"
                variant="ghost"
                size="icon"
                class="ml-0 h-5 w-5 p-1"
                aria-label="复制内容"
                @click="copyToClipboard(msg.content, index)"
              >
                <Check v-if="copiedIndex === index" class="h-3 w-3 text-green-600" />
                <Copy v-else class="text-muted-foreground h-3 w-3" />
              </Button>
              <Button
                v-if="index > 0 && !(msg.role === 'assistant' && index === messages.length - 1 && !msg.done)"
                variant="ghost"
                size="icon"
                class="ml-1 h-5 w-5 p-1"
                aria-label="编辑内容"
                @click="editMessage(msg.content)"
              >
                <Edit class="text-muted-foreground h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!configVisible" class="relative mt-2">
        <div
          class="item-start bg-background border-border flex flex-col items-baseline gap-2 border rounded-xl px-3 py-2 pr-12 shadow-inner"
        >
          <Textarea
            v-model="input"
            placeholder="说些什么… (Enter 发送，Shift+Enter 换行)"
            rows="2"
            class="custom-scroll min-h-16 w-full resize-none border-none bg-transparent p-0 focus-visible:outline-none focus:outline-none focus-visible:ring-0 focus:ring-0 focus-visible:ring-offset-0 focus:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent"
            @keydown="handleKeydown"
          />
          <!-- 引用全文按钮 -->
          <Button variant="ghost" size="icon" :class="isQuoteAllContent ? 'bg-gray-100' : 'text-gray-500'" class="h-8 w-20 border text-white color-black" aria-label="引用全文" @click="quoteAllContent">
            <Copy class="mr-1 h-4 w-4 color-gray-500" />
            <span class="text-xs text-gray-500">引用全文</span>
          </Button>
          <!-- 发送按钮 -->
          <Button
            :disabled="!input.trim() && !loading"
            size="icon"
            class="bg-primary text-primary-foreground hover:bg-primary/90 absolute bottom-3 right-3 rounded-full disabled:opacity-40"
            :aria-label="loading ? '暂停' : '发送'"
            @click="loading ? pauseStreaming() : sendMessage()"
          >
            <Pause v-if="loading" class="h-4 w-4" />
            <Send v-else class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
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
