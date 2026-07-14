<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { useQuickCommandsStore } from '@/stores/quickCommands'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits([`update:open`])

const dialogOpen = ref(props.open)
const confirmDeleteId = ref<string | null>(null)
watch(() => props.open, v => (dialogOpen.value = v))
watch(dialogOpen, (v) => {
  emit(`update:open`, v)
  if (!v)
    confirmDeleteId.value = null
})

const store = useQuickCommandsStore()
const { t } = useI18n()
const label = ref(``)
const template = ref(``)

function addCmd() {
  if (!label.value.trim() || !template.value.trim())
    return
  store.add(label.value.trim(), template.value.trim())
  label.value = ``
  template.value = ``
}

const editingId = ref<string | null>(null)
const editLabel = ref(``)
const editTemplate = ref(``)

function beginEdit(cmd: { id: string, label: string, template: string }) {
  confirmDeleteId.value = null
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
        <DialogTitle>{{ t('ai.quickCommand.title') }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 flex-1 overflow-y-auto pr-1">
        <div
          v-for="cmd in store.commands"
          :key="cmd.id"
          class="flex flex-col gap-2 border rounded-md p-3"
        >
          <template v-if="editingId === cmd.id">
            <Input v-model="editLabel" :placeholder="t('ai.quickCommand.namePlaceholder')" />
            <Textarea
              v-model="editTemplate"
              rows="2"
              :placeholder="t('ai.quickCommand.templatePlaceholder')"
            />
            <div class="flex justify-end gap-2">
              <Button size="xs" @click="saveEdit">
                {{ t('common.save') }}
              </Button>
              <Button variant="ghost" size="xs" @click="cancelEdit">
                {{ t('common.cancel') }}
              </Button>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center justify-between">
              <span class="break-all text-sm">{{ cmd.label }}</span>
              <div class="flex gap-1">
                <Button variant="ghost" size="xs" @click="beginEdit(cmd)">
                  {{ t('common.edit') }}
                </Button>
                <Popover
                  :open="confirmDeleteId === cmd.id"
                  @update:open="v => { if (!v) confirmDeleteId = null }"
                >
                  <PopoverTrigger as-child>
                    <Button variant="outline" size="xs" @click="confirmDeleteId = cmd.id">
                      {{ t('common.delete') }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-3">
                    <div class="flex flex-col gap-2">
                      <p class="text-sm">
                        {{ t('confirm.deleteItem', { name: cmd.label }) }}
                      </p>
                      <div class="flex justify-end gap-2">
                        <Button size="xs" variant="outline" @click="confirmDeleteId = null">
                          {{ t('common.cancel') }}
                        </Button>
                        <Button size="xs" @click="store.remove(cmd.id); confirmDeleteId = null">
                          {{ t('common.confirm') }}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="space-y-2 mt-4 border rounded-md p-3">
        <Input v-model="label" :placeholder="t('ai.quickCommand.nameExamplePlaceholder')" />
        <Textarea
          v-model="template"
          rows="2"
          :placeholder="t('ai.quickCommand.templateExamplePlaceholder')"
        />
        <Button class="w-full" @click="addCmd">
          {{ t('common.add') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
