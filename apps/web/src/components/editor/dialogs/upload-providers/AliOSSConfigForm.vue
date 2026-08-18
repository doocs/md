<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderSwitchField from './UploadProviderSwitchField.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => toTypedSchema(yup.object({
  accessKeyId: yup.string().required(t(`upload.validation.accessKeyIdRequired`)),
  accessKeySecret: yup.string().required(t(`upload.validation.accessKeySecretRequired`)),
  bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
  region: yup.string().required(t(`upload.validation.regionRequired`)),
  useSSL: yup.boolean().required(),
  cdnHost: yup.string().optional(),
  path: yup.string().optional(),
})))
const { config, saveConfig } = useUploadProviderConfig(`aliOSSConfig`, {
  accessKeyId: ``,
  accessKeySecret: ``,
  bucket: ``,
  region: ``,
  useSSL: true,
  cdnHost: ``,
  path: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="accessKeyId" label="AccessKey ID" :placeholder="t('upload.placeholders.accessKeyId')" required />
    <UploadProviderTextField name="accessKeySecret" label="AccessKey Secret" type="password" :placeholder="t('upload.placeholders.accessKeySecret')" required />
    <UploadProviderTextField name="bucket" label="Bucket" :placeholder="t('upload.placeholders.bucket')" required />
    <UploadProviderTextField name="region" :label="t('upload.labels.bucketRegion')" :placeholder="t('upload.placeholders.ossRegion')" required />
    <UploadProviderSwitchField name="useSSL" label="UseSSL" />
    <UploadProviderTextField name="cdnHost" :label="t('upload.labels.customCdn')" :placeholder="t('upload.placeholders.cdnHost')" />
    <UploadProviderTextField name="path" :label="t('upload.labels.storagePath')" :placeholder="t('upload.placeholders.storagePath')" />

    <FormItem>
      <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://help.aliyun.com/document_detail/31883.html" target="_blank" rel="noopener noreferrer">
        {{ t('upload.help.aliOSS') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
