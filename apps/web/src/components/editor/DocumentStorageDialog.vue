<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import { Field, Form } from 'vee-validate'
import * as yup from 'yup'
import { documentStorage } from '@/utils/documentStorage'
import { store } from '@/utils'
import { usePostStore } from '@/stores/post'

const emit = defineEmits([`close`])
const isOpen = defineModel<boolean>(`open`, { default: false })

const postStore = usePostStore()

// WebDAV 配置
const webdavSchema = toTypedSchema(yup.object({
  url: yup.string().required(`WebDAV 地址不能为空`).url(`请输入有效的 URL`),
  username: yup.string().required(`用户名不能为空`),
  password: yup.string().required(`密码不能为空`),
  path: yup.string().optional(),
}))

const webdavConfig = store.reactive(`webdavDocConfig`, {
  url: ``,
  username: ``,
  password: ``,
  path: `/md-documents`,
})

async function webdavSubmit(formValues: any) {
  Object.assign(webdavConfig.value, formValues)
  toast.success(`WebDAV 配置已保存`)
}

// 腾讯云 COS 配置
const cosSchema = toTypedSchema(yup.object({
  secretId: yup.string().required(`Secret ID 不能为空`),
  secretKey: yup.string().required(`Secret Key 不能为空`),
  bucket: yup.string().required(`Bucket 不能为空`),
  region: yup.string().required(`Region 不能为空`),
  path: yup.string().optional(),
}))

const cosConfig = store.reactive(`cosDocConfig`, {
  secretId: ``,
  secretKey: ``,
  bucket: ``,
  region: ``,
  path: `md-documents`,
})

async function cosSubmit(formValues: any) {
  Object.assign(cosConfig.value, formValues)
  toast.success(`腾讯云 COS 配置已保存`)
}

const options = [
  {
    value: `localStorage`,
    label: `LocalStorage`,
    description: `浏览器本地存储，数据保存在当前浏览器`,
  },
  {
    value: `webdav`,
    label: `WebDAV`,
    description: `支持 WebDAV 协议的云存储服务`,
  },
  {
    value: `cos`,
    label: `腾讯云 COS`,
    description: `腾讯云对象存储服务`,
  },
]

const docStorageType = store.reactive(`docStorageType`, `localStorage`)
const activeName = ref(`settings`)
const isSyncing = ref(false)
const connectionStatus = ref<boolean | null>(null)

async function changeDocStorage() {
  if (isSyncing.value) {
    return
  }

  const newType = docStorageType.value

  // 检查配置
  if (newType !== `localStorage`) {
    const config = await store.get(`${newType}DocConfig`)
    if (!config) {
      toast.error(`请先配置 ${options.find(o => o.value === newType)?.label} 参数`)
      // 回滚选择
      docStorageType.value = documentStorage.getCurrentType()
      return
    }
  }

  // 确认切换
  const confirmed = await new Promise((resolve) => {
    if (window.confirm(`切换存储平台将同步当前数据到新平台，是否继续？`)) {
      resolve(true)
    }
    else {
      resolve(false)
    }
  })

  if (!confirmed) {
    // 回滚选择
    docStorageType.value = documentStorage.getCurrentType()
    return
  }

  isSyncing.value = true

  try {
    // 获取当前文档数据
    const currentDocuments = postStore.posts
    const currentId = postStore.currentPostId

    // 同步到新存储
    await documentStorage.syncToNewStorage(newType, currentDocuments, currentId)

    toast.success(`文档存储已切换并同步`)
  }
  catch (error: any) {
    console.error(`Failed to switch document storage:`, error)
    toast.error(`切换失败: ${error.message}`)
    // 回滚选择
    docStorageType.value = documentStorage.getCurrentType()
  }
  finally {
    isSyncing.value = false
  }
}

async function testConnection() {
  connectionStatus.value = null
  try {
    const result = await documentStorage.checkConnection()
    connectionStatus.value = result
    if (result) {
      toast.success(`连接成功`)
    }
    else {
      toast.error(`连接失败`)
    }
  }
  catch (error: any) {
    connectionStatus.value = false
    toast.error(`连接失败: ${error.message}`)
  }
}

// 手动同步
async function manualSync() {
  if (isSyncing.value) {
    return
  }

  isSyncing.value = true

  try {
    const currentDocuments = postStore.posts
    const currentId = postStore.currentPostId

    // 获取当前所有配置
    const localEngine = new (await import('@/utils/documentStorage')).LocalStorageDocumentEngine()
    const config = await localEngine.getProjectConfig()

    // 同步文档和配置
    await documentStorage.saveDocuments(currentDocuments)
    await documentStorage.saveCurrentDocumentId(currentId)
    
    if (config) {
      await documentStorage.saveProjectConfig(config)
      toast.success(`文档和配置已同步到云端`)
    }
    else {
      toast.success(`文档已同步到云端`)
    }
  }
  catch (error: any) {
    console.error(`Failed to sync documents:`, error)
    toast.error(`同步失败: ${error.message}`)
  }
  finally {
    isSyncing.value = false
  }
}

// 从云端加载
async function loadFromCloud() {
  if (isSyncing.value) {
    return
  }

  const confirmed = await new Promise((resolve) => {
    if (window.confirm(`从云端加载将覆盖本地所有数据（包括文档和配置），是否继续？`)) {
      resolve(true)
    }
    else {
      resolve(false)
    }
  })

  if (!confirmed) {
    return
  }

  isSyncing.value = true

  try {
    const result = await documentStorage.downloadFromRemote()
    console.log('从云端下载的数据:', result)

    if (result.documents.length > 0) {
      // 更新文档
      postStore.posts = result.documents
      if (result.currentId) {
        postStore.currentPostId = result.currentId
      }

      // 更新配置
      if (result.config) {
        console.log('开始应用配置:', result.config)
        const localEngine = new (await import('@/utils/documentStorage')).LocalStorageDocumentEngine()
        await localEngine.saveProjectConfig(result.config)
        console.log('配置已保存到 localStorage')
        
        toast.success(`文档和配置已从云端加载，刷新页面以应用配置`)
      }
      else {
        toast.success(`文档已从云端加载`)
      }
    }
    else {
      toast.warning(`云端暂无数据`)
    }
  }
  catch (error: any) {
    console.error(`Failed to load documents:`, error)
    toast.error(`加载失败: ${error.message}`)
  }
  finally {
    isSyncing.value = false
  }
}

onMounted(async () => {
  // 初始化存储管理器
  await documentStorage.init()
  docStorageType.value = documentStorage.getCurrentType()
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="md:max-w-max max-h-[90vh] overflow-y-auto" @pointer-down-outside="ev => ev.preventDefault()">
      <DialogHeader>
        <DialogTitle>文档存储配置</DialogTitle>
        <DialogDescription>
          配置文档的存储位置,支持本地存储和云端存储
        </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeName" class="w-full md:w-max">
        <TabsList class="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="settings" class="text-xs md:text-sm whitespace-nowrap">
            存储设置
          </TabsTrigger>
          <TabsTrigger value="webdav" class="text-xs md:text-sm whitespace-nowrap">
            WebDAV
          </TabsTrigger>
          <TabsTrigger value="cos" class="text-xs md:text-sm whitespace-nowrap">
            腾讯云 COS
          </TabsTrigger>
          <TabsTrigger value="sync" class="text-xs md:text-sm whitespace-nowrap">
            同步管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" class="space-y-4">
          <div class="space-y-4">
            <Label>
              <span class="my-4 block">
                存储平台
              </span>
              <Select v-model="docStorageType" :disabled="isSyncing" @update:model-value="changeDocStorage">
                <SelectTrigger>
                  <SelectValue placeholder="请选择存储平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="item in options"
                    :key="item.value"
                    :value="item.value"
                  >
                    <div class="flex flex-col">
                      <span class="font-medium">{{ item.label }}</span>
                      <span class="text-xs text-muted-foreground">{{ item.description }}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </Label>

            <Alert v-if="docStorageType === 'localStorage'">
              <AlertDescription>
                当前使用浏览器本地存储，数据仅保存在当前浏览器中。清除浏览器数据会导致文档丢失，建议定期备份或切换到云端存储。
              </AlertDescription>
            </Alert>

            <Alert v-else-if="docStorageType === 'webdav'">
              <AlertDescription>
                使用 WebDAV 存储，数据将保存到您配置的 WebDAV 服务器。支持坚果云、Nextcloud 等服务。
              </AlertDescription>
            </Alert>

            <Alert v-else-if="docStorageType === 'cos'">
              <AlertDescription>
                使用腾讯云 COS 对象存储，数据将保存到云端。需要开通腾讯云 COS 服务并配置访问密钥。
              </AlertDescription>
            </Alert>

            <div v-if="docStorageType !== 'localStorage'" class="flex gap-2">
              <Button @click="testConnection" :disabled="isSyncing">
                测试连接
              </Button>
              <Badge v-if="connectionStatus === true" variant="success">
                连接正常
              </Badge>
              <Badge v-else-if="connectionStatus === false" variant="destructive">
                连接失败
              </Badge>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webdav">
          <Form :validation-schema="webdavSchema" :initial-values="webdavConfig" @submit="webdavSubmit">
            <Field v-slot="{ field, errorMessage }" name="url">
              <FormItem label="WebDAV 地址" required :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  placeholder="如：https://dav.jianguoyun.com/dav/"
                />
              </FormItem>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="username">
              <FormItem label="用户名" required :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  placeholder="WebDAV 用户名"
                />
              </FormItem>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="password">
              <FormItem label="密码" required :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  type="password"
                  placeholder="WebDAV 密码或应用密码"
                />
              </FormItem>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="path">
              <FormItem label="存储路径" :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  placeholder="如：/md-documents，可不填"
                />
              </FormItem>
            </Field>

            <FormItem>
              <Button
                variant="link"
                class="p-0 h-auto text-left whitespace-normal"
                as="a"
                href="https://help.jianguoyun.com/?p=2064"
                target="_blank"
              >
                如何使用坚果云 WebDAV？
              </Button>
            </FormItem>

            <FormItem>
              <Button type="submit">
                保存配置
              </Button>
            </FormItem>
          </Form>
        </TabsContent>

        <TabsContent value="cos">
          <Form :validation-schema="cosSchema" :initial-values="cosConfig" @submit="cosSubmit">
            <Field v-slot="{ field, errorMessage }" name="secretId">
              <FormItem label="SecretId" required :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  placeholder="如：AKIDnQp1w3DOOCSs8F5MDp9tdoocsmdUPonW3"
                />
              </FormItem>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="secretKey">
              <FormItem label="SecretKey" required :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  type="password"
                  placeholder="如：ukLmdtEJ9271f3DOocsMDsCXdS3YlbW0"
                />
              </FormItem>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="bucket">
              <FormItem label="Bucket" required :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  placeholder="如：md-documents-1234567890"
                />
              </FormItem>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="region">
              <FormItem label="Bucket 所在区域" required :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  placeholder="如：ap-guangzhou"
                />
              </FormItem>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="path">
              <FormItem label="存储路径" :error="errorMessage">
                <Input
                  v-bind="field"
                  v-model="field.value"
                  placeholder="如：md-documents，可不填"
                />
              </FormItem>
            </Field>

            <FormItem>
              <Button
                variant="link"
                class="p-0 h-auto text-left whitespace-normal"
                as="a"
                href="https://cloud.tencent.com/document/product/436"
                target="_blank"
              >
                如何使用腾讯云 COS？
              </Button>
            </FormItem>

            <FormItem>
              <Button type="submit">
                保存配置
              </Button>
            </FormItem>
          </Form>
        </TabsContent>

        <TabsContent value="sync" class="space-y-4">
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium mb-2">
                数据同步
              </h3>
              <p class="text-sm text-muted-foreground mb-4">
                手动同步本地数据到云端，或从云端加载数据到本地
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <Button @click="manualSync" :disabled="isSyncing || docStorageType === 'localStorage'">
                <template v-if="isSyncing">
                  同步中...
                </template>
                <template v-else>
                  同步到云端
                </template>
              </Button>

              <Button variant="outline" @click="loadFromCloud" :disabled="isSyncing || docStorageType === 'localStorage'">
                从云端加载
              </Button>
            </div>

            <Alert v-if="docStorageType === 'localStorage'">
              <AlertDescription>
                当前使用本地存储，请先切换到云端存储平台
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertDescription>
                <strong>注意：</strong>从云端加载会覆盖本地所有文档数据，请谨慎操作！
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
