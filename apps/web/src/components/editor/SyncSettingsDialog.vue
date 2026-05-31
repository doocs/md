<script setup lang="ts">
import { CheckCircle2, CloudDownload, CloudUpload, RefreshCw, XCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { SYNC_PROVIDER_OPTIONS } from '@/services/sync'
import { useSyncStore } from '@/stores/sync'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const syncStore = useSyncStore()

const { status, lastSyncTime, statusMessage } = storeToRefs(syncStore)

const isOpen = computed({
  get: () => uiStore.isShowSyncSettingsDialog,
  set: v => (uiStore.isShowSyncSettingsDialog = v),
})

// ──────────────────────────────────────────────────
// Actions with toast feedback
// ──────────────────────────────────────────────────

async function handleTest() {
  try {
    await syncStore.testConnection()
    toast.success(syncStore.statusMessage)
  }
  catch {
    toast.error(syncStore.statusMessage)
  }
}

async function handlePush() {
  try {
    await syncStore.pushAll()
    toast.success(syncStore.statusMessage)
  }
  catch {
    toast.error(syncStore.statusMessage)
  }
}

async function handlePull() {
  try {
    const { settingsApplied } = await syncStore.pullAll()
    toast.success(syncStore.statusMessage)
    if (settingsApplied) {
      toast.info(`设置已应用，部分更改需刷新页面后生效`, { duration: 5000 })
    }
  }
  catch {
    toast.error(syncStore.statusMessage)
  }
}

const isBusy = computed(() => status.value === `syncing` || status.value === `testing`)

const formattedLastSync = computed(() => {
  if (!lastSyncTime.value)
    return `从未`
  return new Date(lastSyncTime.value).toLocaleString(`zh-cn`)
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="md:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" @pointer-down-outside="ev => ev.preventDefault()">
      <DialogHeader>
        <DialogTitle>同步存储</DialogTitle>
        <DialogDescription>
          将文档和配置同步到远端存储（WebDAV / S3 / GitHub），实现多设备共享。
        </DialogDescription>
      </DialogHeader>

      <Tabs default-value="provider" class="flex flex-col flex-1 overflow-hidden">
        <TabsList class="shrink-0">
          <TabsTrigger value="provider">
            提供商配置
          </TabsTrigger>
          <TabsTrigger value="operations">
            同步操作
          </TabsTrigger>
        </TabsList>

        <!-- ── Provider Config Tab ─────────────────────────── -->
        <TabsContent value="provider" class="flex-1 overflow-y-auto space-y-4 px-1 py-2">
          <!-- Provider selector -->
          <div class="space-y-1.5">
            <Label>同步提供商</Label>
            <Select v-model="syncStore.syncConfig.type">
              <SelectTrigger>
                <SelectValue placeholder="选择提供商…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in SYNC_PROVIDER_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Wrapper with key forces Vue to completely rebuild this subtree when active provider changes, avoiding unmount/patch bugs -->
          <div :key="syncStore.syncConfig.type" class="space-y-4">
            <!-- ── WebDAV ──────────────────────────────────────── -->
            <div v-if="syncStore.syncConfig.type === 'webdav'" class="space-y-3">
              <div class="space-y-1.5">
                <Label>服务器地址</Label>
                <Input
                  v-model="syncStore.syncConfig.webdav.url"
                  placeholder="https://dav.example.com"
                />
              </div>
              <div class="space-y-1.5">
                <Label>用户名</Label>
                <Input v-model="syncStore.syncConfig.webdav.username" placeholder="user" autocomplete="off" />
              </div>
              <div class="space-y-1.5">
                <Label>密码</Label>
                <Input v-model="syncStore.syncConfig.webdav.password" type="password" placeholder="••••••••" autocomplete="new-password" />
              </div>
              <div class="space-y-1.5">
                <Label>同步目录</Label>
                <Input v-model="syncStore.syncConfig.webdav.basePath" placeholder="/md-sync" />
                <p class="text-xs text-muted-foreground">
                  服务器上用于存放同步数据的路径（不存在时会自动创建）。
                </p>
              </div>
            </div>

            <!-- ── S3-compatible ──────────────────────────────── -->
            <div v-if="syncStore.syncConfig.type === 's3'" class="space-y-3">
              <div class="space-y-1.5">
                <Label>Endpoint <span class="text-muted-foreground text-xs">（可选，AWS S3 留空）</span></Label>
                <Input
                  v-model="syncStore.syncConfig.s3.endpoint"
                  placeholder="https://s3.us-east-1.amazonaws.com"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <Label>Region</Label>
                  <Input v-model="syncStore.syncConfig.s3.region" placeholder="us-east-1" />
                </div>
                <div class="space-y-1.5">
                  <Label>Bucket</Label>
                  <Input v-model="syncStore.syncConfig.s3.bucket" placeholder="my-bucket" />
                </div>
              </div>
              <div class="space-y-1.5">
                <Label>Access Key ID</Label>
                <Input v-model="syncStore.syncConfig.s3.accessKeyId" autocomplete="off" />
              </div>
              <div class="space-y-1.5">
                <Label>Secret Access Key</Label>
                <Input v-model="syncStore.syncConfig.s3.accessKeySecret" type="password" autocomplete="new-password" />
              </div>
              <div class="space-y-1.5">
                <Label>同步路径前缀 <span class="text-muted-foreground text-xs">（Bucket 内目录，如 md-sync）</span></Label>
                <Input v-model="syncStore.syncConfig.s3.path" placeholder="md-sync" />
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm">强制 Path-Style（MinIO / Ceph 等必选）</span>
                <Switch
                  :checked="syncStore.syncConfig.s3.pathStyle"
                  @update:checked="(v: boolean) => syncStore.syncConfig.s3.pathStyle = v"
                />
              </div>
            </div>

            <!-- ── GitHub ─────────────────────────────────────── -->
            <div v-if="syncStore.syncConfig.type === 'github'" class="space-y-3">
              <div class="space-y-1.5">
                <Label>仓库 <span class="text-muted-foreground text-xs">（owner/repo）</span></Label>
                <Input v-model="syncStore.syncConfig.github.repo" placeholder="alice/my-notes" />
              </div>
              <div class="space-y-1.5">
                <Label>分支</Label>
                <Input v-model="syncStore.syncConfig.github.branch" placeholder="main" />
              </div>
              <div class="space-y-1.5">
                <Label>Personal Access Token</Label>
                <Input v-model="syncStore.syncConfig.github.accessToken" type="password" autocomplete="new-password" />
                <p class="text-xs text-muted-foreground">
                  需要 <code>repo</code>（或公开仓库的 <code>public_repo</code>）权限。
                </p>
              </div>
              <div class="space-y-1.5">
                <Label>仓库内路径 <span class="text-muted-foreground text-xs">（如 md-sync）</span></Label>
                <Input v-model="syncStore.syncConfig.github.path" placeholder="md-sync" />
              </div>
            </div>

            <p v-if="syncStore.syncConfig.type === 'none' || !syncStore.syncConfig.type" class="text-sm text-muted-foreground py-4 text-center">
              选择一个提供商后进行配置。
            </p>
          </div>
        </TabsContent>

        <!-- ── Operations Tab ─────────────────────────────── -->
        <TabsContent value="operations" class="flex-1 overflow-y-auto space-y-5 px-1 py-2">
          <!-- Status -->
          <div class="rounded-md border p-3 space-y-1.5 text-sm">
            <div class="flex items-center gap-2">
              <component
                :is="status === 'error' ? XCircle : CheckCircle2"
                class="size-4 shrink-0"
                :class="status === 'error' ? 'text-destructive' : 'text-emerald-500'"
              />
              <span>{{ statusMessage || '就绪' }}</span>
              <RefreshCw v-if="isBusy" class="size-3 animate-spin ml-auto shrink-0" />
            </div>
            <p class="text-xs text-muted-foreground pl-6">
              上次同步：{{ formattedLastSync }}
            </p>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <Button
              class="w-full"
              variant="outline"
              :disabled="isBusy || !syncStore.syncConfig.type || syncStore.syncConfig.type === 'none'"
              @click="handleTest"
            >
              <RefreshCw class="mr-2 size-4" :class="{ 'animate-spin': status === 'testing' }" />
              测试连接
            </Button>

            <div class="grid grid-cols-2 gap-3">
              <Button
                :disabled="isBusy || !syncStore.syncConfig.type || syncStore.syncConfig.type === 'none'"
                @click="handlePush"
              >
                <CloudUpload class="mr-2 size-4" />
                上传（Push）
              </Button>
              <Button
                variant="outline"
                :disabled="isBusy || !syncStore.syncConfig.type || syncStore.syncConfig.type === 'none'"
                @click="handlePull"
              >
                <CloudDownload class="mr-2 size-4" />
                下载（Pull）
              </Button>
            </div>
          </div>

          <!-- Explanation -->
          <div class="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-2">
            <p><strong>上传</strong> — 将当前所有文档和应用配置（图床、主题、CSS 等）推送到远端。</p>
            <p><strong>下载</strong> — 从远端拉取文档和配置，已存在的文档按 ID 合并，新文档追加导入，本地独有文档不受影响。</p>
            <p class="text-amber-600 dark:text-amber-400">
              ⚠ 下载操作会覆盖同名文档内容，建议先上传备份。
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
