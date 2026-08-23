<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderSwitchField from './UploadProviderSwitchField.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => z.object({
  repo: requiredString(t(`upload.validation.githubRepoRequired`)),
  branch: optionalString(),
  accessToken: requiredString(t(`upload.validation.githubTokenRequired`)),
  useCDN: z.boolean(),
}))
const { config, saveConfig } = useUploadProviderConfig(`githubConfig`, {
  repo: ``,
  branch: ``,
  accessToken: ``,
  useCDN: false,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField
      name="repo"
      :label="t('upload.labels.githubRepo')"
      :placeholder="t('upload.placeholders.githubRepo')"
      required
    />
    <UploadProviderTextField
      name="branch"
      :label="t('upload.labels.branch')"
      :placeholder="t('upload.placeholders.branch')"
    />
    <UploadProviderTextField
      name="accessToken"
      label="Token"
      type="password"
      :placeholder="t('upload.placeholders.token')"
      required
    />
    <UploadProviderSwitchField name="useCDN" :label="t('upload.labels.cdnAccel')" />

    <FormItem>
      <Button
        variant="link"
        class="p-0 h-auto text-left whitespace-normal"
        as="a"
        href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ t('upload.help.githubToken') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
