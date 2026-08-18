import type { Component } from 'vue'
import type { ConfigurableUploadProviderId } from '@/services/upload/provider-registry'
import CustomUploadForm from '../CustomUploadForm.vue'
import AliOSSConfigForm from './AliOSSConfigForm.vue'
import CloudinaryConfigForm from './CloudinaryConfigForm.vue'
import GithubConfigForm from './GithubConfigForm.vue'
import MinioConfigForm from './MinioConfigForm.vue'
import MpConfigForm from './MpConfigForm.vue'
import QiniuConfigForm from './QiniuConfigForm.vue'
import R2ConfigForm from './R2ConfigForm.vue'
import S3ConfigForm from './S3ConfigForm.vue'
import TelegramConfigForm from './TelegramConfigForm.vue'
import TxCOSConfigForm from './TxCOSConfigForm.vue'
import UpyunConfigForm from './UpyunConfigForm.vue'

export const UPLOAD_PROVIDER_CONFIG_COMPONENTS = {
  github: GithubConfigForm,
  aliOSS: AliOSSConfigForm,
  txCOS: TxCOSConfigForm,
  qiniu: QiniuConfigForm,
  minio: MinioConfigForm,
  s3: S3ConfigForm,
  mp: MpConfigForm,
  r2: R2ConfigForm,
  upyun: UpyunConfigForm,
  telegram: TelegramConfigForm,
  cloudinary: CloudinaryConfigForm,
  formCustom: CustomUploadForm,
} satisfies Record<ConfigurableUploadProviderId, Component>
