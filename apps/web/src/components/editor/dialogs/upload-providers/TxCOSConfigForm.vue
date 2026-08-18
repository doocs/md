<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => toTypedSchema(yup.object({
  secretId: yup.string().required(t(`upload.validation.secretIdRequired`)),
  secretKey: yup.string().required(t(`upload.validation.secretKeyRequired`)),
  bucket: yup.string().required(t(`upload.validation.bucketRequired`)),
  region: yup.string().required(t(`upload.validation.regionRequired`)),
  cdnHost: yup.string().optional(),
  path: yup.string().optional(),
})))
const { config, saveConfig } = useUploadProviderConfig(`txCOSConfig`, {
  secretId: ``,
  secretKey: ``,
  bucket: ``,
  region: ``,
  cdnHost: ``,
  path: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="secretId" label="SecretId" :placeholder="t('upload.placeholders.secretId')" required />
    <UploadProviderTextField name="secretKey" label="SecretKey" type="password" :placeholder="t('upload.placeholders.secretKey')" required />
    <UploadProviderTextField name="bucket" label="Bucket" :placeholder="t('upload.placeholders.cosBucket')" required />
    <UploadProviderTextField name="region" :label="t('upload.labels.bucketRegion')" :placeholder="t('upload.placeholders.cosRegion')" required />
    <UploadProviderTextField name="cdnHost" :label="t('upload.labels.customCdn')" :placeholder="t('upload.placeholders.cdnHost')" />
    <UploadProviderTextField name="path" :label="t('upload.labels.storagePath')" :placeholder="t('upload.placeholders.storagePathRoot')" />

    <FormItem>
      <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://cloud.tencent.com/document/product/436/38484" target="_blank" rel="noopener noreferrer">
        {{ t('upload.help.txCOS') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
