<script setup lang="ts">
import type { ProgressRootProps } from 'radix-vue'
import { ProgressIndicator, ProgressRoot } from 'radix-vue'

const props = defineProps<ProgressRootProps>()

const modelValue = computed(() => props.modelValue ?? 0)
</script>

<template>
  <ProgressRoot
    v-bind="props"
    :model-value="modelValue"
    class="relative overflow-hidden bg-blackA9 rounded-full w-full h-4 sm:h-5"
    style="transform: translateZ(0)"
  >
    <ProgressIndicator
      class="bg-primary rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
      :style="{ transform: `translateX(-${100 - (Number(modelValue) || 0)}%)` }"
    />
  </ProgressRoot>
</template>
