<script setup lang="ts">
import { Cloud, Crown, List, LogIn, LogOut, Settings2, Share2, User } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import CloudPanelCard from '@/components/editor/editor-header/cloud-panel/CloudPanelCard.vue'
import CloudPanelDialog from '@/components/editor/editor-header/cloud-panel/CloudPanelDialog.vue'
import CloudPanelState from '@/components/editor/editor-header/cloud-panel/CloudPanelState.vue'
import { Button } from '@/components/ui/button'
import { isShareProUser, isShareUiEnabled } from '@/services/share/client'
import { isSyncUiEnabled } from '@/services/sync/client'
import { useAuthStore } from '@/stores/auth'
import { useSyncStore } from '@/stores/sync'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const authStore = useAuthStore()
const syncStore = useSyncStore()
const uiStore = useUIStore()

const { user, isConfigured, isLoggedIn } = storeToRefs(authStore)

const isSharePro = computed(() => isShareProUser(user.value))
const showSyncUi = isSyncUiEnabled()
const showShareUi = isShareUiEnabled()

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})

const dialogDescription = computed(() => {
  if (isLoggedIn.value || !isConfigured.value)
    return undefined
  return `登录后可使用云同步、分享预览等云端能力。`
})

function handleLogin() {
  authStore.login()
}

function handleLogout() {
  authStore.logout()
  syncStore.reset()
}

function openSyncDialog() {
  dialogOpen.value = false
  uiStore.toggleShowSyncDialog(true)
}

function openShareDialog(tab: `create` | `manage` = `create`) {
  dialogOpen.value = false
  uiStore.openShareDialog({ tab })
}
</script>

<template>
  <CloudPanelDialog
    v-model:open="dialogOpen"
    title="账户"
    :description="dialogDescription"
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
      <CloudPanelCard align="center">
        <template #leading>
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
        </template>

        <div class="min-w-0 flex-1 text-left">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="truncate text-sm font-medium">
              {{ user?.name || user?.login }}
            </span>
            <span
              v-if="isSharePro"
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
      </CloudPanelCard>

      <div v-if="showSyncUi || showShareUi" class="grid gap-2 sm:grid-cols-2">
        <Button
          v-if="showSyncUi"
          variant="outline"
          class="h-10 justify-start gap-2"
          @click="openSyncDialog"
        >
          <Cloud class="size-4 shrink-0" />
          云同步
        </Button>
        <Button
          v-if="showShareUi"
          variant="outline"
          class="h-10 justify-start gap-2"
          @click="openShareDialog('create')"
        >
          <Share2 class="size-4 shrink-0" />
          分享预览
        </Button>
        <Button
          v-if="showShareUi && isSharePro"
          variant="outline"
          class="h-10 justify-start gap-2 sm:col-span-2"
          @click="openShareDialog('manage')"
        >
          <List class="size-4 shrink-0" />
          我的分享
        </Button>
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
