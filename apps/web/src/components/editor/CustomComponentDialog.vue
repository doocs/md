<script setup lang="ts">
import type { ComponentPropDef, CustomComponentDef } from '@md/shared'
import type { MpAccount } from '@/stores/mpAccounts'
import { escapeHtml } from '@md/core'
import { Blocks, Check, ChevronDown, Copy, Lock, Pencil, Plus, Rss, Trash2, Zap } from 'lucide-vue-next'
import { useConfirmStore } from '@/stores/confirm'
import { useCustomComponentStore } from '@/stores/customComponent'
import { useEditorStore } from '@/stores/editor'
import { useMpAccountsStore } from '@/stores/mpAccounts'
import { useUIStore } from '@/stores/ui'

const confirmStore = useConfirmStore()
const editorStore = useEditorStore()
const componentStore = useCustomComponentStore()
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
}

const formData = reactive({
  name: '',
  description: '',
  template: '',
})

const propRows = ref<PropRow[]>([{ name: '', description: '', default: '', required: false }])

const formErrors = reactive({
  name: '',
  template: '',
})

// ──────────────────────────────────────────────
// 表单操作
// ──────────────────────────────────────────────
function openCreateForm() {
  formMode.value = 'create'
  formData.name = ''
  formData.description = ''
  formData.template = ''
  propRows.value = [{ name: '', description: '', default: '', required: false }]
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
      }))
    : [{ name: '', description: '', default: '', required: false }]
  formErrors.name = ''
  formErrors.template = ''
  isShowForm.value = true
}

function addPropRow() {
  propRows.value.push({ name: '', description: '', default: '', required: false })
}

function removePropRow(idx: number) {
  propRows.value.splice(idx, 1)
  if (propRows.value.length === 0) {
    propRows.value.push({ name: '', description: '', default: '', required: false })
  }
}

function validate(): boolean {
  formErrors.name = ''
  formErrors.template = ''
  const name = formData.name.trim()

  if (!name) {
    formErrors.name = '组件名称不能为空'
    return false
  }
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    formErrors.name = '组件名称必须以大写字母开头，只含字母和数字（PascalCase）'
    return false
  }
  const duplicate = componentStore.userComponents.find(c => c.name === name && c.id !== editingId.value)
  if (duplicate) {
    formErrors.name = '组件名称已存在，请更换名称'
    return false
  }
  if (!formData.template.trim()) {
    formErrors.template = '组件模板不能为空'
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
// 列表操作
// ──────────────────────────────────────────────
function insertSnippet(def: CustomComponentDef) {
  const snippet = componentStore.buildSnippet(def)
  editorStore.insertAtCursor(snippet)
  toast.success(`已插入组件「${def.name}」`)
  toggleShowComponentDialog(false)
}

function openDeleteConfirm(def: CustomComponentDef) {
  confirmStore.confirm({
    title: '确认删除',
    description: `确定要删除组件「${def.name}」吗？`,
    onConfirm: () => { componentStore.deleteComponent(def.id) },
  })
}

function onUpdate(val: boolean) {
  if (!val) {
    toggleShowComponentDialog(false)
    isShowForm.value = false
  }
}

// ──────────────────────────────────────────────
// 展开/折叠详情
// ──────────────────────────────────────────────
const expandedId = ref<string | null>(null)

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

// ──────────────────────────────────────────────
// 复制代码片段
// ──────────────────────────────────────────────
const copiedId = ref<string | null>(null)

async function copySnippet(def: CustomComponentDef) {
  const text = def.example || componentStore.buildSnippet(def)
  try {
    await navigator.clipboard.writeText(text)
    copiedId.value = def.id
    setTimeout(() => { copiedId.value = null }, 1500)
  }
  catch {
    toast.error(`复制失败，请手动复制`)
  }
}

// 类型颜色标签
function propTypeBadge(prop: ComponentPropDef) {
  if (prop.required)
    return { label: '必填', class: 'bg-red-50 text-red-600 border-red-200' }
  if (prop.default !== undefined && prop.default !== '')
    return { label: '可选', class: 'bg-blue-50 text-blue-600 border-blue-200' }
  return { label: '可选', class: 'bg-muted text-muted-foreground border-border' }
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
  toast.success(`已插入公众号名片「${account.name}」`)
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
    title: '确认删除',
    description: `确定要删除公众号「${account.name}」吗？此操作不可恢复。`,
    onConfirm: () => {
      mpAccountsStore.deleteAccount(account.id)
      toast.success('已删除')
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
          自定义组件
        </DialogTitle>
        <DialogDescription class="text-xs leading-relaxed mt-1">
          在 Markdown 中插入 JSX 风格组件，如
          <code class="bg-muted px-1 py-0.5 rounded font-mono">&lt;QRCodeBlock url="…" /&gt;</code>
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
        <!-- ─── 新建/编辑表单 ─── -->
        <div v-if="isShowForm" class="space-y-5 p-4 sm:p-5 border rounded-xl bg-muted/30">
          <h3 class="text-sm font-semibold">
            {{ formMode === 'create' ? '新建组件' : '编辑组件' }}
          </h3>

          <!-- 组件名称 -->
          <div class="space-y-1.5">
            <Label for="comp-name">
              组件名称
              <span class="text-red-500 ml-0.5">*</span>
              <span class="text-muted-foreground text-xs font-normal ml-1">（PascalCase，如 QRCodeBlock）</span>
            </Label>
            <Input
              id="comp-name"
              v-model="formData.name"
              placeholder="QRCodeBlock"
              :class="{ 'border-red-500': formErrors.name }"
            />
            <p v-if="formErrors.name" class="text-sm text-red-500">
              {{ formErrors.name }}
            </p>
          </div>

          <!-- 组件描述 -->
          <div class="space-y-1.5">
            <Label for="comp-desc">组件描述</Label>
            <Input
              id="comp-desc"
              v-model="formData.description"
              placeholder="简短描述该组件的用途"
            />
          </div>

          <!-- Props 定义 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Props 定义</Label>
              <Button variant="outline" size="sm" @click="addPropRow">
                <Plus class="size-3 mr-1" />
                添加 Prop
              </Button>
            </div>
            <!-- 桌面端：网格表头 -->
            <div class="hidden sm:grid grid-cols-12 gap-2 px-1">
              <span class="col-span-3 text-xs text-muted-foreground">名称</span>
              <span class="col-span-4 text-xs text-muted-foreground">描述</span>
              <span class="col-span-3 text-xs text-muted-foreground">默认值</span>
              <span class="col-span-2" />
            </div>
            <div class="space-y-2">
              <div
                v-for="(row, idx) in propRows"
                :key="idx"
                class="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-start sm:items-center p-3 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none bg-muted/20 sm:bg-transparent"
              >
                <div class="w-full sm:col-span-3 flex gap-1 items-center">
                  <span class="text-xs text-muted-foreground sm:hidden w-12 shrink-0">名称</span>
                  <Input v-model="row.name" placeholder="propName" class="h-8 text-sm flex-1" />
                </div>
                <div class="w-full sm:col-span-4 flex gap-1 items-center">
                  <span class="text-xs text-muted-foreground sm:hidden w-12 shrink-0">描述</span>
                  <Input v-model="row.description" placeholder="描述" class="h-8 text-sm flex-1" />
                </div>
                <div class="w-full sm:col-span-3 flex gap-1 items-center">
                  <span class="text-xs text-muted-foreground sm:hidden w-12 shrink-0">默认值</span>
                  <Input v-model="row.default" placeholder="默认值" class="h-8 text-sm flex-1" />
                </div>
                <div class="flex items-center gap-2 sm:col-span-2 sm:justify-center">
                  <label class="flex items-center gap-1 text-xs cursor-pointer select-none">
                    <input v-model="row.required" type="checkbox" class="cursor-pointer">
                    必填
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
            <p class="text-xs text-muted-foreground">
              在模板中使用 <code class="bg-muted px-1 rounded">&#123;&#123;propName&#125;&#125;</code> 引用 prop 值
            </p>
          </div>

          <!-- HTML 模板 -->
          <div class="space-y-1.5">
            <Label for="comp-template">
              HTML 模板
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
              <p><code class="bg-muted px-1 rounded">&#123;&#123;propName&#125;&#125;</code> — 替换为 prop 值（自动 HTML 转义）</p>
              <p><code class="bg-muted px-1 rounded">&#123;&#123;#if propName&#125;&#125;...&#123;&#123;/if&#125;&#125;</code> — prop 非空时显示该块</p>
            </div>
          </div>

          <div class="flex gap-2 justify-end">
            <Button variant="outline" @click="cancelForm">
              取消
            </Button>
            <Button @click="saveComponent">
              {{ formMode === 'create' ? '创建' : '保存' }}
            </Button>
          </div>
        </div>

        <!-- ─── 组件列表 ─── -->
        <div v-if="!isShowForm">
          <!-- 空状态 -->
          <div v-if="componentStore.allComponents.length === 0" class="text-center py-16">
            <Blocks class="mx-auto size-12 text-muted-foreground/40 mb-3" />
            <p class="text-sm text-muted-foreground mb-4">
              暂无组件，点击新建
            </p>
            <Button variant="outline" size="sm" @click="openCreateForm">
              <Plus class="mr-1.5 size-3.5" />
              新建组件
            </Button>
          </div>

          <!-- ── 内置组件 ── -->
          <section class="mb-6">
            <div class="flex items-center gap-1.5 mb-3">
              <Lock class="size-3.5 text-muted-foreground" />
              <h4 class="text-sm font-medium text-muted-foreground">
                内置组件
              </h4>
              <span class="text-xs text-muted-foreground/60">（只读，不可删除）</span>
            </div>
            <div class="space-y-2">
              <div
                v-for="def in componentStore.builtInComponents"
                :key="def.id"
                class="border rounded-xl overflow-hidden transition-all"
                :class="expandedId === def.id ? 'border-primary/30 bg-primary/[0.02]' : 'hover:border-border/80 bg-card'"
              >
                <!-- 卡片头部：始终可见 -->
                <div
                  class="flex items-start sm:items-center gap-3 p-3 sm:p-4 cursor-pointer select-none"
                  @click="toggleExpand(def.id)"
                >
                  <!-- 图标区 -->
                  <div class="size-8 sm:size-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Blocks class="size-4 text-primary" />
                  </div>
                  <!-- 名称 & 描述 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <code class="text-sm font-semibold text-primary">{{ def.name }}</code>
                      <span class="text-[10px] border px-1.5 py-px rounded-full bg-muted text-muted-foreground">内置</span>
                      <span class="text-[10px] border px-1.5 py-px rounded-full bg-muted text-muted-foreground">
                        {{ def.props.length }} 个属性
                      </span>
                    </div>
                    <p v-if="def.description" class="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                      {{ def.description }}
                    </p>
                  </div>
                  <!-- 操作按钮 -->
                  <div class="flex items-center gap-1 shrink-0" @click.stop>
                    <Button
                      variant="default"
                      size="sm"
                      class="h-7 px-2.5 text-xs gap-1"
                      @click="insertSnippet(def)"
                    >
                      <Zap class="size-3" />
                      插入
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

                <!-- 展开详情 -->
                <Transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <div v-if="expandedId === def.id" class="border-t px-3 sm:px-4 py-3 space-y-3 bg-muted/20">
                    <!-- Props 表格 -->
                    <div v-if="def.props.length > 0">
                      <p class="text-xs font-medium text-muted-foreground mb-2">
                        属性说明
                      </p>
                      <!-- 桌面端表格 -->
                      <div class="hidden sm:block rounded-lg border overflow-hidden">
                        <table class="w-full text-xs">
                          <thead class="bg-muted/50">
                            <tr>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-28">
                                属性名
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-16">
                                状态
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground">
                                描述
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-24">
                                默认值
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
                      <!-- 移动端卡片列表 -->
                      <div class="sm:hidden space-y-2">
                        <div
                          v-for="prop in def.props"
                          :key="prop.name"
                          class="rounded-lg border bg-card p-3 space-y-1"
                        >
                          <div class="flex items-center gap-2">
                            <code class="font-mono text-sm font-semibold text-primary">{{ prop.name }}</code>
                            <span
                              class="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium"
                              :class="propTypeBadge(prop).class"
                            >{{ propTypeBadge(prop).label }}</span>
                          </div>
                          <p v-if="prop.description" class="text-xs text-muted-foreground">
                            {{ prop.description }}
                          </p>
                          <div v-if="prop.default" class="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>默认：</span>
                            <code class="bg-muted px-1.5 py-0.5 rounded text-foreground">{{ prop.default }}</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 使用示例 -->
                    <div>
                      <p class="text-xs font-medium text-muted-foreground mb-1.5">
                        使用示例
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

                    <!-- MpProfile: 已保存的公众号账号 -->
                    <div v-if="isMpProfile(def)" class="border-t pt-3 space-y-2">
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Rss class="size-3.5" />
                          已保存的公众号
                        </p>
                        <Button variant="outline" size="sm" class="h-6 px-2 text-xs gap-1" @click="openAddMpAccount">
                          <Plus class="size-3" />
                          新增
                        </Button>
                      </div>
                      <div v-if="mpAccountsStore.accounts.length === 0" class="text-center py-4">
                        <p class="text-xs text-muted-foreground">
                          暂无保存的公众号，点击「新增」添加
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
                              <TooltipContent side="top" class="z-[250]">
                                插入
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
                              <TooltipContent side="top" class="z-[250]">
                                编辑
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
                              <TooltipContent side="top" class="z-[250]">
                                删除
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </section>

          <!-- ── 自定义组件 ── -->
          <section>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-1.5">
                <Blocks class="size-3.5 text-muted-foreground" />
                <h4 class="text-sm font-medium text-muted-foreground">
                  自定义组件
                </h4>
                <span class="text-xs text-muted-foreground/60">
                  {{ componentStore.userComponents.length }} 个
                </span>
              </div>
              <Button variant="outline" size="sm" class="h-6 px-2 text-xs" @click="openCreateForm">
                <Plus class="mr-1 size-3" />
                新建
              </Button>
            </div>
            <div v-if="componentStore.userComponents.length === 0" class="text-center py-8">
              <p class="text-xs text-muted-foreground">
                暂无自定义组件，点击上方"新建"按钮创建
              </p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="def in componentStore.userComponents"
                :key="def.id"
                class="border rounded-xl overflow-hidden transition-all"
                :class="expandedId === def.id ? 'border-primary/30 bg-primary/[0.02]' : 'hover:border-border/80 bg-card'"
              >
                <!-- 卡片头部 -->
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
                        {{ def.props.length }} 个属性
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
                      插入
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

                <!-- 展开详情 -->
                <Transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <div v-if="expandedId === def.id" class="border-t px-3 sm:px-4 py-3 space-y-3 bg-muted/20">
                    <!-- Props 表格 -->
                    <div v-if="def.props.length > 0">
                      <p class="text-xs font-medium text-muted-foreground mb-2">
                        属性说明
                      </p>
                      <!-- 桌面端表格 -->
                      <div class="hidden sm:block rounded-lg border overflow-hidden">
                        <table class="w-full text-xs">
                          <thead class="bg-muted/50">
                            <tr>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-28">
                                属性名
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-16">
                                状态
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground">
                                描述
                              </th>
                              <th class="text-left px-3 py-2 font-medium text-muted-foreground w-24">
                                默认值
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
                      <!-- 移动端卡片列表 -->
                      <div class="sm:hidden space-y-2">
                        <div
                          v-for="prop in def.props"
                          :key="prop.name"
                          class="rounded-lg border bg-card p-3 space-y-1"
                        >
                          <div class="flex items-center gap-2">
                            <code class="font-mono text-sm font-semibold text-primary">{{ prop.name }}</code>
                            <span
                              class="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium"
                              :class="propTypeBadge(prop).class"
                            >{{ propTypeBadge(prop).label }}</span>
                          </div>
                          <p v-if="prop.description" class="text-xs text-muted-foreground">
                            {{ prop.description }}
                          </p>
                          <div v-if="prop.default" class="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>默认：</span>
                            <code class="bg-muted px-1.5 py-0.5 rounded text-foreground">{{ prop.default }}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else>
                      <p class="text-xs text-muted-foreground italic">
                        该组件无属性定义
                      </p>
                    </div>

                    <!-- 使用示例 -->
                    <div>
                      <p class="text-xs font-medium text-muted-foreground mb-1.5">
                        使用示例
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
                    <!-- 编辑 / 删除 -->
                    <div class="flex items-center gap-2 pt-1 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        class="h-7 px-2.5 text-xs gap-1"
                        @click="openEditForm(def)"
                      >
                        <Pencil class="size-3" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        class="h-7 px-2.5 text-xs gap-1 text-red-500 hover:text-red-600 hover:border-red-300"
                        @click="openDeleteConfirm(def)"
                      >
                        <Trash2 class="size-3" />
                        删除
                      </Button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <MpAccountConfigDialog
    v-model:open="isShowMpAccountConfig"
    :account-id="editingMpAccountId"
  />
</template>
