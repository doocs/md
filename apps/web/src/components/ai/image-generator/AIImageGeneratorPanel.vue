<script setup lang="ts">
import {
  Copy,
  Download,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Settings,
  Trash2,
  X,
} from '@lucide/vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { buildAIHeaders, resolveEndpointUrl } from '@/composables/useAIFetch'
import { prepareModalOverlayFocus } from '@/lib/a11y/dialog-focus'
import { copyPlain } from '@/lib/browser/clipboard'
import { store } from '@/storage'
import useAIImageConfigStore from '@/stores/aiImageConfig'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import AIImageConfig from './AIImageConfig.vue'

/* ---------- 组件属性 ---------- */
const props = defineProps<{ open: boolean }>()

const emit = defineEmits([`update:open`])

const { t } = useI18n()

/** 图片链接有效期：1小时（毫秒） */
const EXPIRY_TIME = 60 * 60 * 1000

/* ---------- 编辑器引用 ---------- */
const editorStore = useEditorStore()
const { editor } = storeToRefs(editorStore)
const uiStore = useUIStore()
const { toggleAIDialog } = uiStore

/* ---------- 弹窗开关 ---------- */
const dialogVisible = ref(props.open)
watch(() => props.open, (val) => {
  dialogVisible.value = val
  // 每次打开面板时检查并清理过期图片
  if (val) {
    cleanExpiredImages()
  }
})
watch(dialogVisible, val => emit(`update:open`, val))

/* ---------- 状态管理 ---------- */
const configVisible = ref(false)
const loading = ref(false)
const prompt = ref<string>(``)
const generatedImages = ref<string[]>([])
const imagePrompts = ref<string[]>([]) // 存储每张图片对应的prompt
const imageTimestamps = ref<number[]>([]) // 存储每张图片的生成时间戳
const abortController = ref<AbortController | null>(null)
const currentImageIndex = ref(0)
const currentTime = ref(Date.now()) // 用于实时显示图片剩余有效期
let timerIntervalId: ReturnType<typeof setInterval> | null = null

/* ---------- AI 配置 ---------- */
const AIImageConfigStore = useAIImageConfigStore()
const { apiKey, endpoint, model, type, size, quality, style } = storeToRefs(AIImageConfigStore)

/* ---------- 过期检查函数 ---------- */
function isImageExpired(timestamp: number): boolean {
  return Date.now() - timestamp > EXPIRY_TIME
}

async function cleanExpiredImages() {
  const images = await store.getJSON<string[]>(`ai_generated_images`, [])
  const timestamps = await store.getJSON<number[]>(`ai_image_timestamps`, [])

  // 没有数据则无需清理
  if (images.length === 0) {
    return
  }

  const prompts = await store.getJSON<string[]>(`ai_image_prompts`, [])

  // 如果没有时间戳数据，说明是旧版本，默认清除所有数据
  if (timestamps.length === 0) {
    generatedImages.value = []
    imagePrompts.value = []
    imageTimestamps.value = []
    await store.remove(`ai_generated_images`)
    await store.remove(`ai_image_prompts`)
    await store.remove(`ai_image_timestamps`)
    return
  }

  // 过滤掉过期的图片
  const validIndices: number[] = []
  timestamps.forEach((timestamp: number, index: number) => {
    if (!isImageExpired(timestamp)) {
      validIndices.push(index)
    }
  })

  const validImages = validIndices.map(i => images[i]).filter(Boolean)
  const validPrompts = validIndices.map(i => prompts[i] || ``).filter((_, index) => validImages[index])
  const validTimestamps = validIndices.map(i => timestamps[i]).filter(Boolean)

  // 更新数据
  generatedImages.value = validImages
  imagePrompts.value = validPrompts
  imageTimestamps.value = validTimestamps

  // 如果有数据被清除，更新存储
  if (validImages.length < images.length) {
    if (validImages.length > 0) {
      await store.setJSON(`ai_generated_images`, validImages)
      await store.setJSON(`ai_image_prompts`, validPrompts)
      await store.setJSON(`ai_image_timestamps`, validTimestamps)
    }
    else {
      await store.remove(`ai_generated_images`)
      await store.remove(`ai_image_prompts`)
      await store.remove(`ai_image_timestamps`)
    }
  }
}

/* ---------- 初始数据 & 定时器 ---------- */
onMounted(async () => {
  // 先进行过期检查和清理
  await cleanExpiredImages()

  // 确保数组长度一致
  const imagesLength = generatedImages.value.length
  const promptsLength = imagePrompts.value.length
  const timestampsLength = imageTimestamps.value.length

  const maxLength = Math.max(imagesLength, promptsLength, timestampsLength)

  if (imagesLength < maxLength) {
    // 如果图片少于其他数组，说明数据不一致，清除所有数据
    generatedImages.value = []
    imagePrompts.value = []
    imageTimestamps.value = []
    await store.remove(`ai_generated_images`)
    await store.remove(`ai_image_prompts`)
    await store.remove(`ai_image_timestamps`)
  }
  else {
    // 补齐较短的数组
    if (promptsLength < imagesLength) {
      imagePrompts.value = [...imagePrompts.value, ...Array.from<string>({ length: imagesLength - promptsLength }).fill(``)]
    }
    if (timestampsLength < imagesLength) {
      imageTimestamps.value = [...imageTimestamps.value, ...Array.from({ length: imagesLength - timestampsLength }, () => Date.now())]
    }
  }

  // 每秒更新当前时间（用于实时显示剩余有效期）
  // 每30秒顺带清理一次已过期的图片
  let tick = 0
  timerIntervalId = setInterval(() => {
    currentTime.value = Date.now()
    tick++
    if (tick % 30 === 0 && generatedImages.value.length > 0) {
      cleanExpiredImages()
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId)
    timerIntervalId = null
  }
})

/* ---------- 事件处理 ---------- */
function handleConfigSaved() {
  configVisible.value = false
}

function switchToChat() {
  // 先关闭当前文生图对话框
  emit(`update:open`, false)
  // 然后打开聊天对话框
  setTimeout(() => {
    toggleAIDialog(true)
  }, 100)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229)
    return

  if (e.key === `Enter` && !e.shiftKey) {
    e.preventDefault()
    generateImage()
  }
}

/* ---------- 生成图像（核心） ---------- */
async function doGenerateImage(promptText: string, clearInput = false) {
  if (!promptText.trim() || loading.value)
    return

  loading.value = true
  abortController.value = new AbortController()

  const headers = buildAIHeaders(apiKey.value, type.value)

  try {
    const url = resolveEndpointUrl(endpoint.value, `image`)

    const payload: any = {
      model: model.value,
      prompt: promptText.trim(),
      size: size.value,
      n: 1,
    }

    // 只对 DALL-E 模型添加额外参数
    if (model.value.includes(`dall-e`)) {
      payload.quality = quality.value
      payload.style = style.value
    }

    const res = await window.fetch(url, {
      method: `POST`,
      headers,
      body: JSON.stringify(payload),
      signal: abortController.value.signal,
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`${res.status}: ${errorText}`)
    }

    const data = await res.json()

    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url || data.data[0].b64_json

      if (imageUrl) {
        // 如果是 base64 格式，转换为 data URL
        const finalUrl = imageUrl.startsWith(`data:`) || imageUrl.startsWith(`http`)
          ? imageUrl
          : `data:image/png;base64,${imageUrl}`

        const currentTimestamp = Date.now()

        generatedImages.value.unshift(finalUrl)
        imagePrompts.value.unshift(promptText.trim()) // 保存对应的prompt
        imageTimestamps.value.unshift(currentTimestamp) // 保存生成时间戳
        currentImageIndex.value = 0

        // 限制存储的图片数量，避免占用过多存储空间
        if (generatedImages.value.length > 20) {
          generatedImages.value = generatedImages.value.slice(0, 20)
          imagePrompts.value = imagePrompts.value.slice(0, 20)
          imageTimestamps.value = imageTimestamps.value.slice(0, 20)
        }

        await store.setJSON(`ai_generated_images`, generatedImages.value)
        await store.setJSON(`ai_image_prompts`, imagePrompts.value)
        await store.setJSON(`ai_image_timestamps`, imageTimestamps.value)

        // 清空输入框
        if (clearInput)
          prompt.value = ``
      }
    }
    else {
      throw new Error(t(`ai.image.noValidData`))
    }
  }
  catch (e) {
    if ((e as Error).name !== `AbortError`) {
      toast.error(t(`ai.image.generateFailed`, { message: (e as Error).message }))
    }
  }
  finally {
    loading.value = false
    abortController.value = null
  }
}

/* ---------- 生成图像 ---------- */
async function generateImage() {
  if (!prompt.value.trim() || loading.value)
    return

  await doGenerateImage(prompt.value, true)
}

/* ---------- 取消生成 ---------- */
function cancelGeneration() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  loading.value = false
}

/* ---------- 清空图像 ---------- */
async function clearImages() {
  generatedImages.value = []
  imagePrompts.value = []
  imageTimestamps.value = []
  currentImageIndex.value = 0
  await store.remove(`ai_generated_images`)
  await store.remove(`ai_image_prompts`)
  await store.remove(`ai_image_timestamps`)
}

/* ---------- 下载图像 ---------- */
async function downloadImage(imageUrl: string, index: number) {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement(`a`)
    a.href = url

    // 生成包含prompt信息的文件名
    const relatedPrompt = imagePrompts.value[index] || ``
    const promptPart = relatedPrompt
      ? relatedPrompt.substring(0, 20).replace(/[^\w\s-]/g, ``).replace(/\s+/g, `-`)
      : `no-prompt`
    a.download = `ai-image-${index + 1}-${promptPart}.png`

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success(t(`ai.image.downloadStarted`))
  }
  catch {
    toast.error(t(`ai.image.downloadFailed`))
  }
}

/* ---------- 复制图像URL ---------- */
async function copyImageUrl(imageUrl: string) {
  try {
    await copyPlain(imageUrl)
    toast.success(t(`common.copiedToClipboard`))
  }
  catch {
    toast.error(t(`ai.image.copyFailed`))
  }
}

/* ---------- 重新生成 ---------- */
function regenerateImage() {
  // 使用当前图片对应的prompt
  const currentPrompt = imagePrompts.value[currentImageIndex.value]
  if (currentPrompt) {
    // 直接使用当前图片的prompt生成，不修改输入框内容
    regenerateWithPrompt(currentPrompt)
  }
  else {
    // No prompt available, silently skip
  }
}

/* ---------- 使用指定prompt重新生成 ---------- */
async function regenerateWithPrompt(promptText: string) {
  await doGenerateImage(promptText)
}

/* ---------- 切换图像 ---------- */
function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function nextImage() {
  if (currentImageIndex.value < generatedImages.value.length - 1) {
    currentImageIndex.value++
  }
}

/* ---------- 插入图像到光标位置 ---------- */
function insertImageToCursor(imageUrl: string) {
  if (!editor.value)
    return

  try {
    // 获取当前图片对应的prompt
    const imagePrompt = imagePrompts.value[currentImageIndex.value] || ``

    // 生成简洁的alt文本
    const altText = imagePrompt.trim()
      ? imagePrompt.trim().substring(0, 30).replace(/\n/g, ` `)
      : t(`ai.image.aiGeneratedAlt`)

    // 生成Markdown图片语法
    const markdownImage = `![${altText}](${imageUrl})`

    // 获取当前光标位置并插入
    const pos = editor.value.state.selection.main.head
    editor.value.dispatch({
      changes: { from: pos, insert: markdownImage },
      selection: { anchor: pos + markdownImage.length },
    })

    // 聚焦编辑器
    editor.value.focus()

    toast.success(t(`ai.image.insertedToEditor`))

    // 关闭弹窗
    dialogVisible.value = false
  }
  catch {
    toast.error(t(`ai.image.insertFailed`))
  }
}

/* ---------- 查看大图 ---------- */
const previewImageUrl = ref('')
const previewOverlayRef = ref<HTMLDivElement | null>(null)

watch(previewImageUrl, async (imageUrl) => {
  if (!imageUrl)
    return

  prepareModalOverlayFocus()
  await nextTick()
  previewOverlayRef.value?.focus()
})

function viewFullImage(imageUrl: string) {
  if (!imageUrl)
    return
  previewImageUrl.value = imageUrl
}

function closePreview() {
  previewImageUrl.value = ''
}

/* ---------- 时间相关函数 ---------- */
function getTimeRemaining(index: number): string {
  if (!imageTimestamps.value[index]) {
    return t(`common.unknown`)
  }

  // EXPIRY_TIME 来自模块顶层常量
  const timestamp = imageTimestamps.value[index]
  const elapsed = currentTime.value - timestamp
  const remaining = EXPIRY_TIME - elapsed

  if (remaining <= 0) {
    return t(`ai.image.expired`)
  }

  const minutes = Math.floor(remaining / (60 * 1000))
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000)

  if (minutes > 0) {
    return t(`ai.image.timeRemaining`, { minutes, seconds })
  }
  else {
    return t(`ai.image.secondsRemaining`, { seconds })
  }
}

function getTimeRemainingClass(index: number): string {
  if (!imageTimestamps.value[index]) {
    return `text-muted-foreground`
  }

  // EXPIRY_TIME 来自模块顶层常量
  const timestamp = imageTimestamps.value[index]
  const elapsed = currentTime.value - timestamp
  const remaining = EXPIRY_TIME - elapsed

  if (remaining <= 0) {
    return `text-red-500 font-medium`
  }
  else if (remaining < 10 * 60 * 1000) { // 少于10分钟
    return `text-orange-500 font-medium`
  }
  else if (remaining < 30 * 60 * 1000) { // 少于30分钟
    return `text-yellow-600`
  }
  else {
    return `text-green-600`
  }
}
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent
      class="bg-card text-card-foreground flex flex-col w-[95vw] max-h-[90vh] sm:max-h-[85vh] sm:max-w-4xl overflow-y-auto"
    >
      <!-- ============ 头部 ============ -->
      <DialogHeader class="space-y-1 flex flex-col items-start">
        <div class="space-x-1 flex items-center">
          <DialogTitle>{{ t('ai.image.title') }}</DialogTitle>

          <Button
            :title="configVisible ? t('ai.image.title') : t('ai.image.configParams')"
            :aria-label="configVisible ? t('ai.image.title') : t('ai.image.configParams')"
            variant="ghost"
            size="icon"
            @click="configVisible = !configVisible"
          >
            <ImageIcon v-if="configVisible" class="h-4 w-4" />
            <Settings v-else class="h-4 w-4" />
          </Button>

          <Button
            :title="t('ai.image.chat')"
            :aria-label="t('ai.image.chat')"
            variant="ghost"
            size="icon"
            @click="switchToChat()"
          >
            <MessageCircle class="h-4 w-4" />
          </Button>

          <Button
            :title="t('ai.image.clearImages')"
            :aria-label="t('ai.image.clearImages')"
            variant="ghost"
            size="icon"
            @click="clearImages"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
        <DialogDescription class="text-muted-foreground text-sm">
          {{ t('ai.image.description') }}
        </DialogDescription>
      </DialogHeader>

      <!-- ============ 参数配置面板 ============ -->
      <div
        v-if="configVisible"
        class="mb-4 w-full border rounded-md p-4 max-h-[60vh] overflow-y-auto flex-shrink-0"
      >
        <AIImageConfig @saved="handleConfigSaved" />
      </div>

      <!-- ============ 图像展示区域 ============ -->
      <div
        v-if="!configVisible && (loading || generatedImages.length > 0)"
        class="flex flex-col space-y-4 flex-shrink-0"
      >
        <!-- 图像显示 -->
        <div class="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[250px] sm:min-h-[300px]">
          <div v-if="loading" class="flex flex-col items-center gap-4">
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
            <p class="text-sm text-muted-foreground">
              {{ t('ai.image.generating') }}
            </p>
            <Button
              variant="outline"
              size="sm"
              @click="cancelGeneration"
            >
              {{ t('ai.image.cancelGeneration') }}
            </Button>
          </div>

          <div v-else-if="generatedImages.length > 0" class="w-full flex flex-col space-y-3">
            <!-- 图像导航 -->
            <div v-if="generatedImages.length > 1" class="flex items-center justify-between p-2 bg-muted/20 rounded">
              <Button
                variant="outline"
                size="sm"
                :disabled="currentImageIndex <= 0"
                @click="previousImage"
              >
                {{ t('ai.image.previous') }}
              </Button>
              <span class="text-sm text-muted-foreground">
                {{ currentImageIndex + 1 }} / {{ generatedImages.length }}
              </span>
              <Button
                variant="outline"
                size="sm"
                :disabled="currentImageIndex >= generatedImages.length - 1"
                @click="nextImage"
              >
                {{ t('ai.image.next') }}
              </Button>
            </div>

            <!-- 图像显示 -->
            <div class="flex items-center justify-center p-2 sm:p-4">
              <div class="relative group cursor-pointer max-w-lg inline-flex justify-center" @click="viewFullImage(generatedImages[currentImageIndex])">
                <img
                  :src="generatedImages[currentImageIndex]"
                  :alt="t('ai.image.generatedImageAlt', { n: currentImageIndex + 1 })"
                  class="max-w-full h-[300px] object-contain rounded-lg shadow-lg border border-border transition-transform hover:scale-105"
                >
                <!-- 点击查看大图提示 -->
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div class="bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                    {{ t('ai.image.clickToViewLarge') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 图像信息 -->
            <div class="px-2 sm:px-4 py-2 bg-muted/10 rounded space-y-1">
              <p class="text-xs text-muted-foreground text-center">
                {{ t('ai.image.size') }}: {{ size }}
              </p>
              <!-- 提示词 -->
              <div class="text-xs text-muted-foreground break-words text-center">
                <span class="font-medium">{{ t('ai.image.prompt') }}:</span>
                <span class="ml-1">{{ imagePrompts[currentImageIndex] || t('ai.image.noPrompt') }}</span>
              </div>
              <div class="text-xs text-muted-foreground text-center">
                <span class="font-medium">{{ t('ai.image.remainingValidity') }}:</span>
                <span class="ml-1" :class="getTimeRemainingClass(currentImageIndex)">
                  {{ getTimeRemaining(currentImageIndex) }}
                </span>
                <span class="font-medium">{{ t('ai.image.downloadReminder') }}</span>
              </div>
            </div>

            <!-- 图像操作按钮 -->
            <div class="flex flex-wrap justify-center gap-2 p-2 sm:p-4 bg-muted/20 border-t border-border rounded-b-lg">
              <Button
                variant="outline"
                size="sm"
                class="flex-shrink-0 bg-background text-xs sm:text-sm"
                @click="insertImageToCursor(generatedImages[currentImageIndex])"
              >
                <ImageIcon class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {{ t('common.insert') }}
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-shrink-0 bg-background text-xs sm:text-sm"
                @click="downloadImage(generatedImages[currentImageIndex], currentImageIndex)"
              >
                <Download class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {{ t('common.download') }}
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-shrink-0 bg-background text-xs sm:text-sm"
                @click="copyImageUrl(generatedImages[currentImageIndex])"
              >
                <Copy class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {{ t('common.copy') }}
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-shrink-0 bg-background text-xs sm:text-sm"
                @click="regenerateImage"
              >
                <RefreshCcw class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {{ t('ai.image.regenerate') }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 输入框 ============ -->
      <div v-if="!configVisible" class="relative flex-shrink-0 mt-auto">
        <div
          class="bg-background border-border flex flex-col items-baseline gap-2 border rounded-xl px-3 py-2 pr-12 shadow-inner"
        >
          <Textarea
            v-model="prompt"
            :placeholder="t('ai.image.inputPlaceholder')"
            rows="2"
            class="custom-scroll min-h-16 w-full resize-none border-none bg-transparent p-0 focus-visible:outline-hidden focus:outline-hidden focus-visible:ring-0 focus:ring-0 focus-visible:ring-offset-0 focus:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent"
            @keydown="handleKeydown"
          />

          <!-- 生成按钮 -->
          <Button
            :disabled="!prompt.trim() && !loading"
            size="icon"
            :class="[
              // eslint-disable-next-line vue/prefer-separate-static-class
              'absolute bottom-3 right-3 rounded-full disabled:opacity-40',
              // eslint-disable-next-line vue/prefer-separate-static-class
              'bg-primary hover:bg-primary/90 text-primary-foreground',
            ]"
            :aria-label="loading ? t('common.cancel') : t('ai.image.generate')"
            @click="loading ? cancelGeneration() : generateImage()"
          >
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <ImageIcon v-else class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- ============ 图片预览遮罩 ============ -->
  <Teleport to="body">
    <div
      v-if="previewImageUrl"
      ref="previewOverlayRef"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-label="t('ai.image.preview')"
      class="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center"
      @click.self="closePreview"
      @click.stop
      @pointerdown.stop
      @keydown.escape.stop="closePreview"
    >
      <Button
        variant="ghost"
        size="icon"
        :aria-label="t('ai.image.closePreview')"
        :title="t('ai.image.closePreview')"
        class="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        @click.stop="closePreview"
      >
        <X class="h-6 w-6" />
      </Button>
      <img
        :src="previewImageUrl"
        :alt="t('ai.image.previewLarge')"
        class="max-w-[95vw] max-h-[95vh] object-contain"
        @click.stop="closePreview"
      >
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
@media (pointer: coarse) {
  /* 触屏设备更细 */
  .custom-scroll::-webkit-scrollbar {
    width: 3px;
  }
}

.custom-scroll::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background-color: rgba(156, 163, 175, 0.4);
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}

html.dark .custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(107, 114, 128, 0.4);
}

html.dark .custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7);
}

.custom-scroll {
  scrollbar-width: thin;
}
</style>
