<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => z.object({
  accountId: requiredString(t(`upload.validation.accountIdRequired`)),
  accessKey: requiredString(t(`upload.validation.accessKeyRequired`)),
  secretKey: requiredString(t(`upload.validation.secretKeyRequired`)),
  bucket: requiredString(t(`upload.validation.bucketRequired`)),
  domain: requiredString(t(`upload.validation.domainRequired`)),
  path: optionalString(),
}))
const { config, saveConfig } = useUploadProviderConfig(`r2Config`, {
  accountId: ``,
  accessKey: ``,
  secretKey: ``,
  bucket: ``,
  domain: ``,
  path: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="accountId" label="AccountId" :placeholder="t('upload.placeholders.accountId')" input-class="w-full min-w-0 md:min-w-[350px]" required />
    <UploadProviderTextField name="accessKey" label="AccessKey" :placeholder="t('upload.placeholders.r2AccessKey')" required />
    <UploadProviderTextField name="secretKey" label="SecretKey" type="password" :placeholder="t('upload.placeholders.r2SecretKey')" required />
    <UploadProviderTextField name="bucket" label="Bucket" :placeholder="t('upload.placeholders.qiniuBucket')" required />
    <UploadProviderTextField name="domain" :label="t('upload.labels.domain')" :placeholder="t('upload.placeholders.r2Domain')" required />
    <UploadProviderTextField name="path" :label="t('upload.labels.storagePath')" :placeholder="t('upload.placeholders.storagePath')" />

    <FormItem>
      <div class="flex flex-col items-start">
        <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://developers.cloudflare.com/r2/api/s3/api/" target="_blank" rel="noopener noreferrer">
          {{ t('upload.help.r2S3Api') }}
        </Button>
        <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://developers.cloudflare.com/r2/buckets/cors/" target="_blank" rel="noopener noreferrer">
          {{ t('upload.help.r2Cors') }}
        </Button>
      </div>
    </FormItem>
  </UploadProviderForm>
</template>
