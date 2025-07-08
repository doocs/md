<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { getImageStats, replaceImageSources } from '@/utils/imageReplace'

const emit = defineEmits<{
  close: []
}>()

const store = useStore()

const isOpen = ref(false)
const selectedHost = ref(``)
const isReplacing = ref(false)

// 图片统计信息
const imageStats = ref<{ total: number, byDomain: Map<string, number> }>({ total: 0, byDomain: new Map() })

// 图床选项列表
const hostOptions = [
  { value: `github`, label: `GitHub` },
  { value: `gitee`, label: `Gitee` },
  { value: `aliyun`, label: `阿里云 OSS` },
  { value: `txCOS`, label: `腾讯云 COS` },
  { value: `qiniu`, label: `七牛云` },
  { value: `minio`, label: `MinIO` },
  { value: `cloudflareR2`, label: `Cloudflare R2` },
  { value: `upyun`, label: `又拍云` },
  { value: `wechatMpCDN`, label: `微信公众号` },
  { value: `cloudinary`, label: `Cloudinary` },
  { value: `telegram`, label: `Telegram` },
  { value: `custom`, label: `自定义上传` },
]

// 检查图床是否已配置
function isHostConfigured(host: string): boolean {
  if (host === `default` || host === `github` || host === `gitee`) {
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
  return localStorage.getItem(`imgHost`) || `default`
})

function open() {
  isOpen.value = true
  // 默认选择当前图床
  selectedHost.value = currentHost.value === `default` ? `github` : currentHost.value

  // 获取图片统计信息
  const currentContent = store.editor?.getValue() || ``
  imageStats.value = getImageStats(currentContent)
}

async function handleReplace() {
  if (!selectedHost.value) {
    toast.error(`请选择目标图床`)
    return
  }

  if (selectedHost.value === currentHost.value) {
    toast.warning(`目标图床与当前图床相同`)
    return
  }

  isReplacing.value = true

  try {
    // 临时切换图床
    const originalHost = localStorage.getItem(`imgHost`)
    localStorage.setItem(`imgHost`, selectedHost.value)

    const currentContent = store.editor?.getValue() || ``
    const newContent = await replaceImageSources(currentContent)

    if (newContent !== currentContent) {
      store.editor?.setValue(newContent)
    }

    // 恢复原图床设置
    if (originalHost) {
      localStorage.setItem(`imgHost`, originalHost)
    }

    isOpen.value = false
    emit(`close`)
  }
  catch (error) {
    console.error(`Replace images error:`, error)
    toast.error(`替换图片源失败`)
  }
  finally {
    isReplacing.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>替换图片源</DialogTitle>
        <DialogDescription>
          选择要将图片替换到的目标图床
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- 图片统计信息 -->
        <Alert v-if="imageStats.total > 0">
          <AlertDescription>
            <div class="space-y-1">
              <div>找到 {{ imageStats.total }} 张图片：</div>
              <div v-for="[domain, count] in imageStats.byDomain" :key="domain" class="text-muted-foreground text-sm">
                • {{ domain }}: {{ count }} 张
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Alert v-else>
          <AlertDescription>
            编辑器中没有找到图片
          </AlertDescription>
        </Alert>

        <div class="space-y-2">
          <Label>当前图床</Label>
          <div class="bg-muted rounded-md p-2 text-sm">
            {{ hostOptions.find(h => h.value === currentHost)?.label || '默认图床' }}
          </div>
        </div>

        <div class="space-y-2">
          <Label>目标图床</Label>
          <Select v-model="selectedHost">
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
          :disabled="!selectedHost || selectedHost === currentHost || isReplacing || imageStats.total === 0"
          @click="handleReplace"
        >
          <Check v-if="!isReplacing" class="mr-2 h-4 w-4" />
          {{ isReplacing ? '替换中...' : '开始替换' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
