<script setup lang="ts">
import {
  Copy,
  Download,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  Settings,
  Trash2,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/stores'
import useAIImageConfigStore from '@/stores/AIImageConfig'
import { copyPlain } from '@/utils/clipboard'
import AIImageConfig from './AIImageConfig.vue'

/* ---------- 组件属性 ---------- */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits([`update:open`])

/* ---------- 编辑器引用 ---------- */
const store = useStore()
const { editor } = storeToRefs(store)

/* ---------- 弹窗开关 ---------- */
const dialogVisible = ref(props.open)
watch(() => props.open, val => (dialogVisible.value = val))
watch(dialogVisible, val => emit(`update:open`, val))

/* ---------- 状态管理 ---------- */
const configVisible = ref(false)
const loading = ref(false)
const prompt = ref<string>(``)
const generatedImages = ref<string[]>([])
const imagePrompts = ref<string[]>([]) // 存储每张图片对应的prompt
const abortController = ref<AbortController | null>(null)
const currentImageIndex = ref(0)

/* ---------- AI 配置 ---------- */
const AIImageConfigStore = useAIImageConfigStore()
const { apiKey, endpoint, model, type, size, quality, style } = storeToRefs(AIImageConfigStore)

/* ---------- 初始数据 ---------- */
onMounted(() => {
  const savedImages = localStorage.getItem(`ai_generated_images`)
  const savedPrompts = localStorage.getItem(`ai_image_prompts`)
  if (savedImages) {
    generatedImages.value = JSON.parse(savedImages)
  }
  if (savedPrompts) {
    imagePrompts.value = JSON.parse(savedPrompts)
  }

  // 确保数组长度一致
  const imagesLength = generatedImages.value.length
  const promptsLength = imagePrompts.value.length

  if (imagesLength > promptsLength) {
    // 如果图片多于提示词，用空字符串填充
    imagePrompts.value = [...imagePrompts.value, ...Array.from({ length: imagesLength - promptsLength }, () => ``)]
  }
  else if (promptsLength > imagesLength) {
    // 如果提示词多于图片，截断提示词数组
    imagePrompts.value = imagePrompts.value.slice(0, imagesLength)
  }

  console.log(`📊 数据加载完成，图片数量:`, imagesLength, `提示词数量:`, imagePrompts.value.length)
})

/* ---------- 事件处理 ---------- */
function handleConfigSaved() {
  configVisible.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229)
    return

  if (e.key === `Enter` && e.ctrlKey) {
    e.preventDefault()
    generateImage()
  }
}

/* ---------- 生成图像 ---------- */
async function generateImage() {
  if (!prompt.value.trim() || loading.value)
    return

  loading.value = true
  abortController.value = new AbortController()

  const headers: Record<string, string> = { 'Content-Type': `application/json` }
  if (apiKey.value && type.value !== `default`)
    headers.Authorization = `Bearer ${apiKey.value}`

  try {
    const url = new URL(endpoint.value)
    if (!url.pathname.includes(`/images/`) && !url.pathname.endsWith(`/images/generations`)) {
      url.pathname = url.pathname.replace(/\/?$/, `/images/generations`)
    }

    const payload: any = {
      model: model.value,
      prompt: prompt.value.trim(),
      size: size.value,
      n: 1,
    }

    // 只对 DALL-E 模型添加额外参数
    if (model.value.includes(`dall-e`)) {
      payload.quality = quality.value
      payload.style = style.value
    }

    const res = await window.fetch(url.toString(), {
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

        generatedImages.value.unshift(finalUrl)
        imagePrompts.value.unshift(prompt.value.trim()) // 保存对应的prompt
        currentImageIndex.value = 0

        // 限制存储的图片数量，避免占用过多存储空间
        if (generatedImages.value.length > 20) {
          generatedImages.value = generatedImages.value.slice(0, 20)
          imagePrompts.value = imagePrompts.value.slice(0, 20)
        }

        localStorage.setItem(`ai_generated_images`, JSON.stringify(generatedImages.value))
        localStorage.setItem(`ai_image_prompts`, JSON.stringify(imagePrompts.value))
      }
    }
    else {
      throw new Error(`未收到有效的图像数据`)
    }
  }
  catch (e) {
    if ((e as Error).name === `AbortError`) {
      console.log(`图像生成请求中止`)
    }
    else {
      console.error(`图像生成失败:`, e)
      // 可以在这里添加错误提示
    }
  }
  finally {
    loading.value = false
    abortController.value = null
  }
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
function clearImages() {
  generatedImages.value = []
  imagePrompts.value = []
  currentImageIndex.value = 0
  localStorage.removeItem(`ai_generated_images`)
  localStorage.removeItem(`ai_image_prompts`)
}

/* ---------- 下载图像 ---------- */
async function downloadImage(imageUrl: string, index: number) {
  try {
    const response = await fetch(imageUrl)
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
  }
  catch (error) {
    console.error(`下载图像失败:`, error)
  }
}

/* ---------- 复制图像URL ---------- */
async function copyImageUrl(imageUrl: string) {
  try {
    await copyPlain(imageUrl)
    console.log(`✅ 图片链接已复制到剪贴板`)
    if (typeof toast !== `undefined`) {
      toast.success(`图片链接已复制到剪贴板`)
    }
  }
  catch (error) {
    console.error(`❌ 复制失败:`, error)
    if (typeof toast !== `undefined`) {
      toast.error(`复制失败，请重试`)
    }
  }
}

/* ---------- 重新生成 ---------- */
function regenerateImage() {
  // 使用当前图片对应的prompt
  const currentPrompt = imagePrompts.value[currentImageIndex.value]
  if (currentPrompt) {
    console.log(`🔄 重新生成图像，使用prompt:`, currentPrompt)
    // 临时设置prompt为当前图片的prompt
    const originalPrompt = prompt.value
    prompt.value = currentPrompt
    generateImage()
    // 生成完成后恢复原来的prompt（如果用户正在编辑）
    if (originalPrompt !== currentPrompt) {
      setTimeout(() => {
        prompt.value = originalPrompt
      }, 100)
    }
  }
  else {
    console.warn(`⚠️ 没有找到当前图片的prompt`)
  }
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
  if (!editor.value) {
    console.warn(`编辑器未初始化`)
    return
  }

  try {
    // 获取当前图片对应的prompt
    const imagePrompt = imagePrompts.value[currentImageIndex.value] || ``
    console.log(`🔗 插入图片，使用关联的prompt:`, imagePrompt)

    // 生成简洁的alt文本
    const altText = imagePrompt.trim()
      ? imagePrompt.trim().substring(0, 30).replace(/\n/g, ` `)
      : `AI生成的图像`

    // 生成Markdown图片语法
    const markdownImage = `![${altText}](${imageUrl})`

    // 获取当前光标位置并插入
    const cursor = editor.value.getCursor()
    editor.value.replaceRange(markdownImage, cursor)

    // 将光标移动到插入内容后面
    const newCursor = { line: cursor.line, ch: cursor.ch + markdownImage.length }
    editor.value.setCursor(newCursor)

    // 聚焦编辑器
    editor.value.focus()

    // 关闭弹窗
    dialogVisible.value = false

    console.log(`✅ 图像已成功插入到光标位置`)
  }
  catch (error) {
    console.error(`❌ 插入图像到光标位置失败:`, error)
  }
}

/* ---------- 查看大图 ---------- */
function viewFullImage(imageUrl: string) {
  console.log(`🔍 点击查看大图:`, imageUrl)
  if (!imageUrl) {
    console.error(`❌ 图片URL为空`)
    return
  }

  try {
    // 在新窗口中打开图片
    const newWindow = window.open(imageUrl, `_blank`, `width=800,height=600,scrollbars=yes,resizable=yes`)
    if (!newWindow) {
      console.error(`❌ 无法打开新窗口，可能被浏览器阻止`)
      // 备用方案：在当前标签页打开
      window.open(imageUrl, `_blank`)
    }
  }
  catch (error) {
    console.error(`❌ 打开图片失败:`, error)
  }
}
</script>

<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent
      class="bg-card text-card-foreground flex flex-col w-[95vw] max-h-[90vh] sm:max-h-[85vh] sm:max-w-4xl overflow-y-auto"
      :style="{ height: 'auto' }"
    >
      <!-- ============ 头部 ============ -->
      <DialogHeader class="space-y-1 flex flex-col items-start">
        <div class="space-x-1 flex items-center">
          <DialogTitle>AI 文生图</DialogTitle>

          <Button
            title="配置参数"
            aria-label="配置参数"
            variant="ghost"
            size="icon"
            @click="configVisible = !configVisible"
          >
            <Settings class="h-4 w-4" />
          </Button>

          <Button
            title="清空图像"
            aria-label="清空图像"
            variant="ghost"
            size="icon"
            @click="clearImages"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
        <p class="text-muted-foreground text-sm">
          使用 AI 根据文字描述生成图像
        </p>
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
        <div class="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[300px]">
          <div v-if="loading" class="flex flex-col items-center gap-4">
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
            <p class="text-sm text-muted-foreground">
              正在生成图像...
            </p>
            <Button
              variant="outline"
              size="sm"
              @click="cancelGeneration"
            >
              取消生成
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
                上一张
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
                下一张
              </Button>
            </div>

            <!-- 图像显示 -->
            <div class="flex items-center justify-center p-4">
              <div class="relative group cursor-pointer" @click="viewFullImage(generatedImages[currentImageIndex])">
                <img
                  :src="generatedImages[currentImageIndex]"
                  :alt="`生成的图像 ${currentImageIndex + 1}`"
                  class="max-w-[350px] max-h-[350px] w-auto h-auto object-contain rounded-lg shadow-lg border border-border transition-transform hover:scale-105"
                >
                <!-- 点击查看大图提示 -->
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div class="bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                    点击查看大图
                  </div>
                </div>
              </div>
            </div>

            <!-- 图像信息 -->
            <div class="px-4 py-2 bg-muted/10 rounded space-y-1">
              <p class="text-xs text-muted-foreground text-center">
                尺寸: {{ size }} | 点击图片查看原图或下载
              </p>
              <div class="text-xs text-muted-foreground">
                <span class="font-medium">提示词:</span>
                <span class="ml-1">{{ imagePrompts[currentImageIndex] || '无关联提示词' }}</span>
              </div>
            </div>

            <!-- 图像操作按钮 -->
            <div class="flex flex-wrap justify-center gap-2 p-4 bg-muted/20 border-t border-border rounded-b-lg">
              <Button
                variant="outline"
                size="sm"
                class="flex-shrink-0 bg-background"
                @click="insertImageToCursor(generatedImages[currentImageIndex])"
              >
                <ImageIcon class="h-4 w-4 mr-2" />
                插入
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-shrink-0 bg-background"
                @click="downloadImage(generatedImages[currentImageIndex], currentImageIndex)"
              >
                <Download class="h-4 w-4 mr-2" />
                下载
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-shrink-0 bg-background"
                @click="copyImageUrl(generatedImages[currentImageIndex])"
              >
                <Copy class="h-4 w-4 mr-2" />
                复制链接
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-shrink-0 bg-background"
                @click="regenerateImage"
              >
                <RefreshCcw class="h-4 w-4 mr-2" />
                重新生成
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
            placeholder="描述你想要生成的图像... (Ctrl+Enter 生成)"
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
            :aria-label="loading ? '取消' : '生成'"
            @click="loading ? cancelGeneration() : generateImage()"
          >
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <ImageIcon v-else class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
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
