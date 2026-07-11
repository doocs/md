<script setup lang="ts">
import { Pause, Settings, Wand2, X } from '@lucide/vue'
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
import { buildAIHeaders, resolveEndpointUrl, useAIFetch } from '@/composables/useAIFetch'
import useAIConfigStore from '@/stores/aiConfig'
import { useEditorStore } from '@/stores/editor'

const props = defineProps<{
  open: boolean
  selectedText: string
  isMobile: boolean
}>()
const emit = defineEmits([`update:open`])

const configVisible = ref(false)
const dialogVisible = ref(props.open)
const message = ref(``)
const { loading, abort: abortAI, fetchSSE } = useAIFetch()
const customPrompts = ref<string[]>([])
const hasResult = ref(false)
const selectedAction = ref<
  `optimize` | `summarize` | `spellcheck` | `translate-zh` | `translate-en` | `expand` | `continue` | `custom`
>(`optimize`)
const currentText = ref(``)
const error = ref(``)

const editorStore = useEditorStore()
const resultContainer = ref<HTMLElement | null>(null)

watch(() => props.open, (val) => {
  dialogVisible.value = val
  if (val && props.selectedText.trim()) {
    currentText.value = props.selectedText
    resetState()
  }
})
watch(dialogVisible, val => emit(`update:open`, val))

const AIConfigStore = useAIConfigStore()
const { apiKey, endpoint, model, temperature, maxToken, type }
  = storeToRefs(AIConfigStore)
const { t } = useI18n()

interface ActionOption {
  value: string
  label: string
  defaultPrompt: string
}

const actionOptions = computed<ActionOption[]>(() => [
  {
    value: `optimize`,
    label: t('ai.toolbox.actions.optimize.label'),
    defaultPrompt: t('ai.toolbox.actions.optimize.prompt'),
  },
  {
    value: `summarize`,
    label: t('ai.toolbox.actions.summarize.label'),
    defaultPrompt: t('ai.toolbox.actions.summarize.prompt'),
  },
  {
    value: `spellcheck`,
    label: t('ai.toolbox.actions.spellcheck.label'),
    defaultPrompt: t('ai.toolbox.actions.spellcheck.prompt'),
  },
  {
    value: `translate-zh`,
    label: t('ai.toolbox.actions.translateZh.label'),
    defaultPrompt: t('ai.toolbox.actions.translateZh.prompt'),
  },
  {
    value: `translate-en`,
    label: t('ai.toolbox.actions.translateEn.label'),
    defaultPrompt: t('ai.toolbox.actions.translateEn.prompt'),
  },
  {
    value: `expand`,
    label: t('ai.toolbox.actions.expand.label'),
    defaultPrompt: t('ai.toolbox.actions.expand.prompt'),
  },
  {
    value: `continue`,
    label: t('ai.toolbox.actions.continue.label'),
    defaultPrompt: t('ai.toolbox.actions.continue.prompt'),
  },
  { value: `custom`, label: t('ai.toolbox.actions.custom.label'), defaultPrompt: `` },
])

watch(message, async () => {
  await nextTick()
  resultContainer.value?.scrollTo({ top: resultContainer.value.scrollHeight })
})

watch(selectedAction, (val) => {
  if (val !== `custom`)
    customPrompts.value = []
})

watch(
  () => props.selectedText,
  (val) => {
    if (dialogVisible.value) {
      currentText.value = val
      resetState()
    }
  },
)

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

  abortAI()
}

async function runAIAction() {
  const text = currentText.value.trim()
  if (!text || loading.value)
    return

  resetState()
  loading.value = true

  const systemPrompt = t('ai.toolbox.systemPrompt')
  const picked = actionOptions.value.find(o => o.value === selectedAction.value)!
  const parts: string[] = []

  if (picked.defaultPrompt)
    parts.push(picked.defaultPrompt)
  if (customPrompts.value.length)
    parts.push(t('ai.toolbox.satisfyRequirements', { requirements: customPrompts.value.join(`、`) }))
  if (!parts.length)
    parts.push(t('ai.toolbox.optimizeDefault'))

  const userCommand = parts.join(` `)
  const messages = [
    { role: `system`, content: systemPrompt },
    { role: `user`, content: `${userCommand}\n\n${t('ai.toolbox.textToProcess', { text })}` },
  ]

  const payload = {
    model: model.value,
    messages,
    temperature: temperature.value,
    max_tokens: maxToken.value,
    stream: true,
  }

  const headers = buildAIHeaders(apiKey.value, type.value)
  const url = resolveEndpointUrl(endpoint.value, `chat`)

  try {
    await fetchSSE(url, headers, payload, {
      onDelta(content) {
        if (content.trim()) {
          message.value += content
          hasResult.value = true
        }
      },
    })
  }
  catch (e: any) {
    console.error(`请求失败：`, e)
    error.value = e.message || t('ai.toolbox.requestFailed')
  }
}

function stopAI() {
  if (loading.value) {
    abortAI()
  }
}

function replaceText() {
  const editorView = toRaw(editorStore.editor!)!
  const selection = editorView.state.selection.main
  editorView.dispatch(editorView.state.replaceSelection(message.value))

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
      <DialogHeader class="space-y-1 flex flex-col items-start px-6 pt-6 pb-4">
        <div class="space-x-1 flex items-center">
          <DialogTitle>{{ t('ai.toolbox.title') }}</DialogTitle>

          <Button
            :title="configVisible ? t('ai.toolbox.title') : t('ai.chat.configParams')"
            :aria-label="configVisible ? t('ai.toolbox.title') : t('ai.chat.configParams')"
            variant="ghost"
            size="icon"
            @click="configVisible = !configVisible"
          >
            <Wand2 v-if="configVisible" class="h-4 w-4" />
            <Settings v-else class="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      <AIConfig
        v-if="configVisible"
        class="border-border mx-6 mb-4 w-auto border rounded-md p-4"
        @saved="() => (configVisible = false)"
      />

      <div v-else class="custom-scroll space-y-3 flex-1 overflow-y-auto px-6 pb-3">
        <div>
          <div class="mb-1.5 text-sm font-medium">
            {{ t('ai.toolbox.selectAction') }}
          </div>
          <Select v-model="selectedAction">
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="t('ai.toolbox.selectActionPlaceholder')" />
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

        <div>
          <div class="mb-1.5 text-sm font-medium">
            {{ t('ai.toolbox.originalText') }}
          </div>
          <div
            class="border-border custom-scroll bg-muted/20 text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-line border rounded px-3 py-2 text-sm"
          >
            {{ currentText }}
          </div>
        </div>

        <div v-if="selectedAction === 'custom'">
          <div class="mb-1.5 text-sm font-medium">
            {{ t('ai.toolbox.customPrompt') }}
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
              :placeholder="t('ai.toolbox.customPromptPlaceholder')"
              @keydown.enter="addPrompt"
            >
          </div>
        </div>

        <div v-if="error" class="min-h-[20px] flex items-center text-xs text-red-500">
          {{ error }}
        </div>

        <div v-if="message">
          <div class="mb-1.5 text-sm font-medium">
            {{ t('ai.toolbox.result') }}
          </div>
          <div
            ref="resultContainer"
            class="custom-scroll border-border bg-background max-h-40 min-h-[60px] overflow-y-auto whitespace-pre-line border rounded px-3 py-2 text-sm"
          >
            {{ message }}
          </div>
        </div>
      </div>

      <div v-if="!configVisible" class="flex justify-end gap-2 px-6 py-3.5 mt-auto">
        <Button v-if="loading" variant="secondary" @click="stopAI">
          <Pause class="mr-1 h-4 w-4" /> {{ t('ai.toolbox.stop') }}
        </Button>
        <Button
          v-if="hasResult && !loading"
          variant="default"
          @click="replaceText"
        >
          {{ t('ai.toolbox.accept') }}
        </Button>
        <Button
          v-if="!loading"
          variant="outline"
          :disabled="!hasResult && !!message"
          @click="runAIAction"
        >
          {{ hasResult ? t('ai.toolbox.retry') : t('ai.toolbox.process') }}
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
