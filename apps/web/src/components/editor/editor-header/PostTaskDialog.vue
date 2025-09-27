<script setup lang="ts">
import type { Post } from '@md/shared/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const props = defineProps<{
  post: Post
  open: boolean
}>()

const emit = defineEmits([`update:open`])

const dialogVisible = computed({
  get: () => props.open,
  set: value => emit(`update:open`, value),
})

const taskStatus = ref<any>(null)
const submitting = ref(false)

async function startPost() {
  if (!props.post)
    return

  try {
    window.$syncer?.addTask(
      {
        post: {
          title: props.post.title,
          content: props.post.content,
          markdown: props.post.markdown,
          thumb: props.post.thumb,
          desc: props.post.desc,
        },
        accounts: props.post.accounts.filter(a => a.checked),
      },
      (newStatus: any) => {
        taskStatus.value = newStatus
      },
      () => {
        submitting.value = false
      },
    )
  }
  catch (error) {
    console.error(`发布失败:`, error)
  }
}

watch(() => props.open, (newVal) => {
  if (newVal) {
    startPost()
  }
})
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>提交发布任务</DialogTitle>
      </DialogHeader>

      <div class="mt-4">
        <div v-if="!taskStatus" class="py-4 text-center">
          等待发布..
        </div>
        <div v-else class="max-h-[400px] flex flex-col overflow-y-auto">
          <div
            v-for="account in taskStatus?.accounts"
            :key="account.uid + account.displayName"
            class="border-b py-4 last:border-b-0"
          >
            <div class="mb-2 flex items-center gap-2">
              <img
                v-if="account.icon"
                :src="account.icon"
                class="object-cover h-5 w-5"
                alt=""
              >
              <span>{{ account.title }} - {{ account.displayName || account.home }}</span>
            </div>
            <div
              class="w-full flex-1 gap-2 overflow-auto pl-7 text-sm" :class="{
                'text-yellow-600': account.status === 'uploading',
                'text-red-600': account.status === 'failed',
                'text-green-600': account.status === 'done',
              }"
            >
              <template v-if="account.status === 'uploading'">
                {{ account.msg || '发布中' }}
              </template>

              <template v-if="account.status === 'failed'">
                同步失败, 错误内容：{{ account.error }}
              </template>

              <template v-if="account.status === 'done' && account.editResp">
                同步成功
                <a
                  v-if="account.type !== 'wordpress' && account.editResp"
                  :href="account.editResp.draftLink"
                  class="ml-2 text-blue-500 hover:underline"
                  referrerPolicy="no-referrer"
                  target="_blank"
                >查看草稿</a>
              </template>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.account-item {
  margin-bottom: 1rem;
}
</style>
