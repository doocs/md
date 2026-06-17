<script setup lang="ts">
import type { Component } from 'vue'
import type { ShareListItem, SharePasswordMode } from '@/services/share/types'
import { Check, Clock, Copy, ExternalLink, Eye, Globe, Inbox, KeyRound, Loader2, LogIn, RefreshCw, Share2, Sparkles, Trash2 } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import CloudPanelCard from '@/components/editor/editor-header/cloud-panel/CloudPanelCard.vue'
import CloudPanelDialog from '@/components/editor/editor-header/cloud-panel/CloudPanelDialog.vue'
import CloudPanelState from '@/components/editor/editor-header/cloud-panel/CloudPanelState.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { captureShareSnapshot } from '@/services/share/capture-snapshot'
import { isShareConfigured, isShareProUser, ShareApiError, ShareClient } from '@/services/share/client'
import { useAuthStore } from '@/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
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

const passwordOptions: PasswordOption[] = [
  {
    value: `none`,
    label: `公开链接`,
    description: `任何人持链接即可查看`,
    icon: Globe,
  },
  {
    value: `custom`,
    label: `自定义密码`,
    description: `自行设置 4–64 位访问密码`,
    icon: KeyRound,
  },
  {
    value: `auto`,
    label: `随机密码`,
    description: `系统生成 8 位密码，生成后展示`,
    icon: Sparkles,
  },
]

const authStore = useAuthStore()
const postStore = usePostStore()
const uiStore = useUIStore()
const confirmStore = useConfirmStore()

const { isLoggedIn, user } = storeToRefs(authStore)
const { shareDialogInitialTab } = storeToRefs(uiStore)

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
  if (!expiresAt.value)
    return ``
  return new Date(expiresAt.value).toLocaleString(`zh-CN`)
})

const canSubmit = computed(() => {
  if (passwordMode.value === `custom`)
    return customPassword.value.trim().length >= 4
  return true
})

function resetForm() {
  passwordMode.value = `none`
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
  return trimmed || `无标题`
}

function formatShareExpiry(expiresAt: number | null, expired: boolean): string {
  if (expired)
    return `已过期`
  if (!expiresAt)
    return `永久有效`
  return `${new Date(expiresAt).toLocaleString(`zh-CN`)} 过期`
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
      ? `我的分享为 Pro 专属功能`
      : err instanceof Error ? err.message : String(err)
    toast.error(`加载分享列表失败：${message}`)
  }
  finally {
    isLoadingList.value = false
  }
}

function confirmRevokeShare(share: ShareListItem) {
  confirmStore.confirm({
    title: `取消分享`,
    description: `确定取消「${formatShareTitle(share.title)}」的分享吗？链接将立即失效。`,
    confirmText: `取消分享`,
    destructive: true,
    onConfirm: async () => {
      revokingId.value = share.id
      try {
        await shareClient.revoke(share.id)
        shareList.value = shareList.value.filter(item => item.id !== share.id)
        if (shareUrl.value === share.url)
          resetForm()
        toast.success(`已取消分享`)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        toast.error(`取消分享失败：${message}`)
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
    const limitText = limit != null ? `每天最多分享 ${limit} 次` : `分享过于频繁`
    const retryHint = retryAfterSec != null
      ? retryAfterSec >= 3600
        ? `，请 ${Math.ceil(retryAfterSec / 3600)} 小时后再试`
        : `，请 ${Math.max(1, Math.ceil(retryAfterSec / 60))} 分钟后再试`
      : `，请明天再试`

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
  submitStage.value = `正在等待图表与公式渲染…`
  errorMessage.value = ``
  shareUrl.value = ``
  sharePassword.value = ``
  isProtected.value = false
  copiedLink.value = false
  copiedPassword.value = false

  try {
    const htmlSnapshot = await captureShareSnapshot()
    submitStage.value = `正在上传分享快照…`

    const currentPost = postStore.currentPost
    if (!currentPost?.id)
      throw new Error(`当前文章无效，请刷新后重试。`)

    const result = await shareClient.create({
      postId: currentPost.id,
      title: currentPost.title ?? ``,
      htmlSnapshot,
      passwordMode: passwordMode.value,
      ...(passwordMode.value === `custom` ? { password: customPassword.value.trim() } : {}),
    })
    shareUrl.value = result.url
    expiresAt.value = result.expiresAt
    isProtected.value = result.protected
    sharePassword.value = result.password ?? ``
    toast.success(result.updated ? `分享链接已更新` : `分享链接已生成`)
  }
  catch (err) {
    const message = formatShareError(err)
    errorMessage.value = message === `invalid_password`
      ? `密码长度需为 4–64 个字符。`
      : message === `forbidden`
        ? `无权更新此分享，请刷新后重试。`
        : message
    toast.error(`生成分享链接失败：${errorMessage.value}`)
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
    toast.success(`已复制`)
  }
  catch {
    toast.error(`复制失败，请手动复制`)
  }
}

async function copyShareBundle() {
  if (!shareUrl.value)
    return

  const lines = [`链接：${shareUrl.value}`]
  if (sharePassword.value)
    lines.push(`密码：${sharePassword.value}`)
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
  <CloudPanelDialog
    v-model:open="dialogOpen"
    title="分享预览"
    description="生成与编辑器预览一致的只读链接，便于转发给他人查看。"
    :icon="Share2"
  >
    <CloudPanelState
      v-if="!isShareConfigured()"
      :icon="Share2"
      title="分享服务未配置"
      description="当前部署未配置分享服务，请联系部署方启用后再试。"
      compact
    />

    <CloudPanelState
      v-else-if="!isLoggedIn"
      :icon="Share2"
      title="登录后分享预览"
      action-label="登录"
      :action-icon="LogIn"
      @action="openAccountDialog"
    />

    <Tabs v-else v-model="activeTab" class="gap-0">
      <TabsList v-if="isProUser" class="mx-4 mt-4 grid w-auto grid-cols-2 sm:mx-6">
        <TabsTrigger value="create">
          生成分享
        </TabsTrigger>
        <TabsTrigger value="manage">
          我的分享
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" class="mt-0">
        <template v-if="!shareUrl">
          <div class="space-y-4 px-4 py-4 sm:px-6">
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground">
                <Clock class="size-3.5" />
                1 天后过期
              </span>
              <span
                v-if="!isProUser"
                class="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
              >
                2 次/天
              </span>
            </div>

            <div class="space-y-2">
              <Label class="text-sm">访问密码</Label>
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
                输入访问密码
              </Label>
              <Input
                id="share-custom-password"
                v-model="customPassword"
                type="password"
                autocomplete="new-password"
                placeholder="4–64 个字符"
              />
            </div>

            <Alert v-if="errorMessage" variant="destructive" class="py-2.5">
              <AlertDescription class="text-xs">
                {{ errorMessage }}
              </AlertDescription>
            </Alert>
          </div>
        </template>

        <template v-else>
          <div class="space-y-4 px-4 py-4 sm:px-6">
            <CloudPanelCard variant="success">
              <p class="text-xs text-green-900 dark:text-green-100">
                分享链接已就绪，可直接复制或打开预览。
              </p>
            </CloudPanelCard>

            <div class="space-y-2">
              <Label for="share-url" class="text-xs text-muted-foreground">分享链接</Label>
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
              <Label for="share-password" class="text-xs text-muted-foreground">访问密码</Label>
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
                复制链接与密码
              </Button>
            </div>

            <p v-else-if="isProtected && passwordMode === 'custom'" class="text-xs text-muted-foreground">
              已启用密码保护，请妥善保管你设置的密码。
            </p>

            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span v-if="expiresLabel">过期：{{ expiresLabel }}</span>
              <span>预览与编辑器一致</span>
            </div>
          </div>
        </template>
      </TabsContent>

      <TabsContent v-if="isProUser" value="manage" class="mt-0">
        <div class="space-y-3 px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-muted-foreground">
              管理已发布的分享链接，取消后链接立即失效。
            </p>
            <Button
              variant="ghost"
              size="icon"
              class="shrink-0"
              title="刷新列表"
              :disabled="isLoadingList"
              @click="loadShareList"
            >
              <Loader2 v-if="isLoadingList" class="size-4 animate-spin" />
              <RefreshCw v-else class="size-4" />
            </Button>
          </div>

          <div v-if="isLoadingList && shareList.length === 0" class="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 class="mr-2 size-4 animate-spin" />
            加载中…
          </div>

          <CloudPanelState
            v-else-if="shareList.length === 0"
            :icon="Inbox"
            title="暂无分享记录"
            description="生成分享后，可在此统一管理链接。"
            compact
          />

          <div v-else class="max-h-80 space-y-2 overflow-y-auto pr-1">
            <CloudPanelCard
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
                  {{ share.viewCount }} 次阅读
                </span>
                <span>{{ formatShareExpiry(share.expiresAt, share.expired) }}</span>
                <span v-if="share.protected">已设密码</span>
              </div>
              <template #trailing>
                <div class="flex shrink-0 flex-wrap items-center justify-end gap-0.5">
                  <Button variant="ghost" size="icon" title="复制链接" @click="copyText(share.url, 'link')">
                    <Copy class="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="打开预览" @click="openShareUrl(share.url)">
                    <ExternalLink class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="text-destructive hover:text-destructive"
                    title="取消分享"
                    :disabled="revokingId === share.id"
                    @click="confirmRevokeShare(share)"
                  >
                    <Loader2 v-if="revokingId === share.id" class="size-4 animate-spin" />
                    <Trash2 v-else class="size-4" />
                  </Button>
                </div>
              </template>
            </CloudPanelCard>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <template v-if="isShareConfigured() && isLoggedIn && activeTab === 'create'" #footer>
      <div class="border-t px-4 py-4 sm:px-6">
        <Button
          v-if="!shareUrl"
          class="h-10 w-full gap-2"
          :disabled="isSubmitting || !canSubmit"
          @click="createShare"
        >
          <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
          <Share2 v-else class="size-4" />
          {{ isSubmitting ? (submitStage || '正在生成…') : '生成分享链接' }}
        </Button>
        <Button
          v-else
          variant="outline"
          class="h-10 w-full"
          @click="resetForm"
        >
          重新设置并生成
        </Button>
      </div>
    </template>
  </CloudPanelDialog>
</template>
