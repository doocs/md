<script setup lang="ts">
import { Pause, Settings, Wand2, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAIConfigStore from '@/stores/aiConfig'
import { useEditorStore } from '@/stores/editor'

/* -------------------- props / emits -------------------- */
const props = defineProps<{
  open: boolean
  selectedText: string
  isMobile: boolean
}>()
const emit = defineEmits([`update:open`])

/* -------------------- reactive state -------------------- */
const configVisible = ref(false)
const dialogVisible = ref(props.open)
const message = ref(``)
const loading = ref(false)
const abortController = ref<AbortController | null>(null)
const customPrompts = ref<string[]>([])
const hasResult = ref(false)
const selectedAction = ref<
  `optimize` | `summarize` | `spellcheck` | `translate-zh` | `translate-en` | `custom`
>(`optimize`)
const currentText = ref(``)
const error = ref(``)

/* -------------------- store & refs -------------------- */
const editorStore = useEditorStore()
const resultContainer = ref<HTMLElement | null>(null)

/* -------------------- dialog state sync -------------------- */
watch(() => props.open, (val) => {
  dialogVisible.value = val
  if (val && props.selectedText.trim()) {
    currentText.value = props.selectedText
    resetState()
  }
})
watch(dialogVisible, val => emit(`update:open`, val))

/* -------------------- AI config -------------------- */
const AIConfigStore = useAIConfigStore()
const { apiKey, endpoint, model, temperature, maxToken, type }
  = storeToRefs(AIConfigStore)

/* -------------------- action options -------------------- */
interface ActionOption {
  value: string
  label: string
  defaultPrompt: string
}

const actionOptions: ActionOption[] = [
  {
    value: `optimize`,
    label: `优化文本`,
    defaultPrompt: `请优化文本，使其更通顺易读。`,
  },
  {
    value: `summarize`,
    label: `文章总结`,
    defaultPrompt: `请对文本进行摘要，输出主要观点和结论。`,
  },
  {
    value: `spellcheck`,
    label: `错别字纠正`,
    defaultPrompt: `请找出并纠正文本中的错别字、标点和语法错误。`,
  },
  {
    value: `translate-zh`,
    label: `翻译为中文`,
    defaultPrompt: `请将文本翻译为地道的中文。`,
  },
  {
    value: `translate-en`,
    label: `翻译为英文`,
    defaultPrompt: `请将文本翻译为自然流畅的英文。`,
  },
  { value: `custom`, label: `自定义`, defaultPrompt: `` },
]

/* -------------------- watchers -------------------- */
watch(message, async () => {
  await nextTick()
  resultContainer.value?.scrollTo({ top: resultContainer.value.scrollHeight })
})

watch(selectedAction, (val) => {
  if (val !== `custom`)
    customPrompts.value = []
})

// 当 dialogVisible 且 props.selectedText 变更时，更新原文并重置状态
watch(
  () => props.selectedText,
  (val) => {
    if (dialogVisible.value) {
      currentText.value = val
      resetState()
    }
  },
)

/* -------------------- prompt handlers -------------------- */
function addPrompt(e: KeyboardEvent) {
  const input = e.target as HTMLInputElement
  const prompt = input.value.trim()
  if (prompt && !customPrompts.value.includes(prompt)) {
    customPrompts.value.push(prompt)
  }
  input.value = ``
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
  const text = currentText.value.trim()
  if (!text || loading.value)
    return

  resetState()
  loading.value = true
  abortController.value = new AbortController()

  const systemPrompt
    = `你是一名专业的多语言文本助手，请根据用户的指令处理下列内容。在输出时，不要输出任何额外的信息，只输出处理后的文本。`
  const picked = actionOptions.find(o => o.value === selectedAction.value)!
  const parts: string[] = []

  if (picked.defaultPrompt)
    parts.push(picked.defaultPrompt)
  if (customPrompts.value.length)
    parts.push(`请同时满足以下要求：${customPrompts.value.join(`、`)}。`)
  if (!parts.length)
    parts.push(`请根据最佳实践优化文本。`)

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

  const headers: Record<string, string> = {
    'Content-Type': `application/json`,
  }
  if (apiKey.value && type.value !== `default`) {
    headers.Authorization = `Bearer ${apiKey.value}`
  }

  try {
    const url = new URL(endpoint.value)
    if (!url.pathname.endsWith(`/chat/completions`)) {
      url.pathname = url.pathname.replace(/\/?$/, `/chat/completions`)
    }

    const res = await window.fetch(url.toString(), {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
      signal: abortController.value!.signal,
    })

    if (!res.ok || !res.body)
      throw new Error(`响应错误：${res.status}`)

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

/* -------------------- abort handler -------------------- */
function stopAI() {
  if (loading.value && abortController.value) {
    abortController.value.abort()
    loading.value = false
  }
}

/* -------------------- actions -------------------- */
function replaceText() {
  const editorView = toRaw(editorStore.editor!)!
  const selection = editorView.state.selection.main
  editorView.dispatch(editorView.state.replaceSelection(message.value))

  // 选中替换后的文本
  const newSelection = editorView.state.selection.main
  editorView.dispatch({
    selection: { anchor: selection.from, head: newSelection.head },
  })
  editorView.focus()

  currentText.value = message.value
  resetState()
}

function show() {
  dialogVisible.value = true
}

function close() {
  dialogVisible.value = false
  customPrompts.value = []
  selectedAction.value = `optimize`
  resetState()
}

defineExpose({ dialogVisible, runAIAction, replaceText, show, close, stopAI })
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent
      class="bg-card text-card-foreground flex flex-col w-[95vw] max-h-[90vh] sm:max-h-[85vh] sm:max-w-2xl overflow-hidden p-0"
    >
      <!-- ============ 头部 ============ -->
      <DialogHeader class="space-y-1 flex flex-col items-start px-6 pt-6 pb-4">
        <div class="space-x-1 flex items-center">
          <DialogTitle>AI 工具箱</DialogTitle>

          <Button
            :title="configVisible ? 'AI 工具箱' : '配置参数'"
            :aria-label="configVisible ? 'AI 工具箱' : '配置参数'"
            variant="ghost"
            size="icon"
            @click="configVisible = !configVisible"
          >
            <Wand2 v-if="configVisible" class="h-4 w-4" />
            <Settings v-else class="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      <!-- ============ 内容区域 ============ -->
      <!-- config panel -->
      <AIConfig
        v-if="configVisible"
        class="border-border mx-6 mb-4 w-auto border rounded-md p-4"
        @saved="() => (configVisible = false)"
      />

      <!-- main content -->
      <div v-else class="custom-scroll space-y-3 flex-1 overflow-y-auto px-6 pb-3">
        <!-- action selector -->
        <div>
          <div class="mb-1.5 text-sm font-medium">
            选择操作
          </div>
          <Select v-model="selectedAction">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="请选择要执行的操作" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="opt in actionOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- original text -->
        <div>
          <div class="mb-1.5 text-sm font-medium">
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
          <div class="mb-1.5 text-sm font-medium">
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
              class="min-w-[100px] flex-1 bg-transparent py-1 text-sm focus:outline-hidden"
              placeholder="输入提示词后按回车"
              @keydown.enter="addPrompt"
            >
          </div>
        </div>

        <!-- error -->
        <div v-if="error" class="min-h-[20px] flex items-center text-xs text-red-500">
          {{ error }}
        </div>

        <!-- result -->
        <div v-if="message">
          <div class="mb-1.5 text-sm font-medium">
            处理结果
          </div>
          <div
            ref="resultContainer"
            class="custom-scroll border-border bg-background max-h-40 min-h-[60px] overflow-y-auto whitespace-pre-line border rounded px-3 py-2 text-sm"
          >
            {{ message }}
          </div>
        </div>
      </div>

      <!-- ============ 底部按钮 ============ -->
      <div v-if="!configVisible" class="flex justify-end gap-2 px-6 py-3.5 mt-auto">
        <Button v-if="loading" variant="secondary" @click="stopAI">
          <Pause class="mr-1 h-4 w-4" /> 终止
        </Button>
        <Button
          v-if="hasResult && !loading"
          variant="default"
          @click="replaceText"
        >
          接受
        </Button>
        <Button
          v-if="!loading"
          variant="outline"
          :disabled="!hasResult && !!message"
          @click="runAIAction"
        >
          {{ hasResult ? '重试' : 'AI 处理' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  /* Tailwind @apply in <style> needs explicit classes when using <style scoped> */
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
}
:deep(.dark) .custom-scroll {
  scrollbar-color: rgba(107, 114, 128, 0.4) transparent;
}

@media (pointer: coarse) {
  .custom-scroll::-webkit-scrollbar {
    width: 3px;
  }
}
</style>
