<script setup lang="ts">
import { useStore } from '@/stores'
import { addPrefix } from '@/utils'
import { useStorage } from '@vueuse/core'
import {
  ArrowUpNarrowWide,
  Edit3,
  Ellipsis,
  FolderPlus,
  History,
  Plus,
  Trash,
} from 'lucide-vue-next'
import { computed, ref, toRaw, watch } from 'vue'

const store = useStore()

/* ----------------------------------------------------------------------
 * Folder helpers
 * -------------------------------------------------------------------- */
const folders = computed(() => [...store.folders].sort((a, b) => a.name.localeCompare(b.name)))

/* sortMode is global but UI is rendered inside each folder row so UX feels scoped. */
const sortMode = useStorage(addPrefix(`sort_mode`), `create-old-new`) as Ref<string>

const sortedPosts = computed(() => {
  return [...store.posts]
    .filter(p => p.folderId === store.currentFolderId)
    .sort((a, b) => {
      switch (sortMode.value) {
        case `A-Z`: return a.title.localeCompare(b.title)
        case `Z-A`: return b.title.localeCompare(a.title)
        case `update-new-old`: return +new Date(b.updateDatetime) - +new Date(a.updateDatetime)
        case `update-old-new`: return +new Date(a.updateDatetime) - +new Date(b.updateDatetime)
        case `create-new-old`: return +new Date(b.createDatetime) - +new Date(a.createDatetime)
        default: /* create-old-new */
          return +new Date(a.createDatetime) - +new Date(b.createDatetime)
      }
    })
})

/* ----------------------------------------------------------------------
 * New / edit / delete folder
 * -------------------------------------------------------------------- */
const isOpenAddFolderDialog = ref(false)
const addFolderInputVal = ref(``)
watch(isOpenAddFolderDialog, open => open && (addFolderInputVal.value = ``))
function addFolder() {
  if (!addFolderInputVal.value.trim())
    return toast.error(`文件夹名称不可为空`)
  if (folders.value.some(f => f.name === addFolderInputVal.value.trim()))
    return toast.error(`文件夹名称已存在`)
  store.addFolder(addFolderInputVal.value.trim())
  isOpenAddFolderDialog.value = false
  toast.success(`文件夹新增成功`)
}

const editFolderId = ref<string | null>(null)
const isOpenEditFolderDialog = ref(false)
const renameFolderInputVal = ref(``)
function startRenameFolder(id: string) {
  if (id === `root`)
    return
  editFolderId.value = id
  renameFolderInputVal.value = folders.value.find(f => f.id === id)!.name
  isOpenEditFolderDialog.value = true
}
function renameFolder() {
  if (!renameFolderInputVal.value.trim())
    return toast.error(`文件夹名称不可为空`)
  if (folders.value.some(f => f.name === renameFolderInputVal.value.trim() && f.id !== editFolderId.value))
    return toast.error(`文件夹名称已存在`)
  if (renameFolderInputVal.value === folders.value.find(f => f.id === editFolderId.value)!.name) {
    isOpenEditFolderDialog.value = false
    return
  }
  store.renameFolder(editFolderId.value!, renameFolderInputVal.value.trim())
  isOpenEditFolderDialog.value = false
  toast.success(`文件夹重命名成功`)
}

const delFolderId = ref<string | null>(null)
const isOpenDelFolderConfirmDialog = ref(false)
const delFolderConfirmText = computed(() => {
  const folder = folders.value.find(f => f.id === delFolderId.value)
  const name = folder?.name ?? ``
  const short = name.length > 20 ? `${name.slice(0, 20)}…` : name
  return `此操作将删除文件夹「${short}」，其中的内容将移动到「未归档」，是否继续？`
})
function startDelFolder(id: string) {
  if (id === `root`)
    return
  delFolderId.value = id
  isOpenDelFolderConfirmDialog.value = true
}
function delFolder() {
  store.delFolder(delFolderId.value!)
  isOpenDelFolderConfirmDialog.value = false
  toast.success(`文件夹删除成功`)
}

/* ----------------------------------------------------------------------
 * Post helpers
 * -------------------------------------------------------------------- */
const isOpenAddDialog = ref(false)
const addPostInputVal = ref(``)
watch(isOpenAddDialog, o => o && (addPostInputVal.value = ``))
function addPost(folderId: string) {
  if (!addPostInputVal.value.trim())
    return toast.error(`内容标题不可为空`)
  if (store.posts.some(post => post.title === addPostInputVal.value.trim() && post.folderId === folderId))
    return toast.error(`同一文件夹下内容标题已存在`)
  store.addPost(addPostInputVal.value.trim(), folderId)
  isOpenAddDialog.value = false
  toast.success(`内容新增成功`)
}

const editId = ref<string | null>(null)
const isOpenEditDialog = ref(false)
const renamePostInputVal = ref(``)
function startRenamePost(id: string) {
  editId.value = id
  renamePostInputVal.value = store.getPostById(id)!.title
  isOpenEditDialog.value = true
}
function renamePost() {
  if (!renamePostInputVal.value.trim())
    return toast.error(`内容标题不可为空`)
  if (store.posts.some(post => post.title === renamePostInputVal.value.trim() && post.id !== editId.value && post.folderId === store.currentFolderId))
    return toast.error(`同一文件夹下内容标题已存在`)
  if (renamePostInputVal.value === store.getPostById(editId.value!)?.title) {
    isOpenEditDialog.value = false
    return
  }
  store.renamePost(editId.value!, renamePostInputVal.value.trim())
  toast.success(`内容重命名成功`)
  isOpenEditDialog.value = false
}

const delId = ref<string | null>(null)
const isOpenDelPostConfirmDialog = ref(false)
const delConfirmText = computed(() => {
  const title = store.getPostById(delId.value || ``)?.title ?? ``
  const short = title.length > 20 ? `${title.slice(0, 20)}…` : title
  return `此操作将删除「${short}」，是否继续？`
})
function startDelPost(id: string) {
  delId.value = id
  isOpenDelPostConfirmDialog.value = true
}
function delPost() {
  store.delPost(delId.value!)
  isOpenDelPostConfirmDialog.value = false
  toast.success(`内容删除成功`)
}

/* ----------------------------------------------------------------------
 * History restore
 * -------------------------------------------------------------------- */
const isOpenHistoryDialog = ref(false)
const currentPostId = ref<string | null>(null)
const currentHistoryIndex = ref(0)
function openHistoryDialog(id: string) {
  currentPostId.value = id
  currentHistoryIndex.value = 0
  isOpenHistoryDialog.value = true
}
function recoverHistory() {
  const post = store.getPostById(currentPostId.value!)
  if (!post)
    return (isOpenHistoryDialog.value = false)
  const content = post.history[currentHistoryIndex.value].content
  post.content = content
  toRaw(store.editor!).setValue(content)
  toast.success(`记录恢复成功`)
  isOpenHistoryDialog.value = false
}

/* ----------------------------------------------------------------------
 * UI helpers
 * -------------------------------------------------------------------- */
const expandedFolders = ref<Record<string, boolean>>({})
watch(
  () => store.currentFolderId,
  (newId) => {
    if (newId)
      expandedFolders.value[newId] = true
  },
  { immediate: true },
)
</script>

<template>
  <!-- 侧栏外框 -->
  <div
    class="overflow-hidden bg-gray/20 transition-width duration-300 dark:bg-[#191c20]"
    :class="{ 'w-0': !store.isOpenPostSlider, 'w-60': store.isOpenPostSlider }"
  >
    <nav
      class="space-y-1 h-full overflow-auto border-r-2 border-gray/20 p-2 transition-transform"
      :class="{ 'translate-x-100': store.isOpenPostSlider, '-translate-x-full': !store.isOpenPostSlider }"
    >
      <!-- Top actions -->
      <div class="mb-4 flex items-center justify-between px-1">
        <div class="flex gap-2">
          <!-- Add folder -->
          <Dialog v-model:open="isOpenAddFolderDialog">
            <DialogTrigger as-child>
              <Button variant="outline" size="sm" class="h-8">
                <FolderPlus class="mr-1 size-4" /> 文件夹
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增文件夹</DialogTitle>
                <DialogDescription>请输入文件夹名称</DialogDescription>
              </DialogHeader>
              <Input v-model="addFolderInputVal" @keyup.enter="addFolder" />
              <DialogFooter>
                <Button @click="addFolder">
                  确 定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <!-- Sort dropdown (global) -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
              <ArrowUpNarrowWide class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup v-model="sortMode">
              <DropdownMenuRadioItem value="A-Z">
                文件名（A-Z）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Z-A">
                文件名（Z-A）
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="update-new-old">
                编辑时间（新→旧）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="update-old-new">
                编辑时间（旧→新）
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="create-new-old">
                创建时间（新→旧）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="create-old-new">
                创建时间（旧→新）
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Folder & posts list -->
      <div class="space-y-1">
        <div
          v-for="folder in folders"
          :key="folder.id"
          class="rounded transition-colors"
          :class="{
            'bg-gray-100 dark:bg-gray-800/60': expandedFolders[folder.id] || store.currentFolderId === folder.id,
          }"
        >
          <!-- Folder row -->
          <div
            class="flex cursor-pointer items-center gap-1 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800/60"
            @click="store.currentFolderId = folder.id"
          >
            <!-- Folder name -->
            <span
              class="flex-1 rounded px-2 py-1 text-sm font-medium"
              :class="{
                'bg-primary text-primary-foreground dark:bg-primary-dark': store.currentFolderId === folder.id,
              }"
            >
              {{ folder.name }}
            </span>

            <!-- Folder ops -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm" class="h-7 w-7 p-0">
                  <Ellipsis class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem @click.stop="isOpenAddDialog = true; store.currentFolderId = folder.id">
                  <Plus class="mr-2 size-4" /> 新增内容
                </DropdownMenuItem>
                <DropdownMenuItem v-if="folder.id !== 'root'" @click.stop="startRenameFolder(folder.id)">
                  <Edit3 class="mr-2 size-4" /> 重命名
                </DropdownMenuItem>
                <DropdownMenuItem v-if="folder.id !== 'root'" @click.stop="startDelFolder(folder.id)">
                  <Trash class="mr-2 size-4" /> 删除
                </DropdownMenuItem>
                <DropdownMenuItem @click.stop="expandedFolders[folder.id] = !expandedFolders[folder.id]">
                  <span v-if="expandedFolders[folder.id]">折叠</span>
                  <span v-else>展开</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Folder's posts -->
          <div
            v-show="expandedFolders[folder.id] || store.currentFolderId === folder.id"
            class="ml-4 border-l border-gray-200 pl-2 dark:border-gray-700"
          >
            <a
              v-for="post in sortedPosts.filter(p => p.folderId === folder.id)"
              :key="post.id"
              href="#"
              class="hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary-dark/90 block h-8 w-full inline-flex items-center gap-2 rounded px-2 text-sm transition-colors"
              :class="{
                'bg-primary text-primary-foreground shadow-lg': store.currentPostId === post.id,
                'dark:bg-primary-dark text-primary-foreground': store.currentPostId === post.id,
              }"
              @click="store.currentPostId = post.id"
            >
              <span class="line-clamp-1 flex-1 text-left">{{ post.title }}</span>
              <!-- Post ops -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm" class="h-6 w-6 p-0">
                    <Ellipsis class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem @click.stop="startRenamePost(post.id)"><Edit3 class="mr-2 size-4" /> 重命名</DropdownMenuItem>
                  <DropdownMenuItem @click.stop="openHistoryDialog(post.id)"><History class="mr-2 size-4" /> 历史记录</DropdownMenuItem>
                  <DropdownMenuItem v-if="store.posts.length > 1" @click.stop="startDelPost(post.id)"><Trash class="mr-2 size-4" /> 删除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </a>
          </div>
        </div>
      </div>

      <!-- ------------------ 弹窗与对话框 ------------------ -->
      <!-- 新增内容 -->
      <Dialog v-model:open="isOpenAddDialog">
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新增内容</DialogTitle>
            <DialogDescription>请输入内容名称</DialogDescription>
          </DialogHeader>
          <Input v-model="addPostInputVal" @keyup.enter="addPost(store.currentFolderId)" />
          <DialogFooter>
            <Button @click="addPost(store.currentFolderId)">
              确 定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 文件夹重命名 -->
      <Dialog v-model:open="isOpenEditFolderDialog">
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑文件夹名称</DialogTitle>
            <DialogDescription>请输入新的文件夹名称</DialogDescription>
          </DialogHeader>
          <Input v-model="renameFolderInputVal" @keyup.enter="renameFolder" />
          <DialogFooter>
            <Button variant="outline" @click="isOpenEditFolderDialog = false">
              取消
            </Button>
            <Button @click="renameFolder">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 文件夹删除确认 -->
      <AlertDialog v-model:open="isOpenDelFolderConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>提示</AlertDialogTitle>
            <AlertDialogDescription>{{ delFolderConfirmText }}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="delFolder">
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- 文章重命名 -->
      <Dialog v-model:open="isOpenEditDialog">
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑内容名称</DialogTitle>
            <DialogDescription>请输入新的内容名称</DialogDescription>
          </DialogHeader>
          <Input v-model="renamePostInputVal" @keyup.enter="renamePost" />
          <DialogFooter>
            <Button variant="outline" @click="isOpenEditDialog = false">
              取消
            </Button>
            <Button @click="renamePost">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 文章删除确认 -->
      <AlertDialog v-model:open="isOpenDelPostConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>提示</AlertDialogTitle>
            <AlertDialogDescription>{{ delConfirmText }}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="delPost">
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- 历史记录 -->
      <Dialog v-model:open="isOpenHistoryDialog">
        <DialogContent class="max-w-max">
          <DialogHeader>
            <DialogTitle>历史记录</DialogTitle>
            <DialogDescription>每隔 30 秒自动保存，最多保留 10 条</DialogDescription>
          </DialogHeader>

          <div class="h-[50vh] flex">
            <!-- 左侧时间轴 -->
            <ul class="space-y-2 w-[150px]">
              <li
                v-for="(item, idx) in store.getPostById(currentPostId!)?.history"
                :key="item.datetime"
                class="hover:text-primary-foreground hover:bg-primary/90 h-8 w-full inline-flex cursor-pointer items-center gap-2 rounded px-2 text-sm transition-colors"
                :class="{
                  'bg-primary text-primary-foreground shadow-lg dark:border dark:border-primary': currentHistoryIndex === idx,
                  'dark:bg-gray/30 dark:text-primary-foreground-dark dark:border-primary-dark': currentHistoryIndex === idx,
                }"
                @click="currentHistoryIndex = idx"
              >
                {{ item.datetime }}
              </li>
            </ul>

            <Separator orientation="vertical" class="mx-2" />

            <!-- 右侧内容 -->
            <div class="space-y-2 max-h-full w-[500px] overflow-y-auto">
              <p
                v-for="(line, idx) in (store.getPostById(currentPostId!)?.history[currentHistoryIndex].content ?? '').split('\n')"
                :key="idx"
              >
                {{ line }}
              </p>
            </div>
          </div>

          <DialogFooter>
            <AlertDialog>
              <AlertDialogTrigger><Button>恢 复</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>提示</AlertDialogTitle>
                  <AlertDialogDescription>此操作将用该记录替换当前文章内容，是否继续？</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction @click="recoverHistory">
                    恢 复
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  </div>
</template>
