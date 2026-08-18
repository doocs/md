<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const schema = computed(() => toTypedSchema(yup.object({
  token: yup.string().required(t(`upload.validation.botTokenRequired`)),
  chatId: yup.string().required(t(`upload.validation.chatIdRequired`)),
})))
const { config, saveConfig } = useUploadProviderConfig(`telegramConfig`, {
  token: ``,
  chatId: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField name="token" label="Bot Token" :placeholder="t('upload.placeholders.telegramToken')" required />
    <UploadProviderTextField name="chatId" label="Chat ID" :placeholder="t('upload.placeholders.telegramChatId')" required />

    <FormItem>
      <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://github.com/doocs/md/blob/main/docs/telegram-usage.md" target="_blank" rel="noopener noreferrer">
        {{ t('upload.help.telegram') }}
      </Button>
    </FormItem>
  </UploadProviderForm>
</template>
