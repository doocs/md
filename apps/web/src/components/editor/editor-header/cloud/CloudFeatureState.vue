<script setup lang="ts">
import type { Component } from 'vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

defineProps<{
  icon: Component
  title: string
  description?: string
  actionLabel?: string
  actionIcon?: Component
  actionDisabled?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div
    :class="cn(
      'flex flex-col items-center text-center',
      compact ? 'gap-3 px-4 py-6 sm:px-6' : 'gap-4 px-4 py-8 sm:px-6 sm:py-10',
    )"
  >
    <div class="flex size-14 items-center justify-center rounded-2xl bg-muted/60 ring-1 ring-border/60">
      <component :is="icon" class="size-7 text-muted-foreground" />
    </div>

    <div class="max-w-xs space-y-1.5">
      <p class="text-sm font-medium text-foreground">
        {{ title }}
      </p>
      <p v-if="description" class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {{ description }}
      </p>
    </div>

    <slot />

    <Button
      v-if="actionLabel"
      class="h-10 w-full max-w-xs gap-2 sm:w-auto sm:min-w-[200px]"
      :disabled="actionDisabled"
      @click="emit('action')"
    >
      <component :is="actionIcon" v-if="actionIcon" class="size-4" />
      {{ actionLabel }}
    </Button>
  </div>
</template>
