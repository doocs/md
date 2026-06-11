<script setup lang="ts">
import { Cloud, Crown, ExternalLink, Loader2, LogIn, LogOut, RefreshCw } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { AFDIAN_PRO_PLANS, buildAfdianOrderUrl } from '@/services/sync/afdian'
import { AFDIAN_PAGE_URL, SyncApiError } from '@/services/sync/client'
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
const { status, lastError, lastSyncAt, autoSyncEnabled, needsRefresh, isSyncing, isPro, syncDebounceMs } = storeToRefs(syncStore)

const orderNo = ref(``)
const activating = ref(false)

const lastSyncText = computed(() => {
  if (!lastSyncAt.value)
    return `从未同步`
  return new Date(lastSyncAt.value).toLocaleString(`zh-cn`)
})

const planExpiresText = computed(() => {
  const expires = user.value?.planExpiresAt
  if (!expires || !isPro.value)
    return ``
  return new Date(expires).toLocaleString(`zh-cn`)
})

const autoSyncHint = computed(() => {
  if (isPro.value)
    return `Pro：编辑后约 ${Math.round(syncDebounceMs.value / 1000)} 秒自动同步`
  return `免费：每 ${Math.round(syncDebounceMs.value / 60000)} 分钟自动同步（升级 Pro 可实时同步）`
})

const proPlanLinks = computed(() => {
  const login = user.value?.login
  if (!login)
    return []
  return AFDIAN_PRO_PLANS.map(plan => ({
    ...plan,
    url: buildAfdianOrderUrl(plan.planId, login),
  }))
})

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

async function handleSync() {
  await syncStore.sync()
  if (status.value === `error`)
    toast.error(`同步失败：${lastError.value}`)
  else
    toast.success(`同步完成`)
}

async function handleActivate() {
  const no = orderNo.value.trim()
  if (!no) {
    toast.error(`请输入爱发电订单号`)
    return
  }

  activating.value = true
  try {
    await authStore.client.activatePro(no)
    await authStore.fetchMe()
    orderNo.value = ``
    toast.success(`Pro 已开通`)
  }
  catch (e) {
    const msg = e instanceof SyncApiError ? e.message : String(e)
    toast.error(`激活失败：${msg}`)
  }
  finally {
    activating.value = false
  }
}

function handleReload() {
  window.location.reload()
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Cloud class="size-5" />
          云同步
        </DialogTitle>
        <DialogDescription>
          多设备同步文章与设置，不含密钥。
        </DialogDescription>
      </DialogHeader>

      <div v-if="!isConfigured" class="text-muted-foreground py-6 text-center text-sm">
        云同步服务未配置（缺少 <code>VITE_SYNC_API_URL</code>），请联系部署方启用。
      </div>

      <div v-else-if="!isLoggedIn" class="flex flex-col items-center gap-4 py-6">
        <p class="text-muted-foreground text-sm">
          登录后即可开启云同步
        </p>
        <Button class="gap-2" @click="handleLogin">
          <LogIn class="size-4" />
          使用 GitHub 登录
        </Button>
      </div>

      <div v-else class="space-y-4 py-2">
        <div class="flex items-center gap-3">
          <img
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user?.login"
            class="size-10 rounded-full"
          >
          <div class="flex-1">
            <div class="flex items-center gap-2 text-sm font-medium">
              <span>{{ user?.name || user?.login }}</span>
              <span
                v-if="isPro"
                class="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
              >
                <Crown class="size-3" />
                Pro
              </span>
              <span v-else class="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                免费
              </span>
            </div>
            <div class="text-muted-foreground text-xs">
              上次同步：{{ lastSyncText }}
            </div>
            <div v-if="planExpiresText" class="text-muted-foreground text-xs">
              Pro 到期：{{ planExpiresText }}
            </div>
          </div>
          <Button variant="ghost" size="icon" title="退出登录" @click="handleLogout">
            <LogOut class="size-4" />
          </Button>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="auto-sync" class="text-sm">自动同步</Label>
            <Switch id="auto-sync" v-model="autoSyncEnabled" />
          </div>
          <p class="text-muted-foreground text-xs">
            {{ autoSyncHint }}
          </p>
        </div>

        <div v-if="!isPro" class="bg-muted space-y-3 rounded-md p-3 text-sm">
          <div class="font-medium">
            升级 Pro · 实时云同步
          </div>
          <ul class="text-muted-foreground list-inside list-disc space-y-1 text-xs">
            <li>编辑后约 3 秒自动同步</li>
            <li>更高同步频率上限</li>
            <li>付款备注请填写 GitHub 用户名：<code>{{ user?.login }}</code></li>
          </ul>
          <div v-if="proPlanLinks.length" class="grid grid-cols-3 gap-2">
            <Button
              v-for="plan in proPlanLinks"
              :key="plan.planId"
              as="a"
              :href="plan.url"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              class="gap-1"
            >
              <ExternalLink class="size-3.5" />
              {{ plan.label }}
            </Button>
          </div>
          <Button
            v-if="AFDIAN_PAGE_URL"
            as="a"
            :href="AFDIAN_PAGE_URL"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
            class="w-full gap-2"
          >
            查看爱发电主页
          </Button>

          <div class="space-y-2 border-t pt-3">
            <Label for="order-no" class="text-xs">已付款？输入爱发电订单号激活</Label>
            <div class="flex gap-2">
              <Input
                id="order-no"
                v-model="orderNo"
                placeholder="例如 202106232138371083454010626"
                class="text-xs"
              />
              <Button size="sm" :disabled="activating" @click="handleActivate">
                <Loader2 v-if="activating" class="size-4 animate-spin" />
                <span v-else>激活</span>
              </Button>
            </div>
          </div>
        </div>

        <div v-if="needsRefresh" class="bg-muted text-muted-foreground flex items-center justify-between gap-2 rounded-md p-2 text-xs">
          <span>部分设置已从云端更新，刷新后生效</span>
          <Button size="sm" variant="outline" @click="handleReload">
            刷新
          </Button>
        </div>

        <Button class="w-full gap-2" :disabled="isSyncing" @click="handleSync">
          <Loader2 v-if="isSyncing" class="size-4 animate-spin" />
          <RefreshCw v-else class="size-4" />
          {{ isSyncing ? '同步中…' : '立即同步' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
