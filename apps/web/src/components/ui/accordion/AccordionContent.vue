<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { AccordionContent, AccordionPortal } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes[`class`] }>()
</script>

<template>
  <AccordionPortal>
    <AccordionContent
      :class="cn(
        'overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        props.class,
      )"
    >
      <div class="pb-4 pt-0">
        <slot />
      </div>
    </AccordionContent>
  </AccordionPortal>
</template>
