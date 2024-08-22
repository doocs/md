<script setup>
import { nextTick, onBeforeMount, ref, watch } from 'vue'
import CodeMirror from 'codemirror/lib/codemirror'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

import { checkImage, removeLeft } from '@/utils'
import { useStore } from '@/stores'

const emit = defineEmits([`uploadImage`])

const store = useStore()

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
})

const minioOSS = ref({
  endpoint: ``,
  port: ``,
  useSSL: true,
  bucket: ``,
  accessKey: ``,
  secretKey: ``,
})

const formCustom = ref({
  code:
    localStorage.getItem(`formCustomConfig`)
    || removeLeft(`
  const {file, util, okCb, errCb} = CUSTOM_ARG
  const param = new FormData()
  param.append('file', file)
  util.axios.post('${window.location.origin}/upload', param, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => {
    okCb(res.url)
  }).catch(err => {
    errCb(err)
  })
`).trim(),
  editor: undefined,
})

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
    value: `formCustom`,
    label: `自定义代码`,
  },
]

const imgHost = ref(`default`)

const formCustomElInput = ref(null)
const activeName = ref(`upload`)

watch(activeName, async (val) => {
  if (val === `formCustom`) {
    nextTick(() => {
      const textarea
        = formCustomElInput.value.$el.querySelector(`textarea`)
      formCustom.value.editor
        = formCustom.value.editor
        || CodeMirror.fromTextArea(textarea, {
          mode: `javascript`,
        })
      // formCustom.value.editor.setValue(formCustom.value.code)
    })
  }
}, {
  immediate: true,
})

onBeforeMount(() => {
  if (localStorage.getItem(`githubConfig`)) {
    formGitHub.value = JSON.parse(localStorage.getItem(`githubConfig`))
  }
  // if (localStorage.getItem(`giteeConfig`)) {
  //   formGitee.value = JSON.parse(localStorage.getItem(`giteeConfig`))
  // }
  if (localStorage.getItem(`aliOSSConfig`)) {
    formAliOSS.value = JSON.parse(localStorage.getItem(`aliOSSConfig`))
  }
  if (localStorage.getItem(`txCOSConfig`)) {
    formTxCOS.value = JSON.parse(localStorage.getItem(`txCOSConfig`))
  }
  if (localStorage.getItem(`qiniuConfig`)) {
    formQiniu.value = JSON.parse(localStorage.getItem(`qiniuConfig`))
  }
  if (localStorage.getItem(`minioConfig`)) {
    minioOSS.value = JSON.parse(localStorage.getItem(`minioConfig`))
  }
  if (localStorage.getItem(`imgHost`)) {
    imgHost.value = localStorage.getItem(`imgHost`)
  }
})

function changeImgHost() {
  localStorage.setItem(`imgHost`, imgHost.value)
  ElMessage.success(`已成功切换图床`)
}

function saveGitHubConfiguration() {
  if (!(formGitHub.value.repo && formGitHub.value.accessToken)) {
    const blankElement = formGitHub.value.repo ? `token` : `GitHub 仓库`
    ElMessage.error(`参数「${blankElement}」不能为空`)
    return
  }

  localStorage.setItem(`githubConfig`, JSON.stringify(formGitHub.value))
  ElMessage.success(`保存成功`)
}

// const saveGiteeConfiguration = () => {
//   if (!(formGitee.value.repo && formGitee.value.accessToken)) {
//     const blankElement = formGitee.value.repo ? `私人令牌` : `Gitee 仓库`
//     ElMessage.error(`参数「${blankElement}」不能为空`)
//     return
//   }
//   localStorage.setItem(`giteeConfig`, JSON.stringify(formGitee.value))
//   ElMessage.success(`保存成功`)
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
    ElMessage.error(`阿里云 OSS 参数配置不全`)
    return
  }
  localStorage.setItem(`aliOSSConfig`, JSON.stringify(formAliOSS.value))
  ElMessage.success(`保存成功`)
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
    ElMessage.error(`MinIO 参数配置不全`)
    return
  }
  localStorage.setItem(`minioConfig`, JSON.stringify(minioOSS.value))
  ElMessage.success(`保存成功`)
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
    ElMessage.error(`腾讯云 COS 参数配置不全`)
    return
  }
  localStorage.setItem(`txCOSConfig`, JSON.stringify(formTxCOS.value))
  ElMessage.success(`保存成功`)
}
function saveQiniuConfiguration() {
  if (
    !(
      formQiniu.value.accessKey
      && formQiniu.value.secretKey
      && formQiniu.value.bucket
      && formQiniu.value.domain
      && formQiniu.value.region
    )
  ) {
    ElMessage.error(`七牛云 Kodo 参数配置不全`)
    return
  }
  localStorage.setItem(`qiniuConfig`, JSON.stringify(formQiniu.value))
  ElMessage.success(`保存成功`)
}

function formCustomSave() {
  const str = formCustom.value.editor.getValue()
  localStorage.setItem(`formCustomConfig`, str)
  ElMessage.success(`保存成功`)
}

function beforeImageUpload(file) {
  // check image
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    ElMessage.error(checkResult.msg)
    return false
  }
  // check image host
  let imgHost = localStorage.getItem(`imgHost`)
  imgHost = imgHost || `default`
  localStorage.setItem(`imgHost`, imgHost)

  const config = localStorage.getItem(`${imgHost}Config`)
  const isValidHost = imgHost === `default` || config
  if (!isValidHost) {
    ElMessage.error(`请先配置 ${imgHost} 图床参数`)
    return false
  }
  return true
}

function uploadImage(params) {
  emit(`uploadImage`, params.file)
}
</script>

<template>
  <el-dialog title="本地上传" class="upload__dialog" :model-value="store.isShowUploadImgDialog" @close="store.toggleShowUploadImgDialog(false)">
    <el-tabs v-model="activeName">
      <el-tab-pane class="upload-panel" label="选择上传" name="upload">
        <el-select v-model="imgHost" placeholder="请选择" size="small" @change="changeImgHost">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-upload
          drag multiple action="" :headers="{ 'Content-Type': 'multipart/form-data' }" :show-file-list="false"
          accept=".jpg, .jpeg, .png, .gif" name="file" :before-upload="beforeImageUpload" :http-request="uploadImage"
        >
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            将图片拖到此处，或
            <em>点击上传</em>
          </div>
        </el-upload>
      </el-tab-pane>
      <!-- <el-tab-pane class="github-panel" label="Gitee 图床" name="gitee">
          <el-form
            class="setting-form"
            :model="formGitee"
            label-position="right"
            label-width="150px"
          >
            <el-form-item label="Gitee 仓库" :required="true">
              <el-input
                v-model.trim="formGitee.repo"
                placeholder="如：gitee.com/yanglbme/resource"
              ></el-input>
            </el-form-item>
            <el-form-item label="分支">
              <el-input
                v-model.trim="formGitee.branch"
                placeholder="如：release，可不填，默认 master"
              ></el-input>
            </el-form-item>
            <el-form-item label="私人令牌" :required="true">
              <el-input
                v-model.trim="formGitee.accessToken"
                show-password
                placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"
              ></el-input>
              <el-link
                type="primary"
                href="https://gitee.com/profile/personal_access_tokens"
                target="_blank"
                >请在 Gitee「设置->安全设置->私人令牌」中生成</el-link
              >
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveGiteeConfiguration"
                >保存配置</el-button
              >
            </el-form-item>
          </el-form>
        </el-tab-pane> -->
      <el-tab-pane class="github-panel" label="GitHub 图床" name="github">
        <el-form class="setting-form" :model="formGitHub" label-position="right" label-width="150px">
          <el-form-item label="GitHub 仓库" :required="true">
            <el-input v-model.trim="formGitHub.repo" placeholder="如：github.com/yanglbme/resource" />
          </el-form-item>
          <el-form-item label="分支">
            <el-input v-model.trim="formGitHub.branch" placeholder="如：release，可不填，默认 master" />
          </el-form-item>
          <el-form-item label="Token" :required="true">
            <el-input
              v-model.trim="formGitHub.accessToken" show-password
              placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"
            />
            <el-link
              type="primary"
              href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
              target="_blank"
            >
              如何获取 GitHub Token？
            </el-link>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveGitHubConfiguration">
              保存配置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane class="github-panel" label="阿里云 OSS" name="aliOSS">
        <el-form class="setting-form" :model="formAliOSS" label-position="right" label-width="150px">
          <el-form-item label="AccessKey ID" :required="true">
            <el-input v-model.trim="formAliOSS.accessKeyId" placeholder="如：LTAI4GdoocsmdoxUf13ylbaNHk" />
          </el-form-item>
          <el-form-item label="AccessKey Secret" :required="true">
            <el-input
              v-model.trim="formAliOSS.accessKeySecret" show-password
              placeholder="如：cc1d0c142doocs0902bd2d7md4b14da6ylbabc46"
            />
          </el-form-item>
          <el-form-item label="Bucket" :required="true">
            <el-input v-model.trim="formAliOSS.bucket" placeholder="如：doocs" />
          </el-form-item>
          <el-form-item label="Bucket 所在区域" :required="true">
            <el-input v-model.trim="formAliOSS.region" placeholder="如：oss-cn-shenzhen" />
          </el-form-item>
          <el-form-item label="自定义 CDN 域名" :required="false">
            <el-input v-model.trim="formAliOSS.cdnHost" placeholder="如：https://imagecdn.alidaodao.com，可不填" />
          </el-form-item>
          <el-form-item label="存储路径">
            <el-input v-model.trim="formAliOSS.path" placeholder="如：img，可不填，默认为根目录" />
            <el-link type="primary" href="https://help.aliyun.com/document_detail/31883.html" target="_blank">
              如何使用阿里云 OSS？
            </el-link>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveAliOSSConfiguration">
              保存配置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane class="github-panel" label="腾讯云 COS" name="txCOS">
        <el-form class="setting-form" :model="formTxCOS" label-position="right" label-width="150px">
          <el-form-item label="SecretId" :required="true">
            <el-input v-model.trim="formTxCOS.secretId" placeholder="如：AKIDnQp1w3DOOCSs8F5MDp9tdoocsmdUPonW3" />
          </el-form-item>
          <el-form-item label="SecretKey" :required="true">
            <el-input
              v-model.trim="formTxCOS.secretKey" show-password
              placeholder="如：ukLmdtEJ9271f3DOocsMDsCXdS3YlbW0"
            />
          </el-form-item>
          <el-form-item label="Bucket" :required="true">
            <el-input v-model.trim="formTxCOS.bucket" placeholder="如：doocs-3212520134" />
          </el-form-item>
          <el-form-item label="Bucket 所在区域" :required="true">
            <el-input v-model.trim="formTxCOS.region" placeholder="如：ap-guangzhou" />
          </el-form-item>
          <el-form-item label="自定义 CDN 域名" :required="false">
            <el-input v-model.trim="formTxCOS.cdnHost" placeholder="如：https://imagecdn.alidaodao.com，可不填" />
          </el-form-item>
          <el-form-item label="存储路径">
            <el-input v-model.trim="formTxCOS.path" placeholder="如：img，可不填，默认根目录" />
            <el-link type="primary" href="https://cloud.tencent.com/document/product/436/38484" target="_blank">
              如何使用腾讯云 COS？
            </el-link>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveTxCOSConfiguration">
              保存配置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane class="github-panel" label="七牛云 Kodo" name="qiniu">
        <el-form class="setting-form" :model="formQiniu" label-position="right" label-width="150px">
          <el-form-item label="AccessKey" :required="true">
            <el-input v-model.trim="formQiniu.accessKey" placeholder="如：6DD3VaLJ_SQgOdoocsyTV_YWaDmdnL2n8EGx7kG" />
          </el-form-item>
          <el-form-item label="SecretKey" :required="true">
            <el-input
              v-model.trim="formQiniu.secretKey" show-password
              placeholder="如：qgZa5qrvDOOcsmdKStD1oCjZ9nB7MDvJUs_34SIm"
            />
          </el-form-item>
          <el-form-item label="Bucket" :required="true">
            <el-input v-model.trim="formQiniu.bucket" placeholder="如：md" />
          </el-form-item>
          <el-form-item label="Bucket 对应域名" :required="true">
            <el-input v-model.trim="formQiniu.domain" placeholder="如：https://images.123ylb.cn" />
          </el-form-item>
          <el-form-item label="存储区域" :required="true">
            <el-input v-model.trim="formQiniu.region" placeholder="如：z2" />
          </el-form-item>
          <el-form-item label="存储路径" :required="false">
            <el-input v-model.trim="formQiniu.path" placeholder="如：img，可不填，默认为根目录" />
            <el-link type="primary" href="https://developer.qiniu.com/kodo" target="_blank">
              如何使用七牛云 Kodo？
            </el-link>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveQiniuConfiguration">
              保存配置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane class="github-panel" label="MinIO" name="minio">
        <el-form class="setting-form" :model="minioOSS" label-position="right" label-width="150px">
          <el-form-item label="Endpoint" :required="true">
            <el-input v-model.trim="minioOSS.endpoint" placeholder="如：play.min.io" />
          </el-form-item>
          <el-form-item label="Port" :required="false">
            <el-input v-model.trim="minioOSS.port" type="number" placeholder="如：9000，可不填，http 默认为 80，https 默认为 443" />
          </el-form-item>
          <el-form-item label="UseSSL" :required="true">
            <el-switch v-model="minioOSS.useSSL" active-text="是" inactive-text="否" />
          </el-form-item>
          <el-form-item label="Bucket" :required="true">
            <el-input v-model.trim="minioOSS.bucket" placeholder="如：doocs" />
          </el-form-item>
          <el-form-item label="AccessKey" :required="true">
            <el-input v-model.trim="minioOSS.accessKey" placeholder="如：zhangsan" />
          </el-form-item>
          <el-form-item label="SecretKey" :required="true">
            <el-input v-model.trim="minioOSS.secretKey" placeholder="如：asdasdasd" />
            <el-link
              type="primary" href="http://docs.minio.org.cn/docs/master/minio-client-complete-guide"
              target="_blank"
            >
              如何使用 MinIO？
            </el-link>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveMinioOSSConfiguration">
              保存配置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane class="github-panel formCustom" label="自定义代码" name="formCustom">
        <el-form class="setting-form" :model="formCustom" label-position="right">
          <el-form-item label="" :required="true">
            <el-input
              ref="formCustomElInput" v-model="formCustom.code" class="formCustomElInput" type="textarea"
              resize="none" placeholder="Your custom code here."
            />
            <el-link type="primary" href="https://github.com/doocs/md#自定义上传逻辑" target="_blank">
              参数详情？
            </el-link>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="formCustomSave">
              保存配置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<style lang="less" scoped>
.upload__dialog {
  display: flex;
}

:deep(.el-dialog) {
  width: 55%;
  min-width: 640px;
  min-height: 615px;
  // 消除固定的行内样式，配合 flex 布局居中元素
  margin: auto !important;
}

:deep(.el-upload-dragger) {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 500px;
  height: 360px;

  .el-icon-upload {
    margin-top: 0;
  }
}

:deep(.el-dialog__body) {
  padding-bottom: 50px;
}

.upload-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .el-select {
    align-self: flex-end;
    margin: 0 67.75px 20px;
    width: 100px;
  }
}

.github-panel {
  display: flex;
  justify-content: center;

  &.formCustom {
    width: 100%;
  }

  .formCustomElInput {
    :deep(.CodeMirror) {
      border: 1px solid #eee;
      height: 300px !important;
      font-family: 'Fira Mono', 'DejaVu Sans Mono', Menlo, Consolas, 'Liberation Mono', Monaco, 'Lucida Console',
        monospace !important;
      line-height: 20px;

      .CodeMirror-scroll {
        padding: 10px;
      }
    }
  }
}

.setting-form {
  width: 100%;

  .el-form-item {
    margin: 15px;
  }

  .el-form-item:last-child {
    text-align: right;
  }
}
</style>
