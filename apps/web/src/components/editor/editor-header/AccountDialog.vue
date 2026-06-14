<script setup lang="ts">
import { Crown, LogIn, LogOut, Settings2, User } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import CloudPanelDialog from '@/components/editor/editor-header/cloud-panel/CloudPanelDialog.vue'
import CloudPanelState from '@/components/editor/editor-header/cloud-panel/CloudPanelState.vue'
import { Button } from '@/components/ui/button'
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

const dialogOpen = computed({
  get: () => props.visible,
  set: (val: boolean) => {
    if (!val)
      emit(`close`)
  },
})

function handleLogin() {
  authStore.login()
}

function handleLogout() {
  authStore.logout()
  syncStore.reset()
}
</script>

<template>
  <CloudPanelDialog
    v-model:open="dialogOpen"
    title="账户"
    description="登录后可使用云同步、分享预览等云端能力。"
    :icon="User"
  >
    <CloudPanelState
      v-if="!isConfigured"
      :icon="Settings2"
      title="账户服务未配置"
      description="部署方需配置 VITE_MD_API_URL 或 VITE_SYNC_API_URL 后，方可使用登录与云同步。"
      compact
    >
      <code class="rounded-md border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
        VITE_MD_API_URL
      </code>
    </CloudPanelState>

    <CloudPanelState
      v-else-if="!isLoggedIn"
      :icon="User"
      title="登录你的账户"
      action-label="使用 GitHub 登录"
      :action-icon="LogIn"
      @action="handleLogin"
    />

    <div v-else class="space-y-4 px-4 py-4 sm:px-6">
      <div class="flex items-center gap-3 rounded-xl border bg-muted/20 p-3.5 sm:p-4">
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user?.login"
          class="size-12 shrink-0 rounded-full ring-2 ring-background sm:size-11"
        >
        <div
          v-else
          class="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted ring-2 ring-background sm:size-11"
        >
          <User class="size-5 text-muted-foreground" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="truncate text-sm font-medium">
              {{ user?.name || user?.login }}
            </span>
            <span
              v-if="isPro"
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground"
            >
              <Crown class="size-3" />
              Pro
            </span>
            <span
              v-else
              class="inline-flex shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase text-muted-foreground"
            >
              Free
            </span>
          </div>
          <p class="truncate text-xs text-muted-foreground">
            @{{ user?.login }}
          </p>
        </div>
      </div>

      <div class="rounded-xl border border-dashed px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
        已登录。可在底部栏打开云同步，或使用分享预览将文章生成只读链接。
      </div>
    </div>

    <template v-if="isConfigured && isLoggedIn" #footer>
      <div class="border-t px-4 py-4 sm:px-6">
        <Button
          variant="outline"
          class="h-10 w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          @click="handleLogout"
        >
          <LogOut class="size-4" />
          退出登录
        </Button>
      </div>
    </template>
  </CloudPanelDialog>
</template>
