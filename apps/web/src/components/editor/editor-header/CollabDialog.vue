<script setup lang="ts">
import type { CollabListItem } from '@md/shared/types'
import { Check, Copy, Loader2, LogIn, LogOut, RefreshCw, Trash2, UserPlus, Users } from '@lucide/vue'
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
import { ApiError } from '@/services/account/client'
import { isCollabConfigured, isCollabUiEnabled } from '@/services/collab/client'
import { useAuthStore } from '@/stores/auth'
import { useCollabStore } from '@/stores/collab'
import { useConfirmStore } from '@/stores/confirm'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const authStore = useAuthStore()
const collabStore = useCollabStore()
const postStore = usePostStore()
const editorStore = useEditorStore()
const uiStore = useUIStore()
const confirmStore = useConfirmStore()

const { isLoggedIn } = storeToRefs(authStore)
const { currentPost } = storeToRefs(postStore)
const { list, members, isOwner, isCollabMode, activeId, status } = storeToRefs(collabStore)

const activeTab = ref<`create` | `open` | `manage`>(`create`)
const isLoadingList = ref(false)
const isSubmitting = ref(false)
const inviteRole = ref<`editor` | `viewer`>(`editor`)
const inviteUrl = ref(``)
const copiedInvite = ref(false)
const errorMessage = ref(``)

const dialogOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit(`update:open`, value),
})

const roleLabel: Record<string, string> = {
  owner: `所有者`,
  editor: `编辑者`,
  viewer: `查看者`,
}

watch(() => props.open, async (open) => {
  if (!open)
    return
  activeTab.value = isCollabMode.value ? `manage` : `create`
  inviteUrl.value = ``
  errorMessage.value = ``
  if (isLoggedIn.value) {
    isLoadingList.value = true
    try {
      await collabStore.loadList()
    }
    finally {
      isLoadingList.value = false
    }
  }
})

function openAccountDialog() {
  dialogOpen.value = false
  uiStore.toggleShowAccountDialog(true)
}

function formatTitle(title: string): string {
  return title.trim() || `无标题`
}

async function handleCreate() {
  if (!currentPost.value)
    return
  isSubmitting.value = true
  errorMessage.value = ``
  try {
    editorStore.flushContentToPostStore()
    const content = editorStore.getContent()
    await collabStore.createFromCurrentPost(
      currentPost.value.id,
      currentPost.value.title,
      content,
    )
    dialogOpen.value = false
    toast.success(`已创建协作文档`)
  }
  catch (e) {
    errorMessage.value = e instanceof ApiError ? e.message : String(e)
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleOpen(item: CollabListItem) {
  isSubmitting.value = true
  errorMessage.value = ``
  try {
    await collabStore.openDocument(item.id)
    dialogOpen.value = false
    toast.success(`已进入协作：${formatTitle(item.title)}`)
  }
  catch (e) {
    errorMessage.value = e instanceof ApiError ? e.message : String(e)
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleCreateInvite() {
  if (!activeId.value)
    return
  isSubmitting.value = true
  errorMessage.value = ``
  try {
    await collabStore.refreshMembers()
    inviteUrl.value = await collabStore.createInvite(inviteRole.value)
    copiedInvite.value = false
  }
  catch (e) {
    errorMessage.value = e instanceof ApiError ? e.message : String(e)
  }
  finally {
    isSubmitting.value = false
  }
}

async function copyInviteUrl() {
  if (!inviteUrl.value)
    return
  await navigator.clipboard.writeText(inviteUrl.value)
  copiedInvite.value = true
  toast.success(`邀请链接已复制`)
}

function confirmExit() {
  confirmStore.confirm({
    title: `退出协作`,
    description: `退出后将恢复你的个人样式设置。未同步的修改会先尝试保存。`,
    confirmText: `退出协作`,
    onConfirm: async () => {
      await collabStore.exitCollab()
      dialogOpen.value = false
      toast.success(`已退出协作`)
    },
  })
}

function confirmDelete() {
  confirmStore.confirm({
    title: `删除协作文档`,
    description: `删除后所有成员将无法继续访问，此操作不可恢复。`,
    confirmText: `删除`,
    destructive: true,
    onConfirm: async () => {
      await collabStore.deleteCollab()
      dialogOpen.value = false
      toast.success(`已删除协作文档`)
    },
  })
}

function confirmRemoveMember(userId: string, login: string) {
  confirmStore.confirm({
    title: `移除成员`,
    description: `确定将 ${login} 移出协作吗？`,
    confirmText: `移除`,
    destructive: true,
    onConfirm: async () => {
      await collabStore.removeMember(userId)
      toast.success(`已移除成员`)
    },
  })
}
</script>

<template>
  <CloudPanelDialog
    v-model:open="dialogOpen"
    title="云端协作"
    description="邀请他人共同编辑正文与样式，需登录后使用。"
    :icon="Users"
    size="2xl"
  >
    <div class="space-y-4 p-4 sm:p-6">
      <CloudPanelState
        v-if="!isCollabUiEnabled() || !isCollabConfigured()"
        :icon="Users"
        title="协作未启用"
        description="当前部署未配置协作服务。"
        compact
      />

      <CloudPanelState
        v-else-if="!isLoggedIn"
        :icon="Users"
        title="登录后使用协作"
        description="使用 GitHub 账户登录，即可创建或加入协作文档。"
        compact
      >
        <Button class="mt-4" @click="openAccountDialog">
          <LogIn class="mr-2 size-4" />
          去登录
        </Button>
      </CloudPanelState>

      <template v-else>
        <Alert v-if="errorMessage" variant="destructive">
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="create">
              发起协作
            </TabsTrigger>
            <TabsTrigger value="open">
              我的协作
            </TabsTrigger>
            <TabsTrigger value="manage" :disabled="!isCollabMode">
              管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" class="mt-4 space-y-4">
            <CloudPanelCard title="从当前文章创建" description="将当前正文与样式快照发布为协作文档，成员可共同编辑。">
              <p class="text-sm text-muted-foreground">
                当前文章：{{ formatTitle(currentPost?.title ?? '') }}
              </p>
              <Button class="mt-4 w-full" :disabled="isSubmitting" @click="handleCreate">
                <Loader2 v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
                <UserPlus v-else class="mr-2 size-4" />
                创建协作文档
              </Button>
            </CloudPanelCard>
          </TabsContent>

          <TabsContent value="open" class="mt-4 space-y-3">
            <div v-if="isLoadingList" class="flex justify-center py-8">
              <Loader2 class="size-6 animate-spin text-muted-foreground" />
            </div>
            <CloudPanelState
              v-else-if="!list.length"
              :icon="Users"
              title="暂无协作文档"
              description="发起协作或接受邀请后，文档会显示在这里。"
              compact
            />
            <div v-else class="space-y-2">
              <button
                v-for="item in list"
                :key="item.id"
                type="button"
                class="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                @click="handleOpen(item)"
              >
                <div>
                  <div class="font-medium">
                    {{ formatTitle(item.title) }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ roleLabel[item.role] ?? item.role }} · 所有者 {{ item.ownerLogin }}
                  </div>
                </div>
                <Users class="size-4 shrink-0 text-muted-foreground" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="manage" class="mt-4 space-y-4">
            <CloudPanelCard v-if="isOwner" title="邀请协作者" description="生成邀请链接，对方登录后即可加入。">
              <div class="space-y-3">
                <div class="flex gap-2">
                  <Button
                    size="sm"
                    :variant="inviteRole === 'editor' ? 'default' : 'outline'"
                    @click="inviteRole = 'editor'"
                  >
                    编辑者
                  </Button>
                  <Button
                    size="sm"
                    :variant="inviteRole === 'viewer' ? 'default' : 'outline'"
                    @click="inviteRole = 'viewer'"
                  >
                    查看者
                  </Button>
                </div>
                <Button class="w-full" :disabled="isSubmitting" @click="handleCreateInvite">
                  <Loader2 v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
                  <UserPlus v-else class="mr-2 size-4" />
                  生成邀请链接
                </Button>
                <div v-if="inviteUrl" class="space-y-2">
                  <Label>邀请链接</Label>
                  <div class="flex gap-2">
                    <Input :model-value="inviteUrl" readonly class="text-xs" />
                    <Button size="icon" variant="outline" @click="copyInviteUrl">
                      <Check v-if="copiedInvite" class="size-4" />
                      <Copy v-else class="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CloudPanelCard>

            <CloudPanelCard title="成员" description="当前协作文档的成员与权限。">
              <ul class="space-y-2">
                <li
                  v-for="member in members"
                  :key="member.userId"
                  class="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <span class="font-medium">{{ member.login }}</span>
                    <span class="ml-2 text-muted-foreground">{{ roleLabel[member.role] }}</span>
                  </div>
                  <Button
                    v-if="isOwner && member.role !== 'owner'"
                    size="sm"
                    variant="ghost"
                    class="text-destructive"
                    @click="confirmRemoveMember(member.userId, member.login)"
                  >
                    移除
                  </Button>
                </li>
              </ul>
            </CloudPanelCard>

            <div class="flex flex-wrap gap-2">
              <Button variant="outline" :disabled="status === 'syncing'" @click="collabStore.syncNow()">
                <Loader2 v-if="status === 'syncing'" class="mr-2 size-4 animate-spin" />
                <RefreshCw v-else class="mr-2 size-4" />
                立即同步
              </Button>
              <Button variant="outline" @click="confirmExit">
                <LogOut class="mr-2 size-4" />
                退出协作
              </Button>
              <Button v-if="isOwner" variant="destructive" @click="confirmDelete">
                <Trash2 class="mr-2 size-4" />
                删除文档
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </template>
    </div>
  </CloudPanelDialog>
</template>
