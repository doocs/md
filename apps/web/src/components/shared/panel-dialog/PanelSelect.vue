<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ChevronDown } from '@lucide/vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue: string
  options: readonly { value: string, label: string }[]
  triggerClass?: HTMLAttributes[`class`]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedLabel = computed(() =>
  props.options.find(option => option.value === props.modelValue)?.label ?? props.modelValue,
)

function onValueChange(value: unknown) {
  if (typeof value !== `string`)
    return
  emit(`update:modelValue`, value)
}
</script>

<template>
  <DropdownMenu :modal="false">
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        :class="cn(
          'flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-start w-[140px] shrink-0',
          props.triggerClass,
        )"
      >
        <span class="truncate">{{ selectedLabel }}</span>
        <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="z-200 min-w-[140px]">
      <DropdownMenuRadioGroup
        :model-value="modelValue"
        @update:model-value="onValueChange"
      >
        <DropdownMenuRadioItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
