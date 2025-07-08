<script setup lang="ts">
import { AlertCircle, Check, RefreshCw, X } from 'lucide-vue-next'
import { toBase64 } from '@/utils'
import { fileUpload } from '@/utils/file'
import { extractImageUrls } from '@/utils/imageReplace'

interface ImageItem {
  url: string
  alt: string
  selected: boolean
  status: `pending` | `uploading` | `success` | `error`
  newUrl?: string
  error?: string
  index: number
  customName?: string
}

const store = useStore()

const isOpen = ref(false)
const selectedHost = ref(``)
const isReplacing = ref(false)
const imageItems = ref<ImageItem[]>([])
const convertToWebP = ref(true) // 默认启用WebP转换

// 图床选项列表
const hostOptions = [
  { value: `r2`, label: `Cloudflare R2` },
  { value: `github`, label: `GitHub` },
  { value: `aliOSS`, label: `阿里云 OSS` },
  { value: `txCOS`, label: `腾讯云 COS` },
  { value: `qiniu`, label: `七牛云` },
  { value: `minio`, label: `MinIO` },
  { value: `upyun`, label: `又拍云` },
  { value: `mp`, label: `微信公众号` },
  { value: `cloudinary`, label: `Cloudinary` },
  { value: `telegram`, label: `Telegram` },
  { value: `custom`, label: `自定义上传` },
]

// 检查图床是否已配置
function isHostConfigured(host: string): boolean {
  if (host === `default` || host === `github`) {
    return true
  }
  const config = localStorage.getItem(`${host}Config`)
  return !!config
}

// 获取已配置的图床列表
const configuredHosts = computed(() => {
  return hostOptions.filter(option => isHostConfigured(option.value))
})

// 获取当前使用的图床
const currentHost = computed(() => {
  return localStorage.getItem(`imgHost`) || `r2`
})

// 选中的图片数量
const selectedCount = computed(() => {
  return imageItems.value.filter(item => item.selected).length
})

// 全选/取消全选
const selectAll = computed({
  get: () => imageItems.value.length > 0 && imageItems.value.every(item => item.selected),
  set: (value) => {
    imageItems.value.forEach((item) => {
      item.selected = value
    })
  },
})

/**
 * 将图片转换为WebP格式
 */
function convertBlobToWebP(blob: Blob, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement(`canvas`)
    const ctx = canvas.getContext(`2d`)
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      canvas.toBlob((webpBlob) => {
        if (webpBlob) {
          resolve(webpBlob)
        }
        else {
          reject(new Error(`WebP转换失败`))
        }
      }, `image/webp`, quality)
    }

    img.onerror = () => reject(new Error(`图片加载失败`))
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * 获取文件扩展名
 */
function getFileExtension(url: string): string {
  try {
    // Remove query parameters and hash
    const cleanUrl = url.split(`?`)[0].split(`#`)[0]

    // Extract filename from URL
    const filename = cleanUrl.split(`/`).pop() || ``

    // Check if it has a valid image extension
    const match = filename.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
    if (match) {
      return match[1].toLowerCase()
    }

    // Try to detect from URL patterns
    if (url.includes(`githubusercontent.com`) || url.includes(`github.com`)) {
      return `png` // default for GitHub
    }

    // Default to png if no extension found
    return `png`
  }
  catch {
    return `png`
  }
}

/**
 * 下载并上传单个图片
 */
async function uploadSingleImage(item: ImageItem) {
  item.status = `uploading`
  item.error = undefined

  try {
    // Download image
    const response = await fetch(item.url).catch(() => {
      throw new Error(`下载失败，可能是跨域限制`)
    })

    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`)
    }

    const blob = await response.blob()

    // Create file with proper extension
    const extension = getFileExtension(item.url)
    let processedBlob = blob
    let processedExtension = extension

    // 转换为WebP格式（如果启用）
    if (convertToWebP.value && extension !== `svg`) {
      try {
        processedBlob = await convertBlobToWebP(blob)
        processedExtension = `webp`
      }
      catch (error) {
        console.warn(`WebP转换失败，使用原格式:`, error)
      }
    }

    // Convert to base64
    const base64 = await toBase64(processedBlob)

    // Create file with proper extension
    const finalExtension = processedExtension
    const timestamp = Date.now()
    const filename = item.customName
      ? `${item.customName}.${finalExtension}`
      : `image-${timestamp}.${finalExtension}`

    const file = new File([processedBlob], filename, {
      type: processedExtension === `webp` ? `image/webp` : (blob.type || `image/${finalExtension}`),
    })

    // Upload to new host
    const newUrl = await fileUpload(base64, file)

    if (newUrl) {
      item.status = `success`
      item.newUrl = newUrl
    }
    else {
      throw new Error(`上传失败`)
    }
  }
  catch (error: any) {
    item.status = `error`
    item.error = error.message || `未知错误`
  }
}

/**
 * 重试单个图片
 */
async function retryImage(item: ImageItem) {
  await uploadSingleImage(item)
}

function open() {
  isOpen.value = true
  selectedHost.value = currentHost.value === `default` ? `github` : currentHost.value

  // 获取所有图片
  const currentContent = store.editor?.getValue() || ``
  const images = extractImageUrls(currentContent)

  imageItems.value = images.map((img, index) => ({
    url: img.url,
    alt: img.alt,
    selected: true,
    status: `pending` as const,
    index,
  }))
}

async function handleReplace() {
  if (!selectedHost.value) {
    toast.error(`请选择目标图床`)
    return
  }

  if (selectedCount.value === 0) {
    toast.warning(`请至少选择一张图片`)
    return
  }

  isReplacing.value = true

  // 临时切换图床
  const originalHost = localStorage.getItem(`imgHost`)
  localStorage.setItem(`imgHost`, selectedHost.value)

  try {
    // 批量上传选中的图片
    const selectedImages = imageItems.value.filter(item => item.selected)

    for (const item of selectedImages) {
      await uploadSingleImage(item)
    }

    // 应用成功的替换
    const currentContent = store.editor?.getValue() || ``
    let newContent = currentContent
    const images = extractImageUrls(currentContent)

    // 从后往前替换，保持位置准确
    for (let i = imageItems.value.length - 1; i >= 0; i--) {
      const item = imageItems.value[i]
      if (item.status === `success` && item.newUrl) {
        const originalImg = images[item.index]
        newContent
          = `${newContent.slice(0, originalImg.start)
          }![${originalImg.alt}](${item.newUrl})${
            newContent.slice(originalImg.end)}`
      }
    }

    if (newContent !== currentContent) {
      store.editor?.setValue(newContent)

      const successCount = imageItems.value.filter(i => i.status === `success`).length
      const errorCount = imageItems.value.filter(i => i.status === `error`).length

      if (successCount > 0) {
        toast.success(`成功替换 ${successCount} 张图片`)
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} 张图片上传失败`)
      }
    }
  }
  finally {
    // 恢复原图床设置
    if (originalHost) {
      localStorage.setItem(`imgHost`, originalHost)
    }
    isReplacing.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[90vh] max-w-5xl w-[90vw] overflow-hidden">
      <DialogHeader>
        <DialogTitle>批量替换图片源</DialogTitle>
        <DialogDescription>
          选择要替换的图片和目标图床
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- 目标图床选择 -->
        <div class="flex items-center gap-4">
          <Label class="shrink-0">目标图床：</Label>
          <Select v-model="selectedHost" class="flex-1">
            <SelectTrigger>
              <SelectValue placeholder="选择目标图床" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="host in configuredHosts"
                :key="host.value"
                :value="host.value"
                :disabled="host.value === currentHost"
              >
                {{ host.label }}
                <span v-if="host.value === currentHost" class="text-muted-foreground ml-2 text-xs">
                  (当前使用)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 转换选项 -->
        <div class="flex items-center gap-4">
          <Label class="shrink-0">转换选项：</Label>
          <div class="space-x-2 flex items-center">
            <input
              id="convert-webp"
              v-model="convertToWebP"
              type="checkbox"
              class="rounded"
            >
            <Label for="convert-webp" class="text-sm font-normal">
              转换为WebP格式 (减小文件大小)
            </Label>
          </div>
        </div>

        <!-- 图片列表 -->
        <div class="overflow-hidden border rounded-lg">
          <div class="bg-muted/50 flex items-center justify-between px-4 py-2">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :checked="selectAll"
                class="rounded"
                @change="selectAll = !selectAll"
              >
              <span class="text-sm">
                全选 ({{ selectedCount }}/{{ imageItems.length }})
              </span>
            </div>
          </div>

          <div class="max-h-[500px] overflow-y-auto">
            <div v-if="imageItems.length === 0" class="text-muted-foreground p-8 text-center">
              编辑器中没有找到图片
            </div>

            <div
              v-for="(item, index) in imageItems"
              :key="index"
              class="hover:bg-muted/30 border-b p-4 last:border-b-0"
            >
              <div class="flex items-start gap-3">
                <input
                  v-model="item.selected"
                  type="checkbox"
                  :disabled="item.status === 'uploading'"
                  class="mt-1 flex-shrink-0 rounded"
                >

                <div class="flex-1 overflow-hidden">
                  <div class="mb-1 flex items-center gap-2">
                    <span class="truncate text-sm font-medium">
                      {{ item.alt || `图片 ${index + 1}` }}
                    </span>

                    <!-- 状态图标 -->
                    <div v-if="item.status !== 'pending'" class="flex flex-shrink-0 items-center gap-1">
                      <span v-if="item.status === 'uploading'" class="text-blue-500">
                        <RefreshCw class="animate-spin h-4 w-4" />
                      </span>
                      <span v-else-if="item.status === 'success'" class="text-green-500">
                        <Check class="h-4 w-4" />
                      </span>
                      <span v-else-if="item.status === 'error'" class="text-red-500">
                        <X class="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  <div class="text-muted-foreground line-clamp-1 break-all text-xs" :title="item.url">
                    {{ item.url }}
                  </div>

                  <!-- 自定义文件名输入 -->
                  <div v-if="item.selected" class="mt-2">
                    <Input
                      v-model="item.customName"
                      placeholder="自定义文件名 (可选)"
                      class="h-7 text-xs"
                      :disabled="item.status === 'uploading'"
                    />
                  </div>

                  <!-- 错误信息 -->
                  <div v-if="item.error" class="mt-1 flex items-start gap-1 text-xs text-red-500">
                    <AlertCircle class="mt-0.5 h-3 w-3 flex-shrink-0" />
                    <span class="break-words">{{ item.error }}</span>
                  </div>

                  <!-- 成功信息 -->
                  <div v-if="item.newUrl" class="line-clamp-1 mt-1 break-all text-xs text-green-600" :title="item.newUrl">
                    已上传: {{ item.newUrl }}
                  </div>
                </div>

                <!-- 重试按钮 - 固定在右侧 -->
                <div class="flex-shrink-0">
                  <Button
                    v-if="item.status === 'error'"
                    size="sm"
                    variant="ghost"
                    :disabled="isReplacing"
                    @click="retryImage(item)"
                  >
                    <RefreshCw class="h-4 w-4" />
                  </Button>
                  <!-- 占位，确保对齐 -->
                  <div v-else class="w-10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Alert v-if="configuredHosts.length <= 1">
          <AlertDescription>
            只有一个已配置的图床。请先在上传图片设置中配置更多图床。
          </AlertDescription>
        </Alert>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="isReplacing" @click="isOpen = false">
          取消
        </Button>
        <Button
          :disabled="!selectedHost || selectedCount === 0 || isReplacing"
          @click="handleReplace"
        >
          {{ isReplacing ? '替换中...' : `替换选中的图片 (${selectedCount})` }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
