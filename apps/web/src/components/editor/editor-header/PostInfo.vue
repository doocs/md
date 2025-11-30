<script setup lang="ts">
import type { Post, PostAccount } from '@md/shared/types'
import { Check, Info, Send } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot, Primitive } from 'radix-vue'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'

defineOptions({
  inheritAttrs: false,
})

const editorStore = useEditorStore()
const { editor } = storeToRefs(editorStore)

const renderStore = useRenderStore()
const { output } = storeToRefs(renderStore)

const uiStore = useUIStore()
const { isMobile } = storeToRefs(uiStore)

const dialogVisible = ref(false)
const extensionInstalled = ref(false)
const allAccounts = ref<PostAccount[]>([])
const postTaskDialogVisible = ref(false)

const form = ref<Post>({
  title: ``,
  desc: ``,
  thumb: ``,
  content: ``,
  markdown: ``,
  accounts: [] as PostAccount[],
})

const allowPost = computed(() => extensionInstalled.value && form.value.accounts.some(a => a.checked))

async function prePost() {
  if (extensionInstalled.value && allAccounts.value.length === 0) {
    await getAccounts()
  }

  let auto: Post = {
    thumb: ``,
    title: ``,
    desc: ``,
    content: ``,
    markdown: ``,
    accounts: [],
  }
  const accounts = allAccounts.value.filter(a => ![`ipfs`].includes(a.type))
  try {
    auto = {
      thumb: document.querySelector<HTMLImageElement>(`#output img`)?.src ?? ``,
      title: [1, 2, 3, 4, 5, 6]
        .map(h => document.querySelector(`#output h${h}`)!)
        .find(h => h)
        ?.textContent ?? ``,
      desc: document.querySelector(`#output p`)?.textContent?.trim() ?? ``,
      content: output.value,
      markdown: editor.value?.state.doc.toString() ?? ``,
      accounts,
    }
  }
  catch (error) {
    console.log(`error`, error)
  }
  finally {
    form.value = {
      ...auto,
    }
  }
}

declare global {
  interface Window {
    syncPost: (data: { thumb: string, title: string, desc: string, content: string }) => void
    $syncer: any
  }
}

async function getAccounts(): Promise<void> {
  return new Promise((resolve) => {
    window.$syncer?.getAccounts((resp: PostAccount[]) => {
      allAccounts.value = resp.map(a => ({ ...a, checked: true }))
      resolve()
    })
  })
}

function post() {
  form.value.accounts = form.value.accounts.filter(a => a.checked)
  postTaskDialogVisible.value = true
  dialogVisible.value = false
}

function onUpdate(val: boolean) {
  if (!val) {
    dialogVisible.value = false
  }
}

function checkExtension() {
  if (window.$syncer !== undefined) {
    extensionInstalled.value = true
    return
  }

  // 如果插件还没加载，5秒内每 500ms 检查一次
  let count = 0
  const timer = setInterval(async () => {
    if (window.$syncer !== undefined) {
      extensionInstalled.value = true
      await getAccounts()
      clearInterval(timer)
      return
    }

    count++
    if (count > 10) { // 5秒后还是没有检测到，就停止检查
      clearInterval(timer)
    }
  }, 500)
}

onBeforeMount(() => {
  checkExtension()
})
</script>

<template>
  <div v-bind="$attrs">
    <Dialog v-model:open="dialogVisible" @update:open="onUpdate">
      <DialogTrigger>
        <Button v-if="!isMobile" variant="outline" class="h-9" @click="prePost">
          <Send class="mr-2 h-4 w-4" />
          发布
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>发布</DialogTitle>
          <DialogDescription>
            将文章发布到多个平台
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Info class="h-4 w-4" />
          <AlertTitle>提示</AlertTitle>
          <AlertDescription>
            此功能由第三方浏览器插件支持，本平台不保证安全性及同步准确度。
          </AlertDescription>
        </Alert>

        <Alert v-if="!extensionInstalled">
          <Info class="h-4 w-4" />
          <AlertTitle>未检测到插件</AlertTitle>
          <AlertDescription>
            请安装
            <Primitive
              as="a" class="text-blue-500" href="https://www.wechatsync.com/?utm_source=syncicon#install"
              target="_blank"
            >
              文章同步助手
            </Primitive>
            插件
          </AlertDescription>
        </Alert>

        <div class="w-full flex items-center gap-4">
          <Label for="thumb" class="w-10 text-end">
            封面
          </Label>
          <Input id="thumb" v-model="form.thumb" placeholder="自动提取第一张图" />
        </div>
        <div class="w-full flex items-center gap-4">
          <Label for="title" class="w-10 text-end">
            标题
          </Label>
          <Input id="title" v-model="form.title" placeholder="自动提取第一个标题" />
        </div>
        <div class="w-full flex items-start gap-4">
          <Label for="desc" class="w-10 text-end">
            描述
          </Label>
          <Textarea id="desc" v-model="form.desc" placeholder="自动提取第一个段落" />
        </div>

        <div class="w-full flex items-start gap-4">
          <Label class="w-10 text-end">
            账号
          </Label>
          <div class="flex flex-1 flex-col gap-2">
            <div v-for="account in form.accounts" :key="account.uid + account.displayName" class="flex items-center gap-2">
              <label class="flex flex-row items-center gap-4">
                <CheckboxRoot
                  v-model:checked="account.checked"
                  class="bg-background hover:bg-muted h-[25px] w-[25px] flex appearance-none items-center justify-center border border-gray-200 rounded-[4px] outline-hidden"
                >
                  <CheckboxIndicator>
                    <Check v-if="account.checked" class="h-4 w-4" />
                  </CheckboxIndicator>
                </CheckboxRoot>
                <span class="flex items-center gap-2 text-sm">
                  <img
                    :src="account.icon"
                    alt=""
                    class="inline-block h-[20px] w-[20px]"
                  >
                  {{ account.title }} - {{ account.displayName ?? account.home }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="dialogVisible = false">
            取 消
          </Button>
          <Button :disabled="!allowPost" @click="post">
            确 定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <PostTaskDialog v-model:open="postTaskDialogVisible" :post="form" />
  </div>
</template>
