<script setup lang="ts">
import type { MpAccount } from '@/stores/mpAccounts'
import { toTypedSchema } from '@vee-validate/yup'
import { Field, Form } from 'vee-validate'
import * as yup from 'yup'

const props = defineProps<{
  open: boolean
  /** null = create; string = edit account id */
  accountId: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const { t } = useI18n()

const mpAccountsStore = useMpAccountsStore()

const isEditing = computed(() => props.accountId !== null)

const editingAccount = computed<MpAccount | null>(() => {
  if (!props.accountId)
    return null
  return (mpAccountsStore.accounts as MpAccount[]).find(a => a.id === props.accountId) ?? null
})

/** Re-init vee-validate Form when key changes */
const formKey = computed(() => `${props.accountId ?? `new`}-${props.open}`)

const initialValues = computed(() => {
  const acc = editingAccount.value
  if (!acc) {
    return { mpId: ``, name: ``, logo: ``, desc: ``, serviceType: `1`, verify: `0` }
  }
  return {
    mpId: acc.mpId,
    name: acc.name,
    logo: acc.logo,
    desc: acc.desc,
    serviceType: acc.serviceType,
    verify: acc.verify,
  }
})

const schema = computed(() => toTypedSchema(yup.object({
  mpId: yup.string().required(t('mpAccount.errors.mpIdRequired')),
  name: yup.string().required(t('mpAccount.errors.nameRequired')),
  logo: yup.string().optional().url(t('mpAccount.errors.logoInvalid')),
  desc: yup.string().optional(),
  serviceType: yup.string().required(),
  verify: yup.string().required(),
})))

function submit(formValues: any) {
  if (props.accountId) {
    mpAccountsStore.updateAccount(props.accountId, {
      mpId: formValues.mpId,
      name: formValues.name,
      logo: formValues.logo,
      desc: formValues.desc,
      serviceType: formValues.serviceType,
      verify: formValues.verify,
    })
    toast.success(t('mpAccount.updated', { name: formValues.name }))
  }
  else {
    mpAccountsStore.addAccount({
      mpId: formValues.mpId,
      name: formValues.name,
      logo: formValues.logo,
      desc: formValues.desc,
      serviceType: formValues.serviceType,
      verify: formValues.verify,
    })
    toast.success(t('mpAccount.added', { name: formValues.name }))
  }
  emit(`saved`)
  emit(`update:open`, false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="!w-[750px] !max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? t('mpAccount.editTitle') : t('mpAccount.addTitle') }}</DialogTitle>
      </DialogHeader>

      <Form
        :key="formKey"
        :validation-schema="schema"
        :initial-values="initialValues"
        class="flex flex-col flex-1 overflow-hidden"
        @submit="submit"
      >
        <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col">
          <Field v-slot="{ field, errorMessage }" name="mpId">
            <FormItem :label="t('mpAccount.idLabel')" required :error="errorMessage" :width="50">
              <Input
                v-bind="field"
                v-model.trim="field.value"
                :placeholder="t('mpAccount.idPlaceholder')"
              />
              <template #hint>
                <a
                  href="https://github.com/doocs/md/blob/main/docs/mp-card.md"
                  target="_blank" rel="noopener noreferrer"
                  class="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                >{{ t('mpAccount.idHelp') }}</a>
              </template>
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="name">
            <FormItem :label="t('mpAccount.nameLabel')" required :error="errorMessage" :width="50">
              <Input
                v-bind="field"
                v-model.trim="field.value"
                :placeholder="t('mpAccount.namePlaceholder')"
              />
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="logo">
            <FormItem :label="t('mpAccount.logoLabel')" :error="errorMessage" :width="50">
              <Input
                v-bind="field"
                v-model.trim="field.value"
                :placeholder="t('mpAccount.logoPlaceholder')"
              />
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="desc">
            <FormItem :label="t('mpAccount.descLabel')" :error="errorMessage" :width="50">
              <Textarea
                v-bind="field"
                v-model.trim="field.value"
                rows="3"
                class="resize-none"
                :placeholder="t('mpAccount.descPlaceholder')"
              />
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="serviceType">
            <FormItem :label="t('mpAccount.typeLabel')" required :error="errorMessage" :width="50">
              <RadioGroup class="flex gap-5" v-bind="field" :default-value="field.value">
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-type-1" value="1" />
                  <Label for="mp-cfg-type-1">{{ t('mpAccount.typeOfficial') }}</Label>
                </div>
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-type-2" value="2" />
                  <Label for="mp-cfg-type-2">{{ t('mpAccount.typeService') }}</Label>
                </div>
              </RadioGroup>
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="verify">
            <FormItem :label="t('mpAccount.verifyLabel')" required :error="errorMessage" :width="50">
              <RadioGroup class="flex gap-5" v-bind="field" :default-value="field.value">
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-verify-0" value="0" />
                  <Label for="mp-cfg-verify-0">{{ t('mpAccount.verifyNone') }}</Label>
                </div>
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-verify-1" value="1" />
                  <Label for="mp-cfg-verify-1">{{ t('mpAccount.verifyPersonal') }}</Label>
                </div>
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-verify-2" value="2" />
                  <Label for="mp-cfg-verify-2">{{ t('mpAccount.verifyEnterprise') }}</Label>
                </div>
              </RadioGroup>
            </FormItem>
          </Field>
        </div>

        <DialogFooter class="p-1">
          <Button variant="outline" type="button" @click="emit('update:open', false)">
            {{ t('common.cancel') }}
          </Button>
          <Button type="submit">
            {{ t('common.save') }}
          </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
