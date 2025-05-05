<script setup lang="ts">
import { useAIConfig } from '@/components/ai/useAIConfig'
import { Button } from '@/components/ui/button'
import { Settings, X } from 'lucide-vue-next'

const props = defineProps<{
  position: { top: number, left: number }
  selectedText: string
  isDragging: boolean
}>()

const emit = defineEmits([`closeBtn`, `adjustPosition`, `startDrag`])

/* -------------------- state -------------------- */
const configVisible = ref(false)
const visible = ref(false)
const message = ref(``)
const loading = ref(false)
const abortController = ref<AbortController | null>(null)
const customPrompts = ref<string[]>([])
const hasResult = ref(false)

const store = useStore()

/* template refs */
const resultContainer = ref<HTMLElement | null>(null)

/* AI config */
const { apiKey, endpoint, model, temperature, maxToken, type } = useAIConfig()

/* ------------------- watch --------------------- */
watch(message, async () => {
  emit(`adjustPosition`)
  await nextTick()
  const el = resultContainer.value
  if (el)
    el.scrollTop = el.scrollHeight
})

/* ------------------- prompt -------------------- */
function addPrompt(e: KeyboardEvent) {
  const prompt = (e.target as HTMLInputElement).value.trim()
  if (prompt && !customPrompts.value.includes(prompt))
    customPrompts.value.push(prompt)
  ;(e.target as HTMLInputElement).value = ``
  emit(`adjustPosition`)
}
function removePrompt(index: number) {
  customPrompts.value.splice(index, 1)
}

/* ------------------- AI call ------------------- */
async function runAIAction() {
  const text = props.selectedText.trim()
  if (!text || loading.value)
    return

  message.value = ``
  loading.value = true
  hasResult.value = false
  abortController.value?.abort()
  abortController.value = new AbortController()

  // 基础系统 Prompt：多功能文本助手
  const systemPrompt = `你是一名专业的多语言文本助手，请根据用户的指令处理下列内容。`

  // 用户指令：把自定义提示词合并成一句话，没有则给默认指令“请优化文本”
  const userCommand = customPrompts.value.length
    ? `请按照以下要求处理文本：${customPrompts.value.join(`、`)}。`
    : `请优化文本，使其更通顺易读。`

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
  if (apiKey.value && type.value !== `default`)
    headers.Authorization = `Bearer ${apiKey.value}`

  try {
    const url = new URL(endpoint.value)
    if (!url.pathname.endsWith(`/chat/completions`))
      url.pathname = url.pathname.replace(/\/?$/, `/chat/completions`)

    const res = await window.fetch(url.toString(), {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
      signal: abortController.value.signal,
    })

    if (!res.ok || !res.body)
      throw new Error(`响应错误：${res.status} ${res.statusText}`)

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
        catch (e) {
          console.error(`解析失败:`, e)
        }
      }
    }
  }
  catch (e) {
    console.error(`请求失败:`, e)
  }
  finally {
    loading.value = false
  }
}

/* ------------------- actions ------------------- */
function replaceText() {
  toRaw(store.editor!)!.replaceSelection(message.value)
}
function show() {
  emit(`closeBtn`)
  if (!props.selectedText.trim()) {
    toast.error(`请选择需要处理的内容`)
    return
  }
  visible.value = true
  emit(`adjustPosition`)
}
function close() {
  visible.value = false
  message.value = ``
  customPrompts.value = []
  loading.value = false
  hasResult.value = false
  abortController.value?.abort()
  abortController.value = null
}

defineExpose({ visible, runAIAction, replaceText, show, close })
</script>

<template>
  <Transition name="fade-scale">
    <div
      v-if="visible"
      class="bg-card border-border text-card-foreground fixed z-50 w-[420px] border rounded-xl shadow-2xl"
      :style="{ left: `${position.left}px`, top: `${position.top}px`, transformOrigin: 'top left' }"
    >
      <!-- header -->
      <div
        class="border-border popover-header flex cursor-move select-none items-center justify-between border-b px-6 pb-2 pt-3"
        @mousedown="emit('startDrag', $event)"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold">AI 工具箱</span>
          <Button variant="ghost" size="icon" aria-label="配置" @click="configVisible = !configVisible">
            <Settings class="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" aria-label="关闭" @click="close">
          <X class="h-3 w-3" />
        </Button>
      </div>

      <!-- config panel -->
      <AIConfig v-if="configVisible" class="border-border mb-4 w-full border rounded-md p-4" @saved="() => (configVisible = false)" />

      <!-- main content -->
      <section v-else>
        <div class="space-y-3 px-6 pb-2 pt-3">
          <!-- original text -->
          <div>
            <div class="mb-1 text-sm font-semibold">
              原文
            </div>
            <div class="border-border custom-scroll bg-muted/20 text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-line border rounded px-3 py-2 text-sm">
              {{ selectedText }}
            </div>
          </div>

          <!-- custom prompts -->
          <div>
            <div class="mb-1 text-sm font-semibold">
              自定义提示词（可选）
            </div>
            <div class="custom-scroll border-border max-h-24 min-h-[40px] flex flex-wrap gap-2 overflow-y-auto border rounded px-2 py-1">
              <template v-for="(prompt, index) in customPrompts" :key="index">
                <div class="text-muted-foreground bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-sm">
                  <span>{{ prompt }}</span>
                  <button class="hover:bg-muted/60 h-4 w-4 flex items-center justify-center rounded-full" @click="removePrompt(index)">
                    <X class="h-3 w-3" />
                  </button>
                </div>
              </template>
              <input class="min-w-[100px] flex-1 bg-transparent py-1 text-sm focus:outline-none" placeholder="输入提示词后按回车" @keydown.enter="addPrompt">
            </div>
          </div>

          <!-- result -->
          <div>
            <div class="mb-1 text-sm font-semibold">
              处理结果
            </div>
            <div ref="resultContainer" class="custom-scroll border-border bg-background max-h-40 min-h-[60px] overflow-y-auto whitespace-pre-line border rounded px-3 py-2 text-sm">
              <span v-if="message">{{ message }}</span>
              <span v-else class="text-muted-foreground">点击下方 "AI 处理" 按钮生成结果</span>
            </div>
          </div>
        </div>

        <!-- footer buttons -->
        <div class="border-border flex justify-end gap-2 border-t px-6 pb-3 pt-2">
          <Button variant="default" :disabled="!message || loading" @click="replaceText">
            接受
          </Button>
          <Button variant="outline" :disabled="loading || (!hasResult && !!message)" @click="runAIAction">
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
  @apply rounded-full bg-gray-400/40 hover:bg-gray-400/60 dark:bg-gray-500/40 dark:hover:bg-gray-500/70;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175 / 0.4) transparent;
}
:deep(.dark) .custom-scroll {
  scrollbar-color: rgb(107 114 128 / 0.4) transparent;
}

.popover-header {
  cursor: move;
  user-select: none;
}
</style>
