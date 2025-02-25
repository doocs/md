<script setup lang="ts">
import { useDisplayStore, useStore } from '@/stores'
import { Edit3, Plus, X } from 'lucide-vue-next'

const store = useStore()
const displayStore = useDisplayStore()

const isOpenEditDialog = ref(false)
const editInputVal = ref(``)
const tabHistory = ref([``, store.cssContentConfig.active])

function rename(name: string) {
  editInputVal.value = name
  isOpenEditDialog.value = true
}

function editTabName() {
  if (!(editInputVal.value).trim()) {
    toast.error(`新建失败，方案名不可为空`)
    return
  }

  if (!store.validatorTabName(editInputVal.value)) {
    toast.error(`不能与现有方案重名`)
    return
  }
  store.renameTab(editInputVal.value)
  isOpenEditDialog.value = false
  toast.success(`修改成功~`)
}

const isOpenAddDialog = ref(false)

const addInputVal = ref(``)

function addTab() {
  if (!(addInputVal.value).trim()) {
    toast.error(`新建失败，方案名不可为空`)
    return
  }

  if (!store.validatorTabName(addInputVal.value)) {
    toast.error(`不能与现有方案重名`)
    return
  }

  store.addCssContentTab(addInputVal.value)
  isOpenAddDialog.value = false

  store.cssContentConfig.active = addInputVal.value
  tabHistory.value = [tabHistory.value[1], addInputVal.value]
  toast.success(`新建成功~`)
}

const isOpenDelTabConfirmDialog = ref(false)
const delTargetName = ref(``)

function removeHandler(targetName: string) {
  delTargetName.value = targetName
  isOpenDelTabConfirmDialog.value = true
}

function delTab() {
  const tabs = store.cssContentConfig.tabs
  if (tabs.length === 1) {
    toast.warning(`至少保留一个方案`)
    return
  }

  let activeName = store.cssContentConfig.active
  if (activeName === delTargetName.value) {
    tabs.forEach((tab, index) => {
      if (tab.name === delTargetName.value) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  store.tabChanged(activeName)
  store.cssContentConfig.tabs = tabs.filter(tab => tab.name !== delTargetName.value)

  toast.success(`删除成功~`)
}

function addHandler() {
  addInputVal.value = `方案${store.cssContentConfig.tabs.length + 1}`
  isOpenAddDialog.value = true
}

function tabChanged(tabName: string | number) {
  if (tabName === `add`) {
    store.cssContentConfig.active = tabHistory.value[1]
    addHandler()
    return
  }

  tabHistory.value = [tabHistory.value[1], tabName as string]
  store.tabChanged(tabName as string)
}
</script>

<template>
  <transition enter-active-class="bounceInRight">
    <div v-show="displayStore.isShowCssEditor" class="cssEditor-wrapper h-full flex flex-col border-l-2 border-gray/50">
      <Tabs
        v-model="store.cssContentConfig.active"
        @update:model-value="tabChanged"
      >
        <TabsList class="w-full overflow-x-auto">
          <TabsTrigger
            v-for="item in store.cssContentConfig.tabs"
            :key="item.name"
            :value="item.name"
            class="flex-1"
          >
            {{ item.title }}
            <Edit3
              v-show="store.cssContentConfig.active === item.name" class="inline size-4 rounded-full p-0.5 transition-color hover:bg-gray-200 dark:hover:bg-gray-600"
              @click="rename(item.name)"
            />
            <X
              v-show="store.cssContentConfig.active === item.name" class="inline size-4 rounded-full p-0.5 transition-color hover:bg-gray-200 dark:hover:bg-gray-600"
              @click.self="removeHandler(item.name)"
            />
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus class="h-5 w-5" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <textarea
        id="cssEditor"
        type="textarea"
        placeholder="Your custom css here."
      />

      <!-- 新增弹窗 -->
      <Dialog v-model:open="isOpenAddDialog">
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新建自定义 CSS</DialogTitle>
            <DialogDescription>
              请输入方案名称
            </DialogDescription>
          </DialogHeader>
          <Input v-model="addInputVal" />
          <DialogFooter>
            <Button variant="outline" @click="isOpenAddDialog = false">
              取消
            </Button>
            <Button @click="addTab()">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 重命名弹窗 -->
      <Dialog v-model:open="isOpenEditDialog">
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑方案名称</DialogTitle>
            <DialogDescription>
              请输入新的方案名称
            </DialogDescription>
          </DialogHeader>
          <Input v-model="editInputVal" />
          <DialogFooter>
            <Button variant="outline" @click="isOpenEditDialog = false">
              取消
            </Button>
            <Button @click="editTabName">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog v-model:open="isOpenDelTabConfirmDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>提示</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除该自定义方案，是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="delTab">
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </transition>
</template>

<style lang="less" scoped>
.bounceInRight {
  animation-name: bounceInRight;
  animation-duration: 1s;
  animation-fill-mode: both;
}

@keyframes bounceInRight {
  0%,
  60%,
  75%,
  90%,
  100% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  0% {
    opacity: 0;
    transform: translate3d(3000px, 0, 0);
  }

  60% {
    opacity: 1;
    transform: translate3d(-25px, 0, 0);
  }

  75% {
    transform: translate3d(10px, 0, 0);
  }

  90% {
    transform: translate3d(-5px, 0, 0);
  }

  100% {
    transform: none;
  }
}
</style>
