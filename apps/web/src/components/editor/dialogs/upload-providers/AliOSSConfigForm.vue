<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderSwitchField from './UploadProviderSwitchField.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => z.object({
  accessKeyId: requiredString(t(`upload.validation.accessKeyIdRequired`)),
  accessKeySecret: requiredString(t(`upload.validation.accessKeySecretRequired`)),
  bucket: requiredString(t(`upload.validation.bucketRequired`)),
  region: requiredString(t(`upload.validation.regionRequired`)),
  useSSL: z.boolean(),
  cdnHost: optionalString(),
  path: optionalString(),
}))
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
