<script setup lang="ts">
import type { Template } from '@md/shared'
import { Calendar, Clock, FileDown, FileInput, FileText, Package, Pencil, Plus, Search, Trash2 } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useTemplateStore } from '@/stores/template'
import { useUIStore } from '@/stores/ui'

const editorStore = useEditorStore()
const postStore = usePostStore()
const templateStore = useTemplateStore()
const uiStore = useUIStore()

const { toggleShowTemplateDialog } = uiStore

// 搜索关键词
const searchKeyword = ref('')

// 搜索结果
const filteredTemplates = computed(() => {
  return templateStore.searchTemplates(searchKeyword.value)
})

// 是否显示新建/编辑模板表单
const isShowForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingTemplateId = ref<string>('')

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  content: '',
})

// 表单验证错误
const formErrors = reactive({
  name: '',
})

// 打开创建模板表单
function openCreateForm() {
  formMode.value = 'create'
  formData.name = ''
  formData.description = ''
  formData.content = editorStore.getContent()
  formErrors.name = ''
  isShowForm.value = true
}

// 打开编辑模板表单
function openEditForm(template: Template) {
  formMode.value = 'edit'
  editingTemplateId.value = template.id
  formData.name = template.name
  formData.description = template.description || ''
  formData.content = template.content
  formErrors.name = ''
  isShowForm.value = true
}

// 验证表单
function validateForm(): boolean {
  formErrors.name = ''

  if (!formData.name.trim()) {
    formErrors.name = '模板名称不能为空'
    return false
  }

  if (formData.name.trim().length > 50) {
    formErrors.name = '模板名称不能超过 50 个字符'
    return false
  }

  return true
}

// 保存模板
function saveTemplate() {
  if (!validateForm())
    return

  if (formMode.value === 'create') {
    templateStore.createTemplate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      content: formData.content,
    })
  }
  else {
    templateStore.updateTemplate(editingTemplateId.value, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      content: formData.content,
    })
  }

  isShowForm.value = false
}

// 取消表单
function cancelForm() {
  isShowForm.value = false
}

// 应用模板到当前文章
function applyTemplate(template: Template) {
  const currentPost = postStore.currentPost
  if (currentPost) {
    postStore.updatePostContent(currentPost.id, template.content)
    editorStore.importContent(template.content)
    toast.success(`已应用模板「${template.name}」到当前文章`)
  }
  else {
    editorStore.importContent(template.content)
    toast.success(`已应用模板「${template.name}」`)
  }
  toggleShowTemplateDialog(false)
}

// 在光标位置插入模板
function insertTemplate(template: Template) {
  editorStore.insertAtCursor(template.content)

  const currentPost = postStore.currentPost
  if (currentPost) {
    postStore.updatePostContent(currentPost.id, editorStore.getContent())
  }

  toast.success(`已插入模板「${template.name}」`)
  toggleShowTemplateDialog(false)
}

// 删除确认对话框
const deleteConfirmDialog = ref(false)
const templateToDelete = ref<Template | null>(null)

// 打开删除确认对话框
function openDeleteConfirm(template: Template) {
  templateToDelete.value = template
  deleteConfirmDialog.value = true
}

// 确认删除模板
function confirmDelete() {
  if (templateToDelete.value) {
    templateStore.deleteTemplate(templateToDelete.value.id)
    templateToDelete.value = null
  }
  deleteConfirmDialog.value = false
}

// 格式化日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 对话框关闭回调
function onUpdate(val: boolean) {
  if (!val) {
    toggleShowTemplateDialog(false)
    isShowForm.value = false
  }
}
</script>

<template>
  <Dialog :open="uiStore.isShowTemplateDialog" @update:open="onUpdate">
    <DialogContent class="max-w-4xl max-h-[85vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b">
        <DialogTitle class="flex items-center gap-2">
          <Package class="size-5" />
          模板管理
        </DialogTitle>
        <DialogDescription>
          保存和管理您的 Markdown 模板，快速复用常用内容
        </DialogDescription>
      </DialogHeader>

      <!-- 主体内容区域 -->
      <div class="flex-1 overflow-auto px-6 py-4">
        <!-- 新建/编辑表单 -->
        <div v-if="isShowForm" class="space-y-4 mb-6 p-4 border rounded-lg bg-muted/30">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ formMode === 'create' ? '新建模板' : '编辑模板' }}
            </h3>
          </div>

          <div class="space-y-4">
            <!-- 模板名称 -->
            <div class="space-y-2">
              <Label for="template-name">模板名称 *</Label>
              <Input
                id="template-name"
                v-model="formData.name"
                placeholder="请输入模板名称"
                :class="{ 'border-red-500': formErrors.name }"
              />
              <p v-if="formErrors.name" class="text-sm text-red-500">
                {{ formErrors.name }}
              </p>
            </div>

            <!-- 模板描述 -->
            <div class="space-y-2">
              <Label for="template-description">模板描述</Label>
              <Textarea
                id="template-description"
                v-model="formData.description"
                placeholder="请输入模板描述（可选）"
                class="resize-none h-20"
              />
            </div>

            <!-- 模板内容编辑 -->
            <div class="space-y-2">
              <Label for="template-content">模板内容</Label>
              <Textarea
                id="template-content"
                v-model="formData.content"
                placeholder="请输入模板内容"
                class="resize-none h-40 font-mono text-sm"
              />
            </div>
          </div>

          <!-- 表单操作按钮 -->
          <div class="flex gap-2 justify-end">
            <Button variant="outline" @click="cancelForm">
              取消
            </Button>
            <Button @click="saveTemplate">
              {{ formMode === 'create' ? '创建' : '保存' }}
            </Button>
          </div>
        </div>

        <!-- 搜索栏和新建按钮 -->
        <div v-if="!isShowForm" class="flex gap-2 mb-4">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              v-model="searchKeyword"
              placeholder="搜索模板名称、描述..."
              class="pl-9"
            />
          </div>
          <Button @click="openCreateForm">
            <Plus class="mr-2 size-4" />
            新建模板
          </Button>
        </div>

        <!-- 模板列表 -->
        <div v-if="!isShowForm" class="space-y-3">
          <!-- 空状态 -->
          <div v-if="filteredTemplates.length === 0" class="text-center py-12">
            <Package class="mx-auto size-12 text-muted-foreground mb-4" />
            <p class="text-muted-foreground mb-2">
              {{ searchKeyword ? '未找到匹配的模板' : '暂无模板' }}
            </p>
            <p v-if="!searchKeyword" class="text-sm text-muted-foreground mb-4">
              点击「新建模板」按钮创建您的第一个模板
            </p>
          </div>

          <!-- 模板卡片列表 -->
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- 模板信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <FileText class="size-4 text-muted-foreground flex-shrink-0" />
                  <h4 class="font-medium truncate">
                    {{ template.name }}
                  </h4>
                </div>

                <p v-if="template.description" class="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {{ template.description }}
                </p>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <Calendar class="size-3" />
                    创建：{{ formatDate(template.createdAt) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Clock class="size-3" />
                    更新：{{ formatDate(template.updatedAt) }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  class="size-8"
                  title="应用模板（替换全部内容）"
                  @click="applyTemplate(template)"
                >
                  <FileInput class="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="size-8"
                  title="插入模板（在光标处插入）"
                  @click="insertTemplate(template)"
                >
                  <FileDown class="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="size-8"
                  title="编辑模板"
                  @click="openEditForm(template)"
                >
                  <Pencil class="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="size-8 text-destructive hover:text-destructive"
                  title="删除模板"
                  @click="openDeleteConfirm(template)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter v-if="!isShowForm" class="px-6 pb-6 pt-4 border-t">
        <div class="flex items-center justify-between w-full">
          <p class="text-sm text-muted-foreground">
            共 {{ templateStore.templateCount }} 个模板
          </p>
          <Button variant="outline" @click="toggleShowTemplateDialog(false)">
            关闭
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 删除确认对话框 -->
  <AlertDialog v-model:open="deleteConfirmDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认删除</AlertDialogTitle>
        <AlertDialogDescription>
          确定要删除模板「{{ templateToDelete?.name }}」吗？此操作不可恢复。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="confirmDelete">
          删除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
