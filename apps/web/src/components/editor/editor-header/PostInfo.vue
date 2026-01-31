<script setup lang="ts">
import type { Post, PostAccount } from '@md/shared/types'
import { Check, ChevronDown, ChevronRight, Info, Loader2, Minus, Send } from 'lucide-vue-next'
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
const isCheckingLogin = ref(false)

const form = ref<Post>({
  title: ``,
  desc: ``,
  thumb: ``,
  content: ``,
  markdown: ``,
  accounts: [] as PostAccount[],
})

const allowPost = computed(() => extensionInstalled.value && allAccounts.value.some(a => a.checked && a.loggedIn))

// 平台分类配置
const platformCategories = [
  {
    name: `媒体平台`,
    platforms: [`wechat`, `toutiao`, `zhihu`, `baijiahao`, `wangyihao`, `sohu`, `weibo`, `bilibili`, `sspai`, `twitter`, `douyin`, `xiaohongshu`],
  },
  {
    name: `博客平台`,
    platforms: [`csdn`, `cnblogs`, `juejin`, `medium`, `cto51`, `segmentfault`, `oschina`, `infoq`, `jianshu`],
  },
  {
    name: `云平台及开发者社区`,
    platforms: [`tencentcloud`, `aliyun`, `huaweicloud`, `huaweidev`, `qianfan`, `alipayopen`, `modelscope`, `volcengine`, `elecfans`],
  },
]

// 分类折叠状态（默认折叠云平台及开发者社区）
const collapsedCategories = ref<Set<string>>(new Set([`云平台及开发者社区`]))

function toggleCategory(categoryName: string) {
  if (collapsedCategories.value.has(categoryName)) {
    collapsedCategories.value.delete(categoryName)
  }
  else {
    collapsedCategories.value.add(categoryName)
  }
}

// 按分类获取账号
const accountsByCategory = computed(() => {
  return platformCategories.map(category => ({
    name: category.name,
    accounts: category.platforms
      .map(type => allAccounts.value.find(a => a.type === type))
      .filter((a): a is PostAccount => a !== undefined),
  }))
})

// 判断分类是否全选（只考虑已登录的账号）
function isCategoryAllSelected(accounts: PostAccount[]) {
  const loggedInAccounts = accounts.filter(a => a.loggedIn)
  return loggedInAccounts.length > 0 && loggedInAccounts.every(a => a.checked)
}

// 判断分类是否部分选中
function isCategoryIndeterminate(accounts: PostAccount[]) {
  const loggedInAccounts = accounts.filter(a => a.loggedIn)
  const checkedCount = loggedInAccounts.filter(a => a.checked).length
  return checkedCount > 0 && checkedCount < loggedInAccounts.length
}

// 切换分类全选
function toggleCategorySelectAll(accounts: PostAccount[]) {
  const loggedInAccounts = accounts.filter(a => a.loggedIn)
  const allSelected = loggedInAccounts.every(a => a.checked)
  loggedInAccounts.forEach(a => a.checked = !allSelected)
}

async function prePost() {
  // 如果扩展已安装且还没有账号数据，则开始检测
  if (extensionInstalled.value && allAccounts.value.length === 0) {
    // 不 await，让检测在后台进行
    startLoginDetection()
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

// 监听对话框打开，自动加载数据
watch(dialogVisible, (newVal) => {
  if (newVal) {
    prePost()
  }
})

declare global {
  interface Window {
    syncPost: (data: { thumb: string, title: string, desc: string, content: string }) => void
    $cose: any
  }
}

// 获取初始平台列表（不带登录状态，用于立即显示）
function getInitialPlatforms(): PostAccount[] {
  if (window.$cose !== undefined && typeof window.$cose.getPlatforms === 'function') {
    return window.$cose.getPlatforms().map((p: any) => ({
      ...p,
      checked: false,
      loggedIn: false,
      isChecking: true, // 标记正在检测中
    }))
  }
  return []
}

// 开始登录检测（异步，不阻塞 UI，渐进式更新）
function startLoginDetection() {
  if (window.$cose === undefined)
    return

  // 立即显示平台列表（带检测中状态）
  const initialPlatforms = getInitialPlatforms()
  if (initialPlatforms.length > 0) {
    allAccounts.value = initialPlatforms
  }

  isCheckingLogin.value = true
  let hasReceivedAny = false

  // 设置超时机制：如果 15 秒内没有任何响应，则停止检测
  const timeoutId = setTimeout(() => {
    if (!hasReceivedAny) {
      console.log('[COSE] 登录检测超时，停止检测')
      allAccounts.value = allAccounts.value.map(a => ({ ...a, isChecking: false }))
      isCheckingLogin.value = false
    }
  }, 15000)

  // 检查是否支持渐进式 API
  if (typeof window.$cose.getAccountsProgressive === 'function') {
    // 使用渐进式 API：每个平台检测完成后立即更新 UI
    window.$cose.getAccountsProgressive(
      // onProgress: 每个平台完成时调用
      (account: PostAccount, _completed: number, _total: number) => {
        hasReceivedAny = true
        // 更新对应平台的状态
        const idx = allAccounts.value.findIndex(a => a.type === account.type)
        if (idx !== -1) {
          allAccounts.value[idx] = { ...account, checked: false, isChecking: false }
        }
      },
      // onComplete: 所有平台完成时调用
      () => {
        clearTimeout(timeoutId)
        isCheckingLogin.value = false
      },
    )
  }
  else {
    // 回退到原有 API
    window.$cose.getAccounts((resp: PostAccount[]) => {
      hasReceivedAny = true
      clearTimeout(timeoutId)
      allAccounts.value = resp.map(a => ({ ...a, checked: false, isChecking: false }))
      isCheckingLogin.value = false
    })
  }
}

// 兼容旧的 getAccounts 调用（checkExtension 使用）
async function getAccounts(): Promise<void> {
  return new Promise((resolve) => {
    startLoginDetection()
    // 立即 resolve，不等待检测完成
    resolve()
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

function getPlatformUrl(type: string): string {
  const urls: Record<string, string> = {
    csdn: 'https://blog.csdn.net',
    juejin: 'https://juejin.cn',
    wechat: 'https://mp.weixin.qq.com',
    zhihu: 'https://www.zhihu.com/signin',
    toutiao: 'https://mp.toutiao.com',
    segmentfault: 'https://segmentfault.com/user/login',
    cnblogs: 'https://account.cnblogs.com/signin',
    oschina: 'https://www.oschina.net/home/login',
    cto51: 'https://home.51cto.com/index',
    infoq: 'https://account.geekbang.org/infoq/login/sms',
    jianshu: 'https://www.jianshu.com/sign_in',
    baijiahao: 'https://baijiahao.baidu.com',
    wangyihao: 'https://mp.163.com/login.html',
    tencentcloud: 'https://cloud.tencent.com/developer',
    medium: 'https://medium.com/m/signin',
    sspai: 'https://sspai.com/login',
    sohu: 'https://mp.sohu.com/mpfe/v4/login',
    bilibili: 'https://passport.bilibili.com/login',
    weibo: 'https://passport.weibo.com/sso/signin',
    aliyun: 'https://account.aliyun.com/login/login.htm',
    huaweicloud: 'https://auth.huaweicloud.com/authui/login.html?service=https%3A%2F%2Fbbs.huaweicloud.com%2F&locale=zh-cn#/login',
    huaweidev: 'https://developer.huawei.com/consumer/cn/blog/create',
    twitter: 'https://x.com/i/flow/login',
    qianfan: 'https://qianfan.cloud.baidu.com/qianfandev/topic/create',
    alipayopen: 'https://open.alipay.com/portal/forum/post/add#article',
    modelscope: 'https://modelscope.cn/learn/create',
    volcengine: 'https://developer.volcengine.com/articles/draft',
    douyin: 'https://creator.douyin.com/creator-micro/content/post/article?default-tab=5&enter_from=publish_page&media_type=article&type=new',
    xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish?from=menu&target=article',
    elecfans: 'https://www.elecfans.com/d/article/md/',
  }
  return urls[type] || '#'
}

function checkExtension() {
  if (window.$cose !== undefined) {
    extensionInstalled.value = true
    getAccounts() // 立即开始登录检测
    return
  }

  // 如果插件还没加载，5秒内每 500ms 检查一次
  let count = 0
  const timer = setInterval(async () => {
    if (window.$cose !== undefined) {
      extensionInstalled.value = true
      await getAccounts()
      clearInterval(timer)
      return
    }

    count++
    if (count > 10) {
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
        <Button v-if="!isMobile" variant="outline" class="h-9">
          <Send class="mr-2 h-4 w-4" />
          发布
        </Button>
      </DialogTrigger>
      <DialogContent class="!w-[750px] !max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>发布</DialogTitle>
          <DialogDescription>
            将文章发布到多个平台
          </DialogDescription>
        </DialogHeader>
        <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-4">
          <Alert>
            <Info class="h-4 w-4" />
            <AlertDescription>
              此功能由 <a href="https://github.com/doocs/cose" target="_blank" class="underline"> GitHub 开源插件 COSE</a> 支持，完全本地运行，不收集、不存储任何用户信息。<br>如需添加更多平台或改善同步准确度，欢迎提 <a href="https://github.com/doocs/cose/issues" target="_blank" class="underline">Issue</a> 或 PR。
            </AlertDescription>
          </Alert>

          <Alert v-if="!extensionInstalled">
            <Info class="h-4 w-4" />
            <AlertTitle>未检测到插件</AlertTitle>
            <AlertDescription>
              请安装 <a href="https://chromewebstore.google.com/detail/ilhikcdphhpjofhlnbojifbihhfmmhfk" target="_blank" class="underline text-primary">cose 文章同步助手</a> 浏览器扩展
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
              平台
            </Label>
            <div class="flex-1 space-y-3">
              <div v-for="category in accountsByCategory" :key="category.name">
                <div class="flex items-center gap-2 mb-2">
                  <div
                    class="flex items-center gap-1 cursor-pointer select-none text-sm font-medium text-muted-foreground hover:text-foreground"
                    @click="toggleCategory(category.name)"
                  >
                    <ChevronDown v-if="!collapsedCategories.has(category.name)" class="h-4 w-4" />
                    <ChevronRight v-else class="h-4 w-4" />
                    <span>{{ category.name }}</span>
                    <span class="text-xs">({{ category.accounts.length }})</span>
                  </div>
                  <div class="flex items-center gap-1 ml-2">
                    <CheckboxRoot
                      :checked="isCategoryAllSelected(category.accounts) ? true : isCategoryIndeterminate(category.accounts) ? 'indeterminate' : false"
                      class="bg-background hover:bg-muted h-[18px] w-[18px] flex shrink-0 appearance-none items-center justify-center border border-gray-300 rounded-[3px] outline-hidden"
                      @click.stop="toggleCategorySelectAll(category.accounts)"
                    >
                      <CheckboxIndicator>
                        <Check v-if="isCategoryAllSelected(category.accounts)" class="h-3 w-3" />
                        <Minus v-else-if="isCategoryIndeterminate(category.accounts)" class="h-3 w-3" />
                      </CheckboxIndicator>
                    </CheckboxRoot>
                    <span class="text-xs text-muted-foreground">全选</span>
                  </div>
                </div>
                <div v-show="!collapsedCategories.has(category.name)" class="grid grid-cols-2 gap-x-8 gap-y-2 pl-5">
                  <div
                    v-for="account in category.accounts"
                    :key="account.uid"
                    class="flex items-center gap-2 whitespace-nowrap"
                  >
                    <CheckboxRoot
                      v-model:checked="account.checked"
                      :disabled="!account.loggedIn"
                      class="bg-background hover:bg-muted h-[18px] w-[18px] flex shrink-0 appearance-none items-center justify-center border border-gray-300 rounded-[3px] outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckboxIndicator>
                        <Check v-if="account.checked" class="h-3 w-3" />
                      </CheckboxIndicator>
                    </CheckboxRoot>
                    <img
                      :src="account.icon"
                      alt=""
                      class="inline-block h-[16px] w-[16px] shrink-0"
                    >
                    <span class="text-sm font-medium">{{ account.title }}</span>
                    <!-- 检测中：显示转圈动画 -->
                    <template v-if="account.isChecking">
                      <Loader2 class="ml-1 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      <span class="text-xs text-muted-foreground">检测中</span>
                    </template>
                    <!-- 已登录：显示头像和用户名 -->
                    <template v-else-if="account.loggedIn">
                      <img
                        v-if="account.avatar"
                        :src="account.avatar"
                        alt=""
                        class="ml-1 h-4 w-4 rounded-full object-cover"
                        referrerpolicy="no-referrer"
                        @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
                      >
                      <span class="text-sm text-muted-foreground">@{{ account.displayName }}</span>
                    </template>
                    <!-- 未登录：显示登录链接 -->
                    <Primitive
                      v-else
                      as="a"
                      :href="getPlatformUrl(account.type)"
                      target="_blank"
                      class="ml-1 text-sm text-muted-foreground hover:underline"
                    >
                      登录
                    </Primitive>
                  </div>
                </div>
              </div>
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
