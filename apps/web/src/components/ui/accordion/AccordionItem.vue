<script setup lang="ts">
import type { AccordionItemEmits, AccordionItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { AccordionItem, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<AccordionItemProps & { class?: HTMLAttributes[`class`] }>()
const emits = defineEmits<AccordionItemEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <AccordionItem
    v-bind="forwarded"
    :class="cn('border-b', props.class)"
  >
    <slot />
  </AccordionItem>
</template>
