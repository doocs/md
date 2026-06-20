<script setup lang="ts">
import type { Post } from '@md/shared/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

declare global {
  interface Window {
    $cose: any
  }
}

const props = defineProps<{
  post: Post
  open: boolean
}>()

const emit = defineEmits([`update:open`])

const { t } = useI18n()

const dialogVisible = computed({
  get: () => props.open,
  set: value => emit(`update:open`, value),
})

const taskStatus = ref<any>(null)
const submitting = ref(false)

async function startPost() {
  if (!props.post)
    return

  const taskData = {
    post: {
      title: props.post.title,
      content: props.post.content,
      markdown: props.post.markdown,
      thumb: props.post.thumb,
      desc: props.post.desc,
    },
    accounts: props.post.accounts.filter(a => a.checked),
  }

  const onProgress = (newStatus: any) => {
    taskStatus.value = newStatus
  }

  const onComplete = () => {
    submitting.value = false
  }

  try {
    window.$cose?.addTask(taskData, onProgress, onComplete)
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
    <DialogContent class="!max-w-[95vw] !w-[min(560px,95vw)] max-h-[85vh] flex flex-col overflow-hidden">
      <DialogHeader>
        <DialogTitle>{{ t('postTask.title') }}</DialogTitle>
      </DialogHeader>

      <div class="mt-4">
        <div v-if="!taskStatus" class="py-4 text-center">
          {{ t('postTask.waiting') }}
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
                {{ account.msg || t('postTask.publishing') }}
              </template>

              <template v-if="account.status === 'failed'">
                {{ t('postTask.syncFailed', { error: account.error }) }}
              </template>

              <template v-if="account.status === 'done' && account.editResp">
                {{ t('postTask.syncSuccess') }}
                <a
                  v-if="account.type !== 'wordpress' && account.editResp"
                  :href="account.editResp.draftLink"
                  class="ml-2 text-blue-500 hover:underline"
                  referrerPolicy="no-referrer"
                  target="_blank" rel="noopener noreferrer"
                >{{ t('postTask.viewDraft') }}</a>
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
