<script setup lang="ts">
import { Check, ExternalLink, Info, Loader2 } from 'lucide-vue-next'
import { useDisplayStore, useStore } from '@/stores'
import { processClipboardContent } from '@/utils'
import { toast } from '@/utils/toast'
import { addMpArticleDraft, getMpCoverMediaId } from '@/utils/wechat-publish'

const store = useStore()
const { output, primaryColor } = storeToRefs(store)
const displayStore = useDisplayStore()

const wechatForm = ref({
  title: ``,
  author: ``,
  digest: ``,
  contentSourceUrl: ``,
  // 封面图链接（用户可见/可输入）
  coverUrl: ``,
  // 内部使用的微信素材ID
  thumbMediaId: ``,
  needOpenComment: 1,
  onlyFansCanComment: 0,
})

const wechatPublishing = ref(false)
const wechatConfigDialogVisible = ref(false)
const wechatSuccessDialogVisible = ref(false)

const mpConfigured = ref(false)
recheckMpConfig()

const disabledBtn = computed(() => {
  const content = output.value || ``
  return wechatPublishing.value || content.trim() === ``
})

const uploadingThumb = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
let coverUrlDebounceTimer: number | undefined

function extractTitleAndDesc() {
  try {
    // 优先从当前选中文章的标题中提取
    const currentPostTitleEl = document.querySelector(`a.bg-primary.text-primary-foreground.shadow-sm span.line-clamp-1`) as HTMLElement | null
    let derivedTitle = currentPostTitleEl?.textContent?.trim() || ``

    // 如果没找到当前文章标题，再从 #output 的 h1-h6 中提取
    if (!derivedTitle) {
      const headingLevels = [1, 2, 3, 4, 5, 6]
      const headingElements = headingLevels.map((level) => {
        return document.querySelector(`#output h${level}`) as HTMLElement | null
      })
      const firstHeading = headingElements.find(el => el)
      derivedTitle = (firstHeading?.textContent || ``).trim()
    }

    const firstParagraph = document.querySelector(`#output p`) as HTMLElement | null
    const derivedDesc = (firstParagraph?.textContent || ``).trim()
    const firstImg = document.querySelector(`#output img`) as HTMLImageElement | null
    const derivedCover = firstImg?.src || ``

    wechatForm.value.title = derivedTitle
    // 限制摘要最多120个字符
    wechatForm.value.digest = derivedDesc.length > 120 ? derivedDesc.substring(0, 120) : derivedDesc
    wechatForm.value.coverUrl = derivedCover
  }
  catch (e) {
    console.warn(`extractTitleAndDesc error`, e)
  }
}

watch(
  () => output.value,
  () => {
    // 当内容变化时，若未手填摘要，则尝试重新生成摘要
    if (!wechatForm.value.digest) {
      extractTitleAndDesc()
    }
  },
  { immediate: false },
)

// 观察 coverUrl 和 mpConfigured.value 为true时，触发上传
watch(
  [() => wechatForm.value.coverUrl, () => mpConfigured.value],
  ([coverUrl, configured], [prevCoverUrl]) => {
    const url = (coverUrl || ``).trim()
    if (!url || !configured)
      return
    if (uploadingThumb.value)
      return

    // 如果封面链接发生变化，清空旧的 thumbMediaId
    if (prevCoverUrl !== coverUrl) {
      wechatForm.value.thumbMediaId = ``
    }

    if (coverUrlDebounceTimer)
      clearTimeout(coverUrlDebounceTimer)
    coverUrlDebounceTimer = window.setTimeout(() => {
      // 若期间用户又清空了或配置失效，跳过
      if (!wechatForm.value.coverUrl?.trim() || !mpConfigured.value)
        return
      uploadThumbIfNeeded().catch(() => {})
    }, 600)
  },
)

function openWechatConfig() {
  const content = output.value || ``
  if (content.trim() === ``) {
    toast.error(`请先填写内容`)
    return
  }
  // 打开弹窗后提示是否缺少配置
  extractTitleAndDesc()
  if (mpConfigured.value) {
    // 预取并上传封面图，获取 thumb_media_id
    uploadThumbIfNeeded().catch((err) => {
      console.warn(`uploadThumbIfNeeded error`, err)
    })
  }
  wechatConfigDialogVisible.value = true
}

function isMpConfigured(): boolean {
  try {
    const mpConfigStr = localStorage.getItem(`mpConfig`)
    const cfg = mpConfigStr ? JSON.parse(mpConfigStr) : null
    return Boolean(cfg?.appID && cfg?.appsecret)
  }
  catch {
    return false
  }
}
function openMpConfigDialog() {
  localStorage.setItem(`imgHost`, `mp`)
  displayStore.toggleShowUploadImgDialog()
}
function recheckMpConfig() {
  mpConfigured.value = isMpConfigured()
  if (mpConfigured.value)
    toast.success(`已检测到公众号图床配置`)
  else
    toast.error(`仍未检测到配置，请完成后再试`)
}

watch(wechatConfigDialogVisible, (open) => {
  if (open) {
    mpConfigured.value = isMpConfigured()
    if (!mpConfigured.value)
      toast.error(`未检测到公众号图床配置，请先完成配置`)
  }
})

async function publishToWechat() {
  wechatPublishing.value = true
  try {
    if (uploadingThumb.value) {
      toast.error(`封面上传中，请稍后再试`)
      return
    }
    if (!wechatForm.value.thumbMediaId) {
      toast.error(`请先提供封面并上传到微信后台`)
      return
    }

    /**
     * 处理HTML内容中的img标签，将wsrv.nl代理链接替换为原始解码后的地址
     * @param html 包含img标签的HTML字符串
     * @returns 处理后的HTML字符串
     */
    function processImageSrc(html: string): string {
    // 正则匹配img标签中的src属性，捕获url=后面的编码内容
      const imgSrcRegex = /(<img[^>]*src=")https:\/\/wsrv\.nl\?url=([^"]*)("[^>]*>)/g

      // 替换匹配的内容：解码url参数值并作为新的src
      return html.replace(imgSrcRegex, (match, prefix, encodedUrl, suffix) => {
        try {
          // 解码URL中的特殊字符（如%3A->:，%2F->/）
          const decodedUrl = decodeURIComponent(encodedUrl)
          // 拼接成新的img标签
          return `${prefix}${decodedUrl}${suffix}`
        }
        catch (e) {
          console.error(`URL解码失败:`, e)
          // 解码失败时保留原始内容
          return match
        }
      })
    }

    const processedContent = await processClipboardContent(primaryColor.value)
    const finalContent = processImageSrc(processedContent)

    const draftContent = {
      title: wechatForm.value.title,
      author: wechatForm.value.author,
      digest: wechatForm.value.digest,
      content_source_url: wechatForm.value.contentSourceUrl || ``,
      thumb_media_id: wechatForm.value.thumbMediaId || ``,
      need_open_comment: wechatForm.value.needOpenComment,
      only_fans_can_comment: wechatForm.value.onlyFansCanComment,
      content: finalContent,
    }

    const result = await addMpArticleDraft(draftContent)
    if (result.media_id) {
      toast.success(`发布成功！`)
      wechatConfigDialogVisible.value = false
      wechatSuccessDialogVisible.value = true
    }
    else {
      toast.error(`发布失败：${result.errmsg}`)
    }
  }
  catch (error) {
    console.error(`发布到微信公众号失败:`, error)
    if (error instanceof Error) {
      if (error.message.includes(`配置`))
        toast.error(error.message)
      else
        toast.error(`发布失败：${error.message}`)
    }
    else {
      toast.error(`发布失败，请检查网络连接`)
    }
  }
  finally {
    wechatPublishing.value = false
  }
}

// 从 #output 提取第一张图片并上传到公众号，返回 media_id
async function uploadThumbIfNeeded(): Promise<string | undefined> {
  try {
    if (wechatForm.value.thumbMediaId)
      return wechatForm.value.thumbMediaId

    const sourceUrl = (wechatForm.value.coverUrl || ``).trim()
    let imgSrc = sourceUrl || (document.querySelector(`#output img`) as HTMLImageElement | null)?.src || ``
    if (!imgSrc)
      return

    // 匹配图片链接，支持本地或者远程的图片格式
    if (!imgSrc.match(/^https?:\/\//) && !imgSrc.match(/^blob:\//)) {
      toast.error(`封面链接格式不正确，请输入正确的图片链接`)
      return
    }

    uploadingThumb.value = true
    // 兼容浏览器插件直接下载微信图片无法成功问题
    if (imgSrc.startsWith(`http://mmbiz.qpic.cn`) || imgSrc.startsWith(`https://mmbiz.qpic.cn`)) {
      imgSrc = `https://wsrv.nl?url=${encodeURIComponent(imgSrc)}`
    }
    const res = await fetch(imgSrc)
    const blob = await res.blob()

    // 使用原文件名或默认名
    const urlObj = new URL(imgSrc, window.location.href)
    const pathname = urlObj.pathname
    const originalName = pathname.split(`/`).pop() || `cover.jpg`
    const file = new File([blob], originalName, { type: blob.type || `image/jpeg` })

    const { media_id, errmsg } = await getMpCoverMediaId(file)

    if (media_id) {
      wechatForm.value.thumbMediaId = media_id
      return media_id as string
    }

    // 若失败，给出提示但不阻断发布（允许用户手动填）
    if (errmsg)
      toast.error(`封面上传失败：${errmsg}`)
  }
  catch (e: any) {
    toast.error(`封面上传失败：${e?.message || e}`)
  }
  finally {
    uploadingThumb.value = false
  }
}

function pickLocalCoverImage() {
  if (uploadingThumb.value)
    return
  fileInputRef.value?.click()
}

async function onLocalCoverFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files.length)
    return
  const file = input.files[0]
  try {
    uploadingThumb.value = true
    const previewUrl = URL.createObjectURL(file)
    wechatForm.value.coverUrl = previewUrl

    const json = await getMpCoverMediaId(file)

    if (json.media_id) {
      wechatForm.value.thumbMediaId = json.media_id
      toast.success(`封面已上传微信后台`)
    }
    else if (json.errmsg) {
      toast.error(`封面上传失败：${json.errmsg}`)
    }
  }
  catch (e: any) {
    toast.error(`封面上传失败：${e?.message || e}`)
  }
  finally {
    uploadingThumb.value = false
    // 重置 input 值以便可重复选择同一文件
    if (input)
      input.value = ``
  }
}
</script>

<template>
  <div>
    <Button
      variant="outline"
      :disabled="disabledBtn"
      @click="openWechatConfig"
    >
      {{ wechatPublishing ? '发布中...' : '发布到公众号' }}
    </Button>

    <Dialog v-model:open="wechatConfigDialogVisible">
      <DialogContent class="z-[200]">
        <DialogHeader>
          <DialogTitle>发布到微信公众号</DialogTitle>
        </DialogHeader>

        <Alert v-if="!mpConfigured">
          <Info class="h-4 w-4" />
          <AlertTitle>需要先配置公众号图床</AlertTitle>
          <AlertDescription>
            请先完成 appID 与 appsecret 的配置。
            <div class="mt-2 flex items-center gap-2">
              <Button size="sm" variant="outline" @click="openMpConfigDialog">
                打开配置
              </Button>
              <Button size="sm" variant="ghost" @click="recheckMpConfig">
                我已配置，重新检测
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div class="w-full flex items-center gap-4">
          <Label for="wechat-title" class="w-16 text-end">
            标题
          </Label>
          <Input id="wechat-title" v-model="wechatForm.title" placeholder="文章标题" />
        </div>

        <div class="w-full flex items-center gap-4">
          <Label for="wechat-author" class="w-16 text-end">
            作者
          </Label>
          <Input id="wechat-author" v-model="wechatForm.author" placeholder="作者名称" />
        </div>

        <div class="w-full flex items-start gap-4">
          <Label for="wechat-digest" class="w-16 text-end">
            摘要
          </Label>
          <div class="flex-1">
            <Textarea
              id="wechat-digest"
              v-model="wechatForm.digest"
              placeholder="文章摘要内容"
              :maxlength="120"
              class="resize-none"
            />
            <div class="text-xs text-muted-foreground mt-1 text-right">
              {{ wechatForm.digest.length }}/120
            </div>
          </div>
        </div>

        <div class="w-full flex items-center gap-4">
          <Label for="wechat-cover" class="w-16 text-end">
            封面链接
          </Label>
          <div class="flex-1 flex items-center gap-2">
            <Input
              id="wechat-cover"
              v-model="wechatForm.coverUrl"
              :disabled="uploadingThumb"
              placeholder="https://..."
            />
            <span class="text-sm text-muted-foreground select-none inline-flex items-center gap-1">
              <Loader2 v-if="uploadingThumb" class="h-4 w-4 animate-spin" />
              <Check v-else-if="wechatForm.thumbMediaId" class="h-4 w-4 text-green-500" />
              <span class="text-xs">
                {{ uploadingThumb ? '自动上传中…' : (wechatForm.thumbMediaId ? '已上传微信后台' : '将自动上传到微信后台') }}
              </span>
            </span>
          </div>
        </div>

        <div v-if="!wechatForm.coverUrl" class="w-full flex items-center gap-4">
          <div class="w-16 text-end" />
          <div class="flex-1 flex items-center gap-2">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onLocalCoverFileChange"
            >
            <Button variant="outline" :disabled="uploadingThumb" @click="pickLocalCoverImage">
              {{ uploadingThumb ? '上传中…' : '上传图片' }}
            </Button>
            <span class="text-xs text-muted-foreground">未提取到封面，请上传本地图片或在上方输入图片地址</span>
          </div>
        </div>

        <div class="w-full flex items-center gap-4">
          <Label for="wechat-url" class="w-18 text-end">
            原文链接
          </Label>
          <Input id="wechat-url" v-model="wechatForm.contentSourceUrl" placeholder="" />
        </div>

        <div class="w-full flex items-center gap-4">
          <Label class="w-16 text-end">
            评论设置
          </Label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2">
              <input v-model="wechatForm.needOpenComment" type="checkbox" :true-value="1" :false-value="0">
              <span class="text-sm">开启评论</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="wechatForm.onlyFansCanComment" type="checkbox" :true-value="1" :false-value="0">
              <span class="text-sm">仅粉丝可评论</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="wechatConfigDialogVisible = false">
            取 消
          </Button>
          <Button :disabled="wechatPublishing || !mpConfigured" @click="publishToWechat">
            {{ wechatPublishing ? '发布中...' : '确 定' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="wechatSuccessDialogVisible">
      <DialogContent class="z-[1000]">
        <DialogHeader>
          <DialogTitle>发布成功</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="text-center">
            <Check class="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p class="text-lg font-medium">
              文章已成功发布到微信公众号
            </p>
            <p class="text-sm text-gray-600 mt-2">
              <a
                href="https://mp.weixin.qq.com"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                打开微信公众号管理后台
                <ExternalLink class="h-4 w-4 opacity-90" />
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
