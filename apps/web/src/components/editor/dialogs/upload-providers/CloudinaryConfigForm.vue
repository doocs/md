<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => z.object({
  cloudName: requiredString(t(`upload.validation.cloudNameRequired`)),
  apiKey: requiredString(t(`upload.validation.apiKeyRequired`)),
  apiSecret: optionalString(),
  uploadPreset: optionalString(),
  folder: optionalString(),
  domain: optionalString(),
}).superRefine((data, ctx) => {
  if (!data.apiSecret?.trim() && !data.uploadPreset?.trim()) {
    ctx.addIssue({
      code: `custom`,
      path: [`uploadPreset`],
      message: t(`upload.validation.uploadPresetRequired`),
    })
  }
}))
const { config, saveConfig } = useUploadProviderConfig(`cloudinaryConfig`, {
  cloudName: ``,
  apiKey: ``,
  apiSecret: ``,
  uploadPreset: ``,
  folder: ``,
  domain: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="cloudName" label="Cloud Name" :placeholder="t('upload.placeholders.cloudName')" required />
    <UploadProviderTextField name="apiKey" label="API Key" :placeholder="t('upload.placeholders.apiKey')" required />
    <UploadProviderTextField name="apiSecret" label="API Secret" type="password" :placeholder="t('upload.placeholders.apiSecretOptional')" />
    <UploadProviderTextField name="uploadPreset" label="Upload Preset" :placeholder="t('upload.placeholders.uploadPresetUnsigned')" />
    <UploadProviderTextField name="folder" label="Folder" :placeholder="t('upload.placeholders.cloudinaryFolder')" />
    <UploadProviderTextField name="domain" :label="t('upload.labels.customDomainCdn')" :placeholder="t('upload.placeholders.cloudinaryDomain')" />

    <FormItem>
      <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://cloudinary.com/documentation/upload_images" target="_blank" rel="noopener noreferrer">
        {{ t('upload.help.cloudinary') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
