<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { AccordionHeader, AccordionTrigger } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes[`class`] }>()
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      :class="cn(
        'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        props.class,
      )"
    >
      <slot />
    </AccordionTrigger>
  </AccordionHeader>
</template>
