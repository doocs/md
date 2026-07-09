<script setup lang="ts">
import type { ComponentPropDef, ComponentPropType, CustomComponentDef } from '@md/shared'
import type { MpAccount } from '@/stores/mpAccounts'
import { Blocks, Check, ChevronDown, Copy, Download, Lock, Pencil, Plus, Rss, Trash2, Upload, Zap } from '@lucide/vue'
import { escapeHtml, previewComponent } from '@md/core'
import DOMPurify from 'isomorphic-dompurify'
import { useLocalizedBuiltinComponents } from '@/composables/useLocalizedBuiltinComponents'
import { useConfirmStore } from '@/stores/confirm'
import { useCustomComponentStore } from '@/stores/customComponent'
import { useEditorStore } from '@/stores/editor'
import { useMpAccountsStore } from '@/stores/mpAccounts'
import { useUIStore } from '@/stores/ui'

const { t } = useI18n()
const confirmStore = useConfirmStore()
const editorStore = useEditorStore()
const componentStore = useCustomComponentStore()
const localizedBuiltinComponents = useLocalizedBuiltinComponents()
const mpAccountsStore = useMpAccountsStore()
const uiStore = useUIStore()

const { toggleShowComponentDialog } = uiStore

// ──────────────────────────────────────────────
// 表单状态
// ──────────────────────────────────────────────
const isShowForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingId = ref('')

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

// ──────────────────────────────────────────────
// 表单操作
// ──────────────────────────────────────────────
function openCreateForm() {
  formMode.value = 'create'
  editingId.value = ''
  formData.name = ''
  formData.description = ''
  formData.template = ''
  propRows.value = []
  formErrors.name = ''
  formErrors.template = ''
  isShowForm.value = true
}

function openEditForm(def: CustomComponentDef) {
  formMode.value = 'edit'
  editingId.value = def.id
  formData.name = def.name
  formData.description = def.description || ''
  formData.template = def.template
  propRows.value = def.props.length
    ? def.props.map(p => ({
        name: p.name,
        description: p.description || '',
        default: p.default || '',
        required: !!p.required,
        type: (p.type || 'string') as ComponentPropType,
      }))
    : []
  formErrors.name = ''
  formErrors.template = ''
  isShowForm.value = true
}

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
  const duplicate = componentStore.userComponents.find(c => c.name === name && (formMode.value === 'create' || c.id !== editingId.value))
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

  const props = buildProps()

  if (formMode.value === 'create') {
    componentStore.createComponent({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      template: formData.template,
      props,
    })
  }
  else {
    componentStore.updateComponent(editingId.value, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      template: formData.template,
      props,
    })
  }
  isShowForm.value = false
}

function cancelForm() {
  isShowForm.value = false
}

const TEMPLATE_PLACEHOLDER = `<section style="text-align:center;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?data={{url}}" />
  <p>{{text}}</p>
</section>`

// ──────────────────────────────────────────────
// 实时预览
// ──────────────────────────────────────────────
const isShowPreview = ref(false)

const previewHtml = computed(() => {
  if (!formData.template.trim())
    return ''
  const props = buildProps()
  const tmpDef: CustomComponentDef = {
    id: '__preview__',
    name: formData.name.trim() || 'Preview',
    template: formData.template,
    props,
  }
  // 用每个 prop 的默认值（或占位）渲染预览
  const propValues: Record<string, string> = {}
  for (const p of props) {
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
    return DOMPurify.sanitize(raw, { ADD_TAGS: [`mp-common-profile`] })
  }
  catch {
    return ''
  }
})

// ──────────────────────────────────────────────
// 导入 / 导出
// ──────────────────────────────────────────────
function exportComponents() {
  const data = JSON.stringify(componentStore.userComponents, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `md-components-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(t('component.exportSuccess'))
}

const importFileRef = ref<HTMLInputElement | null>(null)

function triggerImport() {
  importFileRef.value?.click()
}

function onImportFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file)
    return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed: CustomComponentDef[] = JSON.parse(e.target?.result as string)
      if (!Array.isArray(parsed))
        throw new Error(t('component.formatError'))
      let imported = 0
      for (const def of parsed) {
        if (!def.name || !def.template)
          continue
        const existing = componentStore.userComponents.find(c => c.name === def.name)
        if (existing) {
          componentStore.updateComponent(existing.id, {
            name: def.name,
            description: def.description,
            template: def.template,
            props: def.props || [],
          })
        }
        else {
          componentStore.createComponent({
            name: def.name,
            description: def.description,
            template: def.template,
            props: def.props || [],
          })
        }
        imported++
      }
      toast.success(t('component.importSuccess', { count: imported }))
    }
    catch {
      toast.error(t('component.importFailed'))
    }
    // reset input so the same file can be re-imported
    if (importFileRef.value)
      importFileRef.value.value = ''
  }
  reader.readAsText(file)
}

// ──────────────────────────────────────────────
// 列表操作
// ──────────────────────────────────────────────
function insertSnippet(def: CustomComponentDef) {
  const snippet = def.example || componentStore.buildSnippet(def.builtIn ? findBuiltinDef(def.id) ?? def : def)
  editorStore.insertAtCursor(snippet)
  toast.success(t('component.insertSuccess', { name: def.name }))
  toggleShowComponentDialog(false)
}

function openDeleteConfirm(def: CustomComponentDef) {
  confirmStore.confirm({
    title: t('component.confirmDelete'),
    description: t('component.deleteConfirm', { name: def.name }),
    onConfirm: () => { componentStore.deleteComponent(def.id) },
  })
}

function onUpdate(val: boolean) {
  if (!val) {
    toggleShowComponentDialog(false)
    isShowForm.value = false
  }
}

const PREVIEW_FALLBACK_HTML = computed(() => `<span style="color:#aaa;font-size:12px;">${t('component.noContent')}</span>`)

function getPropDefaultPlaceholder(type: string): string {
  return type === 'array' ? '["item1","item2"]' : t('component.defaultValue')
}

// ──────────────────────────────────────────────
// 展开/折叠详情
// ──────────────────────────────────────────────
const activeComponentTab = ref<'builtin' | 'custom'>('builtin')
const expandedId = ref<string | null>(null)

watch(activeComponentTab, () => {
  expandedId.value = null
})

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

// ──────────────────────────────────────────────
// 复制代码片段
// ──────────────────────────────────────────────
const copiedId = ref<string | null>(null)

function findBuiltinDef(id: string) {
  return componentStore.builtInComponents.find(c => c.id === id)
}

async function copySnippet(def: CustomComponentDef) {
  const text = def.example || componentStore.buildSnippet(def.builtIn ? findBuiltinDef(def.id) ?? def : def)
  try {
    await navigator.clipboard.writeText(text)
    copiedId.value = def.id
    setTimeout(() => { copiedId.value = null }, 1500)
  }
  catch {
    toast.error(t('common.copyFailed'))
  }
}

// 类型颜色标签
function propTypeBadge(prop: ComponentPropDef) {
  if (prop.required)
    return { label: t('component.required'), class: 'bg-red-50 text-red-600 border-red-200' }
  if (prop.default !== undefined && prop.default !== '')
    return { label: t('component.optional'), class: 'bg-blue-50 text-blue-600 border-blue-200' }
  return { label: t('component.optional'), class: 'bg-muted text-muted-foreground border-border' }
}

// ──────────────────────────────────────────────
// MpProfile 公众号名片集成
// ──────────────────────────────────────────────
const isShowMpAccountConfig = ref(false)
const editingMpAccountId = ref<string | null>(null)

function isMpProfile(def: CustomComponentDef): boolean {
  return def.name === 'MpProfile'
}

function buildMpAccountSnippet(account: MpAccount): string {
  const logo = account.logo || 'https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png'
  const parts = [
    `mpId="${escapeHtml(account.mpId)}"`,
    `nickname="${escapeHtml(account.name)}"`,
    `headimg="${escapeHtml(logo)}"`,
  ]
  if (account.desc)
    parts.push(`signature="${escapeHtml(account.desc)}"`)
  parts.push(`serviceType="${account.serviceType || '1'}"`)
  parts.push(`verifyStatus="${account.verify || '0'}"`)
  return `<MpProfile ${parts.join(' ')} />`
}

function insertMpAccount(account: MpAccount) {
  const snippet = buildMpAccountSnippet(account)
  editorStore.insertAtCursor(snippet)
  toast.success(t('component.insertMpSuccess', { name: account.name }))
  toggleShowComponentDialog(false)
}

function openAddMpAccount() {
  editingMpAccountId.value = null
  isShowMpAccountConfig.value = true
}

function openEditMpAccount(id: string) {
  editingMpAccountId.value = id
  isShowMpAccountConfig.value = true
}

function deleteMpAccount(account: MpAccount) {
  confirmStore.confirm({
    title: t('component.confirmDelete'),
    description: t('component.deleteMpConfirm', { name: account.name }),
    onConfirm: () => {
      mpAccountsStore.deleteAccount(account.id)
      toast.success(t('component.deleted'))
    },
  })
}

// 当对话框打开且携带 target 时，自动展开对应的内置组件
watch(() => uiStore.isShowComponentDialog, (val) => {
  if (val && uiStore.componentDialogTarget) {
    const target = uiStore.componentDialogTarget
    uiStore.componentDialogTarget = null
    nextTick(() => {
      const def = componentStore.builtInComponents.find(c => c.name === target)
      if (def)
        expandedId.value = def.id
    })
  }
  if (!val) {
    expandedId.value = null
  }
})
</script>

<template>
  <Dialog :open="uiStore.isShowComponentDialog" @update:open="onUpdate">
    <DialogContent class="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0">
      <DialogHeader class="px-4 sm:px-6 pt-5 pb-4 border-b shrink-0">
        <DialogTitle class="flex items-center gap-2 text-base">
          <Blocks class="size-4.5" />
          {{ t('menu.component') }}
        </DialogTitle>
        <DialogDescription class="text-xs leading-relaxed mt-1">
          {{ t('component.description') }}
          <code class="bg-muted px-1 py-0.5 rounded font-mono">&lt;QRCodeBlock url="…" /&gt;</code>
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
        <!-- ─── 新建/编辑表单 ─── -->
        <div v-if="isShowForm" class="space-y-5 p-4 sm:p-5 border rounded-xl bg-muted/30">
          <h3 class="text-sm font-semibold">
            {{ formMode === 'create' ? t('component.create') : t('component.edit') }}
          </h3>

          <!-- 组件名称 -->
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

          <!-- 组件描述 -->
          <div class="space-y-1.5">
            <Label for="comp-desc">{{ t('component.descLabel') }}</Label>
            <Input
              id="comp-desc"
              v-model="formData.description"
              :placeholder="t('component.descPlaceholder')"
            />
          </div>

          <!-- Props 定义 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>{{ t('component.propsLabel') }}</Label>
              <Button variant="outline" size="sm" @click="addPropRow">
                <Plus class="size-3 mr-1" />
                {{ t('component.addProp') }}
              </Button>
            </div>
            <template v-if="propRows.length > 0">
              <!-- 桌面端：网格表头 -->
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

          <!-- HTML 模板 -->
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

          <!-- 实时预览 -->
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
              {{ formMode === 'create' ? t('common.create') : t('common.save') }}
            </Button>
          </div>
        </div>

        <!-- ─── 组件列表 ─── -->
        <div v-if="!isShowForm">
          <Tabs v-model="activeComponentTab" class="w-full">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="builtin">
                <span class="inline-flex items-center gap-1.5">
                  <Lock class="size-3.5" />
                  {{ t('component.builtin') }}
                </span>
              </TabsTrigger>
              <TabsTrigger value="custom">
                <span class="inline-flex items-center gap-1.5">
                  <Blocks class="size-3.5" />
                  {{ t('component.custom') }}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builtin" class="mt-4 space-y-2">
              <div
                v-for="def in localizedBuiltinComponents"
                :key="def.id"
                class="border rounded-xl overflow-hidden transition-all"
                :class="expandedId === def.id ? 'border-primary/30 bg-primary/2' : 'hover:border-border/80 bg-card'"
              >
                <div
                  class="flex items-start sm:items-center gap-3 p-3 sm:p-4 cursor-pointer select-none"
                  @click="toggleExpand(def.id)"
                >
                  <div class="size-8 sm:size-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Blocks class="size-4 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <code class="text-sm font-semibold text-primary">{{ def.name }}</code>
                      <span class="text-[10px] border px-1.5 py-px rounded-full bg-muted text-muted-foreground">{{ t('component.builtinBadge') }}</span>
                      <span class="text-[10px] border px-1.5 py-px rounded-full bg-muted text-muted-foreground">
                        {{ t('component.propCount', { count: def.props.length }) }}
                      </span>
                    </div>
                    <p v-if="def.description" class="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                      {{ def.description }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0" @click.stop>
                    <Button
                      variant="default"
                      size="sm"
                      class="h-7 px-2.5 text-xs gap-1"
                      @click="insertSnippet(def)"
                    >
                      <Zap class="size-3" />
                      {{ t('common.insert') }}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="size-7 text-muted-foreground"
                      @click="toggleExpand(def.id)"
                    >
                      <ChevronDown
                        class="size-3.5 transition-transform duration-200"
                        :class="{ 'rotate-180': expandedId === def.id }"
                      />
                    </Button>
                  </div>
                </div>

                <Transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <div v-if="expandedId === def.id" class="border-t px-3 sm:px-4 py-3 space-y-3 bg-muted/20">
                    <div v-if="def.props.length > 0">
                      <p class="text-xs font-medium text-muted-foreground mb-2">
                        {{ t('component.propDocs') }}
                      </p>
                      <div class="hidden sm:block rounded-lg border overflow-hidden">
                        <table class="w-full text-xs">
                          <thead class="bg-muted/50">
                            <tr>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-28">
                                {{ t('component.propNameCol') }}
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-16">
                                {{ t('component.typeCol') }}
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-14">
                                {{ t('component.statusCol') }}
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground">
                                {{ t('component.descCol') }}
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-24">
                                {{ t('component.defaultCol') }}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="prop in def.props"
                              :key="prop.name"
                              class="border-t border-border/50"
                            >
                              <td class="px-3 py-2">
                                <code class="font-mono text-primary font-medium">{{ prop.name }}</code>
                              </td>
                              <td class="px-3 py-2">
                                <code class="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">{{ prop.type || 'string' }}</code>
                              </td>
                              <td class="px-3 py-2">
                                <span
                                  class="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium"
                                  :class="propTypeBadge(prop).class"
                                >{{ propTypeBadge(prop).label }}</span>
                              </td>
                              <td class="px-3 py-2 text-muted-foreground">
                                {{ prop.description || '—' }}
                              </td>
                              <td class="px-3 py-2">
                                <code v-if="prop.default" class="text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">{{ prop.default }}</code>
                                <span v-else class="text-muted-foreground/50">—</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="sm:hidden space-y-2">
                        <div
                          v-for="prop in def.props"
                          :key="prop.name"
                          class="rounded-lg border bg-card p-3 space-y-1"
                        >
                          <div class="flex items-center gap-2">
                            <code class="font-mono text-sm font-semibold text-primary">{{ prop.name }}</code>
                            <code class="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">{{ prop.type || 'string' }}</code>
                            <span
                              class="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium"
                              :class="propTypeBadge(prop).class"
                            >{{ propTypeBadge(prop).label }}</span>
                          </div>
                          <p v-if="prop.description" class="text-xs text-muted-foreground">
                            {{ prop.description }}
                          </p>
                          <div v-if="prop.default" class="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{{ t('component.defaultPrefix') }}</span>
                            <code class="bg-muted px-1.5 py-0.5 rounded text-foreground">{{ prop.default }}</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p class="text-xs font-medium text-muted-foreground mb-1.5">
                        {{ t('component.example') }}
                      </p>
                      <div class="relative group">
                        <pre class="text-xs font-mono bg-muted rounded-lg px-3 py-2.5 overflow-x-auto text-foreground/80 pr-10 leading-relaxed"><code>{{ def.example || componentStore.buildSnippet(def) }}</code></pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          class="absolute right-1.5 top-1.5 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          @click="copySnippet(def)"
                        >
                          <Check v-if="copiedId === def.id" class="size-3 text-green-500" />
                          <Copy v-else class="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    <div v-if="isMpProfile(def)" class="border-t pt-3 space-y-2">
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Rss class="size-3.5" />
                          {{ t('component.savedAccounts') }}
                        </p>
                        <Button variant="outline" size="sm" class="h-6 px-2 text-xs gap-1" @click="openAddMpAccount">
                          <Plus class="size-3" />
                          {{ t('common.add') }}
                        </Button>
                      </div>
                      <div v-if="mpAccountsStore.accounts.length === 0" class="text-center py-4">
                        <p class="text-xs text-muted-foreground">
                          {{ t('component.noAccounts') }}
                        </p>
                      </div>
                      <div v-else class="space-y-1.5">
                        <div
                          v-for="account in mpAccountsStore.accounts"
                          :key="account.id"
                          class="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <img
                            v-if="account.logo"
                            :src="account.logo"
                            class="size-7 rounded-full object-cover shrink-0"
                            :alt="account.name"
                          >
                          <div v-else class="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Rss class="size-3.5 text-muted-foreground" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-xs font-medium truncate">
                              {{ account.name }}
                            </p>
                            <p v-if="account.desc" class="text-[10px] text-muted-foreground truncate">
                              {{ account.desc }}
                            </p>
                          </div>
                          <TooltipProvider :delay-duration="300">
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button variant="ghost" size="icon" class="size-6 shrink-0 text-primary hover:text-primary" @click="insertMpAccount(account)">
                                  <Zap class="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" class="z-250">
                                {{ t('common.insert') }}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider :delay-duration="300">
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button variant="ghost" size="icon" class="size-6 shrink-0 text-muted-foreground" @click="openEditMpAccount(account.id)">
                                  <Pencil class="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" class="z-250">
                                {{ t('common.edit') }}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider :delay-duration="300">
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button variant="ghost" size="icon" class="size-6 shrink-0 text-destructive hover:text-destructive" @click="deleteMpAccount(account)">
                                  <Trash2 class="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" class="z-250">
                                {{ t('common.delete') }}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </TabsContent>

            <TabsContent value="custom" class="mt-4 space-y-4">
              <input ref="importFileRef" type="file" accept=".json" class="hidden" @change="onImportFile">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <Blocks class="size-3.5 text-muted-foreground" />
                  <h4 class="text-sm font-medium text-muted-foreground">
                    {{ t('component.custom') }}
                  </h4>
                  <span class="text-xs text-muted-foreground/60">
                    {{ t('component.propCount', { count: componentStore.userComponents.length }) }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" class="h-6 px-2 text-xs gap-1" :disabled="componentStore.userComponents.length === 0" @click="exportComponents">
                    <Download class="size-3" />
                    {{ t('common.export') }}
                  </Button>
                  <Button variant="outline" size="sm" class="h-6 px-2 text-xs gap-1" @click="triggerImport">
                    <Upload class="size-3" />
                    {{ t('common.import') }}
                  </Button>
                  <Button variant="outline" size="sm" class="h-6 px-2 text-xs" @click="openCreateForm">
                    <Plus class="mr-1 size-3" />
                    {{ t('common.create') }}
                  </Button>
                </div>
              </div>
              <div v-if="componentStore.userComponents.length === 0" class="text-center py-8 border rounded-xl bg-card/50">
                <p class="text-xs text-muted-foreground">
                  {{ t('component.noCustom') }}
                </p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="def in componentStore.userComponents"
                  :key="def.id"
                  class="border rounded-xl overflow-hidden transition-all"
                  :class="expandedId === def.id ? 'border-primary/30 bg-primary/2' : 'hover:border-border/80 bg-card'"
                >
                  <div
                    class="flex items-start sm:items-center gap-3 p-3 sm:p-4 cursor-pointer select-none"
                    @click="toggleExpand(def.id)"
                  >
                    <div class="size-8 sm:size-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Blocks class="size-4 text-primary" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <code class="text-sm font-semibold text-foreground">{{ def.name }}</code>
                        <span class="text-[10px] border px-1.5 py-px rounded-full bg-muted text-muted-foreground">
                          {{ t('component.propCount', { count: def.props.length }) }}
                        </span>
                      </div>
                      <p v-if="def.description" class="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                        {{ def.description }}
                      </p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0" @click.stop>
                      <Button
                        variant="default"
                        size="sm"
                        class="h-7 px-2.5 text-xs gap-1"
                        @click="insertSnippet(def)"
                      >
                        <Zap class="size-3" />
                        {{ t('common.insert') }}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-7 text-muted-foreground"
                        @click="toggleExpand(def.id)"
                      >
                        <ChevronDown
                          class="size-3.5 transition-transform duration-200"
                          :class="{ 'rotate-180': expandedId === def.id }"
                        />
                      </Button>
                    </div>
                  </div>

                  <Transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="expandedId === def.id" class="border-t px-3 sm:px-4 py-3 space-y-3 bg-muted/20">
                      <div v-if="def.props.length > 0">
                        <p class="text-xs font-medium text-muted-foreground mb-2">
                          {{ t('component.propDocs') }}
                        </p>
                        <div class="hidden sm:block rounded-lg border overflow-hidden">
                          <table class="w-full text-xs">
                            <thead class="bg-muted/50">
                              <tr>
                                <th class="text-left px-3 py-2 font-medium text-muted-foreground w-28">
                                  {{ t('component.propNameCol') }}
                                </th>
                                <th class="text-left px-3 py-2 font-medium text-muted-foreground w-16">
                                  {{ t('component.typeCol') }}
                                </th>
                                <th class="text-left px-3 py-2 font-medium text-muted-foreground w-14">
                                  {{ t('component.statusCol') }}
                                </th>
                                <th class="text-left px-3 py-2 font-medium text-muted-foreground">
                                  {{ t('component.descCol') }}
                                </th>
                                <th class="text-left px-3 py-2 font-medium text-muted-foreground w-24">
                                  {{ t('component.defaultCol') }}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="prop in def.props"
                                :key="prop.name"
                                class="border-t border-border/50"
                              >
                                <td class="px-3 py-2">
                                  <code class="font-mono text-primary font-medium">{{ prop.name }}</code>
                                </td>
                                <td class="px-3 py-2">
                                  <code class="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">{{ prop.type || 'string' }}</code>
                                </td>
                                <td class="px-3 py-2">
                                  <span
                                    class="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium"
                                    :class="propTypeBadge(prop).class"
                                  >{{ propTypeBadge(prop).label }}</span>
                                </td>
                                <td class="px-3 py-2 text-muted-foreground">
                                  {{ prop.description || '—' }}
                                </td>
                                <td class="px-3 py-2">
                                  <code v-if="prop.default" class="text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">{{ prop.default }}</code>
                                  <span v-else class="text-muted-foreground/50">—</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div class="sm:hidden space-y-2">
                          <div
                            v-for="prop in def.props"
                            :key="prop.name"
                            class="rounded-lg border bg-card p-3 space-y-1"
                          >
                            <div class="flex items-center gap-2">
                              <code class="font-mono text-sm font-semibold text-primary">{{ prop.name }}</code>
                              <code class="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">{{ prop.type || 'string' }}</code>
                              <span
                                class="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium"
                                :class="propTypeBadge(prop).class"
                              >{{ propTypeBadge(prop).label }}</span>
                            </div>
                            <p v-if="prop.description" class="text-xs text-muted-foreground">
                              {{ prop.description }}
                            </p>
                            <div v-if="prop.default" class="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{{ t('component.defaultPrefix') }}</span>
                              <code class="bg-muted px-1.5 py-0.5 rounded text-foreground">{{ prop.default }}</code>
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
                          {{ t('component.example') }}
                        </p>
                        <div class="relative group">
                          <pre class="text-xs font-mono bg-muted rounded-lg px-3 py-2.5 overflow-x-auto text-foreground/80 pr-10 leading-relaxed"><code>{{ def.example || componentStore.buildSnippet(def) }}</code></pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            class="absolute right-1.5 top-1.5 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            @click="copySnippet(def)"
                          >
                            <Check v-if="copiedId === def.id" class="size-3 text-green-500" />
                            <Copy v-else class="size-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 pt-1 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          class="h-7 px-2.5 text-xs gap-1"
                          @click="openEditForm(def)"
                        >
                          <Pencil class="size-3" />
                          {{ t('common.edit') }}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          class="h-7 px-2.5 text-xs gap-1 text-red-500 hover:text-red-600 hover:border-red-300"
                          @click="openDeleteConfirm(def)"
                        >
                          <Trash2 class="size-3" />
                          {{ t('common.delete') }}
                        </Button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <MpAccountConfigDialog
    v-model:open="isShowMpAccountConfig"
    :account-id="editingMpAccountId"
  />
</template>
