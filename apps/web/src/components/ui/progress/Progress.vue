<script setup lang="ts">
import type { ProgressRootProps } from 'radix-vue'
import { ProgressIndicator, ProgressRoot, useForwardPropsEmits } from 'radix-vue'

const props = defineProps<ProgressRootProps>()
const emits = defineEmits<{
  (e: `update:modelValue`, payload: string | number): void
}>()

const modelValue = useVModel(props, `modelValue`, emits, {
  passive: true,
  defaultValue: 0,
})
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ProgressRoot
    v-bind="forwarded"
    v-model="modelValue"
    class="relative overflow-hidden bg-blackA9 rounded-full w-full h-4 sm:h-5"
    style="transform: translateZ(0)"
  >
    <ProgressIndicator
      class="bg-primary rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
      :style="`transform: translateX(-${100 - (modelValue || 0)}%)`"
    />
  </ProgressRoot>
</template>
