<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useQuickCommands } from '@/stores/quickCommands'

/* ---------- 弹窗开关 ---------- */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits([`update:open`])

const dialogOpen = ref(props.open)
watch(() => props.open, v => (dialogOpen.value = v))
watch(dialogOpen, v => emit(`update:open`, v))

/* ---------- store & 新增 ---------- */
const store = useQuickCommands()
const label = ref(``)
const template = ref(``)

function addCmd() {
  if (!label.value.trim() || !template.value.trim())
    return
  store.add(label.value.trim(), template.value.trim())
  label.value = ``
  template.value = ``
}

/* ---------- 编辑 ---------- */
const editingId = ref<string | null>(null)
const editLabel = ref(``)
const editTemplate = ref(``)

function beginEdit(cmd: { id: string, label: string, template: string }) {
  editingId.value = cmd.id
  editLabel.value = cmd.label
  editTemplate.value = cmd.template
}
function cancelEdit() {
  editingId.value = null
}
function saveEdit() {
  if (!editLabel.value.trim() || !editTemplate.value.trim())
    return
  store.update(editingId.value!, editLabel.value.trim(), editTemplate.value.trim())
  editingId.value = null
}
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent
      class="max-h-[90vh] w-[92vw] flex flex-col sm:max-w-lg"
    >
      <DialogHeader>
        <DialogTitle>管理快捷指令</DialogTitle>
      </DialogHeader>

      <!-- 列表：独立滚动区域 -->
      <div class="space-y-4 flex-1 overflow-y-auto pr-1">
        <div
          v-for="cmd in store.commands"
          :key="cmd.id"
          class="flex flex-col gap-2 border rounded-md p-3"
        >
          <!-- 编辑态 -->
          <template v-if="editingId === cmd.id">
            <Input v-model="editLabel" placeholder="指令名称" />
            <Textarea
              v-model="editTemplate"
              rows="2"
              placeholder="模板内容，支持 {{sel}} 占位"
            />
            <div class="flex justify-end gap-2">
              <Button size="xs" @click="saveEdit">
                保存
              </Button>
              <Button variant="ghost" size="xs" @click="cancelEdit">
                取消
              </Button>
            </div>
          </template>

          <!-- 查看态 -->
          <template v-else>
            <div class="flex items-center justify-between">
              <span class="break-all text-sm">{{ cmd.label }}</span>
              <div class="flex gap-1">
                <Button variant="ghost" size="xs" @click="beginEdit(cmd)">
                  编辑
                </Button>
                <Button variant="outline" size="xs" @click="store.remove(cmd.id)">
                  删除
                </Button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 新增表单：固定在滚动区下方 -->
      <div class="space-y-2 mt-4 border rounded-md p-3">
        <Input v-model="label" placeholder="指令名称 (如：改写为 SEO 文案)" />
        <Textarea
          v-model="template"
          rows="2"
          placeholder="模板，可用 {{sel}} 占位，例如：\n请把以下文字改写为 SEO 友好的标题：\n\n{{sel}}"
        />
        <Button class="w-full" @click="addCmd">
          添加
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
