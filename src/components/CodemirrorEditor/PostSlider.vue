<script setup lang="ts">
import { useStore } from '@/stores'
import { Edit3, Ellipsis, Plus, Trash } from 'lucide-vue-next'

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
      <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
          <Button variant="outline" class="w-full" size="xs">
            <Plus /> 新增内容
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
      <a
        v-for="(post, index) in store.posts" :key="post.title" href="#" :class="{
          'bg-primary text-primary-foreground shadow-lg dark:border-1 border-primary': store.currentPostIndex === index,
          'dark:bg-gray/30 dark:text-primary-foreground-dark dark:border-primary-dark': store.currentPostIndex === index,
        }"
        class="hover:bg-primary/90 hover:text-primary-foreground dark:hover:border-primary-dark h-8 w-full inline-flex items-center justify-start gap-2 whitespace-nowrap rounded px-2 text-sm transition-colors dark:text-white dark:hover:bg-gray/20 dark:hover:text-white"
        @click="store.currentPostIndex = index"
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
    </nav>
  </div>
</template>

<style scoped lang="less">

</style>
