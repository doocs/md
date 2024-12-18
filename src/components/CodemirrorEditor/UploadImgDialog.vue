<script setup lang="ts">
import CustomUploadForm from '@/components/CustomUploadForm.vue'
import FormItem from '@/components/FormItem.vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDisplayStore } from '@/stores'
import { checkImage } from '@/utils'
import { useFileDialog } from '@vueuse/core'
import { UploadCloud } from 'lucide-vue-next'
import { onBeforeMount, ref } from 'vue'
import { toast } from 'vue-sonner'

const emit = defineEmits([`uploadImage`])

const displayStore = useDisplayStore()

const formGitHub = ref({
  repo: ``,
  branch: ``,
  accessToken: ``,
})

// const formGitee = ref({
//   repo: ``,
//   branch: ``,
//   accessToken: ``,
// })

const formAliOSS = ref({
  accessKeyId: ``,
  accessKeySecret: ``,
  bucket: ``,
  region: ``,
  path: ``,
  cdnHost: ``,
  useSSL: true,
})

const formTxCOS = ref({
  secretId: ``,
  secretKey: ``,
  bucket: ``,
  region: ``,
  path: ``,
  cdnHost: ``,
})

const formQiniu = ref({
  accessKey: ``,
  secretKey: ``,
  bucket: ``,
  domain: ``,
  region: ``,
  path: ``,
})

const minioOSS = ref({
  endpoint: ``,
  port: ``,
  useSSL: true,
  bucket: ``,
  accessKey: ``,
  secretKey: ``,
})

const formMp = ref({
  proxyOrigin: ``,
  appID: ``,
  appsecret: ``,
})
const isWebsite = ref(window.location.href.startsWith(`http`))

const options = [
  {
    value: `default`,
    label: `默认`,
  },
  // {
  //   value: `gitee`,
  //   label: `Gitee`,
  // },
  {
    value: `github`,
    label: `GitHub`,
  },
  {
    value: `aliOSS`,
    label: `阿里云`,
  },
  {
    value: `txCOS`,
    label: `腾讯云`,
  },
  {
    value: `qiniu`,
    label: `七牛云`,
  },
  {
    value: `minio`,
    label: `MinIO`,
  },
  {
    value: `mp`,
    label: `公众号图床`,
  },
  {
    value: `formCustom`,
    label: `自定义代码`,
  },
]

const imgHost = ref(`default`)

const activeName = ref(`upload`)

onBeforeMount(() => {
  if (localStorage.getItem(`githubConfig`)) {
    formGitHub.value = JSON.parse(localStorage.getItem(`githubConfig`)!)
  }
  // if (localStorage.getItem(`giteeConfig`)) {
  //   formGitee.value = JSON.parse(localStorage.getItem(`giteeConfig`)!)
  // }
  if (localStorage.getItem(`aliOSSConfig`)) {
    formAliOSS.value = JSON.parse(localStorage.getItem(`aliOSSConfig`)!)
  }
  if (localStorage.getItem(`txCOSConfig`)) {
    formTxCOS.value = JSON.parse(localStorage.getItem(`txCOSConfig`)!)
  }
  if (localStorage.getItem(`qiniuConfig`)) {
    formQiniu.value = JSON.parse(localStorage.getItem(`qiniuConfig`)!)
  }
  if (localStorage.getItem(`minioConfig`)) {
    minioOSS.value = JSON.parse(localStorage.getItem(`minioConfig`)!)
  }
  if (localStorage.getItem(`imgHost`)) {
    imgHost.value = localStorage.getItem(`imgHost`)!
  }
  if (localStorage.getItem(`mpConfig`)) {
    formMp.value = JSON.parse(localStorage.getItem(`mpConfig`)!)
  }
})

function changeImgHost() {
  localStorage.setItem(`imgHost`, imgHost.value)
  toast.success(`已成功切换图床`)
}

function saveGitHubConfiguration() {
  if (!(formGitHub.value.repo && formGitHub.value.accessToken)) {
    const blankElement = formGitHub.value.repo ? `token` : `GitHub 仓库`
    toast.error(`参数「${blankElement}」不能为空`)
    return
  }

  localStorage.setItem(`githubConfig`, JSON.stringify(formGitHub.value))
  toast.success(`保存成功`)
}

// const saveGiteeConfiguration = () => {
//   if (!(formGitee.value.repo && formGitee.value.accessToken)) {
//     const blankElement = formGitee.value.repo ? `私人令牌` : `Gitee 仓库`
//     toast.error(`参数「${blankElement}」不能为空`)
//     return
//   }
//   localStorage.setItem(`giteeConfig`, JSON.stringify(formGitee.value))
//   toast.success(`保存成功`)
// }

function saveAliOSSConfiguration() {
  if (
    !(
      formAliOSS.value.accessKeyId
      && formAliOSS.value.accessKeySecret
      && formAliOSS.value.bucket
      && formAliOSS.value.region
    )
  ) {
    toast.error(`阿里云 OSS 参数配置不全`)
    return
  }
  localStorage.setItem(`aliOSSConfig`, JSON.stringify(formAliOSS.value))
  toast.success(`保存成功`)
}
function saveMinioOSSConfiguration() {
  if (
    !(
      minioOSS.value.endpoint
      && minioOSS.value.bucket
      && minioOSS.value.accessKey
      && minioOSS.value.secretKey
    )
  ) {
    toast.error(`MinIO 参数配置不全`)
    return
  }
  localStorage.setItem(`minioConfig`, JSON.stringify(minioOSS.value))
  toast.success(`保存成功`)
}
function saveTxCOSConfiguration() {
  if (
    !(
      formTxCOS.value.secretId
      && formTxCOS.value.secretKey
      && formTxCOS.value.bucket
      && formTxCOS.value.region
    )
  ) {
    toast.error(`腾讯云 COS 参数配置不全`)
    return
  }
  localStorage.setItem(`txCOSConfig`, JSON.stringify(formTxCOS.value))
  toast.success(`保存成功`)
}
function saveQiniuConfiguration() {
  if (
    !(
      formQiniu.value.accessKey
      && formQiniu.value.secretKey
      && formQiniu.value.bucket
      && formQiniu.value.domain
    )
  ) {
    toast.error(`七牛云 Kodo 参数配置不全`)
    return
  }
  localStorage.setItem(`qiniuConfig`, JSON.stringify(formQiniu.value))
  toast.success(`保存成功`)
}

function saveMpConfiguration() {
  if (
    !(
      formMp.value.appID
      && formMp.value.appsecret
    )
  ) {
    toast.error(`公众号图床 参数配置不全`)
    return
  }
  if (isWebsite.value && !formMp.value.proxyOrigin) {
    toast.error(`代理域名必须配置`)
    return
  }
  localStorage.setItem(`mpConfig`, JSON.stringify(formMp.value))
  toast.success(`保存成功`)
}

function beforeImageUpload(file: File) {
  // check image
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    toast.error(checkResult.msg || ``)
    return false
  }
  // check image host
  let imgHost = localStorage.getItem(`imgHost`)
  imgHost = imgHost || `default`
  localStorage.setItem(`imgHost`, imgHost)

  const config = localStorage.getItem(`${imgHost}Config`)
  const isValidHost = imgHost === `default` || config
  if (!isValidHost) {
    toast.error(`请先配置 ${imgHost} 图床参数`)
    return false
  }
  return true
}

const dragover = ref(false)

const { open, onChange } = useFileDialog({
  accept: `image/*`,
})

onChange((files) => {
  if (files == null) {
    return
  }

  const file = files[0]

  beforeImageUpload(file) && emit(`uploadImage`, file)
})

function onDrop(e: DragEvent) {
  dragover.value = false
  e.stopPropagation()
  const file = Array.from(e.dataTransfer!.files)[0]
  beforeImageUpload(file) && emit(`uploadImage`, file)
}
</script>

<template>
  <Dialog v-model:open="displayStore.isShowUploadImgDialog">
    <DialogContent class="max-w-max">
      <DialogHeader>
        <DialogTitle>本地上传</DialogTitle>
      </DialogHeader>
      <Tabs v-model="activeName" class="w-max">
        <TabsList>
          <TabsTrigger value="upload">
            选择上传
          </TabsTrigger>
          <!-- <TabsTrigger value="gitee">
            Gitee 图床
          </TabsTrigger> -->
          <TabsTrigger value="github">
            GitHub 图床
          </TabsTrigger>
          <TabsTrigger value="aliOSS">
            阿里云 OSS
          </TabsTrigger>
          <TabsTrigger value="txCOS">
            腾讯云 COS
          </TabsTrigger>
          <TabsTrigger value="qiniu">
            七牛云 Kodo
          </TabsTrigger>
          <TabsTrigger value="minio">
            MinIO
          </TabsTrigger>
          <TabsTrigger value="mp">
            公众号图床
          </TabsTrigger>
          <TabsTrigger value="formCustom">
            自定义代码
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Label>
            <span class="my-4 block">
              图床
            </span>
            <Select v-model="imgHost" @update:model-value="changeImgHost">
              <SelectTrigger>
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Label>
          <div
            class="bg-clip-padding mt-4 h-50 flex flex-col cursor-pointer items-center justify-evenly border-2 rounded border-dashed transition-colors hover:border-gray-700 hover:bg-gray-400/50 dark:hover:border-gray-200 dark:hover:bg-gray-500/50"
            :class="{
              'border-gray-700 bg-gray-400/50 dark:border-gray-200 dark:bg-gray-500/50': dragover,
            }"
            @click="open()"
            @drop.prevent="onDrop"
            @dragover.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
          >
            <UploadCloud class="size-20" />
            <p>
              将图片拖到此处，或
              <strong>点击上传</strong>
            </p>
          </div>
        </TabsContent>
        <!--        <TabsContent value="gitee">
          <div class="space-y-4">
            <FormItem label="Gitee 仓库" required>
              <Input
                v-model.trim="formGitee.repo"
                placeholder="如：gitee.com/yanglbme/resource"
              />
            </FormItem>
            <FormItem label="分支">
              <Input
                v-model.trim="formGitee.branch"
                placeholder="如：release，可不填，默认 master"
              />
            </FormItem>
            <FormItem label="私人令牌" required>
              <Input
                v-model.trim="formGitee.accessToken"
                type="password"
                placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"
              />
            </FormItem>
            <FormItem>
              <Button
                variant="link"
                class="p-0"
                as="a"
                href="https://gitee.com/profile/personal_access_tokens"
                target="_blank"
              >
                请在 Gitee「设置->安全设置->私人令牌」中生成
              </Button>
            </FormItem>
            <FormItem>
              <Button @click="saveGiteeConfiguration">
                保存配置
              </Button>
            </FormItem>
          </div>
        </TabsContent> -->
        <TabsContent value="github">
          <div class="space-y-4">
            <FormItem label="GitHub 仓库" required>
              <Input
                v-model.trim="formGitHub.repo"
                placeholder="如：github.com/yanglbme/resource"
              />
            </FormItem>
            <FormItem label="分支">
              <Input
                v-model.trim="formGitHub.branch"
                placeholder="如：release，可不填，默认 master"
              />
            </FormItem>
            <FormItem label="Token" required>
              <Input
                v-model.trim="formGitHub.accessToken"
                type="password"
                placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"
              />
            </FormItem>
            <FormItem>
              <Button
                variant="link"
                class="p-0"
                as="a"
                href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
                target="_blank"
              >
                如何获取 GitHub Token？
              </Button>
            </FormItem>
            <FormItem>
              <Button @click="saveGitHubConfiguration">
                保存配置
              </Button>
            </FormItem>
          </div>
        </TabsContent>
        <TabsContent value="aliOSS">
          <div class="space-y-4">
            <FormItem label="AccessKey ID" required>
              <Input
                v-model.trim="formAliOSS.accessKeyId"
                placeholder="如：LTAI4GdoocsmdoxUf13ylbaNHk"
              />
            </FormItem>
            <FormItem label="AccessKey Secret" required>
              <Input
                v-model.trim="formAliOSS.accessKeySecret"
                type="password"
                placeholder="如：cc1d0c142doocs0902bd2d7md4b14da6ylbabc46"
              />
            </FormItem>
            <FormItem label="Bucket" required>
              <Input v-model.trim="formAliOSS.bucket" placeholder="如：doocs" />
            </FormItem>
            <FormItem label="Bucket 所在区域" required>
              <Input
                v-model.trim="formAliOSS.region"
                placeholder="如：oss-cn-shenzhen"
              />
            </FormItem>
            <FormItem label="UseSSL" required>
              <Switch v-model:checked="formAliOSS.useSSL" />
            </FormItem>
            <FormItem label="自定义 CDN 域名">
              <Input
                v-model.trim="formAliOSS.cdnHost"
                placeholder="如：https://imagecdn.alidaodao.com，可不填"
              />
            </FormItem>
            <FormItem label="存储路径">
              <Input
                v-model.trim="formAliOSS.path"
                placeholder="如：img，可不填，默认为根目录"
              />
            </FormItem>
            <FormItem>
              <Button
                variant="link"
                class="p-0"
                as="a"
                href="https://help.aliyun.com/document_detail/31883.html"
                target="_blank"
              >
                如何使用阿里云 OSS？
              </Button>
            </FormItem>
            <FormItem>
              <Button @click="saveAliOSSConfiguration">
                保存配置
              </Button>
            </FormItem>
          </div>
        </TabsContent>
        <TabsContent value="txCOS">
          <div class="space-y-4">
            <FormItem label="SecretId" required>
              <Input
                v-model.trim="formTxCOS.secretId"
                placeholder="如：AKIDnQp1w3DOOCSs8F5MDp9tdoocsmdUPonW3"
              />
            </FormItem>
            <FormItem label="SecretKey" required>
              <Input
                v-model.trim="formTxCOS.secretKey"
                type="password"
                placeholder="如：ukLmdtEJ9271f3DOocsMDsCXdS3YlbW0"
              />
            </FormItem>
            <FormItem label="Bucket" required>
              <Input
                v-model.trim="formTxCOS.bucket"
                placeholder="如：doocs-3212520134"
              />
            </FormItem>
            <FormItem label="Bucket 所在区域" required>
              <Input v-model.trim="formTxCOS.region" placeholder="如：ap-guangzhou" />
            </FormItem>
            <FormItem label="自定义 CDN 域名">
              <Input
                v-model.trim="formTxCOS.cdnHost"
                placeholder="如：https://imagecdn.alidaodao.com，可不填"
              />
            </FormItem>
            <FormItem label="存储路径">
              <Input
                v-model.trim="formTxCOS.path"
                placeholder="如：img，可不填，默认根目录"
              />
            </FormItem>
            <FormItem>
              <Button
                variant="link"
                class="p-0"
                as="a"
                href="https://cloud.tencent.com/document/product/436/38484"
                target="_blank"
              >
                如何使用腾讯云 COS？
              </Button>
            </FormItem>
            <FormItem>
              <Button @click="saveTxCOSConfiguration">
                保存配置
              </Button>
            </FormItem>
          </div>
        </TabsContent>
        <TabsContent value="qiniu">
          <div class="space-y-4">
            <FormItem label="AccessKey" required>
              <Input
                v-model.trim="formQiniu.accessKey"
                placeholder="如：6DD3VaLJ_SQgOdoocsyTV_YWaDmdnL2n8EGx7kG"
              />
            </FormItem>
            <FormItem label="SecretKey" required>
              <Input
                v-model.trim="formQiniu.secretKey"
                type="password"
                placeholder="如：qgZa5qrvDOOcsmdKStD1oCjZ9nB7MDvJUs_34SIm"
              />
            </FormItem>
            <FormItem label="Bucket" required>
              <Input v-model.trim="formQiniu.bucket" placeholder="如：md" />
            </FormItem>
            <FormItem label="Bucket 对应域名" required>
              <Input
                v-model.trim="formQiniu.domain"
                placeholder="如：https://images.123ylb.cn"
              />
            </FormItem>
            <FormItem label="存储区域">
              <Input v-model.trim="formQiniu.region" placeholder="如：z2，可不填" />
            </FormItem>
            <FormItem label="存储路径">
              <Input
                v-model.trim="formQiniu.path"
                placeholder="如：img，可不填，默认为根目录"
              />
            </FormItem>
            <FormItem>
              <Button
                variant="link"
                class="p-0"
                as="a"
                href="https://developer.qiniu.com/kodo"
                target="_blank"
              >
                如何使用七牛云 Kodo？
              </Button>
            </FormItem>
            <FormItem>
              <Button @click="saveQiniuConfiguration">
                保存配置
              </Button>
            </FormItem>
          </div>
        </TabsContent>
        <TabsContent value="minio">
          <div class="space-y-4">
            <FormItem label="Endpoint" required>
              <Input v-model.trim="minioOSS.endpoint" placeholder="如：play.min.io" />
            </FormItem>
            <FormItem label="Port">
              <Input
                v-model.trim="minioOSS.port"
                type="number"
                placeholder="如：9000，可不填，http 默认为 80，https 默认为 443"
              />
            </FormItem>
            <FormItem label="UseSSL" required>
              <Switch v-model:checked="minioOSS.useSSL" />
            </FormItem>
            <FormItem label="Bucket" required>
              <Input v-model.trim="minioOSS.bucket" placeholder="如：doocs" />
            </FormItem>
            <FormItem label="AccessKey" required>
              <Input v-model.trim="minioOSS.accessKey" placeholder="如：zhangsan" />
            </FormItem>
            <FormItem label="SecretKey" required>
              <Input v-model.trim="minioOSS.secretKey" placeholder="如：asdasdasd" />
            </FormItem>
            <FormItem>
              <Button
                variant="link"
                class="p-0"
                as="a"
                href="http://docs.minio.org.cn/docs/master/minio-client-complete-guide"
                target="_blank"
              >
                如何使用 MinIO？
              </Button>
            </FormItem>
            <FormItem>
              <Button @click="saveMinioOSSConfiguration">
                保存配置
              </Button>
            </FormItem>
          </div>
        </TabsContent>
        <TabsContent value="mp">
          <div class="space-y-4">
            <FormItem label="代理域名" :required="isWebsite">
              <Input
                v-model.trim="formMp.proxyOrigin"
                placeholder="如：http://proxy.example.com，使用插件时可不填"
              />
            </FormItem>
            <FormItem label="appID" required>
              <Input
                v-model.trim="formMp.appID"
                placeholder="如：wx6e1234567890efa3"
              />
            </FormItem>
            <FormItem label="appsecret" required>
              <Input
                v-model.trim="formMp.appsecret"
                placeholder="如：d9f1abcdef01234567890abcdef82397"
              />
            </FormItem>
            <FormItem>
              <div class="flex flex-col items-start">
                <Button
                  variant="link"
                  class="p-0"
                  as="a"
                  href="https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Getting_Started_Guide.html"
                  target="_blank"
                >
                  如何开启公众号开发者模式并获取应用账号密钥？
                </Button>
                <Button
                  variant="link"
                  class="p-0"
                  as="a"
                  href="https://mpmd.pages.dev/tutorial/"
                  target="_blank"
                >
                  如何在浏览器插件中使用公众号图床？
                </Button>
              </div>
            </FormItem>
            <FormItem>
              <Button @click="saveMpConfiguration">
                保存配置
              </Button>
            </FormItem>
          </div>
        </TabsContent>
        <TabsContent value="formCustom">
          <CustomUploadForm />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<style lang="less" scoped>
</style>
