<script setup lang="ts">
import { useAIConfig } from '@/components/ai/useAIConfig'
import { Button } from '@/components/ui/button'
import { Settings, X } from 'lucide-vue-next'

const props = defineProps<{
  position: {
    top: number
    left: number
  }
  selectedText: string
  isDragging: boolean
}>()

const emit = defineEmits([`closeBtn`, `adjustPosition`, `startDrag`])

const configVisible = ref(false)

const store = useStore()

const { apiKey, endpoint, model, temperature, maxToken, type } = useAIConfig()

const visible = ref(false)

const message = ref(``)
const loading = ref(false)
const abortController = ref<AbortController | null>(null)
const customPrompts = ref<string[]>([])
const hasPolished = ref(false)

watch(message, () => {
  emit(`adjustPosition`)
})

function addPrompt(e: KeyboardEvent) {
  const prompt = (e.target as HTMLInputElement).value
  if (prompt.trim() && !customPrompts.value.includes(prompt.trim())) {
    customPrompts.value.push(prompt.trim())
  }
  (e.target as HTMLInputElement).value = ``
  emit(`adjustPosition`)
}

function removePrompt(index: number) {
  customPrompts.value.splice(index, 1)
}

async function getPolishedText() {
  const text = props.selectedText.trim()
  if (!text || loading.value)
    return

  message.value = ``
  loading.value = true
  abortController.value = new AbortController()
  hasPolished.value = false

  const systemPrompt = `你是一个专业的 AI 润色助手，请用简洁中文润色以下词句：${text}`

  const messages = [
    { role: `system`, content: systemPrompt },
  ]

  if (customPrompts.value.length > 0) {
    messages.push({
      role: `user`,
      content: `润色时请注意：${customPrompts.value.join(`，`)}`,
    })
  }

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
      headers: {
        'Authorization': `Bearer ${apiKey.value}`,
        'Content-Type': `application/json`,
      },
      body: JSON.stringify(payload),
      signal: abortController.value?.signal,
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
        if (line.trim() === ``)
          continue
        try {
          const eventData = line.replace(/^data: /, ``)
          if (eventData === `[DONE]`)
            continue
          const json = JSON.parse(eventData)
          const delta = json.choices?.[0]?.delta?.content
          if (delta && delta.trim()) {
            message.value += delta
            hasPolished.value = true
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

function replaceText() {
  toRaw(store.editor!)!.replaceSelection(message.value)
}

function show() {
  emit(`closeBtn`)

  if (!props.selectedText.trim()) {
    toast.error(`请选择需要润色的内容`)
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
  hasPolished.value = false
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
}

defineExpose({
  visible,
  getPolishedText,
  replaceText,
  show,
  close,
})
</script>

<template>
  <Transition tag="div" name="fade-scale">
    <div
      v-if="visible"
      class="fixed z-50 w-[420px] border rounded-xl bg-white p-0 shadow-2xl dark:bg-black"
      :style="{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transformOrigin: 'top left',
      }"
    >
      <div
        class="popover-header flex items-center justify-between border-b px-6 pb-2 pt-3"
        @mousedown="emit('startDrag', $event)"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold">AI 润色</span>
          <Button variant="ghost" size="icon" aria-label="配置" @click="configVisible = !configVisible">
            <Settings class="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" aria-label="关闭" @click="close">
          <X class="h-3 w-3" />
        </Button>
      </div>
      <AIConfig
        v-if="configVisible"
        class="mb-4 w-full border rounded-md p-4"
        @saved="() => configVisible = false"
      />
      <section v-else>
        <div class="px-6 pb-2 pt-3">
          <div class="mb-2">
            <div class="mb-1 text-sm font-semibold">
              原文
            </div>
            <div
              class="max-h-32 overflow-y-auto whitespace-pre-line border rounded bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-400"
            >
              {{ selectedText }}
            </div>
          </div>
          <div class="mb-2">
            <div class="mb-1 text-sm font-semibold">
              自定义提示词（可选）
            </div>
            <div class="max-h-24 min-h-[40px] flex flex-wrap gap-2 overflow-y-auto border rounded">
              <div
                v-for="(prompt, index) in customPrompts"
                :key="index"
                class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm dark:bg-gray-600"
              >
                <span>{{ prompt }}</span>
                <button
                  class="h-4 w-4 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                  @click="removePrompt(index)"
                >
                  <X class="h-3 w-3" />
                </button>
              </div>
              <input
                class="min-w-[100px] flex-1 border-0 bg-transparent px-2 py-1 text-sm dark:bg-gray-900 focus:outline-none"
                placeholder="输入提示词后按回车"
                @keydown.enter="addPrompt"
              >
            </div>
          </div>
          <div class="mb-2">
            <div class="mb-1 text-sm font-semibold">
              润色结果
            </div>
            <div class="max-h-40 min-h-[60px] overflow-y-auto whitespace-pre-line border rounded bg-white px-3 py-2 text-sm text-black dark:bg-gray-900 dark:text-gray-400">
              <span v-if="message">{{ message }}</span>
              <span v-else>点击下方"AI润色"按钮生成结果</span>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t px-6 pb-3 pt-2">
          <Button variant="default" :disabled="!message || loading" @click="replaceText">
            接受
          </Button>
          <Button
            variant="outline"
            :disabled="loading || (!hasPolished && !!message)"
            @click="getPolishedText"
          >
            {{ loading ? 'AI润色中...' : (hasPolished ? '重试' : 'AI润色') }}
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
.popover-header {
  cursor: move;
  user-select: none;
}

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
</style>
