<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue: string
  options: readonly { value: string, label: string }[]
  class?: HTMLAttributes[`class`]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function select(value: string) {
  if (value === props.modelValue)
    return
  emit(`update:modelValue`, value)
}
</script>

<template>
  <div
    role="radiogroup"
    :class="cn(
      'inline-flex h-10 shrink-0 items-center rounded-md bg-muted p-1 text-muted-foreground',
      props.class,
    )"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      class="inline-flex h-full items-center justify-center whitespace-nowrap rounded-sm px-3 text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      :class="modelValue === option.value
        ? 'bg-background text-foreground shadow-xs'
        : 'hover:text-foreground'"
      @click="select(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
