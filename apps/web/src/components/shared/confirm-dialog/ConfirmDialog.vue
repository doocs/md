<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
  <AlertDialog v-model:open="confirmStore.isOpen">
    <AlertDialogContent
      overlay-class="z-[999]"
      class="z-[1000]"
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
  </AlertDialog>
</template>
