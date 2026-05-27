<script setup lang="ts">
import type { ComponentPropDef, CustomComponentDef } from '@md/shared'
import { Blocks, Lock, Pencil, Plus, Trash2, Zap } from 'lucide-vue-next'
import { useConfirmStore } from '@/stores/confirm'
import { useCustomComponentStore } from '@/stores/customComponent'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

const confirmStore = useConfirmStore()
const editorStore = useEditorStore()
const componentStore = useCustomComponentStore()
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

  if (!formData.name.trim()) {
    formErrors.name = '组件名称不能为空'
    return false
  }
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(formData.name.trim())) {
    formErrors.name = '组件名称必须以大写字母开头，只含字母和数字（PascalCase）'
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
</script>

<template>
  <Dialog :open="uiStore.isShowComponentDialog" @update:open="onUpdate">
    <DialogContent class="max-w-4xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b">
        <DialogTitle class="flex items-center gap-2">
          <Blocks class="size-5" />
          自定义组件
        </DialogTitle>
        <DialogDescription>
          在 Markdown 中使用 JSX 风格的组件，如
          <code class="text-xs bg-muted px-1 py-0.5 rounded">&lt;QRCodeBlock url="https://example.com" /&gt;</code>
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-auto px-6 py-4">
        <!-- ─── 新建/编辑表单 ─── -->
        <div v-if="isShowForm" class="space-y-5 p-5 border rounded-lg bg-muted/30">
          <h3 class="text-base font-semibold">
            {{ formMode === 'create' ? '新建组件' : '编辑组件' }}
          </h3>

          <!-- 组件名称 -->
          <div class="space-y-1.5">
            <Label for="comp-name">组件名称 * <span class="text-muted-foreground text-xs font-normal">（PascalCase，如 QRCodeBlock）</span></Label>
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
            <div class="space-y-2">
              <div
                v-for="(row, idx) in propRows"
                :key="idx"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <Input v-model="row.name" placeholder="名称" class="col-span-3 h-8 text-sm" />
                <Input v-model="row.description" placeholder="描述" class="col-span-4 h-8 text-sm" />
                <Input v-model="row.default" placeholder="默认值" class="col-span-3 h-8 text-sm" />
                <label class="col-span-1 flex items-center justify-center gap-1 text-xs cursor-pointer">
                  <input v-model="row.required" type="checkbox" class="cursor-pointer">
                  必填
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  class="col-span-1 size-7 text-muted-foreground hover:text-red-500"
                  @click="removePropRow(idx)"
                >
                  <Trash2 class="size-3.5" />
                </Button>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              在模板中使用 <code class="bg-muted px-1 rounded">&#123;&#123;propName&#125;&#125;</code> 引用 prop 值
            </p>
          </div>

          <!-- HTML 模板 -->
          <div class="space-y-1.5">
            <Label for="comp-template">HTML 模板 *</Label>
            <Textarea
              id="comp-template"
              v-model="formData.template"
              :placeholder="TEMPLATE_PLACEHOLDER"
              class="font-mono text-sm resize-none h-48"
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
          <div class="flex justify-end mb-4">
            <Button @click="openCreateForm">
              <Plus class="mr-2 size-4" />
              新建组件
            </Button>
          </div>

          <!-- 空状态 -->
          <div v-if="componentStore.allComponents.length === 0" class="text-center py-12">
            <Blocks class="mx-auto size-12 text-muted-foreground mb-4" />
            <p class="text-muted-foreground">
              暂无组件
            </p>
          </div>

          <!-- 内置组件 -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
              <Lock class="size-3.5" />
              内置组件
            </h4>
            <div class="space-y-2">
              <div
                v-for="def in componentStore.builtInComponents"
                :key="def.id"
                class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <code class="text-sm font-semibold text-primary">{{ def.name }}</code>
                      <span class="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">内置</span>
                    </div>
                    <p v-if="def.description" class="text-sm text-muted-foreground mb-2">
                      {{ def.description }}
                    </p>
                    <p class="text-xs text-muted-foreground font-mono">
                      {{ componentStore.buildSnippet(def) }}
                    </p>
                  </div>
                  <div class="flex gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      class="gap-1"
                      @click="insertSnippet(def)"
                    >
                      <Zap class="size-3.5" />
                      插入
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 用户自定义组件 -->
          <div v-if="componentStore.userComponents.length > 0">
            <h4 class="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
              <Blocks class="size-3.5" />
              自定义组件
            </h4>
            <div class="space-y-2">
              <div
                v-for="def in componentStore.userComponents"
                :key="def.id"
                class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <code class="text-sm font-semibold text-primary">{{ def.name }}</code>
                    </div>
                    <p v-if="def.description" class="text-sm text-muted-foreground mb-2">
                      {{ def.description }}
                    </p>
                    <p class="text-xs text-muted-foreground font-mono">
                      {{ componentStore.buildSnippet(def) }}
                    </p>
                  </div>
                  <div class="flex gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      class="gap-1"
                      @click="insertSnippet(def)"
                    >
                      <Zap class="size-3.5" />
                      插入
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="openEditForm(def)"
                    >
                      <Pencil class="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      class="text-red-500 hover:text-red-600"
                      @click="openDeleteConfirm(def)"
                    >
                      <Trash2 class="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
