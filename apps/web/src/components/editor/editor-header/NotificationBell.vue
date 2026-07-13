<script setup lang="ts">
import type { NotificationItem } from '@/services/notifications/client'
import { Bell } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { isNotificationsConfigured } from '@/services/notifications/client'
import { useAuthStore } from '@/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
import { useNotificationsStore } from '@/stores/notifications'
import { useUIStore } from '@/stores/ui'

withDefaults(defineProps<{
  /** Match editor footer icon density */
  variant?: `default` | `footer`
}>(), {
  variant: `default`,
})

const { t, locale } = useI18n()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const confirmStore = useConfirmStore()
const uiStore = useUIStore()

const { isLoggedIn } = storeToRefs(authStore)
const { items, unreadCount, loading } = storeToRefs(notificationsStore)

const open = ref(false)
const show = computed(() => isNotificationsConfigured() && isLoggedIn.value)
const hasUnread = computed(() => unreadCount.value > 0)

function formatTime(ts: number): string {
  void locale.value
  try {
    return new Date(ts).toLocaleString(locale.value)
  }
  catch {
    return new Date(ts).toLocaleString()
  }
}

function messageText(item: NotificationItem): string {
  void locale.value
  const name = item.payload.name || item.payload.slug || `—`
  if (item.type === `marketplace_pending`)
    return t(`notifications.pending`, { name })
  if (item.type === `marketplace_approved`)
    return t(`notifications.approved`, { name })
  const reason = item.payload.rejectReason?.trim()
  if (reason)
    return t(`notifications.rejectedWithReason`, { name, reason })
  return t(`notifications.rejected`, { name })
}

async function onOpenChange(next: boolean) {
  open.value = next
  if (next)
    await notificationsStore.fetchOnce()
}

async function onMarkAllRead() {
  await notificationsStore.markAllRead()
}

async function onClearAll() {
  confirmStore.confirm({
    title: t(`notifications.clearAll`),
    description: t(`notifications.clearAllConfirm`),
    confirmText: t(`notifications.clearAll`),
    destructive: true,
    onConfirm: () => notificationsStore.clearAll(),
  })
}

async function onClickItem(item: NotificationItem) {
  await notificationsStore.markRead(item.id)
  open.value = false

  if (item.type === `marketplace_pending` && authStore.user?.isAdmin) {
    uiStore.openMarketplaceDialog({ tab: `theme`, view: `admin` })
    return
  }
  uiStore.openMarketplaceDialog({ tab: `theme`, view: `mine` })
}
</script>

<template>
  <Popover v-if="show" :open="open" @update:open="onOpenChange">
    <PopoverTrigger as-child>
      <button
        type="button"
        :aria-label="t('notifications.title')"
        class="relative inline-flex items-center justify-center transition-colors"
        :class="[
          variant === 'footer'
            ? 'cursor-pointer rounded-md p-1.5 hover:bg-accent hover:text-foreground'
            : 'h-9 w-9 rounded-md border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
          variant === 'footer' && hasUnread ? 'text-foreground' : '',
        ]"
      >
        <Bell :class="variant === 'footer' ? 'size-3' : 'size-4'" />
        <span
          v-if="hasUnread"
          class="absolute rounded-full bg-destructive ring-1 ring-background"
          :class="variant === 'footer' ? 'top-1 right-1 size-1.5' : 'top-1.5 right-1.5 size-2'"
        />
      </button>
    </PopoverTrigger>
    <PopoverContent
      :side="variant === 'footer' ? 'top' : 'bottom'"
      :side-offset="variant === 'footer' ? 8 : 4"
      align="end"
      class="w-[min(100vw-2rem,22rem)] p-0"
    >
      <div class="flex items-center justify-between gap-2 border-b px-3 py-2">
        <span class="text-sm font-medium">{{ t('notifications.title') }}</span>
        <div class="flex shrink-0 items-center gap-0.5">
          <Button
            v-if="unreadCount > 0"
            variant="ghost"
            size="sm"
            class="h-7 px-2 text-xs"
            @click="onMarkAllRead"
          >
            {{ t('notifications.markAllRead') }}
          </Button>
          <Button
            v-if="items.length"
            variant="ghost"
            size="sm"
            class="h-7 px-2 text-xs text-muted-foreground"
            @click="onClearAll"
          >
            {{ t('notifications.clearAll') }}
          </Button>
        </div>
      </div>

      <div class="max-h-80 overflow-y-auto">
        <div
          v-if="loading && !items.length"
          class="px-3 py-8 text-center text-sm text-muted-foreground"
        >
          …
        </div>
        <div
          v-else-if="!items.length"
          class="px-3 py-8 text-center text-sm text-muted-foreground"
        >
          {{ t('notifications.empty') }}
        </div>
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="flex w-full flex-col gap-1 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-accent/50"
          :class="item.readAt == null && 'bg-accent/30'"
          @click="onClickItem(item)"
        >
          <span class="text-sm leading-snug">{{ messageText(item) }}</span>
          <span class="text-[11px] text-muted-foreground">{{ formatTime(item.createdAt) }}</span>
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
