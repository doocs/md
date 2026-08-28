<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { mergeModelOptions } from '@/lib/ai-models'

const props = defineProps<{
  presetModels: string[]
  discoveredModels: string[]
  placeholder: string
  selectPlaceholder: string
  discoverLabel: string
  discoveringLabel: string
  needConfigLabel: string
  discovering: boolean
  canDiscover: boolean
  showDiscover: boolean
}>()

const emit = defineEmits<{
  discover: []
}>()

const model = defineModel<string>({ required: true })
const open = ref(false)

const listedOptions = computed(() =>
  mergeModelOptions(props.presetModels, props.discoveredModels),
)
const selectOptions = computed(() =>
  mergeModelOptions(listedOptions.value, model.value),
)

watch(() => props.discoveredModels, (ids, prev) => {
  if (ids.length > 0 && ids !== prev)
    open.value = true
})

function onSelectModel(value: unknown) {
  if (typeof value === `string` && value)
    model.value = value
}

function onOpenChange(value: boolean) {
  open.value = value
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="min-w-0 flex-1">
      <Select
        v-if="listedOptions.length > 0"
        :model-value="model"
        :open="open"
        data-testid="ai-model-select"
        @update:model-value="onSelectModel"
        @update:open="onOpenChange"
      >
        <SelectTrigger class="w-full">
          <SelectValue>
            {{ model || selectPlaceholder }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in selectOptions" :key="option" :value="option">
            {{ option }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Input
        v-else
        v-model="model"
        :placeholder="placeholder"
        class="h-10 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
        data-testid="ai-model-input"
      />
    </div>
    <TooltipProvider v-if="showDiscover">
      <Tooltip :disabled="canDiscover || discovering">
        <TooltipTrigger as-child>
          <span class="inline-flex shrink-0">
            <Button
              variant="outline"
              class="h-10"
              :disabled="!canDiscover || discovering"
              data-testid="ai-model-discover"
              @click="emit('discover')"
            >
              {{ discovering ? discoveringLabel : discoverLabel }}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" class="z-[250]">
          {{ needConfigLabel }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
