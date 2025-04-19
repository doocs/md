<script setup lang="ts">
import { useStore } from '@/stores'
import { addPrefix } from '@/utils'
import { ArrowUpNarrowWide, Edit3, Ellipsis, History, Plus, Trash } from 'lucide-vue-next'

const store = useStore()

const isOpen = ref(false)

const addPostInputVal = ref(``)

watch(isOpen, () => {
  if (isOpen.value) {
    addPostInputVal.value = ``
  }
})

function addPost() {
  if (addPostInputVal.value === ``) {
    toast.error(`内容标题不可为空`)
    return
  }
  store.addPost(addPostInputVal.value)
  isOpen.value = false
  toast.success(`内容新增成功`)
}

const editTarget = ref(-1)
const isOpenEditDialog = ref(false)
const renamePostInputVal = ref(``)
function startRenamePost(index: number) {
  editTarget.value = index
  renamePostInputVal.value = store.posts[index].title
  isOpenEditDialog.value = true
}

function renamePost() {
  if (renamePostInputVal.value === ``) {
    toast.error(`内容标题不可为空`)
    return
  }
  store.renamePost(editTarget.value, renamePostInputVal.value)
  isOpenEditDialog.value = false
  toast.success(`内容重命名成功`)
}

const isOpenDelPostConfirmDialog = ref(false)
function startDelPost(index: number) {
  editTarget.value = index
  isOpenDelPostConfirmDialog.value = true
}
function delPost() {
  store.delPost(editTarget.value)
  isOpenDelPostConfirmDialog.value = false
  toast.success(`内容删除成功`)
}

const isOpenHistoryDialog = ref(false)
const currentPostIndex = ref(0)
const currentPost = ref<typeof store.posts[0] | null>(null)
const currentHistoryIndex = ref(0)

/**
 * 打开窗口
 * @param index
 */
function openHistoryDialog(index: number) {
  isOpenHistoryDialog.value = true
  currentPost.value = store.posts[index]
  currentHistoryIndex.value = 0
  currentPostIndex.value = index
}

/**
 * 恢复记录
 */
function recoverHistory() {
  if (currentPost.value == null) {
    isOpenHistoryDialog.value = false
    return
  }

  store.posts[currentPostIndex.value].content = currentPost.value.history[currentHistoryIndex.value]?.content
  toRaw(store.editor!).setValue(currentPost.value.history[currentHistoryIndex.value]?.content)

  toast.success(`记录恢复成功`)
  isOpenHistoryDialog.value = false
}

// 排序模式
const sortMode = useStorage(addPrefix(`sort_mode`), `create-old-new`)
</script>

<template>
  <div
    class="overflow-hidden bg-gray/20 transition-width duration-300 dark:bg-[#191c20]"
    :class="{
      'w-0': !store.isOpenPostSlider,
      'w-50': store.isOpenPostSlider,
    }"
  >
    <nav
      class="space-y-1 h-full overflow-auto border-r-2 border-gray/20 p-2 transition-transform"
      :class="{
        'translate-x-100': store.isOpenPostSlider,
        '-translate-x-full': !store.isOpenPostSlider,
      }"
    >
      <div class="space-x-4 flex justify-center">
        <!-- 新增文章 -->
        <Dialog v-model:open="isOpen">
          <DialogTrigger as-child>
            <Button variant="outline" size="icon">
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增内容</DialogTitle>
              <DialogDescription>
                请输入内容名称
              </DialogDescription>
            </DialogHeader>
            <Input v-model="addPostInputVal" />
            <DialogFooter>
              <Button @click="addPost()">
                确 定
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="icon">
              <ArrowUpNarrowWide />
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
                编辑时间（从新到旧）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="update-old-new">
                编辑时间（从旧到新）
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="create-new-old">
                创建时间（从新到旧）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="create-old-new">
                创建时间（从旧到新）
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <a
        v-for="(post, index) in [...store.posts].map((post, index) => {
          return {
            ...post,
            index,
          }
        }).sort((a, b) => {
          if (sortMode === 'A-Z') {
            return a.title < b.title ? 1 : -1
          }
          if (sortMode === 'Z-A') {
            return a.title > b.title ? 1 : -1
          }
          if (sortMode === 'update-new-old') {
            return new Date(a.updateDatetime) < new Date(b.updateDatetime) ? 1 : -1
          }
          if (sortMode === 'update-old-new') {
            return new Date(a.updateDatetime) > new Date(b.updateDatetime) ? 1 : -1
          }
          if (sortMode === 'create-new-old') {
            return new Date(a.createDatetime) < new Date(b.createDatetime) ? 1 : -1
          }
          if (sortMode === 'create-old-new') {
            return new Date(a.createDatetime) > new Date(b.createDatetime) ? 1 : -1
          }
          return 1
        })" :key="post.index" href="#"
        :class="{
          'bg-primary text-primary-foreground shadow-lg dark:border-1 border-primary': store.currentPostIndex === post.index,
          'dark:bg-gray/30 dark:text-primary-foreground-dark dark:border-primary-dark': store.currentPostIndex === post.index,
        }"
        class="hover:bg-primary/90 hover:text-primary-foreground dark:hover:border-primary-dark h-8 w-full inline-flex items-center justify-start gap-2 whitespace-nowrap rounded px-2 text-sm transition-colors dark:text-white dark:hover:bg-gray/20 dark:hover:text-white"
        @click="store.currentPostIndex = post.index"
      >
        <span class="line-clamp-1">{{ post.title }}</span>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button size="xs" variant="ghost" class="ml-auto px-1.5">
              <Ellipsis class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click.stop="startRenamePost(index)">
              <Edit3 class="mr-2 size-4" />
              重命名
            </DropdownMenuItem>
            <DropdownMenuItem @click.stop="openHistoryDialog(index)">
              <History class="mr-2 size-4" />
              历史记录
            </DropdownMenuItem>
            <DropdownMenuItem v-if="store.posts.length > 1" @click.stop="startDelPost(index)">
              <Trash class="mr-2 size-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </a>

      <!-- 重命名弹窗 -->
      <Dialog v-model:open="isOpenEditDialog">
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑内容名称</DialogTitle>
            <DialogDescription>
              请输入新的内容名称
            </DialogDescription>
          </DialogHeader>
          <Input v-model="renamePostInputVal" />
          <DialogFooter>
            <Button variant="outline" @click="isOpenEditDialog = false">
              取消
            </Button>
            <Button @click="renamePost()">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <!-- 删除文章 -->
      <AlertDialog v-model:open="isOpenDelPostConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>提示</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除该内容，是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="delPost()">
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog v-model:open="isOpenHistoryDialog">
        <DialogContent class="max-w-max">
          <DialogHeader>
            <DialogTitle>历史记录</DialogTitle>
            <DialogDescription>
              每隔 30 秒进行一次保存，最多保存 10 条
            </DialogDescription>
          </DialogHeader>

          <div class="h-[50vh] flex">
            <ul class="space-y-2 w-[150px]">
              <li
                v-for="(item, index) in currentPost?.history"
                :key="item.datetime"
                :class="{
                  'bg-primary text-primary-foreground shadow-lg dark:border-1 border-primary': currentHistoryIndex === index,
                  'dark:bg-gray/30 dark:text-primary-foreground-dark dark:border-primary-dark': currentHistoryIndex === index,
                }"
                class="hover:bg-primary/90 hover:text-primary-foreground dark:hover:border-primary-dark h-8 w-full inline-flex cursor-pointer items-center justify-start gap-2 whitespace-nowrap rounded px-2 text-sm transition-colors dark:text-white dark:hover:bg-gray/20 dark:hover:text-white"
                @click="currentHistoryIndex = index"
              >
                {{ item.datetime }}
              </li>
            </ul>
            <Separator orientation="vertical" class="mx-2" />
            <div class="space-y-2 max-h-full w-[500px] overflow-y-auto">
              <p v-for="(item, index) in currentPost?.history[currentHistoryIndex].content.split('\n')" :key="index">
                {{ item }}
              </p>
            </div>
          </div>

          <DialogFooter>
            <AlertDialog v-model:open="isOpenDelPostConfirmDialog">
              <AlertDialogTrigger>
                <Button>
                  恢 复
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>提示</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将使用该记录替换对应文章内容，是否继续恢复？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction @click="recoverHistory()">
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

<style scoped lang="less">

</style>
