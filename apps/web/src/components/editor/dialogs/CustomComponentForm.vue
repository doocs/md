<script setup lang="ts">
import type { ComponentPropDef, ComponentPropType, CustomComponentDef } from '@md/shared'
import { Plus, Trash2 } from '@lucide/vue'
import { previewComponent } from '@md/core'
import { sanitizeHtml } from '@md/core/utils'
import { useCustomComponentStore } from '@/stores/customComponent'

export interface CustomComponentFormPayload {
  name: string
  description?: string
  template: string
  props: ComponentPropDef[]
}

const props = defineProps<{
  mode: 'create' | 'edit'
  initial?: CustomComponentDef | null
}>()

const emit = defineEmits<{
  save: [payload: CustomComponentFormPayload]
  cancel: []
}>()

const { t } = useI18n()
const componentStore = useCustomComponentStore()

interface PropRow {
  name: string
  description: string
  default: string
  required: boolean
  type: ComponentPropType
}

const formData = reactive({
  name: '',
  description: '',
  template: '',
})

const propRows = ref<PropRow[]>([])

const formErrors = reactive({
  name: '',
  template: '',
})

function initForm() {
  if (props.mode === 'edit' && props.initial) {
    formData.name = props.initial.name
    formData.description = props.initial.description || ''
    formData.template = props.initial.template
    propRows.value = props.initial.props.length
      ? props.initial.props.map(p => ({
          name: p.name,
          description: p.description || '',
          default: p.default || '',
          required: !!p.required,
          type: (p.type || 'string') as ComponentPropType,
        }))
      : []
  }
  else {
    formData.name = ''
    formData.description = ''
    formData.template = ''
    propRows.value = []
  }
  formErrors.name = ''
  formErrors.template = ''
}

initForm()

function addPropRow() {
  propRows.value.push({ name: '', description: '', default: '', required: false, type: 'string' })
}

function removePropRow(idx: number) {
  if (idx < 0 || idx >= propRows.value.length)
    return
  propRows.value.splice(idx, 1)
}

function validate(): boolean {
  formErrors.name = ''
  formErrors.template = ''
  const name = formData.name.trim()

  if (!name) {
    formErrors.name = t('component.nameRequired')
    return false
  }
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    formErrors.name = t('component.nameInvalid')
    return false
  }
  const editingId = props.initial?.id
  const duplicate = componentStore.userComponents.find(c => c.name === name && (props.mode === 'create' || c.id !== editingId))
  if (duplicate) {
    formErrors.name = t('component.nameDuplicate')
    return false
  }
  if (!formData.template.trim()) {
    formErrors.template = t('component.templateRequired')
    return false
  }
  return true
}

function buildProps(): ComponentPropDef[] {
  return propRows.value
    .filter(r => r.name.trim())
    .map(r => ({
      name: r.name.trim(),
      description: r.description.trim() || undefined,
      default: r.default || undefined,
      required: r.required || undefined,
      type: r.type !== 'string' ? r.type : undefined,
    }))
}

function saveComponent() {
  if (!validate())
    return

  emit('save', {
    name: formData.name.trim(),
    description: formData.description.trim() || undefined,
    template: formData.template,
    props: buildProps(),
  })
}

function cancelForm() {
  emit('cancel')
}

const TEMPLATE_PLACEHOLDER = `<section style="text-align:center;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?data={{url}}" />
  <p>{{text}}</p>
</section>`

const isShowPreview = ref(false)

const previewHtml = computed(() => {
  if (!formData.template.trim())
    return ''
  const propsDef = buildProps()
  const tmpDef: CustomComponentDef = {
    id: '__preview__',
    name: formData.name.trim() || 'Preview',
    template: formData.template,
    props: propsDef,
  }
  const propValues: Record<string, string> = {}
  for (const p of propsDef) {
    if (p.default !== undefined && p.default !== '')
      propValues[p.name] = p.default
    else if (p.type === 'array')
      propValues[p.name] = '[]'
    else if (p.type === 'boolean')
      propValues[p.name] = 'true'
    else if (p.type === 'number')
      propValues[p.name] = '0'
  }
  try {
    const raw = previewComponent(tmpDef, propValues)
    return sanitizeHtml(raw)
  }
  catch {
    return ''
  }
})

const PREVIEW_FALLBACK_HTML = computed(() => `<span style="color:#aaa;font-size:12px;">${t('component.noContent')}</span>`)

function getPropDefaultPlaceholder(type: string): string {
  return type === 'array' ? '["item1","item2"]' : t('component.defaultValue')
}
</script>

<template>
  <div class="space-y-5 p-4 sm:p-5 border rounded-xl bg-muted/30">
    <h3 class="text-sm font-semibold">
      {{ mode === 'create' ? t('component.create') : t('component.edit') }}
    </h3>

    <div class="space-y-1.5">
      <Label for="comp-name">
        {{ t('component.nameLabel') }}
        <span class="text-red-500 ml-0.5">*</span>
        <span class="text-muted-foreground text-xs font-normal ml-1">{{ t('component.nameHint') }}</span>
      </Label>
      <Input
        id="comp-name"
        v-model="formData.name"
        :placeholder="t('component.namePlaceholder')"
        :class="{ 'border-red-500': formErrors.name }"
      />
      <p v-if="formErrors.name" class="text-sm text-red-500">
        {{ formErrors.name }}
      </p>
    </div>

    <div class="space-y-1.5">
      <Label for="comp-desc">{{ t('component.descLabel') }}</Label>
      <Input
        id="comp-desc"
        v-model="formData.description"
        :placeholder="t('component.descPlaceholder')"
      />
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label>{{ t('component.propsLabel') }}</Label>
        <Button variant="outline" size="sm" @click="addPropRow">
          <Plus class="size-3 mr-1" />
          {{ t('component.addProp') }}
        </Button>
      </div>
      <template v-if="propRows.length > 0">
        <div class="hidden sm:grid grid-cols-13 gap-2 px-1">
          <span class="col-span-3 text-xs text-muted-foreground">{{ t('component.propName') }}</span>
          <span class="col-span-2 text-xs text-muted-foreground">{{ t('component.propType') }}</span>
          <span class="col-span-4 text-xs text-muted-foreground">{{ t('component.propDesc') }}</span>
          <span class="col-span-3 text-xs text-muted-foreground">{{ t('component.propDefault') }}</span>
          <span class="col-span-1" />
        </div>
        <div class="space-y-2">
          <div
            v-for="(row, idx) in propRows"
            :key="idx"
            class="flex flex-col sm:grid sm:grid-cols-13 gap-2 items-start sm:items-center p-3 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none bg-muted/20 sm:bg-transparent"
          >
            <div class="w-full sm:col-span-3 flex gap-1 items-center">
              <span class="text-xs text-muted-foreground sm:hidden w-12 shrink-0">{{ t('component.propName') }}</span>
              <Input v-model="row.name" placeholder="propName" class="h-8 text-sm flex-1" />
            </div>
            <div class="w-full sm:col-span-2 flex gap-1 items-center">
              <span class="text-xs text-muted-foreground sm:hidden w-12 shrink-0">{{ t('component.propType') }}</span>
              <select
                v-model="row.type"
                class="h-8 w-full rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="string">
                  string
                </option>
                <option value="number">
                  number
                </option>
                <option value="boolean">
                  boolean
                </option>
                <option value="array">
                  array
                </option>
              </select>
            </div>
            <div class="w-full sm:col-span-4 flex gap-1 items-center">
              <span class="text-xs text-muted-foreground sm:hidden w-12 shrink-0">{{ t('component.propDesc') }}</span>
              <Input v-model="row.description" :placeholder="t('component.propDesc')" class="h-8 text-sm flex-1" />
            </div>
            <div class="w-full sm:col-span-3 flex gap-1 items-center">
              <span class="text-xs text-muted-foreground sm:hidden w-12 shrink-0">{{ t('component.propDefault') }}</span>
              <Input
                v-model="row.default"
                :placeholder="getPropDefaultPlaceholder(row.type)"
                class="h-8 text-sm flex-1"
              />
            </div>
            <div class="flex items-center gap-2 sm:col-span-1 sm:justify-center">
              <label class="flex items-center gap-1 text-xs cursor-pointer select-none" :title="t('component.required')">
                <input v-model="row.required" type="checkbox" class="cursor-pointer">
              </label>
              <Button
                variant="ghost"
                size="icon"
                class="size-7 text-muted-foreground hover:text-red-500"
                @click="removePropRow(idx)"
              >
                <Trash2 class="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="rounded-lg border border-dashed bg-muted/20 px-3 py-4 text-xs text-muted-foreground">
        {{ t('component.noProps') }}
      </div>
      <p class="text-xs text-muted-foreground">
        {{ t('component.propRefHint') }}
      </p>
    </div>

    <div class="space-y-1.5">
      <Label for="comp-template">
        {{ t('component.htmlTemplate') }}
        <span class="text-red-500 ml-0.5">*</span>
      </Label>
      <Textarea
        id="comp-template"
        v-model="formData.template"
        :placeholder="TEMPLATE_PLACEHOLDER"
        class="font-mono text-sm resize-none h-44"
        :class="{ 'border-red-500': formErrors.template }"
      />
      <p v-if="formErrors.template" class="text-sm text-red-500">
        {{ formErrors.template }}
      </p>
      <div class="text-xs text-muted-foreground space-y-0.5">
        <p>{{ t('component.templateHint1') }}</p>
        <p>{{ t('component.templateHint2') }}</p>
        <p>{{ t('component.templateHint3') }}</p>
        <p>{{ t('component.templateHint4') }}</p>
      </div>
    </div>

    <div v-if="formData.template.trim()" class="space-y-1.5">
      <div class="flex items-center justify-between">
        <Label class="text-muted-foreground">{{ t('component.previewLabel') }}</Label>
        <Button variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="isShowPreview = !isShowPreview">
          {{ isShowPreview ? t('common.collapse') : t('common.expand') }}
        </Button>
      </div>
      <div
        v-if="isShowPreview"
        class="rounded-lg border bg-white dark:bg-card p-3 text-sm overflow-x-auto"
        v-html="previewHtml || PREVIEW_FALLBACK_HTML"
      />
    </div>

    <div class="flex gap-2 justify-end">
      <Button variant="outline" @click="cancelForm">
        {{ t('common.cancel') }}
      </Button>
      <Button @click="saveComponent">
        {{ mode === 'create' ? t('common.create') : t('common.save') }}
      </Button>
    </div>
  </div>
</template>
