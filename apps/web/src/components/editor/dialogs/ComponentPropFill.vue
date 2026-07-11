<script setup lang="ts">
import type { CustomComponentDef } from '@md/shared'
import { previewComponent } from '@md/core'
import { sanitizeHtml } from '@md/core/utils'
import { buildComponentSnippet, getInitialPropValues } from '@/lib/component-snippet'

const props = defineProps<{
  def: CustomComponentDef
}>()

const emit = defineEmits<{
  'update:values': [values: Record<string, string>]
}>()

const { t, locale } = useI18n()

const values = reactive<Record<string, string>>({})
let syncing = false

function resetValues() {
  syncing = true
  const initial = getInitialPropValues(props.def)
  for (const key of Object.keys(values))
    delete values[key]
  Object.assign(values, initial)
  emit(`update:values`, { ...values })
  syncing = false
}

// Reset when component identity or locale-driven example/copy changes
watch(
  () => [props.def.id, props.def.example, locale.value] as const,
  () => {
    resetValues()
  },
  { immediate: true },
)

watch(values, () => {
  if (syncing)
    return
  emit(`update:values`, { ...values })
}, { deep: true })

const previewHtml = computed(() => {
  try {
    const raw = previewComponent(props.def, { ...values })
    const html = sanitizeHtml(raw)
    if (html)
      return html
  }
  catch {
    // fall through
  }
  return `<span style="color:#aaa;font-size:12px;">${t('component.noContent')}</span>`
})

const snippetPreview = computed(() => buildComponentSnippet(props.def, { ...values }))
</script>

<template>
  <div class="space-y-3">
    <div v-if="def.props.length > 0" class="space-y-2">
      <p class="text-xs font-medium text-muted-foreground">
        {{ t('component.fillProps') }}
      </p>
      <div class="space-y-2">
        <div
          v-for="prop in def.props"
          :key="prop.name"
          class="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-1.5 sm:gap-3 items-start sm:items-center"
        >
          <Label :for="`fill-${def.id}-${prop.name}`" class="text-xs font-mono text-primary pt-0 sm:pt-2">
            {{ prop.name }}
            <span v-if="prop.required" class="text-red-500 ml-0.5">*</span>
          </Label>
          <div class="space-y-1 min-w-0">
            <Select
              v-if="prop.type === 'boolean'"
              :model-value="values[prop.name] || 'true'"
              @update:model-value="(v) => { values[prop.name] = String(v) }"
            >
              <SelectTrigger :id="`fill-${def.id}-${prop.name}`" class="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">
                  true
                </SelectItem>
                <SelectItem value="false">
                  false
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else
              :id="`fill-${def.id}-${prop.name}`"
              v-model="values[prop.name]"
              class="h-8 text-xs font-mono"
              :placeholder="prop.description || prop.default || prop.name"
            />
            <p v-if="prop.description" class="text-[10px] text-muted-foreground leading-snug">
              {{ prop.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="text-xs text-muted-foreground italic">
        {{ t('component.noPropsDefined') }}
      </p>
    </div>

    <div>
      <p class="text-xs font-medium text-muted-foreground mb-1.5">
        {{ t('common.preview') }}
      </p>
      <div
        class="rounded-lg border bg-background px-3 py-2.5 text-sm leading-relaxed overflow-auto max-h-48"
        v-html="previewHtml"
      />
    </div>

    <div>
      <p class="text-xs font-medium text-muted-foreground mb-1.5">
        {{ t('component.example') }}
      </p>
      <pre class="text-xs font-mono bg-muted rounded-lg px-3 py-2.5 overflow-x-auto text-foreground/80 leading-relaxed"><code>{{ snippetPreview }}</code></pre>
    </div>
  </div>
</template>
