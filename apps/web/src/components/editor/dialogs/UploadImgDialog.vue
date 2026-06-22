<script setup lang="ts">
import type { GenericObject } from 'vee-validate'
import { UploadCloud } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/yup'
import { Field, Form } from 'vee-validate'
import * as yup from 'yup'
import { useLocalizedUploadHostOptions } from '@/composables/useLocalizedUploadHosts'
import { validateImageFile } from '@/lib/upload/validate-image'
import { store } from '@/storage'
import { useUIStore } from '@/stores/ui'

const emit = defineEmits([`uploadImage`])

const { t } = useI18n()

const uiStore = useUIStore()
const { enableImageReupload } = storeToRefs(uiStore)
const { toggleImageReupload } = uiStore

// github
const githubSchema = computed(() => toTypedSchema(yup.object({
  repo: yup.string().required(t(`upload.validation.githubRepoRequired`)),
  branch: yup.string().optional(),
  accessToken: yup.string().required(t(`upload.validation.githubTokenRequired`)),
  useCDN: yup.boolean().required(),
})))

const githubConfig = store.reactive(`githubConfig`, { repo: ``, branch: ``, accessToken: ``, useCDN: false })

async function githubSubmit(formValues: GenericObject) {
  Object.assign(githubConfig.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// 阿里云
const aliOSSSchema = computed(() => toTypedSchema(yup.object({
  accessKeyId: yup.string().required(t(`upload.validation.accessKeyIdRequired`)),
  accessKeySecret: yup.string().required(t(`upload.validation.accessKeySecretRequired`)),
  bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
  region: yup.string().required(t(`upload.validation.regionRequired`)),
  useSSL: yup.boolean().required(),
  cdnHost: yup.string().optional(),
  path: yup.string().optional(),
})))

const aliOSSConfig = store.reactive(`aliOSSConfig`, {
  accessKeyId: ``,
  accessKeySecret: ``,
  bucket: ``,
  region: ``,
  useSSL: true,
  cdnHost: ``,
  path: ``,
})

async function aliOSSSubmit(formValues: GenericObject) {
  Object.assign(aliOSSConfig.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// 腾讯云
const txCOSSchema = computed(() => toTypedSchema(yup.object({
  secretId: yup.string().required(t(`upload.validation.secretIdRequired`)),
  secretKey: yup.string().required(t(`upload.validation.secretKeyRequired`)),
  bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
  region: yup.string().required(t(`upload.validation.regionRequired`)),
  cdnHost: yup.string().optional(),
  path: yup.string().optional(),
})))

const txCOSConfig = store.reactive(`txCOSConfig`, {
  secretId: ``,
  secretKey: ``,
  bucket: ``,
  region: ``,
  cdnHost: ``,
  path: ``,
})

async function txCOSSubmit(formValues: GenericObject) {
  Object.assign(txCOSConfig.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// 七牛云
const qiniuSchema = computed(() => toTypedSchema(yup.object({
  accessKey: yup.string().required(t(`upload.validation.accessKeyRequired`)),
  secretKey: yup.string().required(t(`upload.validation.secretKeyRequired`)),
  bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
  domain: yup.string().required(t(`upload.validation.domainRequired`)),
  region: yup.string().optional(),
  path: yup.string().optional(),
})))

const qiniuConfig = store.reactive(`qiniuConfig`, {
  accessKey: ``,
  secretKey: ``,
  bucket: ``,
  domain: ``,
  region: ``,
  path: ``,
})

async function qiniuSubmit(formValues: GenericObject) {
  Object.assign(qiniuConfig.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// MinIO
const minioOSSSchema = computed(() => toTypedSchema(yup.object({
  endpoint: yup.string().required(t(`upload.validation.endpointRequired`)),
  port: yup.string().optional(),
  useSSL: yup.boolean().required(),
  bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
  accessKey: yup.string().required(t(`upload.validation.accessKeyRequired`)),
  secretKey: yup.string().required(t(`upload.validation.secretKeyRequired`)),
})))

const minioOSSConfig = store.reactive(`minioConfig`, {
  endpoint: ``,
  port: ``,
  useSSL: true,
  bucket: ``,
  accessKey: ``,
  secretKey: ``,
})

async function minioOSSSubmit(formValues: GenericObject) {
  Object.assign(minioOSSConfig.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// S3
const s3Schema = computed(() => toTypedSchema(yup.object({
  endpoint: yup.string().optional(),
  region: yup.string().required(t(`upload.validation.regionRequired`)),
  bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
  accessKeyId: yup.string().required(t(`upload.validation.accessKeyIdRequired`)),
  accessKeySecret: yup.string().required(t(`upload.validation.secretAccessKeyRequired`)),
  path: yup.string().optional(),
  cdnHost: yup.string().optional(),
  pathStyle: yup.boolean().optional(),
})))

const s3Config = store.reactive(`s3Config`, {
  endpoint: ``,
  region: ``,
  bucket: ``,
  accessKeyId: ``,
  accessKeySecret: ``,
  path: ``,
  cdnHost: ``,
  pathStyle: false,
})

async function s3Submit(formValues: GenericObject) {
  Object.assign(s3Config.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// Telegram 图床
const telegramSchema = computed(() => toTypedSchema(
  yup.object({
    token: yup.string().required(t(`upload.validation.botTokenRequired`)),
    chatId: yup.string().required(t(`upload.validation.chatIdRequired`)),
  }),
))

const telegramConfig = store.reactive(`telegramConfig`, { token: ``, chatId: `` })

async function telegramSubmit(values: GenericObject) {
  Object.assign(telegramConfig.value, values)
  toast.success(t(`common.saveSuccess`))
}

// 公众号
// 当前是否为网页（http/https 协议）
const isWebsite = window.location.protocol.startsWith(`http`)

// Cloudflare Workers 环境
const isCfWorkers = import.meta.env.CF_WORKERS === `1`

// 插件模式运行（如 chrome-extension://）
const isPluginMode = !isWebsite

// 是否需要填写 proxyOrigin（只在 非插件 且 非CF页面 时需要）
const isProxyRequired = computed(() => {
  return !isPluginMode && !isCfWorkers
})

const mpPlaceholder = computed(() => {
  if (isProxyRequired.value) {
    return t(`upload.placeholders.proxyExample`)
  }
  return t(`upload.placeholders.proxyOptional`)
})
const mpSchema = computed(() =>
  toTypedSchema(yup.object({
    proxyOrigin: isProxyRequired.value
      ? yup.string().required(t(`upload.validation.proxyRequired`))
      : yup.string().optional(),
    appID: yup.string().required(t(`upload.validation.appIdRequired`)),
    appsecret: yup.string().required(t(`upload.validation.appSecretRequired`)),
  })),
)

const mpConfig = store.reactive(`mpConfig`, {
  proxyOrigin: ``,
  appID: ``,
  appsecret: ``,
})

async function mpSubmit(formValues: GenericObject) {
  Object.assign(mpConfig.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// Cloudflare R2
const r2Schema = computed(() => toTypedSchema(yup.object({
  accountId: yup.string().required(t(`upload.validation.accountIdRequired`)),
  accessKey: yup.string().required(t(`upload.validation.accessKeyRequired`)),
  secretKey: yup.string().required(t(`upload.validation.secretKeyRequired`)),
  bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
  domain: yup.string().required(t(`upload.validation.domainRequired`)),
  path: yup.string().optional(),
})))

const r2Config = store.reactive(`r2Config`, {
  accountId: ``,
  accessKey: ``,
  secretKey: ``,
  bucket: ``,
  domain: ``,
  path: ``,
})

async function r2Submit(formValues: GenericObject) {
  Object.assign(r2Config.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// 又拍云
const upyunSchema = computed(() => toTypedSchema(
  yup.object({
    bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
    operator: yup.string().required(t(`upload.validation.operatorRequired`)),
    password: yup.string().required(t(`upload.validation.passwordRequired`)),
    domain: yup.string().required(t(`upload.validation.cdnDomainRequired`)),
    path: yup.string().optional(),
  }),
))

const upyunConfig = store.reactive(`upyunConfig`, {
  bucket: ``,
  operator: ``,
  password: ``,
  domain: ``,
  path: ``,
})

async function upyunSubmit(formValues: GenericObject) {
  Object.assign(upyunConfig.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

// Cloudinary
const cloudinarySchema = computed(() => toTypedSchema(
  yup.object({
    cloudName: yup.string().required(t(`upload.validation.cloudNameRequired`)),
    apiKey: yup.string().required(t(`upload.validation.apiKeyRequired`)),
    apiSecret: yup.string().optional(),
    uploadPreset: yup.string().when(`apiSecret`, {
      is: (v: string | undefined) => !v || v.length === 0,
      then: s => s.required(t(`upload.validation.uploadPresetRequired`)),
      otherwise: s => s.optional(),
    }),
    folder: yup.string().optional(),
    domain: yup.string().optional(),
  }),
))

const cloudinaryConfig = store.reactive(`cloudinaryConfig`, {
  cloudName: ``,
  apiKey: ``,
  apiSecret: ``,
  uploadPreset: ``,
  folder: ``,
  domain: ``,
})

async function cloudinarySubmit(formValues: GenericObject) {
  Object.assign(cloudinaryConfig.value, formValues)
  toast.success(t(`common.saveSuccess`))
}

const uploadHostOptions = useLocalizedUploadHostOptions()

const imgHost = store.reactive(`imgHost`, `default`)
const useCompression = store.reactive(`useCompression`, false)
const activeName = ref(`upload`)

async function changeImgHost() {
  toast.success(t(`upload.hostSwitched`))
}

async function changeCompression() {
  // reactive 会自动保存，不需要手动操作
}

async function beforeImageUpload(file: File) {
  const checkResult = validateImageFile(file, t)
  if (!checkResult.ok) {
    toast.error(checkResult.msg)
    return false
  }

  const imgHostValue = imgHost.value || `default`
  const config = await store.get(`${imgHostValue}Config`)
  const isValidHost = imgHostValue === `default` || config
  if (!isValidHost) {
    const hostLabel = uploadHostOptions.value.find(option => option.value === imgHostValue)?.label ?? imgHostValue
    toast.error(t(`upload.configureHostFirst`, { host: hostLabel }))
    return false
  }
  return true
}

const dragover = ref(false)

const { open, reset, onChange } = useFileDialog({
  accept: `image/*`,
})

onChange(async (files) => {
  if (files == null) {
    return
  }

  const file = files[0]

  if (await beforeImageUpload(file)) {
    emitUploads(file)
  }
  reset()
})

async function onDrop(e: DragEvent) {
  dragover.value = false
  e.stopPropagation()
  const file = [...e.dataTransfer!.files][0]
  if (await beforeImageUpload(file)) {
    emitUploads(file)
  }
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
      </DialogHeader>
      <Tabs v-model="activeName" class="w-full md:w-full flex flex-col flex-1 overflow-hidden">
        <TabsList
          class="flex w-full justify-start overflow-x-auto flex-nowrap gap-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          @wheel="onTabScroll"
        >
          <TabsTrigger value="upload" class="text-xs md:text-sm whitespace-nowrap">
            {{ t('upload.selectUpload') }}
          </TabsTrigger>
          <TabsTrigger
            v-for="item in uploadHostOptions.filter(item => item.value !== 'default')"
            :key="item.value"
            :value="item.value"
            class="text-xs md:text-sm whitespace-nowrap"
          >
            {{ item.label }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
            class="bg-clip-padding mt-4 h-50 relative flex flex-col cursor-pointer items-center justify-evenly border-2 rounded border-dashed transition-colors hover:border-gray-700 hover:bg-gray-400/50 dark:hover:border-gray-200 dark:hover:bg-gray-500/50"
            :class="{
              'border-gray-700 bg-gray-400/50 dark:border-gray-200 dark:bg-gray-500/50': dragover,
            }"
            @click="open()"
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
              <img :src="imageUrl" class="max-h-40 object-contain">
            </div>
          </div>
        </TabsContent>

        <TabsContent value="github" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="githubSchema" :initial-values="githubConfig" class="flex flex-col flex-1 overflow-hidden" @submit="githubSubmit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="repo">
                <FormItem :label="t('upload.labels.githubRepo')" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.githubRepo')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="branch">
                <FormItem :label="t('upload.labels.branch')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.branch')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="accessToken">
                <FormItem label="Token" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    type="password"
                    :placeholder="t('upload.placeholders.token')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="useCDN" type="boolean">
                <FormItem :label="t('upload.labels.cdnAccel')" :error="errorMessage">
                  <Switch
                    :model-value="field.value"
                    :name="field.name"
                    @update:model-value="field.onChange"
                    @blur="field.onBlur"
                  />
                </FormItem>
              </Field>

              <FormItem>
                <Button
                  variant="link"
                  class="p-0 h-auto text-left whitespace-normal"
                  as="a"
                  href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
                  target="_blank" rel="noopener noreferrer"
                >
                  {{ t('upload.help.githubToken') }}
                </Button>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="aliOSS" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="aliOSSSchema" :initial-values="aliOSSConfig" class="flex flex-col flex-1 overflow-hidden" @submit="aliOSSSubmit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="accessKeyId">
                <FormItem label="AccessKey ID" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.accessKeyId')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="accessKeySecret">
                <FormItem label="AccessKey Secret" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    type="password"
                    :placeholder="t('upload.placeholders.accessKeySecret')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="bucket">
                <FormItem label="Bucket" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.bucket')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="region">
                <FormItem :label="t('upload.labels.bucketRegion')" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.ossRegion')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="useSSL" type="boolean">
                <FormItem label="UseSSL" required :error="errorMessage">
                  <Switch
                    :model-value="field.value"
                    :name="field.name"
                    @update:model-value="field.onChange"
                    @blur="field.onBlur"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="cdnHost">
                <FormItem :label="t('upload.labels.customCdn')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.cdnHost')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="path">
                <FormItem :label="t('upload.labels.storagePath')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.storagePath')"
                  />
                </FormItem>
              </Field>

              <FormItem>
                <Button
                  variant="link"
                  class="p-0 h-auto text-left whitespace-normal"
                  as="a"
                  href="https://help.aliyun.com/document_detail/31883.html"
                  target="_blank" rel="noopener noreferrer"
                >
                  {{ t('upload.help.aliOSS') }}
                </Button>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="txCOS" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="txCOSSchema" :initial-values="txCOSConfig" class="flex flex-col flex-1 overflow-hidden" @submit="txCOSSubmit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="secretId">
                <FormItem label="SecretId" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.secretId')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="secretKey">
                <FormItem label="SecretKey" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    type="password"
                    :placeholder="t('upload.placeholders.secretKey')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="bucket">
                <FormItem label="Bucket" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.cosBucket')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="region">
                <FormItem :label="t('upload.labels.bucketRegion')" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.cosRegion')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="cdnHost">
                <FormItem :label="t('upload.labels.customCdn')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.cdnHost')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="path">
                <FormItem :label="t('upload.labels.storagePath')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.storagePathRoot')"
                  />
                </FormItem>
              </Field>

              <FormItem>
                <Button
                  variant="link"
                  class="p-0 h-auto text-left whitespace-normal"
                  as="a"
                  href="https://cloud.tencent.com/document/product/436/38484"
                  target="_blank" rel="noopener noreferrer"
                >
                  {{ t('upload.help.txCOS') }}
                </Button>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="qiniu" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="qiniuSchema" :initial-values="qiniuConfig" class="flex flex-col flex-1 overflow-hidden" @submit="qiniuSubmit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="accessKey">
                <FormItem label="AccessKey" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.qiniuAccessKey')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="secretKey">
                <FormItem label="SecretKey" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    type="password"
                    :placeholder="t('upload.placeholders.qiniuSecretKey')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="bucket">
                <FormItem label="Bucket" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.qiniuBucket')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="domain">
                <FormItem :label="t('upload.labels.domain')" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.qiniuDomain')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="region">
                <FormItem :label="t('upload.labels.storageRegion')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.qiniuRegion')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="path">
                <FormItem :label="t('upload.labels.storagePath')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.storagePath')"
                  />
                </FormItem>
              </Field>

              <FormItem>
                <Button
                  variant="link"
                  class="p-0 h-auto text-left whitespace-normal"
                  as="a"
                  href="https://developer.qiniu.com/kodo"
                  target="_blank" rel="noopener noreferrer"
                >
                  {{ t('upload.help.qiniu') }}
                </Button>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="minio" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="minioOSSSchema" :initial-values="minioOSSConfig" class="flex flex-col flex-1 overflow-hidden" @submit="minioOSSSubmit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="endpoint">
                <FormItem label="Endpoint" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.minioEndpoint')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="port">
                <FormItem label="Port" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    type="number"
                    :placeholder="t('upload.placeholders.minioPort')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="useSSL" type="boolean">
                <FormItem label="UseSSL" required :error="errorMessage">
                  <Switch
                    :model-value="field.value"
                    :name="field.name"
                    @update:model-value="field.onChange"
                    @blur="field.onBlur"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="bucket">
                <FormItem label="Bucket" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.bucket')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="accessKey">
                <FormItem label="AccessKey" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.minioAccessKey')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="secretKey">
                <FormItem label="SecretKey" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.minioSecretKey')" />
                </FormItem>
              </Field>

              <FormItem>
                <Button
                  variant="link"
                  class="p-0 h-auto text-left whitespace-normal"
                  as="a"
                  href="http://docs.minio.org.cn/docs/master/minio-client-complete-guide"
                  target="_blank" rel="noopener noreferrer"
                >
                  {{ t('upload.help.minio') }}
                </Button>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="s3" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="s3Schema" :initial-values="s3Config" class="flex flex-col flex-1 overflow-hidden" @submit="s3Submit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="endpoint">
                <FormItem label="Endpoint" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.s3Endpoint')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="region">
                <FormItem label="Region" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.s3Region')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="bucket">
                <FormItem label="Bucket" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.s3Bucket')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="accessKeyId">
                <FormItem label="AccessKey ID" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.s3AccessKeyId')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="accessKeySecret">
                <FormItem label="AccessKey Secret" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    type="password"
                    :placeholder="t('upload.placeholders.s3AccessKeySecret')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="path">
                <FormItem :label="t('upload.labels.storagePath')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.storagePathRoot')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="cdnHost">
                <FormItem :label="t('upload.labels.customDomain')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.customDomain')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="pathStyle" type="boolean">
                <FormItem label="Force Path Style" :error="errorMessage">
                  <Switch
                    :model-value="field.value"
                    :name="field.name"
                    @update:model-value="field.onChange"
                    @blur="field.onBlur"
                  />
                </FormItem>
              </Field>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="mp" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="mpSchema" :initial-values="mpConfig" class="flex flex-col flex-1 overflow-hidden" @submit="mpSubmit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <!-- 只有在需要代理时才显示 proxyOrigin 字段 -->
              <Field
                v-if="isProxyRequired"
                v-slot="{ field, errorMessage }"
                name="proxyOrigin"
              >
                <FormItem :label="t('upload.labels.proxyDomain')" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="mpPlaceholder"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="appID">
                <FormItem label="appID" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.appId')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="appsecret">
                <FormItem label="appsecret" required :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.appSecret')"
                  />
                </FormItem>
              </Field>

              <FormItem>
                <div class="flex flex-col items-start">
                  <Button
                    variant="link"
                    class="p-0 h-auto text-left whitespace-normal"
                    as="a"
                    href="https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Getting_Started_Guide.html"
                    target="_blank" rel="noopener noreferrer"
                  >
                    {{ t('upload.help.mpDevMode') }}
                  </Button>
                  <Button
                    variant="link"
                    class="p-0 h-auto text-left whitespace-normal"
                    as="a"
                    href="https://md-pages.doocs.org/tutorial/"
                    target="_blank" rel="noopener noreferrer"
                  >
                    {{ t('upload.help.mpExtension') }}
                  </Button>
                </div>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="r2" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="r2Schema" :initial-values="r2Config" class="flex flex-col flex-1 overflow-hidden" @submit="r2Submit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="accountId">
                <FormItem label="AccountId" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.accountId')" class="w-full min-w-0 md:min-w-[350px]" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="accessKey">
                <FormItem label="AccessKey" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.r2AccessKey')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="secretKey">
                <FormItem label="SecretKey" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" type="password" :placeholder="t('upload.placeholders.r2SecretKey')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="bucket">
                <FormItem label="Bucket" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.qiniuBucket')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="domain">
                <FormItem :label="t('upload.labels.domain')" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.r2Domain')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="path">
                <FormItem :label="t('upload.labels.storagePath')" :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.storagePath')" />
                </FormItem>
              </Field>

              <FormItem>
                <div class="flex flex-col items-start">
                  <Button
                    variant="link"
                    class="p-0 h-auto text-left whitespace-normal"
                    as="a"
                    href="https://developers.cloudflare.com/r2/api/s3/api/"
                    target="_blank" rel="noopener noreferrer"
                  >
                    {{ t('upload.help.r2S3Api') }}
                  </Button>
                  <Button
                    variant="link"
                    class="p-0 h-auto text-left whitespace-normal"
                    as="a"
                    href="https://developers.cloudflare.com/r2/buckets/cors/"
                    target="_blank" rel="noopener noreferrer"
                  >
                    {{ t('upload.help.r2Cors') }}
                  </Button>
                </div>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="upyun" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="upyunSchema" :initial-values="upyunConfig" class="flex flex-col flex-1 overflow-hidden" @submit="upyunSubmit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="bucket">
                <FormItem label="Bucket" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.upyunBucket')" class="w-full min-w-0 md:min-w-[350px]" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="operator">
                <FormItem :label="t('upload.labels.operator')" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.upyunOperator')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="password">
                <FormItem :label="t('upload.labels.operatorPassword')" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" type="password" :placeholder="t('upload.placeholders.r2SecretKey')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="domain">
                <FormItem :label="t('upload.labels.domain')" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.upyunDomain')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="path">
                <FormItem :label="t('upload.labels.storagePath')" :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.storagePath')" />
                </FormItem>
              </Field>

              <FormItem>
                <Button
                  variant="link"
                  class="p-0 h-auto text-left whitespace-normal"
                  as="a"
                  href="https://help.upyun.com/"
                  target="_blank" rel="noopener noreferrer"
                >
                  {{ t('upload.help.upyun') }}
                </Button>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="telegram" class="flex-1 flex flex-col overflow-hidden">
          <Form :validation-schema="telegramSchema" :initial-values="telegramConfig" class="flex flex-col flex-1 overflow-hidden" @submit="telegramSubmit">
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="token">
                <FormItem label="Bot Token" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.telegramToken')" />
                </FormItem>
              </Field>
              <Field v-slot="{ field, errorMessage }" name="chatId">
                <FormItem label="Chat ID" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.telegramChatId')" />
                </FormItem>
              </Field>
              <FormItem>
                <Button
                  variant="link"
                  class="p-0 h-auto text-left whitespace-normal"
                  as="a"
                  href="https://github.com/doocs/md/blob/main/docs/telegram-usage.md"
                  target="_blank" rel="noopener noreferrer"
                >
                  {{ t('upload.help.telegram') }}
                </Button>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="cloudinary" class="flex-1 flex flex-col overflow-hidden">
          <Form
            :validation-schema="cloudinarySchema"
            :initial-values="cloudinaryConfig"
            class="flex flex-col flex-1 overflow-hidden"
            @submit="cloudinarySubmit"
          >
            <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Field v-slot="{ field, errorMessage }" name="cloudName">
                <FormItem label="Cloud Name" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.cloudName')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="apiKey">
                <FormItem label="API Key" required :error="errorMessage">
                  <Input v-bind="field" v-model="field.value" :placeholder="t('upload.placeholders.apiKey')" />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="apiSecret">
                <FormItem label="API Secret" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    type="password"
                    :placeholder="t('upload.placeholders.apiSecretOptional')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="uploadPreset">
                <FormItem label="Upload Preset" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.uploadPresetUnsigned')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="folder">
                <FormItem label="Folder" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.cloudinaryFolder')"
                  />
                </FormItem>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="domain">
                <FormItem :label="t('upload.labels.customDomainCdn')" :error="errorMessage">
                  <Input
                    v-bind="field"
                    v-model="field.value"
                    :placeholder="t('upload.placeholders.cloudinaryDomain')"
                  />
                </FormItem>
              </Field>

              <FormItem>
                <Button
                  variant="link"
                  class="p-0 h-auto text-left whitespace-normal"
                  as="a"
                  href="https://cloudinary.com/documentation/upload_images"
                  target="_blank" rel="noopener noreferrer"
                >
                  {{ t('upload.help.cloudinary') }}
                </Button>
              </FormItem>
            </div>

            <DialogFooter class="p-1">
              <Button type="submit">
                {{ t('upload.saveConfig') }}
              </Button>
            </DialogFooter>
          </Form>
        </TabsContent>

        <TabsContent value="formCustom" class="flex-1 flex flex-col overflow-hidden">
          <CustomUploadForm />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
