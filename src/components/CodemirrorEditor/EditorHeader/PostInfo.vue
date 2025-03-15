<script setup lang="ts">
import type { ArticleData, checkServiceStatus, FileData, funcGetPermission, funcPublish, getPlatformInfos, type PlatformInfo, SyncData } from '@/utils/extension'
import { useStore } from '@/stores'
import { Check, Info } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot, Primitive } from 'radix-vue'

const store = useStore()
const { output, editor } = storeToRefs(store)

const dialogVisible = ref(false)
const extensionInstalled = ref(false)
const allAccounts = ref<PlatformInfo[]>([])
const postTaskDialogVisible = ref(false)

const selectedAccounts = ref<PlatformInfo[]>([])

const form = ref<ArticleData>({
  title: ``,
  content: ``,
  digest: ``,
  cover: {
    url: ``,
    type: ``,
    size: 0,
    name: ``,
  },
  images: [],
  videos: [],
  fileDatas: [],
  originContent: ``,
  markdownContent: ``,
  markdownOriginContent: ``,
})

async function prePost() {
  if (extensionInstalled.value && allAccounts.value.length === 0) {
    await getAccounts()
  }

  let auto: ArticleData = {
    cover: {
      url: ``,
      type: ``,
      size: 0,
      name: ``,
    },
    title: ``,
    content: ``,
    digest: ``,
    images: [],
    videos: [],
    fileDatas: [],
    originContent: ``,
    markdownContent: ``,
    markdownOriginContent: ``,
  }
  try {
    auto = {
      cover: {
        url: document.querySelector<HTMLImageElement>(`#output img`)?.src ?? ``,
        type: `image/*`,
        size: 0,
        name: `cover.png`,
        originUrl: document.querySelector<HTMLImageElement>(`#output img`)?.src ?? ``,
      },
      title: [1, 2, 3, 4, 5, 6]
        .map(h => document.querySelector(`#output h${h}`)!)
        .filter(h => h)[0]
        .textContent ?? ``,
      digest: document.querySelector(`#output p`)!.textContent ?? ``,
      content: output.value,
      originContent: output.value,
      markdownContent: editor.value?.getValue() ?? ``,
      markdownOriginContent: editor.value?.getValue() ?? ``,
      images: [],
      videos: [],
      fileDatas: [],
    }
  }
  catch (error) {
    console.log(`error`, error)
  }
  finally {
    form.value = {
      ...auto,
    }
    // 在表单数据准备好后处理图片
    await processImages()
  }
}

declare global {
  interface Window {
    syncPost: (data: { thumb: string, title: string, desc: string, content: string }) => void
    $syncer: any
  }
}

async function getAccounts(): Promise<void> {
  const platforms = await getPlatformInfos(`ARTICLE`)
  allAccounts.value = platforms
  console.log(`allAccounts`, platforms)
}

function toRaw<T extends object>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === `object` && item !== null) {
        return toRaw(item)
      }
      return item
    }) as unknown as T
  }

  const rawObj: Record<string, any> = {}
  for (const key in obj) {
    const value = obj[key as keyof T]
    if (typeof value === `object` && value !== null) {
      rawObj[key] = toRaw(value)
    }
    else {
      rawObj[key] = value
    }
  }
  return rawObj as T
}

function post() {
  const sdata: SyncData = {
    platforms: selectedAccounts.value.map(account => account.name),
    auto_publish: false,
    data: toRaw(form.value),
  }

  funcPublish(sdata)

  console.log(`sdata`, sdata)
  // postTaskDialogVisible.value = true
  // dialogVisible.value = false
}

async function processImages() {
  const images = Array.from(document.querySelectorAll(`#output img`)) as HTMLImageElement[]
  console.log(`images`, images)

  const imageFileDatas: FileData[] = []

  // 处理图片
  for (let i = 0; i < images.length; i++) {
    try {
      const img = images[i]
      const src = img.src
      const response = await fetch(src)
      const blob = await response.blob()
      const fileData: FileData = {
        name: `image_${i}.${blob.type.split(`/`)[1]}`,
        type: blob.type,
        size: blob.size,
        url: URL.createObjectURL(blob),
        originUrl: src,
      }
      imageFileDatas.push(fileData)

      // 替换原始图片的 src 为本地 URL
      img.src = fileData.url

      if (i === 0) {
        form.value.cover = fileData
      }
    }
    catch (error) {
      console.error(`处理图片时出错:`, error)
    }
  }

  // 保存所有图片数据
  form.value.images = imageFileDatas
  form.value.fileDatas = [...imageFileDatas]
}

function onUpdate(val: boolean) {
  if (!val) {
    dialogVisible.value = false
  }
}

async function checkExtension() {
  const result = await checkServiceStatus()
  extensionInstalled.value = result
}

function toggleAccount(account: PlatformInfo) {
  const index = selectedAccounts.value.findIndex(a => a.platformName === account.platformName)
  if (index === -1) {
    selectedAccounts.value.push(account)
  }
  else {
    selectedAccounts.value.splice(index, 1)
  }
}

function isAccountSelected(account: PlatformInfo) {
  return selectedAccounts.value.some(a => a.platformName === account.platformName)
}

onBeforeMount(() => {
  checkExtension()
})

onMounted(() => {
  funcGetPermission().then((res) => {
    console.log(`res`, res)
  })
  processImages()
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
          此功能由第三方浏览器插件支持，本平台不保证安全性及同步准确度。
        </AlertDescription>
      </Alert>

      <Alert v-if="!extensionInstalled">
        <Info class="h-4 w-4" />
        <AlertTitle>未检测到插件</AlertTitle>
        <AlertDescription>
          请安装
          <Primitive as="a" class="text-blue-500" href="https://multipost.app/extension" target="_blank">
            文章同步助手
          </Primitive>
          插件
        </AlertDescription>
      </Alert>

      <div class="w-full flex items-center gap-4">
        <Label for="thumb" class="w-10 text-end">
          封面
        </Label>
        <img :src="form.cover.originUrl" :alt="form.cover.name" class="h-20 w-20 rounded-sm">
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
        <Textarea id="desc" v-model="form.digest" placeholder="自动提取第一个段落" />
      </div>

      <div class="w-full flex items-start gap-4">
        <Label for="accounts" class="w-10 text-end">
          平台
        </Label>
        <div class="grid grid-cols-2 w-full gap-2">
          <div v-for="account in allAccounts" :key="account.platformName" class="flex items-center gap-2">
            <CheckboxRoot
              :checked="isAccountSelected(account)" class="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4 flex items-center justify-center border rounded-sm"
              @update:checked="toggleAccount(account)"
            >
              <CheckboxIndicator>
                <Check class="h-4 w-4" />
              </CheckboxIndicator>
            </CheckboxRoot>
            <div class="flex items-center gap-2">
              <img
                v-if="account.faviconUrl" :src="account.faviconUrl" :alt="account.platformName"
                class="h-4 w-4 rounded-sm"
              >
              <span class="text-sm">{{ account.platformName }}</span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="dialogVisible = false">
          取 消
        </Button>
        <Button :disabled="!selectedAccounts.length" @click="post">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <PostTaskDialog v-model:open="postTaskDialogVisible" :post="form" />
</template>
