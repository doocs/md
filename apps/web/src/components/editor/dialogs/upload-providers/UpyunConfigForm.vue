<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => z.object({
  bucket: requiredString(t(`upload.validation.bucketRequired`)),
  operator: requiredString(t(`upload.validation.operatorRequired`)),
  password: requiredString(t(`upload.validation.passwordRequired`)),
  domain: requiredString(t(`upload.validation.cdnDomainRequired`)),
  path: optionalString(),
}))
const { config, saveConfig } = useUploadProviderConfig(`upyunConfig`, {
  bucket: ``,
  operator: ``,
  password: ``,
  domain: ``,
  path: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="bucket" label="Bucket" :placeholder="t('upload.placeholders.upyunBucket')" input-class="w-full min-w-0 md:min-w-[350px]" required />
    <UploadProviderTextField name="operator" :label="t('upload.labels.operator')" :placeholder="t('upload.placeholders.upyunOperator')" required />
    <UploadProviderTextField name="password" :label="t('upload.labels.operatorPassword')" type="password" :placeholder="t('upload.placeholders.r2SecretKey')" required />
    <UploadProviderTextField name="domain" :label="t('upload.labels.domain')" :placeholder="t('upload.placeholders.upyunDomain')" required />
    <UploadProviderTextField name="path" :label="t('upload.labels.storagePath')" :placeholder="t('upload.placeholders.storagePath')" />

    <FormItem>
      <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://help.upyun.com/" target="_blank" rel="noopener noreferrer">
        {{ t('upload.help.upyun') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
