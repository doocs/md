<script setup lang="ts">
import type { ContextMenuRootEmits, ContextMenuRootProps } from 'reka-ui'
import { ContextMenuRoot, useForwardPropsEmits } from 'reka-ui'

const props = defineProps<ContextMenuRootProps>()
const emits = defineEmits<ContextMenuRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ContextMenuRoot v-bind="forwarded">
    <slot />
  </ContextMenuRoot>
</template>
