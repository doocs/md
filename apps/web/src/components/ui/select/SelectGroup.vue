<script setup lang="ts">
import type { SelectGroupProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { SelectGroup } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<SelectGroupProps & { class?: HTMLAttributes[`class`] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <SelectGroup :class="cn('p-1 w-full', props.class)" v-bind="delegatedProps">
    <slot />
  </SelectGroup>
</template>
