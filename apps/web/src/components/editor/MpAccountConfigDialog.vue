<script setup lang="ts">
import type { MpAccount } from '@/stores/mpAccounts'
import { toTypedSchema } from '@vee-validate/yup'
import { Field, Form } from 'vee-validate'
import * as yup from 'yup'

const props = defineProps<{
  open: boolean
  /** null = 新建，string = 编辑指定账号 */
  accountId: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const mpAccountsStore = useMpAccountsStore()

const isEditing = computed(() => props.accountId !== null)

const editingAccount = computed<MpAccount | null>(() => {
  if (!props.accountId)
    return null
  return (mpAccountsStore.accounts as MpAccount[]).find(a => a.id === props.accountId) ?? null
})

/** key 变化时 vee-validate Form 重新初始化 */
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

const schema = toTypedSchema(yup.object({
  mpId: yup.string().required(`公众号 ID 不能为空`),
  name: yup.string().required(`公众号名称不能为空`),
  logo: yup.string().optional().url(`公众号 Logo 必须是一个有效的 URL`),
  desc: yup.string().optional(),
  serviceType: yup.string().required(),
  verify: yup.string().required(),
}))

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
    toast.success(`「${formValues.name}」已更新`)
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
    toast.success(`「${formValues.name}」已添加`)
  }
  emit(`saved`)
  emit(`update:open`, false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="!w-[750px] !max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? `编辑公众号` : `新增公众号` }}</DialogTitle>
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
            <FormItem label="ID" required :error="errorMessage" :width="50">
              <Input
                v-bind="field"
                v-model.trim="field.value"
                placeholder="例：MzIxNjA5ODQ0OQ=="
              />
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="name">
            <FormItem label="名称" required :error="errorMessage" :width="50">
              <Input
                v-bind="field"
                v-model.trim="field.value"
                placeholder="例：Doocs"
              />
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="logo">
            <FormItem label="Logo" :error="errorMessage" :width="50">
              <Input
                v-bind="field"
                v-model.trim="field.value"
                placeholder="例：https://doocs.com/mp-logo.png"
              />
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="desc">
            <FormItem label="描述" :error="errorMessage" :width="50">
              <Textarea
                v-bind="field"
                v-model.trim="field.value"
                rows="3"
                class="resize-none"
                placeholder="例：GitHub 开源组织 @Doocs 旗下唯一公众号，专注分享技术领域相关知识及行业最新资讯。"
              />
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="serviceType">
            <FormItem label="类型" required :error="errorMessage" :width="50">
              <RadioGroup class="flex gap-5" v-bind="field" :default-value="field.value">
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-type-1" value="1" />
                  <Label for="mp-cfg-type-1">公众号</Label>
                </div>
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-type-2" value="2" />
                  <Label for="mp-cfg-type-2">服务号</Label>
                </div>
              </RadioGroup>
            </FormItem>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="verify">
            <FormItem label="认证" required :error="errorMessage" :width="50">
              <RadioGroup class="flex gap-5" v-bind="field" :default-value="field.value">
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-verify-0" value="0" />
                  <Label for="mp-cfg-verify-0">无</Label>
                </div>
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-verify-1" value="1" />
                  <Label for="mp-cfg-verify-1">个人</Label>
                </div>
                <div class="inline-flex items-center space-x-2 w-20">
                  <RadioGroupItem id="mp-cfg-verify-2" value="2" />
                  <Label for="mp-cfg-verify-2">企业</Label>
                </div>
              </RadioGroup>
            </FormItem>
          </Field>

          <FormItem :width="50">
            <Button
              variant="link"
              class="p-0 h-auto text-left whitespace-normal"
              as="a"
              href="https://github.com/doocs/md/blob/main/docs/mp-card.md"
              target="_blank"
            >
              如何获取公众号 ID？
            </Button>
          </FormItem>
        </div>

        <DialogFooter class="p-1">
          <Button variant="outline" type="button" @click="emit('update:open', false)">
            取消
          </Button>
          <Button type="submit">
            保存
          </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
