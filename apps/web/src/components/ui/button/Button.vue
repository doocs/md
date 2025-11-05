<script setup lang="ts">
import type { PrimitiveProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { Primitive } from 'radix-vue'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants[`variant`]
  size?: ButtonVariants[`size`]
  class?: HTMLAttributes[`class`]
}

const props = withDefaults(defineProps<Props>(), {
  as: `button`,
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class, 'cursor-pointer')"
  >
    <slot />
  </Primitive>
</template>
