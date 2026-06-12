<script setup lang="ts">
import type { Component } from 'vue'
import type { SharePasswordMode } from '@/services/share/types'
import { Check, Clock, Copy, ExternalLink, Globe, KeyRound, Loader2, LogIn, Share2, Sparkles } from '@lucide/vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SYNC_PRO_ENABLED } from '@/services/account/features'
import { captureShareSnapshot } from '@/services/share/capture-snapshot'
import { isShareConfigured, ShareApiError, ShareClient } from '@/services/share/client'
import { AFDIAN_PAGE_URL } from '@/services/sync/client'
import { useAuthStore } from '@/stores/auth'
import { usePostStore } from '@/stores/post'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits([`update:open`])

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

const { isLoggedIn, user } = storeToRefs(authStore)

const isProUser = computed(() => {
  if (!user.value || user.value.plan !== `pro`)
    return false
  return user.value.planExpiresAt != null && user.value.planExpiresAt > Date.now()
})

const dialogVisible = computed({
  get: () => props.open,
  set: value => emit(`update:open`, value),
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

function openAccountDialog() {
  dialogVisible.value = false
  uiStore.toggleShowAccountDialog(true)
}

function formatShareError(err: unknown): string {
  if (err instanceof ShareApiError && err.status === 429 && err.body?.error === `rate_limited`) {
    const limit = typeof err.body.limit === `number` ? err.body.limit : null
    const retryAfterSec = typeof err.body.retryAfterSec === `number` ? err.body.retryAfterSec : null
    const upgradeRequired = err.body.upgradeRequired === true
    const limitText = limit != null ? `每天最多分享 ${limit} 次` : `分享过于频繁`
    const retryHint = retryAfterSec != null
      ? retryAfterSec >= 3600
        ? `，请 ${Math.ceil(retryAfterSec / 3600)} 小时后再试`
        : `，请 ${Math.max(1, Math.ceil(retryAfterSec / 60))} 分钟后再试`
      : `，请明天再试`

    if (upgradeRequired) {
      const proHint = SYNC_PRO_ENABLED && AFDIAN_PAGE_URL
        ? `，或升级 Pro 解除限制`
        : `。Pro 会员上线后将不受此限制`
      return `免费版${limitText}${retryHint}${proHint}`
    }

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
      themeMode: uiStore.isDark ? `dark` : `light`,
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
    window.open(shareUrl.value, `_blank`, `noopener,noreferrer`)
}

watch(() => props.open, (visible) => {
  if (visible)
    resetForm()
})
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent class="gap-0 p-0 sm:max-w-md">
      <DialogHeader class="space-y-1.5 border-b px-6 py-4">
        <DialogTitle class="flex items-center gap-2">
          <Share2 class="size-5" />
          分享预览
        </DialogTitle>
        <DialogDescription>
          生成与编辑器预览一致的只读链接，便于转发给他人查看。
        </DialogDescription>
      </DialogHeader>

      <div v-if="!isShareConfigured()" class="px-6 py-8 text-center text-sm text-muted-foreground">
        分享服务未配置，请联系部署方启用。
      </div>

      <div v-else-if="!isLoggedIn" class="flex flex-col items-center gap-4 px-6 py-8">
        <p class="text-sm text-muted-foreground">
          请先登录账户后再分享
        </p>
        <Button class="gap-2" @click="openAccountDialog">
          <LogIn class="size-4" />
          前往登录
        </Button>
      </div>

      <template v-else-if="!shareUrl">
        <div class="space-y-4 px-6 py-4">
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground">
              <Clock class="size-3.5" />
              1 天后过期
            </span>
            <span
              v-if="!isProUser"
              class="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
            >
              免费版 2 次/天
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

        <div class="border-t px-6 py-4">
          <Button class="w-full gap-2" :disabled="isSubmitting || !canSubmit" @click="createShare">
            <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
            <Share2 v-else class="size-4" />
            {{ isSubmitting ? (submitStage || '正在生成…') : '生成分享链接' }}
          </Button>
        </div>
      </template>

      <template v-else>
        <div class="space-y-4 px-6 py-4">
          <Alert class="border-green-200 bg-green-50 py-2.5 text-green-900 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-100">
            <AlertDescription class="text-xs">
              分享链接已就绪，可直接复制或打开预览。
            </AlertDescription>
          </Alert>

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

        <div class="border-t px-6 py-4">
          <Button variant="outline" class="w-full" @click="resetForm">
            重新设置并生成
          </Button>
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>
