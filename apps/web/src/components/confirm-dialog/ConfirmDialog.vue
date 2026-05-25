<script setup lang="ts">
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
} from 'radix-vue'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useConfirmStore } from '@/stores/confirm'

const confirmStore = useConfirmStore()
</script>

<template>
  <AlertDialogRoot v-model:open="confirmStore.isOpen">
    <AlertDialogPortal>
      <AlertDialogOverlay
        class="fixed inset-0 z-[999] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-[1000] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 sm:rounded-lg"
      >
        <AlertDialogHeader>
          <AlertDialogTitle class="text-lg font-semibold">
            {{ confirmStore.title }}
          </AlertDialogTitle>
          <AlertDialogDescription v-if="confirmStore.description">
            {{ confirmStore.description }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            :class="cn(
              buttonVariants({ variant: 'outline' }),
              'mt-2 sm:mt-0',
            )"
            @click="confirmStore.handleCancel()"
          >
            {{ confirmStore.cancelText }}
          </AlertDialogCancel>
          <AlertDialogAction
            :class="cn(
              buttonVariants(),
              confirmStore.destructive
                && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            )"
            @click="confirmStore.handleConfirm()"
          >
            {{ confirmStore.confirmText }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
