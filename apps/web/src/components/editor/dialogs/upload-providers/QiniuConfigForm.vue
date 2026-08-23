<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => z.object({
  accessKey: requiredString(t(`upload.validation.accessKeyRequired`)),
  secretKey: requiredString(t(`upload.validation.secretKeyRequired`)),
  bucket: requiredString(t(`upload.validation.bucketRequired`)),
  domain: requiredString(t(`upload.validation.domainRequired`)),
  region: optionalString(),
  path: optionalString(),
}))
const { config, saveConfig } = useUploadProviderConfig(`qiniuConfig`, {
  accessKey: ``,
  secretKey: ``,
  bucket: ``,
  domain: ``,
  region: ``,
  path: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="accessKey" label="AccessKey" :placeholder="t('upload.placeholders.qiniuAccessKey')" required />
    <UploadProviderTextField name="secretKey" label="SecretKey" type="password" :placeholder="t('upload.placeholders.qiniuSecretKey')" required />
    <UploadProviderTextField name="bucket" label="Bucket" :placeholder="t('upload.placeholders.qiniuBucket')" required />
    <UploadProviderTextField name="domain" :label="t('upload.labels.domain')" :placeholder="t('upload.placeholders.qiniuDomain')" required />
    <UploadProviderTextField name="region" :label="t('upload.labels.storageRegion')" :placeholder="t('upload.placeholders.qiniuRegion')" />
    <UploadProviderTextField name="path" :label="t('upload.labels.storagePath')" :placeholder="t('upload.placeholders.storagePath')" />

    <FormItem>
      <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://developer.qiniu.com/kodo" target="_blank" rel="noopener noreferrer">
        {{ t('upload.help.qiniu') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
