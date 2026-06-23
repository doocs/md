<script setup lang="ts">
import type { Component } from 'vue'
import type { ShareExpiresMode, ShareListItem, SharePasswordMode } from '@/services/share/types'
import { Check, Clock, Copy, ExternalLink, Eye, Globe, Inbox, KeyRound, Loader2, LogIn, RefreshCw, Share2, Sparkles, Trash2 } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import CloudFeatureState from '@/components/editor/editor-header/cloud/CloudFeatureState.vue'
import PanelCard from '@/components/shared/panel-dialog/PanelCard.vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { captureShareSnapshot } from '@/services/share/capture-snapshot'
import { isShareConfigured, isShareProUser, ShareApiError, ShareClient } from '@/services/share/client'
import { useAuthStore } from '@/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
import { useLocaleStore } from '@/stores/locale'
import { usePostStore } from '@/stores/post'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

interface PasswordOption {
  value: SharePasswordMode
  label: string
  description: string
  icon: Component
}

interface ExpiresOption {
  value: ShareExpiresMode
  label: string
}

const { t } = useI18n()
const authStore = useAuthStore()
const postStore = usePostStore()
const uiStore = useUIStore()
const confirmStore = useConfirmStore()
const localeStore = useLocaleStore()

const passwordOptions = computed<PasswordOption[]>(() => [
  {
    value: `none`,
    label: t(`share.passwordMode.public.label`),
    description: t(`share.passwordMode.public.description`),
    icon: Globe,
  },
  {
    value: `custom`,
    label: t(`share.passwordMode.custom.label`),
    description: t(`share.passwordMode.custom.description`),
    icon: KeyRound,
  },
  {
    value: `auto`,
    label: t(`share.passwordMode.auto.label`),
    description: t(`share.passwordMode.auto.description`),
    icon: Sparkles,
  },
])

const expiresOptions = computed<ExpiresOption[]>(() => [
  { value: `1d`, label: t(`share.expiresMode.1d`) },
  { value: `7d`, label: t(`share.expiresMode.7d`) },
  { value: `30d`, label: t(`share.expiresMode.30d`) },
  { value: `never`, label: t(`share.expiresMode.never`) },
])

const { isLoggedIn, user } = storeToRefs(authStore)
const { shareDialogInitialTab } = storeToRefs(uiStore)
const { locale } = storeToRefs(localeStore)

const activeTab = ref<`create` | `manage`>(`create`)
const shareList = ref<ShareListItem[]>([])
const isLoadingList = ref(false)
const revokingId = ref<string | null>(null)

const isProUser = computed(() => isShareProUser(user.value))

const dialogOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value)
      shareDialogInitialTab.value = `create`
    emit(`update:open`, value)
  },
})

const shareClient = new ShareClient(() => authStore.token)
const passwordMode = ref<SharePasswordMode>(`none`)
const expiresMode = ref<ShareExpiresMode>(`1d`)
const customPassword = ref(``)
const isSubmitting = ref(false)
const submitStage = ref(``)
const shareUrl = ref(``)
const sharePassword = ref(``)
const isProtected = ref(false)
const expiresAt = ref<number | null>(null)
const errorMessage = ref(``)
const copiedLink = ref(false)
const copiedPassword = ref(false)

const expiresLabel = computed(() => {
  if (expiresAt.value == null && shareUrl.value)
    return t(`share.permanent`)
  if (!expiresAt.value)
    return ``
  return t(`share.expiresAt`, { date: new Date(expiresAt.value).toLocaleString(locale.value) })
})

const canSubmit = computed(() => {
  if (passwordMode.value === `custom`)
    return customPassword.value.trim().length >= 4
  return true
})

function resetForm() {
  passwordMode.value = `none`
  expiresMode.value = `1d`
  customPassword.value = ``
  shareUrl.value = ``
  sharePassword.value = ``
  isProtected.value = false
  expiresAt.value = null
  errorMessage.value = ``
  copiedLink.value = false
  copiedPassword.value = false
}

function resetDialog() {
  activeTab.value = shareDialogInitialTab.value === `manage` && isProUser.value
    ? `manage`
    : `create`
  resetForm()
}

function formatShareTitle(title: string): string {
  const trimmed = title.trim()
  return trimmed || t(`share.untitled`)
}

function formatShareExpiry(expiresAtValue: number | null, expired: boolean): string {
  if (expired)
    return t(`share.expired`)
  if (!expiresAtValue)
    return t(`share.permanent`)
  return t(`share.expiresOn`, { date: new Date(expiresAtValue).toLocaleString(locale.value) })
}

async function loadShareList() {
  if (!isLoggedIn.value)
    return

  isLoadingList.value = true
  try {
    const result = await shareClient.list()
    shareList.value = result.shares
  }
  catch (err) {
    const message = err instanceof ShareApiError && err.message === `pro_required`
      ? t(`share.proRequired`)
      : err instanceof Error ? err.message : String(err)
    toast.error(t(`share.loadListFailed`, { message }))
  }
  finally {
    isLoadingList.value = false
  }
}

function confirmRevokeShare(share: ShareListItem) {
  confirmStore.confirm({
    title: t(`share.revokeTitle`),
    description: t(`share.revokeDescription`, { title: formatShareTitle(share.title) }),
    confirmText: t(`share.revokeShare`),
    destructive: true,
    onConfirm: async () => {
      revokingId.value = share.id
      try {
        await shareClient.revoke(share.id)
        shareList.value = shareList.value.filter(item => item.id !== share.id)
        if (shareUrl.value === share.url)
          resetForm()
        toast.success(t(`share.revokeSuccess`))
      }
      catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        toast.error(t(`share.revokeFailed`, { message }))
      }
      finally {
        revokingId.value = null
      }
    },
  })
}

function openAccountDialog() {
  dialogOpen.value = false
  uiStore.toggleShowAccountDialog(true)
}

function formatShareError(err: unknown): string {
  if (err instanceof ShareApiError && err.status === 429 && err.body?.error === `rate_limited`) {
    const limit = typeof err.body.limit === `number` ? err.body.limit : null
    const retryAfterSec = typeof err.body.retryAfterSec === `number` ? err.body.retryAfterSec : null
    const limitText = limit != null ? t(`share.rateLimited`, { limit }) : t(`share.rateLimitedGeneric`)
    const retryHint = retryAfterSec != null
      ? retryAfterSec >= 3600
        ? t(`share.retryAfterHours`, { hours: Math.ceil(retryAfterSec / 3600) })
        : t(`share.retryAfterMinutes`, { minutes: Math.max(1, Math.ceil(retryAfterSec / 60)) })
      : t(`share.retryTomorrow`)

    return `${limitText}${retryHint}`
  }

  if (err instanceof Error)
    return err.message

  return String(err)
}

async function createShare() {
  if (isSubmitting.value || !isLoggedIn.value || !canSubmit.value)
    return

  isSubmitting.value = true
  submitStage.value = t(`share.stageRendering`)
  errorMessage.value = ``
  shareUrl.value = ``
  sharePassword.value = ``
  isProtected.value = false
  copiedLink.value = false
  copiedPassword.value = false

  try {
    const htmlSnapshot = await captureShareSnapshot()
    submitStage.value = t(`share.stageUploading`)

    const currentPost = postStore.currentPost
    if (!currentPost?.id)
      throw new Error(t(`share.invalidPost`))

    const result = await shareClient.create({
      postId: currentPost.id,
      title: currentPost.title ?? ``,
      htmlSnapshot,
      passwordMode: passwordMode.value,
      ...(passwordMode.value === `custom` ? { password: customPassword.value.trim() } : {}),
      ...(isProUser.value ? { expiresMode: expiresMode.value } : {}),
    })
    shareUrl.value = result.url
    expiresAt.value = result.expiresAt
    isProtected.value = result.protected
    sharePassword.value = result.password ?? ``
    toast.success(result.updated ? t(`share.linkUpdated`) : t(`share.linkCreated`))
  }
  catch (err) {
    const message = formatShareError(err)
    errorMessage.value = message === `invalid_password`
      ? t(`share.invalidPassword`)
      : message === `forbidden`
        ? t(`share.forbidden`)
        : message
    toast.error(t(`share.createFailed`, { message: errorMessage.value }))
  }
  finally {
    isSubmitting.value = false
    submitStage.value = ``
  }
}

async function copyText(text: string, kind: `link` | `password`) {
  if (!text)
    return

  try {
    await navigator.clipboard.writeText(text)
    if (kind === `link`) {
      copiedLink.value = true
      window.setTimeout(() => {
        copiedLink.value = false
      }, 2000)
    }
    else {
      copiedPassword.value = true
      window.setTimeout(() => {
        copiedPassword.value = false
      }, 2000)
    }
    toast.success(t(`common.copied`))
  }
  catch {
    toast.error(t(`common.copyFailed`))
  }
}

async function copyShareBundle() {
  if (!shareUrl.value)
    return

  const lines = [t(`share.copyBundle.link`, { url: shareUrl.value })]
  if (sharePassword.value)
    lines.push(t(`share.copyBundle.password`, { password: sharePassword.value }))
  await copyText(lines.join(`\n`), `link`)
}

function openSharePage() {
  if (shareUrl.value)
    openShareUrl(shareUrl.value)
}

function openShareUrl(url: string) {
  window.open(url, `_blank`, `noopener,noreferrer`)
}

watch(() => props.open, (visible) => {
  if (visible)
    resetDialog()
})

watch(activeTab, (tab) => {
  if (tab === `manage` && props.open && isProUser.value)
    loadShareList()
})

watch(isProUser, (pro) => {
  if (!pro && activeTab.value === `manage`)
    activeTab.value = `create`
})
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('share.title')"
    :description="t('share.description')"
    :icon="Share2"
  >
    <CloudFeatureState
      v-if="!isShareConfigured()"
      :icon="Share2"
      :title="t('share.notConfiguredTitle')"
      :description="t('share.notConfiguredDescription')"
      compact
    />

    <CloudFeatureState
      v-else-if="!isLoggedIn"
      :icon="Share2"
      :title="t('share.loginTitle')"
      :action-label="t('common.login')"
      :action-icon="LogIn"
      @action="openAccountDialog"
    />

    <Tabs v-else v-model="activeTab" class="gap-0">
      <TabsList v-if="isProUser" class="mx-4 mt-4 grid w-auto grid-cols-2 sm:mx-6">
        <TabsTrigger value="create">
          {{ t('share.tabCreate') }}
        </TabsTrigger>
        <TabsTrigger value="manage">
          {{ t('share.tabManage') }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" class="mt-0">
        <template v-if="!shareUrl">
          <div class="space-y-4 px-4 py-4 sm:px-6">
            <div class="flex flex-wrap gap-2">
              <span
                v-if="!isProUser"
                class="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
              >
                <Clock class="size-3.5" />
                {{ t('share.expiresIn1Day') }}
              </span>
              <span
                v-if="!isProUser"
                class="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
              >
                {{ t('share.limitPerDay') }}
              </span>
            </div>

            <div v-if="isProUser" class="space-y-2">
              <Label class="text-sm">{{ t('share.expiresLabel') }}</Label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in expiresOptions"
                  :key="option.value"
                  type="button"
                  class="rounded-md border px-3 py-1.5 text-sm transition-colors"
                  :class="expiresMode === option.value
                    ? 'border-primary bg-primary/5 font-medium text-primary ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:bg-muted/50'"
                  @click="expiresMode = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="text-sm">{{ t('share.passwordLabel') }}</Label>
              <div class="grid gap-2">
                <button
                  v-for="option in passwordOptions"
                  :key="option.value"
                  type="button"
                  class="flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
                  :class="passwordMode === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'hover:bg-muted/50'"
                  @click="passwordMode = option.value"
                >
                  <component :is="option.icon" class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-medium">{{ option.label }}</span>
                    <span class="block text-xs text-muted-foreground">{{ option.description }}</span>
                  </span>
                  <span
                    class="mt-1 size-2 shrink-0 rounded-full"
                    :class="passwordMode === option.value ? 'bg-primary' : 'bg-muted-foreground/30'"
                  />
                </button>
              </div>
            </div>

            <div v-if="passwordMode === 'custom'" class="space-y-2 pl-1">
              <Label for="share-custom-password" class="text-xs text-muted-foreground">
                {{ t('share.customPasswordLabel') }}
              </Label>
              <Input
                id="share-custom-password"
                v-model="customPassword"
                type="password"
                autocomplete="new-password"
                :placeholder="t('share.customPasswordPlaceholder')"
              />
            </div>

            <Alert v-if="errorMessage" variant="destructive" class="py-2.5">
              <AlertDescription class="text-xs">
                {{ errorMessage }}
              </AlertDescription>
            </Alert>

            <Button
              class="h-10 w-full gap-2"
              :disabled="isSubmitting || !canSubmit"
              @click="createShare"
            >
              <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
              <Share2 v-else class="size-4" />
              {{ isSubmitting ? (submitStage || t('share.generating')) : t('share.generateLink') }}
            </Button>
          </div>
        </template>

        <template v-else>
          <div class="space-y-4 px-4 py-4 sm:px-6">
            <PanelCard variant="success">
              <p class="text-xs text-green-900 dark:text-green-100">
                {{ t('share.readyHint') }}
              </p>
            </PanelCard>

            <div class="space-y-2">
              <Label for="share-url" class="text-xs text-muted-foreground">{{ t('share.linkLabel') }}</Label>
              <div class="flex gap-2">
                <Input
                  id="share-url"
                  :model-value="shareUrl"
                  readonly
                  class="font-mono text-xs"
                />
                <Button variant="outline" size="icon" @click="copyText(shareUrl, 'link')">
                  <Check v-if="copiedLink" class="size-4 text-green-600" />
                  <Copy v-else class="size-4" />
                </Button>
                <Button variant="outline" size="icon" @click="openSharePage">
                  <ExternalLink class="size-4" />
                </Button>
              </div>
            </div>

            <div v-if="isProtected && sharePassword" class="space-y-2">
              <Label for="share-password" class="text-xs text-muted-foreground">{{ t('share.accessPasswordLabel') }}</Label>
              <div class="flex gap-2">
                <Input
                  id="share-password"
                  :model-value="sharePassword"
                  readonly
                  class="font-mono text-xs"
                />
                <Button variant="outline" size="icon" @click="copyText(sharePassword, 'password')">
                  <Check v-if="copiedPassword" class="size-4 text-green-600" />
                  <Copy v-else class="size-4" />
                </Button>
              </div>
              <Button variant="outline" class="w-full" @click="copyShareBundle">
                {{ t('share.copyLinkAndPassword') }}
              </Button>
            </div>

            <p v-else-if="isProtected && passwordMode === 'custom'" class="text-xs text-muted-foreground">
              {{ t('share.customPasswordHint') }}
            </p>

            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span v-if="expiresLabel">{{ expiresLabel }}</span>
              <span>{{ t('share.previewConsistent') }}</span>
            </div>

            <Button
              variant="outline"
              class="h-10 w-full"
              @click="resetForm"
            >
              {{ t('share.regenerate') }}
            </Button>
          </div>
        </template>
      </TabsContent>

      <TabsContent v-if="isProUser" value="manage" class="mt-0">
        <div class="space-y-3 px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-muted-foreground">
              {{ t('share.manageHint') }}
            </p>
            <Button
              variant="ghost"
              size="icon"
              class="shrink-0"
              :title="t('share.refreshList')"
              :disabled="isLoadingList"
              @click="loadShareList"
            >
              <Loader2 v-if="isLoadingList" class="size-4 animate-spin" />
              <RefreshCw v-else class="size-4" />
            </Button>
          </div>

          <div v-if="isLoadingList && shareList.length === 0" class="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 class="mr-2 size-4 animate-spin" />
            {{ t('common.loading') }}
          </div>

          <CloudFeatureState
            v-else-if="shareList.length === 0"
            :icon="Inbox"
            :title="t('share.emptyTitle')"
            :description="t('share.emptyDescription')"
            compact
          />

          <div v-else class="max-h-80 space-y-2 overflow-y-auto pr-1">
            <PanelCard
              v-for="share in shareList"
              :key="share.id"
              align="start"
              :class="share.expired ? 'opacity-70' : ''"
            >
              <p class="truncate text-sm font-medium">
                {{ formatShareTitle(share.title) }}
              </p>
              <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span class="inline-flex items-center gap-1">
                  <Eye class="size-3" />
                  {{ t('share.viewCount', { count: share.viewCount }) }}
                </span>
                <span>{{ formatShareExpiry(share.expiresAt, share.expired) }}</span>
                <span v-if="share.protected">{{ t('share.passwordProtected') }}</span>
              </div>
              <template #trailing>
                <div class="flex shrink-0 flex-wrap items-center justify-end gap-0.5">
                  <Button variant="ghost" size="icon" :title="t('share.copyLink')" @click="copyText(share.url, 'link')">
                    <Copy class="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" :title="t('share.openPreview')" @click="openShareUrl(share.url)">
                    <ExternalLink class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="text-destructive hover:text-destructive"
                    :title="t('share.revokeShare')"
                    :disabled="revokingId === share.id"
                    @click="confirmRevokeShare(share)"
                  >
                    <Loader2 v-if="revokingId === share.id" class="size-4 animate-spin" />
                    <Trash2 v-else class="size-4" />
                  </Button>
                </div>
              </template>
            </PanelCard>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </PanelDialog>
</template>
