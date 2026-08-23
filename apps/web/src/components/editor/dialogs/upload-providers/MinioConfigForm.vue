<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString, toTypedSchema } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderSwitchField from './UploadProviderSwitchField.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => toTypedSchema(z.object({
  endpoint: requiredString(t(`upload.validation.endpointRequired`)),
  port: optionalString(),
  useSSL: z.boolean(),
  bucket: requiredString(t(`upload.validation.bucketRequired`)),
  accessKey: requiredString(t(`upload.validation.accessKeyRequired`)),
  secretKey: requiredString(t(`upload.validation.secretKeyRequired`)),
})))
const { config, saveConfig } = useUploadProviderConfig(`minioConfig`, {
  endpoint: ``,
  port: ``,
  useSSL: true,
  bucket: ``,
  accessKey: ``,
  secretKey: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="endpoint" label="Endpoint" :placeholder="t('upload.placeholders.minioEndpoint')" required />
    <UploadProviderTextField name="port" label="Port" type="number" :placeholder="t('upload.placeholders.minioPort')" />
    <UploadProviderSwitchField name="useSSL" label="UseSSL" />
    <UploadProviderTextField name="bucket" label="Bucket" :placeholder="t('upload.placeholders.bucket')" required />
    <UploadProviderTextField name="accessKey" label="AccessKey" :placeholder="t('upload.placeholders.minioAccessKey')" required />
    <UploadProviderTextField name="secretKey" label="SecretKey" :placeholder="t('upload.placeholders.minioSecretKey')" required />

    <FormItem>
      <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="http://docs.minio.org.cn/docs/master/minio-client-complete-guide" target="_blank" rel="noopener noreferrer">
        {{ t('upload.help.minio') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
