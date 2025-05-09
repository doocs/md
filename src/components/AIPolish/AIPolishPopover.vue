<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAIConfigStore from '@/stores/AIConfig'
import { Settings, X } from 'lucide-vue-next'
import { nextTick, ref, toRaw, watch } from 'vue'

/* -------------------- props / emits -------------------- */
const props = defineProps<{
  position: { top: number, left: number }
  selectedText: string
  isDragging: boolean
}>()
const emit = defineEmits([`closeBtn`, `recalcPos`, `startDrag`])

/* -------------------- reactive state -------------------- */
const configVisible = ref(false)
const visible = ref(false)
const message = ref(``)
const loading = ref(false)
const abortController = ref<AbortController | null>(null)
const customPrompts = ref<string[]>([])
const hasResult = ref(false)
const selectedAction = ref<`optimize` | `summarize` | `spellcheck` | `translate-zh` | `translate-en` | `custom`>(`optimize`)
const currentText = ref(``)
const error = ref(``)

/* -------------------- store & refs -------------------- */
const store = useStore()
const resultContainer = ref<HTMLElement | null>(null)

/* -------------------- AI config -------------------- */
const AIConfigStore = useAIConfigStore()
const { apiKey, endpoint, model, temperature, maxToken, type } = storeToRefs(AIConfigStore)

/* -------------------- action options -------------------- */
interface ActionOption {
  value: string
  label: string
  defaultPrompt: string
}

const actionOptions: ActionOption[] = [
  { value: `optimize`, label: `优化文本`, defaultPrompt: `请优化文本，使其更通顺易读。` },
  { value: `summarize`, label: `文章总结`, defaultPrompt: `请对文本进行摘要，输出主要观点和结论。` },
  { value: `spellcheck`, label: `错别字纠正`, defaultPrompt: `请找出并纠正文本中的错别字、标点和语法错误。` },
  { value: `translate-zh`, label: `翻译为中文`, defaultPrompt: `请将文本翻译为地道的中文。` },
  { value: `translate-en`, label: `翻译为英文`, defaultPrompt: `请将文本翻译为自然流畅的英文。` },
  { value: `custom`, label: `自定义`, defaultPrompt: `` },
]

/* -------------------- watchers -------------------- */
watch(message, async () => {
  emit(`recalcPos`)
  await nextTick()
  resultContainer.value?.scrollTo({ top: resultContainer.value.scrollHeight })
})

watch(selectedAction, (val) => {
  if (val !== `custom`) {
    customPrompts.value = []
  }
})

// 当 visible 且 props.selectedText 变更时，更新原文并重置状态
watch(
  () => props.selectedText,
  (val) => {
    if (visible.value) {
      currentText.value = val
      resetState()
    }
  },
)

watch(selectedAction, (val) => {
  if (val !== `custom`) {
    customPrompts.value = []
  }
})

/* -------------------- prompt handlers -------------------- */
function addPrompt(e: KeyboardEvent) {
  const input = e.target as HTMLInputElement
  const prompt = input.value.trim()
  if (prompt && !customPrompts.value.includes(prompt)) {
    customPrompts.value.push(prompt)
  }
  input.value = ``
  emit(`recalcPos`)
}

function removePrompt(index: number) {
  customPrompts.value.splice(index, 1)
}

function resetState() {
  message.value = ``
  loading.value = false
  hasResult.value = false
  error.value = ``

  abortController.value?.abort()
  abortController.value = null
}

/* -------------------- AI call -------------------- */
async function runAIAction() {
  // 使用 currentText 而非 props.selectedText，以便重复处理更新后的内容
  const text = currentText.value.trim()
  if (!text || loading.value)
    return

  resetState()
  loading.value = true
  abortController.value = new AbortController()

  const systemPrompt = `你是一名专业的多语言文本助手，请根据用户的指令处理下列内容。在输出时，不要输出任何额外的信息，只输出处理后的文本。`
  const picked = actionOptions.find(o => o.value === selectedAction.value)!
  const parts: string[] = []

  if (picked.defaultPrompt) {
    parts.push(picked.defaultPrompt)
  }
  if (customPrompts.value.length) {
    parts.push(`请同时满足以下要求：${customPrompts.value.join(`、`)}。`)
  }
  if (!parts.length) {
    parts.push(`请根据最佳实践优化文本。`)
  }

  const userCommand = parts.join(` `)
  const messages = [
    { role: `system`, content: systemPrompt },
    { role: `user`, content: `${userCommand}\n\n待处理文本：\n${text}` },
  ]

  const payload = {
    model: model.value,
    messages,
    temperature: temperature.value,
    max_tokens: maxToken.value,
    stream: true,
  }

  const headers: Record<string, string> = { 'Content-Type': `application/json` }
  if (apiKey.value && type.value !== `default`) {
    headers.Authorization = `Bearer ${apiKey.value}`
  }

  try {
    const url = new URL(endpoint.value)
    if (!url.pathname.endsWith(`/chat/completions`)) {
      url.pathname = url.pathname.replace(/\/?$/, `/chat/completions`)
    }

    const res = await fetch(url.toString(), {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
      signal: abortController.value.signal,
    })

    if (!res.ok || !res.body) {
      throw new Error(`响应错误：${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder(`utf-8`)
    let buffer = ``

    while (true) {
      const { value, done } = await reader.read()
      if (done)
        break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(`\n`)
      buffer = lines.pop() || ``

      for (const line of lines) {
        if (!line.trim() || line.trim() === `data: [DONE]`)
          continue
        try {
          const json = JSON.parse(line.replace(/^data: /, ``))
          const delta = json.choices?.[0]?.delta?.content
          if (delta?.trim()) {
            message.value += delta
            hasResult.value = true
          }
        }
        catch {}
      }
    }
  }
  catch (e: any) {
    if (e.name === `AbortError`) {
      console.log(`Request aborted by user.`)
    }
    else {
      console.error(`请求失败：`, e)
      error.value = e.message || `请求失败`
    }
  }
  finally {
    loading.value = false
  }
}

/* -------------------- actions -------------------- */
function replaceText() {
  const cm = toRaw(store.editor!)!
  const start = cm.getCursor(`start`)
  cm.replaceSelection(message.value)
  const end = cm.getCursor(`end`)
  cm.setSelection(start, end)
  cm.focus()

  // 更新展示文本
  currentText.value = message.value

  // 点击接受后隐藏处理结果和按钮
  resetState()
}

function show() {
  emit(`closeBtn`)

  if (!props.selectedText.trim()) {
    toast.error(`请选择需要处理的内容`)
    return
  }

  visible.value = true
  currentText.value = props.selectedText
  emit(`recalcPos`)
}

function close() {
  visible.value = false
  customPrompts.value = []
  selectedAction.value = `optimize`
  resetState()
}

defineExpose({ visible, runAIAction, replaceText, show, close })
</script>

<template>
  <Transition name="fade-scale">
    <div
      v-if="visible"
      class="bg-card border-border text-card-foreground fixed z-50 w-[460px] border rounded-xl shadow-2xl"
      :style="{ left: `${position.left}px`, top: `${position.top}px`, transformOrigin: 'top left' }"
    >
      <!-- header -->
      <div
        class="border-border popover-header flex cursor-move select-none items-center justify-between border-b px-6 pb-2 pt-3"
        @mousedown="emit('startDrag', $event)"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold">AI 工具箱</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="配置"
            @click="configVisible = !configVisible"
          >
            <Settings class="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="关闭"
          @click="close"
        >
          <X class="h-3 w-3" />
        </Button>
      </div>

      <!-- config panel -->
      <AIConfig
        v-if="configVisible"
        class="border-border mb-4 w-full border rounded-md p-4"
        @saved="() => (configVisible = false)"
      />

      <!-- main content -->
      <section v-else class="space-y-3 px-6 pb-2 pt-3">
        <!-- action selector -->
        <div>
          <div class="mb-1 text-sm font-semibold">
            选择操作
          </div>
          <Select v-model="selectedAction">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="请选择要执行的操作" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="opt in actionOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- original text -->
        <div>
          <div class="mb-1 text-sm font-semibold">
            原文
          </div>
          <div
            class="border-border custom-scroll bg-muted/20 text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-line border rounded px-3 py-2 text-sm"
          >
            {{ currentText }}
          </div>
        </div>

        <!-- custom prompts -->
        <div v-if="selectedAction === 'custom'">
          <div class="mb-1 text-sm font-semibold">
            自定义提示词（可选）
          </div>
          <div
            class="custom-scroll border-border max-h-24 min-h-[40px] flex flex-wrap gap-2 overflow-y-auto border rounded px-2 py-1"
          >
            <template v-for="(prompt, index) in customPrompts" :key="index">
              <div
                class="text-muted-foreground bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-sm"
              >
                <span>{{ prompt }}</span>
                <button
                  class="hover:bg-muted/60 h-4 w-4 flex items-center justify-center rounded-full"
                  @click="removePrompt(index)"
                >
                  <X class="h-3 w-3" />
                </button>
              </div>
            </template>
            <input
              class="min-w-[100px] flex-1 bg-transparent py-1 text-sm focus:outline-none"
              placeholder="输入提示词后按回车"
              @keydown.enter="addPrompt"
            >
          </div>
        </div>

        <!-- error -->
        <div v-if="error" class="min-h-[24px] flex items-center text-[12px] text-red-500">
          {{ error }}
        </div>

        <!-- result -->
        <div v-if="message">
          <div class="mb-1 text-sm font-semibold">
            处理结果
          </div>
          <div
            ref="resultContainer"
            class="custom-scroll border-border bg-background max-h-40 min-h-[60px] overflow-y-auto whitespace-pre-line border rounded px-3 py-2 text-sm"
          >
            {{ message }}
          </div>
        </div>

        <!-- footer buttons -->
        <div class="border-border flex justify-end gap-2 border-t px-6 pb-3 pt-2">
          <Button
            v-if="hasResult"
            variant="default"
            @click="replaceText"
          >
            接受
          </Button>
          <Button
            variant="outline"
            :disabled="loading || (!hasResult && !!message)"
            @click="runAIAction"
          >
            {{ loading ? 'AI 处理中...' : hasResult ? '重试' : 'AI 处理' }}
          </Button>
          <Button variant="ghost" @click="close">
            取消
          </Button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.fade-scale-enter-active {
  transition: all 0.2s ease-out;
}
.fade-scale-leave-active {
  transition: all 0.15s ease-in;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  @apply rounded-full bg-gray-400/40 hover:bg-gray-400/60;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
}
:deep(.dark) .custom-scroll {
  scrollbar-color: rgba(107, 114, 128, 0.4) transparent;
}

.popover-header {
  cursor: move;
  user-select: none;
}
</style>
