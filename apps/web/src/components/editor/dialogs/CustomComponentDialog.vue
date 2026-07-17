<script setup lang="ts">
import type { ComponentPropDef, CustomComponentDef } from '@md/shared'
import type { CustomComponentFormPayload } from './CustomComponentForm.vue'
import type { MpAccount } from '@/stores/mpAccounts'
import { Blocks, Check, ChevronDown, Copy, Download, Lock, Pencil, Plus, Rss, Trash2, Upload, Zap } from '@lucide/vue'
import { escapeHtml } from '@md/core'
import { useLocalizedBuiltinComponents } from '@/composables/useLocalizedBuiltinComponents'
import { buildComponentSnippet, missingRequiredProps } from '@/lib/component-snippet'
import { useConfirmStore } from '@/stores/confirm'
import { useCustomComponentStore } from '@/stores/customComponent'
import { useEditorStore } from '@/stores/editor'
import { useMpAccountsStore } from '@/stores/mpAccounts'
import { useUIStore } from '@/stores/ui'
import ComponentPropFill from './ComponentPropFill.vue'
import CustomComponentForm from './CustomComponentForm.vue'

const { t } = useI18n()
const confirmStore = useConfirmStore()
const editorStore = useEditorStore()
const componentStore = useCustomComponentStore()
const localizedBuiltinComponents = useLocalizedBuiltinComponents()
const mpAccountsStore = useMpAccountsStore()
const uiStore = useUIStore()

const { toggleShowComponentDialog } = uiStore

const isShowForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingId = ref('')
const editingDef = ref<CustomComponentDef | null>(null)

function openCreateForm() {
  formMode.value = 'create'
  editingId.value = ''
  editingDef.value = null
  isShowForm.value = true
}

function openEditForm(def: CustomComponentDef) {
  formMode.value = 'edit'
  editingId.value = def.id
  editingDef.value = def
  isShowForm.value = true
}

function onFormSave(payload: CustomComponentFormPayload) {
  if (formMode.value === 'create') {
    componentStore.createComponent(payload)
  }
  else {
    componentStore.updateComponent(editingId.value, payload)
  }
  isShowForm.value = false
}

function onFormCancel() {
  isShowForm.value = false
}

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
    if (importFileRef.value)
      importFileRef.value.value = ''
  }
  reader.readAsText(file)
}

const activeComponentTab = ref<'builtin' | 'custom'>('builtin')
const expandedId = ref<string | null>(null)
const fillValues = reactive<Record<string, Record<string, string>>>({})
const copiedId = ref<string | null>(null)

watch(activeComponentTab, () => {
  expandedId.value = null
})

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function onFillValues(id: string, values: Record<string, string>) {
  fillValues[id] = values
}

/** Use filled values only while that component panel is expanded. */
function activeFillValues(def: CustomComponentDef): Record<string, string> | undefined {
  if (expandedId.value !== def.id)
    return undefined
  return fillValues[def.id]
}

function insertSnippet(def: CustomComponentDef) {
  // `def` is already localized for built-ins (from localizedBuiltinComponents)
  const values = activeFillValues(def)
  if (values) {
    const missing = missingRequiredProps(def, values)
    if (missing.length) {
      toast.error(t('component.requiredEmpty', { props: missing.join(', ') }))
      return
    }
  }
  const snippet = values
    ? buildComponentSnippet(def, values)
    : (def.example || componentStore.buildSnippet(def))
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
    expandedId.value = null
  }
}

async function copySnippet(def: CustomComponentDef) {
  const values = activeFillValues(def)
  if (values) {
    const missing = missingRequiredProps(def, values)
    if (missing.length) {
      toast.error(t('component.requiredEmpty', { props: missing.join(', ') }))
      return
    }
  }
  const text = values
    ? buildComponentSnippet(def, values)
    : (def.example || componentStore.buildSnippet(def))
  try {
    await navigator.clipboard.writeText(text)
    copiedId.value = def.id
    setTimeout(() => { copiedId.value = null }, 1500)
  }
  catch {
    toast.error(t('common.copyFailed'))
  }
}

function propTypeBadge(prop: ComponentPropDef) {
  if (prop.required)
    return { label: t('component.required'), class: 'bg-red-50 text-red-600 border-red-200' }
  if (prop.default !== undefined && prop.default !== '')
    return { label: t('component.optional'), class: 'bg-blue-50 text-blue-600 border-blue-200' }
  return { label: t('component.optional'), class: 'bg-muted text-muted-foreground border-border' }
}

// MpProfile WeChat card integration
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
    <DialogContent class="sm:max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
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
        <CustomComponentForm
          v-if="isShowForm"
          :mode="formMode"
          :initial="editingDef"
          @save="onFormSave"
          @cancel="onFormCancel"
        />

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
                      :aria-label="expandedId === def.id ? t('common.collapse') : t('common.expand')"
                      :aria-expanded="expandedId === def.id"
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
                        <table class="w-full text-xs border-separate border-spacing-0">
                          <thead>
                            <tr class="bg-muted/40">
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-28 border-b border-r border-border/50">
                                {{ t('component.propNameCol') }}
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-16 border-b border-r border-border/50">
                                {{ t('component.typeCol') }}
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-16 border-b border-r border-border/50">
                                {{ t('component.statusCol') }}
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/50">
                                {{ t('component.descCol') }}
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-24 border-b border-border/50">
                                {{ t('component.defaultCol') }}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="prop in def.props"
                              :key="prop.name"
                              class="bg-background"
                            >
                              <td class="px-3 py-2 border-b border-r border-border/30">
                                <code class="font-mono text-primary font-medium">{{ prop.name }}</code>
                              </td>
                              <td class="px-3 py-2 border-b border-r border-border/30">
                                <code class="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">{{ prop.type || 'string' }}</code>
                              </td>
                              <td class="px-3 py-2 border-b border-r border-border/30">
                                <span
                                  class="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium"
                                  :class="propTypeBadge(prop).class"
                                >{{ propTypeBadge(prop).label }}</span>
                              </td>
                              <td class="px-3 py-2 border-b border-r border-border/30 text-muted-foreground">
                                {{ prop.description || '—' }}
                              </td>
                              <td class="px-3 py-2 border-b border-border/30">
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

                    <ComponentPropFill
                      :def="def"
                      @update:values="(v) => onFillValues(def.id, v)"
                    />

                    <div class="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        class="h-7 px-2.5 text-xs gap-1"
                        @click="insertSnippet(def)"
                      >
                        <Zap class="size-3" />
                        {{ t('component.insertWithValues') }}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-7 text-muted-foreground"
                        :aria-label="t('common.copy')"
                        :title="t('common.copy')"
                        @click="copySnippet(def)"
                      >
                        <Check v-if="copiedId === def.id" class="size-3 text-green-500" />
                        <Copy v-else class="size-3" />
                      </Button>
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
                                <Button variant="ghost" size="icon" class="size-6 shrink-0 text-primary hover:text-primary" :aria-label="t('common.insert')" @click="insertMpAccount(account)">
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
                                <Button variant="ghost" size="icon" class="size-6 shrink-0 text-muted-foreground" :aria-label="t('common.edit')" @click="openEditMpAccount(account.id)">
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
                                <Button variant="ghost" size="icon" class="size-6 shrink-0 text-destructive hover:text-destructive" :aria-label="t('common.delete')" @click="deleteMpAccount(account)">
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
                        :aria-label="expandedId === def.id ? t('common.collapse') : t('common.expand')"
                        :aria-expanded="expandedId === def.id"
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
                                <th class="text-left px-3 py-2 font-medium text-muted-foreground w-16">
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

                      <ComponentPropFill
                        :def="def"
                        @update:values="(v) => onFillValues(def.id, v)"
                      />

                      <div class="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          class="h-7 px-2.5 text-xs gap-1"
                          @click="insertSnippet(def)"
                        >
                          <Zap class="size-3" />
                          {{ t('component.insertWithValues') }}
                        </Button>
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
