<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString, toTypedSchema } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderSwitchField from './UploadProviderSwitchField.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => toTypedSchema(z.object({
  endpoint: optionalString(),
  region: requiredString(t(`upload.validation.regionRequired`)),
  bucket: requiredString(t(`upload.validation.bucketRequired`)),
  accessKeyId: requiredString(t(`upload.validation.accessKeyIdRequired`)),
  accessKeySecret: requiredString(t(`upload.validation.secretAccessKeyRequired`)),
  path: optionalString(),
  cdnHost: optionalString(),
  pathStyle: z.boolean().optional(),
})))
const { config, saveConfig } = useUploadProviderConfig(`s3Config`, {
  endpoint: ``,
  region: ``,
  bucket: ``,
  accessKeyId: ``,
  accessKeySecret: ``,
  path: ``,
  cdnHost: ``,
  pathStyle: false,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="endpoint" label="Endpoint" :placeholder="t('upload.placeholders.s3Endpoint')" />
    <UploadProviderTextField name="region" label="Region" :placeholder="t('upload.placeholders.s3Region')" required />
    <UploadProviderTextField name="bucket" label="Bucket" :placeholder="t('upload.placeholders.s3Bucket')" required />
    <UploadProviderTextField name="accessKeyId" label="AccessKey ID" :placeholder="t('upload.placeholders.s3AccessKeyId')" required />
    <UploadProviderTextField name="accessKeySecret" label="AccessKey Secret" type="password" :placeholder="t('upload.placeholders.s3AccessKeySecret')" required />
    <UploadProviderTextField name="path" :label="t('upload.labels.storagePath')" :placeholder="t('upload.placeholders.storagePathRoot')" />
    <UploadProviderTextField name="cdnHost" :label="t('upload.labels.customDomain')" :placeholder="t('upload.placeholders.customDomain')" />
    <UploadProviderSwitchField name="pathStyle" label="Force Path Style" />
  </UploadProviderForm>
</template>
