<script setup lang="ts">
import { UploadCloud } from '@lucide/vue'
import { useLocalizedUploadHostOptions } from '@/composables/useLocalizedUploadHosts'
import { validateImageFile } from '@/lib/upload/validate-image'
import {
  isConfigurableUploadProvider,
  isUploadProviderConfigured,
  UPLOAD_PROVIDERS,
} from '@/services/upload/provider-registry'
import { store } from '@/storage'
import { useUIStore } from '@/stores/ui'
import { UPLOAD_PROVIDER_CONFIG_COMPONENTS } from './upload-providers'

const emit = defineEmits([`uploadImage`])

const { t } = useI18n()

const uiStore = useUIStore()
const { enableImageReupload } = storeToRefs(uiStore)
const { toggleImageReupload } = uiStore

const uploadHostOptions = useLocalizedUploadHostOptions()
const configurableProviders = UPLOAD_PROVIDERS.filter(isConfigurableUploadProvider)

const imgHost = store.reactive(`imgHost`, `default`)
const useCompression = store.reactive(`useCompression`, false)
const activeName = ref(`upload`)

function providerLabel(providerId: string): string {
  return uploadHostOptions.value.find(option => option.value === providerId)?.label ?? providerId
}

function changeImgHost() {
  toast.success(t(`upload.hostSwitched`))
}

function changeCompression() {
}

async function beforeImageUpload(file: File) {
  const checkResult = validateImageFile(file, t)
  if (!checkResult.ok) {
    toast.error(checkResult.msg)
    return false
  }

  const providerId = imgHost.value || `default`
  if (!await isUploadProviderConfigured(providerId)) {
    toast.error(t(`upload.configureHostFirst`, { host: providerLabel(providerId) }))
    return false
  }
  return true
}

const dragover = ref(false)

const { open, reset, onChange } = useFileDialog({
  accept: `image/*`,
})

onChange(async (files) => {
  if (files == null)
    return

  const file = files[0]
  if (await beforeImageUpload(file))
    emitUploads(file)
  reset()
})

async function onDrop(e: DragEvent) {
  dragover.value = false
  e.stopPropagation()
  const file = [...e.dataTransfer!.files][0]
  if (await beforeImageUpload(file))
    emitUploads(file)
}

const isUploading = ref(false)
const imageUrl = ref(``)

function emitUploads(file: File) {
  isUploading.value = true
  const cleanup = (_url: string, data: string) => {
    isUploading.value = false
    if (data) {
      imageUrl.value = `data:image/png;base64,${data}`
      setTimeout(() => {
        imageUrl.value = ``
      }, 1000)
    }
  }
  emit(`uploadImage`, file, cleanup, true)
}

function onTabScroll(e: WheelEvent) {
  if (e.deltaY !== 0) {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.scrollLeft += e.deltaY
  }
}
</script>

<template>
  <Dialog v-model:open="uiStore.isShowUploadImgDialog">
    <DialogContent class="md:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" @pointer-down-outside="ev => ev.preventDefault()">
      <DialogHeader>
        <DialogTitle>{{ t('upload.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('upload.description') }}
        </DialogDescription>
      </DialogHeader>
      <Tabs v-model="activeName" class="w-full md:w-full flex flex-col flex-1 overflow-hidden">
        <TabsList
          class="flex w-full justify-start overflow-x-auto flex-nowrap gap-1 pb-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          @wheel="onTabScroll"
        >
          <TabsTrigger value="upload" class="text-xs md:text-sm whitespace-nowrap">
            {{ t('upload.selectUpload') }}
          </TabsTrigger>
          <TabsTrigger
            v-for="provider in configurableProviders"
            :key="provider.id"
            :value="provider.id"
            class="text-xs md:text-sm whitespace-nowrap"
          >
            {{ providerLabel(provider.id) }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" class="flex-1 overflow-y-auto p-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Select v-model="imgHost" class="my-4" @update:model-value="changeImgHost">
            <SelectTrigger>
              <SelectValue :placeholder="t('upload.selectHostPlaceholder')" />
            </SelectTrigger>
            <SelectContent class="max-h-64 md:max-h-96">
              <SelectItem
                v-for="item in uploadHostOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <div class="space-y-3 my-4">
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">
                {{ t('upload.enableCompression') }}
              </span>
              <Switch
                v-model="useCompression"
                name="UseCompression"
                @update:model-value="changeCompression"
              />
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">
                {{ t('upload.autoReuploadOnPaste') }}
              </span>
              <Switch
                v-model="enableImageReupload"
                name="EnableImageReupload"
                @update:model-value="toggleImageReupload"
              />
            </div>
            <p class="text-xs text-muted-foreground mt-1.5">
              {{ t('upload.autoReuploadMdHint') }}
            </p>
          </div>

          <div
            role="button"
            tabindex="0"
            class="bg-clip-padding mt-4 h-50 relative flex flex-col cursor-pointer items-center justify-evenly border-2 rounded border-dashed transition-colors hover:border-gray-700 hover:bg-gray-400/50 dark:hover:border-gray-200 dark:hover:bg-gray-500/50"
            :class="{
              'border-gray-700 bg-gray-400/50 dark:border-gray-200 dark:bg-gray-500/50': dragover,
            }"
            @click="open()"
            @keydown.enter.prevent="open()"
            @keydown.space.prevent="open()"
            @drop.prevent="onDrop"
            @dragover.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
          >
            <Progress v-if="isUploading" indeterminate class="absolute left-0 right-0 rounded-none" style="top: -24px; height: 2px;" />
            <UploadCloud class="size-16 md:size-20" />
            <p class="text-center text-sm md:text-base px-4">
              {{ t('upload.dragOrClick') }}
              <strong>{{ t('upload.clickToUpload') }}</strong>
            </p>
            <div v-if="imageUrl" class="absolute left-0 right-0 h-full w-full flex items-center justify-center bg-white dark:bg-black">
              <img :src="imageUrl" class="max-h-40 object-contain" :alt="t('common.preview')">
            </div>
          </div>
        </TabsContent>

        <TabsContent
          v-for="provider in configurableProviders"
          :key="provider.id"
          :value="provider.id"
          class="flex-1 flex flex-col overflow-hidden"
        >
          <component :is="UPLOAD_PROVIDER_CONFIG_COMPONENTS[provider.id]" />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
