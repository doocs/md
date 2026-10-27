<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString, toTypedSchema } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => toTypedSchema(z.object({
  server: requiredString(t(`upload.validation.picgoServerRequired`)),
  path: optionalString(),
  key: optionalString(),
})))
const { config, saveConfig } = useUploadProviderConfig(`picgoConfig`, {
  server: `http://127.0.0.1:36677`,
  path: `/upload`,
  key: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField
      name="server"
      :label="t('upload.labels.picgoServer')"
      :placeholder="t('upload.placeholders.picgoServer')"
      required
    />
    <UploadProviderTextField
      name="path"
      :label="t('upload.labels.picgoPath')"
      :placeholder="t('upload.placeholders.picgoPath')"
    />
    <UploadProviderTextField
      name="key"
      :label="t('upload.labels.picgoKey')"
      type="password"
      :placeholder="t('upload.placeholders.picgoKey')"
    />

    <FormItem>
      <Button
        variant="link"
        class="p-0 h-auto text-left whitespace-normal"
        as="a"
        href="https://github.com/Molunerfinn/PicGo"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ t('upload.help.picgo') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
