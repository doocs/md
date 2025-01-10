<script setup lang="ts">
import { useStore } from '@/stores'
import { Info } from 'lucide-vue-next'
import { Primitive } from 'radix-vue'

const store = useStore()
const { output } = storeToRefs(store)

const dialogVisible = ref(false)
const extensionInstalled = ref(false)
const form = ref<any>({
  title: ``,
  desc: ``,
  thumb: ``,
  content: ``,
  auto: {},
})

function prePost() {
  let auto = {}
  try {
    auto = {
      thumb: document.querySelector<HTMLImageElement>(`#output img`)?.src,
      title: [1, 2, 3, 4, 5, 6]
        .map(h => document.querySelector(`#output h${h}`)!)
        .filter(h => h)[0]
        .textContent,
      desc: document.querySelector(`#output p`)!.textContent,
      content: output.value,
    }
  }
  catch (error) {
    console.log(`error`, error)
  }
  form.value = {
    ...auto,
    auto,
  }
}

declare global {
  interface Window {
    syncPost: (data: { thumb: string, title: string, desc: string, content: string }) => void
    $syncer: any
  }
}

function post() {
  dialogVisible.value = false;
  (window.syncPost)({
    thumb: form.value.thumb || form.value.auto.thumb,
    title: form.value.title || form.value.auto.title,
    desc: form.value.desc || form.value.auto.desc,
    content: form.value.content || form.value.auto.content,
  })
}

function onUpdate(val: boolean) {
  if (!val) {
    dialogVisible.value = false
  }
}

onMounted(() => {
  extensionInstalled.value = window.$syncer !== undefined
})
</script>

<template>
  <Dialog v-model:open="dialogVisible" @update:open="onUpdate">
    <DialogTrigger>
      <Button variant="outline" @click="prePost">
        发布
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>发布</DialogTitle>
      </DialogHeader>
      <Alert>
        <Info class="h-4 w-4" />
        <AlertTitle>提示</AlertTitle>
        <AlertDescription>
          此功能由第三方浏览器插件支持，本平台不保证安全性。
        </AlertDescription>
      </Alert>

      <Alert v-if="!extensionInstalled">
        <Info class="h-4 w-4" />
        <AlertTitle>未检测到插件</AlertTitle>
        <AlertDescription>
          请安装
          <Primitive
            as="a"
            class="text-blue-500"
            href="https://www.wechatsync.com/?utm_source=syncicon#install"
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

      <DialogFooter>
        <Button variant="outline" @click="dialogVisible = false">
          取 消
        </Button>
        <Button :disabled="!extensionInstalled" @click="post">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
