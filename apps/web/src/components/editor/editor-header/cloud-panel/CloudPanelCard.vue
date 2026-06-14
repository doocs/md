<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  align?: `center` | `start`
  variant?: `default` | `dashed` | `success`
  class?: string
}>()
</script>

<template>
  <div
    :class="cn(
      'rounded-xl border p-3.5 sm:p-4',
      align === 'center' ? 'flex items-center gap-3' : 'flex items-start gap-3',
      variant === 'dashed' && 'border-dashed bg-transparent',
      variant === 'success' && 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/30',
      (!variant || variant === 'default') && 'bg-muted/20',
      props.class,
    )"
  >
    <slot name="leading" />
    <div class="min-w-0 flex-1">
      <slot />
    </div>
    <slot name="trailing" />
  </div>
</template>
