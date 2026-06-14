<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  icon?: Component
  size?: keyof typeof sizeClassMap
}>(), {
  size: `md`,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const sizeClassMap = {
  'md': `sm:max-w-md`,
  'lg': `sm:max-w-lg`,
  'xl': `sm:max-w-xl`,
  '2xl': `sm:max-w-2xl`,
  '3xl': `sm:max-w-3xl`,
} as const

const dialogContentClass = computed(() => cn(
  `flex max-h-[min(90vh,100dvh)] flex-col gap-0 overflow-hidden p-0`,
  `max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none`,
  `max-sm:max-h-[min(88dvh,100dvh)] max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-2xl max-sm:rounded-b-none`,
  `max-sm:border-x-0 max-sm:border-b-0 max-sm:shadow-2xl`,
  `max-sm:pb-[max(1rem,env(safe-area-inset-bottom,0px))]`,
  `max-sm:data-[state=open]:slide-in-from-bottom-4 max-sm:data-[state=closed]:slide-out-to-bottom-4`,
  sizeClassMap[props.size],
))

function onUpdate(val: boolean) {
  emit(`update:open`, val)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="onUpdate">
    <DialogContent :class="dialogContentClass">
      <div
        aria-hidden="true"
        class="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25 sm:hidden"
      />

      <DialogHeader class="space-y-1.5 border-b px-4 py-4 sm:px-6">
        <DialogTitle class="flex items-center gap-2 pr-8 text-base sm:text-lg">
          <component :is="icon" v-if="icon" class="size-5 shrink-0 text-primary" />
          {{ title }}
        </DialogTitle>
        <DialogDescription v-if="description" class="text-left text-sm">
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <slot />
      </div>

      <slot name="footer" />
    </DialogContent>
  </Dialog>
</template>
