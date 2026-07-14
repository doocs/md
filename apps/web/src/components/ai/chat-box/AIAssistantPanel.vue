<script setup lang="ts">
import type { QuickCommandRuntime } from '@/stores/quickCommands'
import {
  Check,
  Copy,
  FilePlus2,
  FolderOpen,
  Image as ImageIcon,
  MessageCircle,
  Pause,
  Plus,
  RefreshCcw,
  Send,
  Settings,
  Trash2,
} from '@lucide/vue'
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
import { buildAIHeaders, resolveEndpointUrl, useAIFetch } from '@/composables/useAIFetch'
import { copyPlain } from '@/lib/browser/clipboard'
import { store } from '@/storage'
import useAIConfigStore from '@/stores/aiConfig'
import { useEditorStore } from '@/stores/editor'
import { useQuickCommandsStore } from '@/stores/quickCommands'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{ open: boolean }>()

const emit = defineEmits([`update:open`])

const FEEDBACK_INDICATOR_TIMEOUT_MS = 1500

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
const { loading, abort: abortFetch, fetchSSE } = useAIFetch()
const copiedIndex = ref<number | null>(null)
const insertedIndex = ref<number | null>(null)
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

const quickCmdStore = useQuickCommandsStore()
const { t } = useI18n()
const chatInputRef = ref<{ $el: HTMLTextAreaElement } | null>(null)

function getSelectedText(): string {
  return editorStore.getSelection()
}

function applyQuickCommand(cmd: QuickCommandRuntime) {
  const selected = getSelectedText()
  input.value = cmd.buildPrompt(selected)
  historyIndex.value = null
  nextTick(() => {
    const textarea = chatInputRef.value?.$el
    textarea?.focus()
    if (textarea) {
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    }
  })
}

onMounted(async () => {
  conversationList.value = await store.getJSON(conversationListKey, [])

  const saved = await store.getJSON<ChatMessage[]>(memoryKey, [])
  messages.value = saved.length > 0
    ? saved.map((msg: ChatMessage) => ({ ...msg, id: msg.id || crypto.randomUUID() }))
    : getDefaultMessages()
  await scrollToBottom(true)
})

function getDefaultMessages(): ChatMessage[] {
  return [{ role: `assistant`, content: t(`ai.chat.greeting`), id: crypto.randomUUID() }]
}

function generateConversationTitle(): string {
  const firstUserMessage = messages.value.find(m => m.role === `user`)
  if (!firstUserMessage)
    return t(`ai.chat.conversationTitle`, { date: new Date().toLocaleString() })

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
  toast.success(t(`ai.chat.sessionCreated`))
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
    toast.success(t(`ai.chat.conversationLoaded`))
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

  toast.success(t(`ai.chat.conversationDeleted`))
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
  setTimeout(() => (copiedIndex.value = null), FEEDBACK_INDICATOR_TIMEOUT_MS)
}

function insertToDocument(text: string, index: number) {
  editorStore.insertAtCursor(text)
  insertedIndex.value = index
  setTimeout(() => (insertedIndex.value = null), FEEDBACK_INDICATOR_TIMEOUT_MS)
  toast.success(t(`ai.chat.insertedToDoc`))
}

async function resetMessages() {
  abortFetch()

  if (currentConversationId.value) {
    conversationList.value = conversationList.value.filter(c => c.id !== currentConversationId.value)
    await store.setJSON(conversationListKey, conversationList.value)
    await store.remove(`ai_conversation_${currentConversationId.value}`)
    currentConversationId.value = null
  }

  messages.value = getDefaultMessages()
  await store.setJSON(memoryKey, messages.value)
  scrollToBottom(true)
  toast.success(t(`ai.chat.sessionCleared`))
}

function pauseStreaming() {
  abortFetch()
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
        content: t(`ai.chat.systemQuote`, { content: editor.value?.state.doc.toString() ?? `` }),
      }]
    : []

  const payloadMessages: ChatMessage[] = [
    {
      role: `system`,
      content: t(`ai.chat.systemPrompt`),
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
  const headers = buildAIHeaders(apiKey.value, type.value)
  const url = resolveEndpointUrl(endpoint.value, `chat`)

  try {
    await fetchSSE(url, headers, payload, {
      onDelta(content) {
        const last = messages.value[messages.value.length - 1]
        if (last !== replyMessageProxy)
          return
        last.content += content
        scrollToBottom()
      },
      onReasoningDelta(reasoning) {
        const last = messages.value[messages.value.length - 1]
        if (last !== replyMessageProxy)
          return
        last.reasoning = (last.reasoning || ``) + reasoning
        scrollToBottom()
      },
      onDone() {
        const last = messages.value[messages.value.length - 1]
        if (last.role === `assistant`) {
          last.done = true
          scrollToBottom(true)
        }
      },
    })
  }
  catch (e) {
    messages.value[messages.value.length - 1].content
      = t(`ai.chat.requestFailed`, { message: (e as Error).message })
    await scrollToBottom(true)
  }
  finally {
    await store.setJSON(memoryKey, messages.value)
    await autoSaveCurrentConversation()
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
      <DialogHeader class="space-y-1 flex flex-col items-start">
        <div class="space-x-1 flex items-center">
          <DialogTitle>{{ t('ai.chat.title') }}</DialogTitle>

          <Button
            :title="configVisible ? t('ai.chat.title') : t('ai.chat.configParams')"
            :aria-label="configVisible ? t('ai.chat.title') : t('ai.chat.configParams')"
            variant="ghost"
            size="icon"
            @click="configVisible = !configVisible"
          >
            <MessageCircle v-if="configVisible" class="h-4 w-4" />
            <Settings v-else class="h-4 w-4" />
          </Button>

          <Button
            :title="t('ai.chat.imageGen')"
            :aria-label="t('ai.chat.imageGen')"
            variant="ghost"
            size="icon"
            @click="switchToImageGenerator()"
          >
            <ImageIcon class="h-4 w-4" />
          </Button>

          <Button
            :title="t('ai.chat.newSession')"
            :aria-label="t('ai.chat.newSession')"
            variant="ghost"
            size="icon"
            @click="createNewConversation"
          >
            <Plus class="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                :title="t('ai.chat.loadConversation')"
                :aria-label="t('ai.chat.loadConversation')"
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
                {{ t('ai.chat.noSavedConversations') }}
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
            :title="t('ai.chat.clearConversation')"
            :aria-label="t('ai.chat.clearConversation')"
            variant="ghost"
            size="icon"
            @click="resetMessages"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
        <DialogDescription class="text-muted-foreground text-sm">
          {{ t('ai.chat.description') }}
        </DialogDescription>
      </DialogHeader>

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
            {{ t('ai.chat.noQuickCommands') }}
          </div>
        </template>
        <Button
          variant="ghost"
          size="sm"
          :title="t('ai.chat.manageCommands')"
          @click="cmdMgrOpen = true"
        >
          <Plus class="h-4 w-4" />
        </Button>

        <QuickCommandManager v-model:open="cmdMgrOpen" />
      </div>

      <AIConfig
        v-if="configVisible"
        class="mb-4 w-full border rounded-md p-4"
        @saved="handleConfigSaved"
      />

      <div
        v-if="!configVisible"
        class="custom-scroll space-y-3 chat-container mb-4 flex-1 overflow-y-auto pr-2"
      >
        <div
          v-for="(msg, index) in messages"
          :key="msg.id || index"
          class="flex flex-col"
          :class="msg.role === 'user' ? 'items-end' : 'items-start'"
        >
          <div
            class="ring-border/20 max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-xs ring-1"
            :class="msg.role === 'user'
              ? 'bg-black text-white dark:bg-primary dark:text-primary-foreground'
              : 'bg-gray-100 text-gray-800 dark:bg-muted/60 dark:text-muted-foreground'"
          >
            <div v-if="msg.reasoning" class="text-muted-foreground mb-1 italic">
              {{ msg.reasoning }}
            </div>

            <div
              class="whitespace-pre-wrap"
              :class="msg.content ? '' : 'animate-pulse text-muted-foreground'"
            >
              {{
                msg.content
                  || (msg.role === 'assistant' && !msg.done ? t('ai.chat.thinking') : '')
              }}
            </div>
          </div>

          <div class="mt-1 flex gap-1">
            <Button
              v-if="index > 0 && !(msg.role === 'assistant' && index === messages.length - 1 && !msg.done)"
              variant="ghost"
              size="icon"
              class="h-5 w-5 p-1"
              :title="t('ai.chat.copyContent')"
              :aria-label="t('ai.chat.copyContent')"
              @click="copyToClipboard(msg.content, index)"
            >
              <Check
                v-if="copiedIndex === index"
                class="h-3 w-3 text-green-600"
              />
              <Copy v-else class="text-muted-foreground h-3 w-3" />
            </Button>
            <Button
              v-if="msg.role === 'assistant' && (msg.done || index < messages.length - 1) && index > 0"
              variant="ghost"
              size="icon"
              class="h-5 w-5 p-1"
              :title="t('ai.chat.insertDoc')"
              :aria-label="t('ai.chat.insertDoc')"
              @click="insertToDocument(msg.content, index)"
            >
              <Check
                v-if="insertedIndex === index"
                class="h-3 w-3 text-green-600"
              />
              <FilePlus2 v-else class="text-muted-foreground h-3 w-3" />
            </Button>
            <Button
              v-if="msg.role === 'assistant' && msg.done && index === messages.length - 1"
              variant="ghost"
              size="icon"
              class="h-5 w-5 p-1"
              :title="t('ai.chat.regenerate')"
              :aria-label="t('ai.chat.regenerate')"
              @click="regenerateLast"
            >
              <RefreshCcw class="text-muted-foreground h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div v-if="!configVisible" class="relative mt-2">
        <div
          class="bg-background border-border flex flex-col items-baseline gap-2 border rounded-xl px-3 py-2 pr-12 shadow-inner"
        >
          <Textarea
            ref="chatInputRef"
            v-model="input"
            :placeholder="t('ai.chat.inputPlaceholder')"
            rows="2"
            class="custom-scroll min-h-16 w-full resize-none border-none bg-transparent p-0 focus-visible:outline-hidden focus:outline-hidden focus-visible:ring-0 focus:ring-0 focus-visible:ring-offset-0 focus:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent"
            @keydown="handleKeydown"
          />

          <Button
            size="sm"
            variant="outline"
            class="h-8 flex items-center gap-1 rounded-md px-3 font-medium transition-colors duration-150"
            :class="[
              isQuoteAllContent
                ? 'bg-primary text-white border-primary dark:bg-white dark:text-black dark:border-white'
                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground dark:bg-muted dark:text-gray-400 dark:hover:text-white dark:hover:border-white/60',
            ]"
            :aria-label="t('ai.chat.quoteFullText')"
            @click="quoteAllContent"
          >
            <component :is="isQuoteAllContent ? Check : Copy" class="h-4 w-4" />
            <span class="text-xs">{{ t('ai.chat.quoteFullText') }}</span>
          </Button>

          <Button
            :disabled="!input.trim() && !loading"
            size="icon"
            :class="[
              // eslint-disable-next-line vue/prefer-separate-static-class
              'absolute bottom-3 right-3 rounded-full disabled:opacity-40',
              // eslint-disable-next-line vue/prefer-separate-static-class
              'bg-primary hover:bg-primary/90 text-primary-foreground',
            ]"
            :aria-label="loading ? t('common.pause') : t('common.send')"
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

.chat-container {
  padding-bottom: calc(1rem + var(--safe-bottom));
}

.chat-container pre {
  overflow-x: auto;
}

.dark .hljs {
  background: #0d1117 !important;
  color: #c9d1d9 !important;
}

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
