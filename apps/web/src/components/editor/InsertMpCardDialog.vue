<script setup lang="ts">
import type { MpAccount } from '@/stores/mpAccounts'
import { FileDown, Pencil, Plus, Rss, Search, Trash2 } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()
const uiStore = useUIStore()
const { toggleShowInsertMpCardDialog } = uiStore
const mpAccountsStore = useMpAccountsStore()

// 搜索关键词
const searchKeyword = ref('')

// 搜索结果
const filteredAccounts = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw)
    return mpAccountsStore.accounts as MpAccount[]
  return (mpAccountsStore.accounts as MpAccount[]).filter(a =>
    a.name.toLowerCase().includes(kw)
    || a.mpId.toLowerCase().includes(kw)
    || a.desc.toLowerCase().includes(kw),
  )
})

/** 配置弹窗状态 */
const isShowConfigDialog = ref(false)
const editingAccountId = ref<string | null>(null)

function openConfigForNew() {
  editingAccountId.value = null
  isShowConfigDialog.value = true
}

function openConfigForEdit(id: string) {
  editingAccountId.value = id
  isShowConfigDialog.value = true
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  1: '公众号',
  2: '服务号',
}

const VERIFY_LABELS: Record<string, string> = {
  0: '无',
  1: '个人认证',
  2: '企业认证',
}

/** 组装 HTML 片段 */
function buildMpHtml(account: MpAccount) {
  const logo = account.logo || 'https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png'
  const attrs = [
    `data-pluginname="mpprofile"`,
    `data-id="${account.mpId}"`,
    `data-nickname="${account.name}"`,
    `data-headimg="${logo}"`,
    account.desc && `data-signature="${account.desc}"`,
    `data-service_type="${account.serviceType || '1'}"`,
    `data-verify_status="${account.verify || '0'}"`,
  ].filter(Boolean).join(' ')

  return `<section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf="">
  <mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe" ${attrs}></mp-common-profile>
  <br class="ProseMirror-trailingBreak">
</section>`
}

function insertAccount(account: MpAccount) {
  const html = buildMpHtml(account)
  const editor = toRaw(editorStore.editor!)
  const selection = editor.state.selection.main
  editor.dispatch({
    changes: { from: selection.from, to: selection.to, insert: `\n${html}\n` },
  })
  toast.success('公众号名片插入成功')
  toggleShowInsertMpCardDialog(false)
}

// 删除确认对话框
const deleteConfirmDialog = ref(false)
const accountToDelete = ref<MpAccount | null>(null)

function openDeleteConfirm(account: MpAccount) {
  accountToDelete.value = account
  deleteConfirmDialog.value = true
}

function confirmDelete() {
  if (accountToDelete.value) {
    mpAccountsStore.deleteAccount(accountToDelete.value.id)
    toast.success('已删除')
    accountToDelete.value = null
  }
  deleteConfirmDialog.value = false
}

// 对话框关闭回调
function onUpdate(val: boolean) {
  if (!val) {
    toggleShowInsertMpCardDialog(false)
    searchKeyword.value = ''
  }
}
</script>

<template>
  <Dialog :open="uiStore.isShowInsertMpCardDialog" @update:open="onUpdate">
    <DialogContent class="max-w-3xl max-h-[85vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b">
        <DialogTitle class="flex items-center gap-2">
          <Rss class="size-5" />
          插入公众号名片
        </DialogTitle>
        <DialogDescription>
          选择已配置的公众号，将名片插入到编辑器
        </DialogDescription>
      </DialogHeader>

      <!-- 主体内容区域 -->
      <div class="flex-1 overflow-auto px-6 py-4">
        <!-- 搜索栏和新增按钮 -->
        <div class="flex gap-2 mb-4">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              v-model="searchKeyword"
              placeholder="搜索公众号名称、ID、描述..."
              class="pl-9"
            />
          </div>
          <Button @click="openConfigForNew">
            <Plus class="mr-2 size-4" />
            新增公众号
          </Button>
        </div>

        <!-- 账号卡片列表 -->
        <div class="space-y-3">
          <!-- 空状态 -->
          <div v-if="filteredAccounts.length === 0" class="text-center py-12">
            <Rss class="mx-auto size-12 text-muted-foreground mb-4" />
            <p class="text-muted-foreground mb-2">
              {{ searchKeyword ? '未找到匹配的公众号' : '暂无已配置的公众号' }}
            </p>
            <p v-if="!searchKeyword" class="text-sm text-muted-foreground mb-4">
              点击「新增公众号」按钮添加您的公众号
            </p>
          </div>

          <div
            v-for="account in filteredAccounts"
            :key="account.id"
            class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- 公众号信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-medium truncate">
                    {{ account.name || '未命名公众号' }}
                  </h4>
                  <span class="text-xs rounded px-1.5 py-0.5 bg-muted text-muted-foreground flex-shrink-0">
                    {{ SERVICE_TYPE_LABELS[account.serviceType] }}
                  </span>
                  <span
                    v-if="account.verify !== '0'"
                    class="text-xs rounded px-1.5 py-0.5 bg-muted text-muted-foreground flex-shrink-0"
                  >
                    {{ VERIFY_LABELS[account.verify] }}
                  </span>
                </div>
                <p v-if="account.desc" class="text-sm text-muted-foreground line-clamp-2">
                  {{ account.desc }}
                </p>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  class="size-8"
                  title="插入名片"
                  @click="insertAccount(account)"
                >
                  <FileDown class="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="size-8"
                  title="编辑"
                  @click="openConfigForEdit(account.id)"
                >
                  <Pencil class="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="size-8 text-destructive hover:text-destructive"
                  title="删除"
                  @click="openDeleteConfirm(account)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 配置弹窗 -->
  <MpAccountConfigDialog
    v-model:open="isShowConfigDialog"
    :account-id="editingAccountId"
  />

  <!-- 删除确认对话框 -->
  <AlertDialog v-model:open="deleteConfirmDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认删除</AlertDialogTitle>
        <AlertDialogDescription>
          确定要删除公众号「{{ accountToDelete?.name }}」吗？此操作不可恢复。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="confirmDelete">
          确定
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
