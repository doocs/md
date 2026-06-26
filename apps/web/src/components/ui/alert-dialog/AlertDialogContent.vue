<script setup lang="ts">
import type { AlertDialogContentEmits, AlertDialogContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import {
  AlertDialogContent,

  AlertDialogOverlay,
  AlertDialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { useDialogContentA11yBindings } from '@/lib/a11y/dialog-focus'
import { cn } from '@/lib/utils'

const props = defineProps<AlertDialogContentProps & {
  class?: HTMLAttributes[`class`]
  overlayClass?: HTMLAttributes[`class`]
}>()
const emits = defineEmits<AlertDialogContentEmits>()

const delegatedProps = computed(() => {
  const { class: _, overlayClass: __, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
const contentBindings = useDialogContentA11yBindings(forwarded)
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay
      :class="
        cn(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
          props.overlayClass,
        )
      "
    />
    <AlertDialogContent
      v-bind="contentBindings"
      :class="
        cn(
          'fixed left-1/2 top-1/2 z-200 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 sm:rounded-lg',
          props.class,
        )
      "
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
