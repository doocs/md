<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes[`class`]
}>()

const emits = defineEmits<{
  (e: `update:modelValue`, payload: string | number): void
}>()

const modelValue = useVModel(props, `modelValue`, emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const attrs = useAttrs()

const inputRef = ref<HTMLInputElement>()

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  setSelectionRange: (start: number, end: number) => inputRef.value?.setSelectionRange(start, end),
  inputElement: inputRef,
})
</script>

<template>
  <input
    ref="inputRef"
    v-model="modelValue"
    v-bind="attrs"
    :class="cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', props.class)"
  >
</template>
