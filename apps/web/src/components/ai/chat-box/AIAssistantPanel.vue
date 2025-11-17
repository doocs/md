<script setup lang="ts">
import type { QuickCommandRuntime } from '@/stores/quickCommands'
import {
  Check,
  Copy,
  FolderOpen,
  Image as ImageIcon,
  MessageCircle,
  Pause,
  Plus,
  RefreshCcw,
  Send,
  Settings,
  Trash2,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import useAIConfigStore from '@/stores/aiConfig'
import { useEditorStore } from '@/stores/editor'
import { useQuickCommands } from '@/stores/quickCommands'
import { useUIStore } from '@/stores/ui'
import { copyPlain } from '@/utils/clipboard'
import { store } from '@/utils/storage'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits([`update:open`])

const editorStore = useEditorStore()
const { editor } = storeToRefs(editorStore)
const uiStore = useUIStore()
const { toggleAIImageDialog } = uiStore

const dialogVisible = ref(props.open)
watch(() => props.open, val => (dialogVisible.value = val))
watch(dialogVisible, (val) => {
  emit(`update:open`, val)
  if (val)
    scrollToBottom(true)
})

const input = ref<string>(``)
const inputHistory = ref<string[]>([])
const historyIndex = ref<number | null>(null)

const configVisible = ref(false)
const loading = ref(false)
const fetchController = ref<AbortController | null>(null)
const copiedIndex = ref<number | null>(null)
const memoryKey = `ai_memory_context`
const isQuoteAllContent = ref(false)
const cmdMgrOpen = ref(false)

const conversationListKey = `ai_conversation_list`
const currentConversationId = ref<string | null>(null)
const conversationList = ref<Array<{ id: string, name: string, timestamp: number }>>([])

interface ChatMessage {
  role: `user` | `assistant` | `system`
  content: string
  reasoning?: string
  done?: boolean
  id?: string
}

const messages = ref<ChatMessage[]>([])
const AIConfigStore = useAIConfigStore()
const { apiKey, endpoint, model, temperature, maxToken, type } = storeToRefs(AIConfigStore)

const quickCmdStore = useQuickCommands()

function getSelectedText(): string {
  try {
    const cm: any = editor.value
    if (!cm)
      return ``
    if (typeof cm.getSelection === `function`)
      return cm.getSelection() || ``
    return ``
  }
  catch (e) {
    console.warn(`获取选中文本失败`, e)
    return ``
  }
}

function applyQuickCommand(cmd: QuickCommandRuntime) {
  const selected = getSelectedText()
  input.value = cmd.buildPrompt(selected)
  historyIndex.value = null
  nextTick(() => {
    const textarea = document.querySelector(
      `textarea[placeholder*="说些什么" ]`,
    ) as HTMLTextAreaElement | null
    textarea?.focus()
    if (textarea) {
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    }
  })
}

onMounted(async () => {
  const savedList = await store.get(conversationListKey)
  if (savedList) {
    conversationList.value = JSON.parse(savedList)
  }

  const saved = await store.get(memoryKey)
  messages.value = saved
    ? JSON.parse(saved).map((msg: ChatMessage) => ({
        ...msg,
        id: msg.id || crypto.randomUUID(),
      }))
    : getDefaultMessages()
  await scrollToBottom(true)
})

function getDefaultMessages(): ChatMessage[] {
  return [{ role: `assistant`, content: `你好，我是 AI 助手，有什么可以帮你的？`, id: crypto.randomUUID() }]
}

function generateConversationTitle(): string {
  const firstUserMessage = messages.value.find(m => m.role === `user`)
  if (!firstUserMessage)
    return `对话 ${new Date().toLocaleString()}`

  let title = firstUserMessage.content.trim()
  if (title.length > 20) {
    title = `${title.substring(0, 20)}...`
  }

  return title
}

async function autoSaveCurrentConversation() {
  if (messages.value.length <= 1)
    return

  if (!currentConversationId.value) {
    currentConversationId.value = crypto.randomUUID()

    const conversation = {
      id: currentConversationId.value,
      name: generateConversationTitle(),
      timestamp: Date.now(),
    }
    conversationList.value.unshift(conversation)
    await store.setJSON(conversationListKey, conversationList.value)
  }
  else {
    const conv = conversationList.value.find(c => c.id === currentConversationId.value)
    if (conv) {
      conv.timestamp = Date.now()
      await store.setJSON(conversationListKey, conversationList.value)
    }
  }

  await store.setJSON(`ai_conversation_${currentConversationId.value}`, messages.value)
}

async function createNewConversation() {
  await autoSaveCurrentConversation()

  currentConversationId.value = null
  messages.value = getDefaultMessages()
  await store.setJSON(memoryKey, messages.value)
  await scrollToBottom(true)
  toast.success(`已创建新会话`)
}

async function loadConversation(id: string) {
  await autoSaveCurrentConversation()

  const saved = await store.getJSON<ChatMessage[]>(`ai_conversation_${id}`, [])
  if (saved.length > 0) {
    messages.value = saved.map(msg => ({
      ...msg,
      id: msg.id || crypto.randomUUID(),
    }))
    currentConversationId.value = id
    await store.setJSON(memoryKey, messages.value)
    await scrollToBottom(true)
    toast.success(`对话已加载`)
  }
}

async function deleteConversation(id: string) {
  conversationList.value = conversationList.value.filter(c => c.id !== id)
  await store.setJSON(conversationListKey, conversationList.value)
  await store.remove(`ai_conversation_${id}`)

  if (currentConversationId.value === id) {
    currentConversationId.value = null
    messages.value = getDefaultMessages()
    await store.setJSON(memoryKey, messages.value)
  }

  toast.success(`对话已删除`)
}

function handleConfigSaved() {
  configVisible.value = false
  scrollToBottom(true)
}

function switchToImageGenerator() {
  emit(`update:open`, false)
  setTimeout(() => {
    toggleAIImageDialog(true)
  }, 100)
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
  copyPlain(text)
  copiedIndex.value = index
  setTimeout(() => (copiedIndex.value = null), 1500)
}

async function resetMessages() {
  if (fetchController.value) {
    fetchController.value.abort()
    fetchController.value = null
  }

  if (currentConversationId.value) {
    conversationList.value = conversationList.value.filter(c => c.id !== currentConversationId.value)
    await store.setJSON(conversationListKey, conversationList.value)
    await store.remove(`ai_conversation_${currentConversationId.value}`)
    currentConversationId.value = null
  }

  messages.value = getDefaultMessages()
  await store.setJSON(memoryKey, messages.value)
  scrollToBottom(true)
  toast.success(`会话已清空`)
}

function pauseStreaming() {
  if (fetchController.value) {
    fetchController.value.abort()
    fetchController.value = null
  }
  loading.value = false
  const last = messages.value[messages.value.length - 1]
  if (last?.role === `assistant`)
    last.done = true
  scrollToBottom(true)
}

async function scrollToBottom(force = false) {
  await nextTick()
  const container = document.querySelector(`.chat-container`)
  if (container) {
    const isNearBottom = (container.scrollTop + container.clientHeight)
      >= (container.scrollHeight - 50)
    if (force || isNearBottom) {
      container.scrollTop = container.scrollHeight
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
}

function quoteAllContent() {
  isQuoteAllContent.value = !isQuoteAllContent.value
}

async function regenerateLast() {
  if (loading.value)
    return

  const lastAssistantIdx = messages.value.length - 1
  if (lastAssistantIdx < 0 || messages.value[lastAssistantIdx].role !== `assistant`)
    return

  messages.value.splice(lastAssistantIdx, 1)

  loading.value = true
  const replyMessage: ChatMessage = { role: `assistant`, content: ``, reasoning: ``, done: false }
  messages.value.push(replyMessage)
  const replyMessageProxy = messages.value[messages.value.length - 1]
  await scrollToBottom(true)

  await streamResponse(replyMessageProxy)
}

async function streamResponse(replyMessageProxy: ChatMessage) {
  const allHistory = messages.value
    .slice(-12)
    .filter((msg, idx, arr) =>
      !(idx === arr.length - 1 && msg.role === `assistant` && !msg.done)
      && !(idx === 0 && msg.role === `assistant`),
    )

  let contextHistory: ChatMessage[]
  if (isQuoteAllContent.value) {
    const latest: ChatMessage[] = []
    for (let i = allHistory.length - 1; i >= 0 && latest.length < 2; i--) {
      const m = allHistory[i]
      if (latest.length === 0 || m.role === `user`)
        latest.unshift(m)
      else if (m.role === `assistant`)
        latest.unshift(m)
    }
    contextHistory = latest
  }
  else {
    contextHistory = allHistory.slice(-10)
  }
  const quoteMessages: ChatMessage[] = isQuoteAllContent.value
    ? [{
        role: `system`,
        content:
          `下面是一篇 Markdown 文章全文，请严格以此为主完成后续指令：\n\n${editor.value?.state.doc.toString()}`,
      }]
    : []

  const payloadMessages: ChatMessage[] = [
    {
      role: `system`,
      content: `你是一个专业的 Markdown 编辑器助手，请用简洁中文回答。`,
    },
    ...quoteMessages,
    ...contextHistory,
  ]

  const payload = {
    model: model.value,
    messages: payloadMessages,
    temperature: temperature.value,
    max_tokens: maxToken.value,
    stream: true,
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
        catch {
        }
      }
    }
  }
  catch (e) {
    if ((e as Error).name !== `AbortError`) {
      messages.value[messages.value.length - 1].content
        = `❌ 请求失败: ${(e as Error).message}`
    }
    await scrollToBottom(true)
  }
  finally {
    await store.setJSON(memoryKey, messages.value)
    await autoSaveCurrentConversation()
    loading.value = false
    fetchController.value = null
  }
}

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

  await streamResponse(replyMessageProxy)
}
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent
      class="bg-card text-card-foreground h-dvh max-h-dvh w-full flex flex-col rounded-none shadow-xl sm:max-h-[80vh] sm:max-w-2xl sm:rounded-xl"
    >
      <!-- ============ 头部 ============ -->
      <DialogHeader class="space-y-1 flex flex-col items-start">
        <div class="space-x-1 flex items-center">
          <DialogTitle>AI 对话</DialogTitle>

          <Button
            :title="configVisible ? 'AI 对话' : '配置参数'"
            :aria-label="configVisible ? 'AI 对话' : '配置参数'"
            variant="ghost"
            size="icon"
            @click="configVisible = !configVisible"
          >
            <MessageCircle v-if="configVisible" class="h-4 w-4" />
            <Settings v-else class="h-4 w-4" />
          </Button>

          <Button
            title="AI 文生图"
            aria-label="AI 文生图"
            variant="ghost"
            size="icon"
            @click="switchToImageGenerator()"
          >
            <ImageIcon class="h-4 w-4" />
          </Button>

          <Button
            title="新建会话"
            aria-label="新建会话"
            variant="ghost"
            size="icon"
            @click="createNewConversation"
          >
            <Plus class="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                title="加载对话"
                aria-label="加载对话"
                variant="ghost"
                size="icon"
              >
                <FolderOpen class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="max-h-64 overflow-y-auto w-64 z-[9999]">
              <DropdownMenuItem
                v-if="conversationList.length === 0"
                disabled
                class="text-muted-foreground text-sm"
              >
                暂无保存的对话
              </DropdownMenuItem>
              <DropdownMenuItem
                v-for="conv in conversationList"
                :key="conv.id"
                class="flex items-center justify-between gap-2 cursor-pointer"
                @click="loadConversation(conv.id)"
              >
                <span class="flex-1 truncate">
                  {{ conv.name }}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-6 w-6 flex-shrink-0"
                  @click.stop="deleteConversation(conv.id)"
                >
                  <Trash2 class="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            title="清空对话内容"
            aria-label="清空对话内容"
            variant="ghost"
            size="icon"
            @click="resetMessages"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
        <DialogDescription class="text-muted-foreground text-sm">
          使用 AI 助手帮助您编写和优化内容
        </DialogDescription>
      </DialogHeader>

      <!-- ============ 快捷指令 ============ -->
      <div
        v-if="!configVisible"
        class="mb-3 flex flex-wrap gap-2 overflow-x-auto pb-1"
      >
        <template v-if="quickCmdStore.commands.length">
          <Button
            v-for="cmd in quickCmdStore.commands"
            :key="cmd.id"
            variant="secondary"
            size="sm"
            class="text-xs"
            @click="applyQuickCommand(cmd)"
          >
            {{ cmd.label }}
          </Button>
        </template>
        <template v-else>
          <div
            class="text-muted-foreground flex items-center gap-2 border rounded-md border-dashed px-3 py-1 text-xs"
          >
            还没有任何快捷指令，点击右侧添加
          </div>
        </template>
        <Button
          variant="ghost"
          size="icon"
          title="管理指令"
          @click="cmdMgrOpen = true"
        >
          <Plus class="h-4 w-4" />
        </Button>

        <!-- 指令管理弹窗 -->
        <QuickCommandManager v-model:open="cmdMgrOpen" />
      </div>

      <!-- ============ 参数配置面板 ============ -->
      <AIConfig
        v-if="configVisible"
        class="mb-4 w-full border rounded-md p-4"
        @saved="handleConfigSaved"
      />

      <!-- ============ 聊天内容 ============ -->
      <div
        v-if="!configVisible"
        class="custom-scroll space-y-3 chat-container mb-4 flex-1 overflow-y-auto pr-2"
      >
        <div
          v-for="(msg, index) in messages"
          :key="msg.id || index"
          class="relative flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="ring-border/20 max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-xs ring-1"
            :class="msg.role === 'user'
              ? 'bg-black text-white dark:bg-primary dark:text-primary-foreground'
              : 'bg-gray-100 text-gray-800 dark:bg-muted/60 dark:text-muted-foreground'"
          >
            <!-- reasoning -->
            <div v-if="msg.reasoning" class="text-muted-foreground mb-1 italic">
              {{ msg.reasoning }}
            </div>

            <!-- 消息内容 -->
            <div
              class="whitespace-pre-wrap"
              :class="msg.content ? '' : 'animate-pulse text-muted-foreground'"
            >
              {{
                msg.content
                  || (msg.role === 'assistant' && !msg.done ? '思考中…' : '')
              }}
            </div>

            <!-- 工具按钮 -->
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
                <Check
                  v-if="copiedIndex === index"
                  class="h-3 w-3 text-green-600"
                />
                <Copy v-else class="text-muted-foreground h-3 w-3" />
              </Button>
              <Button
                v-if="msg.role === 'assistant' && msg.done && index === messages.length - 1"
                variant="ghost"
                size="icon"
                class="ml-1 h-5 w-5 p-1"
                aria-label="重新生成"
                @click="regenerateLast"
              >
                <RefreshCcw class="text-muted-foreground h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 输入框 ============ -->
      <div v-if="!configVisible" class="relative mt-2">
        <div
          class="bg-background border-border flex flex-col items-baseline gap-2 border rounded-xl px-3 py-2 pr-12 shadow-inner"
        >
          <Textarea
            v-model="input"
            placeholder="说些什么… (Enter 发送，Shift+Enter 换行)"
            rows="2"
            class="custom-scroll min-h-16 w-full resize-none border-none bg-transparent p-0 focus-visible:outline-hidden focus:outline-hidden focus-visible:ring-0 focus:ring-0 focus-visible:ring-offset-0 focus:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent"
            @keydown="handleKeydown"
          />

          <!-- 引用全文按钮 -->
          <Button
            size="sm"
            variant="outline"
            class="h-8 flex items-center gap-1 rounded-md px-3 font-medium transition-colors duration-150"
            :class="[
              isQuoteAllContent
                ? 'bg-primary text-white border-primary dark:bg-white dark:text-black dark:border-white'
                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground dark:bg-muted dark:text-gray-400 dark:hover:text-white dark:hover:border-white/60',
            ]"
            aria-label="引用全文"
            @click="quoteAllContent"
          >
            <component :is="isQuoteAllContent ? Check : Copy" class="h-4 w-4" />
            <span class="text-xs">引用全文</span>
          </Button>

          <!-- 发送 / 暂停按钮 -->
          <Button
            :disabled="!input.trim() && !loading"
            size="icon"
            :class="[
              // eslint-disable-next-line vue/prefer-separate-static-class
              'absolute bottom-3 right-3 rounded-full disabled:opacity-40',
              // eslint-disable-next-line vue/prefer-separate-static-class
              'bg-primary hover:bg-primary/90 text-primary-foreground',
            ]"
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
@reference 'tailwindcss';

:root {
  --safe-bottom: env(safe-area-inset-bottom);
}

/* 聊天容器底部内边距，适配安全区 */
.chat-container {
  padding-bottom: calc(1rem + var(--safe-bottom));
}

/* 让代码块可横向滚动 */
.chat-container pre {
  overflow-x: auto;
}

/* highlight.js 暗黑主题适配 */
.dark .hljs {
  background: #0d1117 !important;
  color: #c9d1d9 !important;
}

/* 自定义滚动条 */
@media (pointer: coarse) {
  .custom-scroll::-webkit-scrollbar {
    width: 3px;
  }
}
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
