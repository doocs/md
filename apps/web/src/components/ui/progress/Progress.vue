<script setup lang="ts">
import type { ProgressRootProps } from 'reka-ui'
import { ProgressIndicator, ProgressRoot } from 'reka-ui'

const props = defineProps<ProgressRootProps & { indeterminate?: boolean }>()

const modelValue = computed(() => props.modelValue ?? 0)
const progressRootProps = computed(() => {
  const { indeterminate: _, ...rest } = props
  return rest
})
</script>

<template>
  <div
    v-if="indeterminate"
    class="relative overflow-hidden bg-blackA9 rounded-full w-full h-4 sm:h-5"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-busy="true"
  >
    <div class="progress-indeterminate-bar bg-primary h-full rounded-full" />
  </div>
  <ProgressRoot
    v-else
    v-bind="progressRootProps"
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

<style scoped>
.progress-indeterminate-bar {
  width: 40%;
  animation: progress-indeterminate 1.2s ease-in-out infinite;
}

@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(350%);
  }
}
</style>
