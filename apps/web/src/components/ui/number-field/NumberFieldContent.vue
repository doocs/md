<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes[`class`]
}>()
</script>

<template>
  <div :class="cn('relative has-data-[slot=increment]:*:data-[slot=input]:pr-5 has-data-[slot=decrement]:*:data-[slot=input]:pl-5', props.class)">
    <slot />
  </div>
</template>
