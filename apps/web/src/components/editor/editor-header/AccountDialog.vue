<script setup lang="ts">
import { Cloud, Crown, LogOut, Settings2, Share2, User } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import CloudFeatureState from '@/components/editor/editor-header/cloud/CloudFeatureState.vue'
import GitHubIcon from '@/components/icons/GitHubIcon.vue'
import PanelCard from '@/components/shared/panel-dialog/PanelCard.vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
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

const { t } = useI18n()
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
  return t(`account.loginHint`)
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

function openShareDialog() {
  dialogOpen.value = false
  uiStore.openShareDialog()
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('account.title')"
    :description="dialogDescription"
    :icon="User"
  >
    <CloudFeatureState
      v-if="!isConfigured"
      :icon="Settings2"
      :title="t('account.notConfiguredTitle')"
      :description="t('account.notConfiguredDescription')"
      compact
    >
      <code class="rounded-md border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
        VITE_MD_API_URL
      </code>
    </CloudFeatureState>

    <CloudFeatureState
      v-else-if="!isLoggedIn"
      :icon="User"
      :title="t('account.loginTitle')"
      :action-label="t('account.githubLogin')"
      :action-icon="GitHubIcon"
      @action="handleLogin"
    />

    <div v-else class="space-y-4 px-4 py-4 sm:px-6">
      <PanelCard align="center">
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
      </PanelCard>

      <div v-if="showSyncUi || showShareUi" class="grid gap-2 sm:grid-cols-2">
        <Button
          v-if="showSyncUi"
          variant="outline"
          class="h-10 justify-start gap-2"
          @click="openSyncDialog"
        >
          <Cloud class="size-4 shrink-0" />
          {{ t('account.cloudSync') }}
        </Button>
        <Button
          v-if="showShareUi"
          variant="outline"
          class="h-10 justify-start gap-2"
          @click="openShareDialog"
        >
          <Share2 class="size-4 shrink-0" />
          {{ t('account.sharePreview') }}
        </Button>
      </div>

      <Button
        variant="outline"
        class="h-10 w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        @click="handleLogout"
      >
        <LogOut class="size-4" />
        {{ t('common.logout') }}
      </Button>
    </div>
  </PanelDialog>
</template>
