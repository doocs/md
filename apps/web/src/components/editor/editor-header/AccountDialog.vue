<script setup lang="ts">
import { Crown, LogIn, LogOut, User } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { isProPlan } from '@/services/account/features'
import { useAuthStore } from '@/stores/auth'
import { useSyncStore } from '@/stores/sync'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

const authStore = useAuthStore()
const syncStore = useSyncStore()

const { user, isConfigured, isLoggedIn } = storeToRefs(authStore)

const isPro = computed(() => isProPlan(user.value?.plan))

function onUpdate(val: boolean) {
  if (!val)
    emit(`close`)
}

function handleLogin() {
  authStore.login()
}

function handleLogout() {
  authStore.logout()
  syncStore.reset()
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent class="max-w-md gap-0 p-0">
      <DialogHeader class="space-y-1.5 border-b px-6 py-4">
        <DialogTitle class="flex items-center gap-2">
          <User class="size-5" />
          账户
        </DialogTitle>
        <DialogDescription>
          登录后可使用云同步等云端能力，后续将支持更多高级功能。
        </DialogDescription>
      </DialogHeader>

      <div v-if="!isConfigured" class="text-muted-foreground px-6 py-8 text-center text-sm">
        账户服务未配置（缺少 <code>VITE_MD_API_URL</code> 或 <code>VITE_SYNC_API_URL</code>）。
      </div>

      <div v-else-if="!isLoggedIn" class="flex flex-col items-center gap-4 px-6 py-8">
        <p class="text-muted-foreground text-center text-sm">
          使用 GitHub 登录，在多设备间同步数据
        </p>
        <Button class="gap-2" @click="handleLogin">
          <LogIn class="size-4" />
          使用 GitHub 登录
        </Button>
      </div>

      <div v-else class="space-y-4 px-6 py-4">
        <div class="flex items-center gap-3 rounded-lg border p-3">
          <img
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user?.login"
            class="size-10 shrink-0 rounded-full"
          >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 text-sm font-medium">
              <span class="truncate">{{ user?.name || user?.login }}</span>
              <span
                v-if="isPro"
                class="bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs"
              >
                <Crown class="size-3" />
                Pro
              </span>
              <span v-else class="bg-muted text-muted-foreground shrink-0 rounded px-1.5 py-0.5 text-xs uppercase">
                Free
              </span>
            </div>
            <div class="text-muted-foreground truncate text-xs">
              @{{ user?.login }}
            </div>
          </div>
          <Button variant="ghost" size="icon" class="shrink-0" title="退出登录" @click="handleLogout">
            <LogOut class="size-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
