<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import { Field, Form } from 'vee-validate'
import * as yup from 'yup'
import { useEditorStore } from '@/stores/editor'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

/** 编辑器实例和全局弹窗状态 */
const editorStore = useEditorStore()
const uiStore = useUIStore()
const { toggleShowInsertMpCardDialog } = uiStore

interface Config {
  id: string
  name: string
  logo: string
  desc: string
  /**
   * 1: 公众号
   * 2: 服务号
   */
  serviceType: `1` | `2`
  /**
   * 0: 无标识
   * 1: 个人认证
   * 2: 企业认证
   */
  verify: `0` | `1` | `2`
}

/** 表单字段 */
const config = store.reactive<Config>(addPrefix(`mp-profile`), {
  id: ``,
  name: ``,
  logo: ``,
  desc: ``,
  serviceType: `1`,
  verify: `0`,
})

const schema = toTypedSchema(yup.object({
  id: yup.string().required(`公众号 ID 不能为空`),
  name: yup.string().required(`公众号名称 不能为空`),
  logo: yup.string().optional().url(`公众号 Logo 必须是一个有效的 URL`),
  desc: yup.string().optional(),
  serviceType: yup.string().required(),
  verify: yup.string().required(),
}))

/** 组装 HTML 片段 */
function buildMpHtml(config: Config) {
  const logo = config.logo || `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png`
  const attrs = [
    `data-pluginname="mpprofile"`,
    `data-id="${config.id}"`,
    `data-nickname="${config.name}"`,
    `data-headimg="${logo}"`,
    config.desc && `data-signature="${config.desc}"`,
    `data-service_type="${config.serviceType || `1`}"`,
    `data-verify_status="${config.verify || `0`}"`,
  ].filter(Boolean).join(` `)

  return `<section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf="">
  <mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe" ${attrs}></mp-common-profile>
  <br class="ProseMirror-trailingBreak">
</section>`
}

function submit(formValues: any) {
  config.value = formValues as Config
  const html = buildMpHtml(formValues as Config)
  const editor = toRaw(editorStore.editor!)
  const selection = editor.state.selection.main
  editor.dispatch({
    changes: { from: selection.from, to: selection.to, insert: `\n${html}\n` },
  })
  toast.success(`公众号名片插入成功`)
  toggleShowInsertMpCardDialog(false)
}
</script>

<template>
  <Dialog v-model:open="uiStore.isShowInsertMpCardDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>插入公众号名片</DialogTitle>
      </DialogHeader>

      <Form :validation-schema="schema" :initial-values="config" @submit="submit">
        <Field v-slot="{ field, errorMessage }" name="id">
          <FormItem label="公众号 ID" required :error="errorMessage" :width="90">
            <Input
              v-bind="field"
              v-model.trim="field.value"
              placeholder="例：MzIxNjA5ODQ0OQ=="
            />
          </FormItem>
        </Field>

        <Field v-slot="{ field, errorMessage }" name="name">
          <FormItem label="公众号名称" required :error="errorMessage" :width="90">
            <Input
              v-bind="field"
              v-model.trim="field.value"
              placeholder="例：Doocs"
            />
          </FormItem>
        </Field>

        <Field v-slot="{ field, errorMessage }" name="logo">
          <FormItem label="公众号 Logo" :error="errorMessage" :width="90">
            <Input
              v-bind="field"
              v-model.trim="field.value"
              placeholder="例：https://doocs.com/mp-logo.png"
            />
          </FormItem>
        </Field>

        <Field v-slot="{ field, errorMessage }" name="desc">
          <FormItem label="公众号描述" :error="errorMessage" :width="90">
            <Textarea
              v-bind="field"
              v-model.trim="field.value"
              rows="3"
              placeholder="例：GitHub 开源组织 @Doocs 旗下唯一公众号，专注分享技术领域相关知识及行业最新资讯。"
            />
          </FormItem>
        </Field>

        <Field v-slot="{ field, errorMessage }" name="serviceType">
          <FormItem label="公众号类型" required :error="errorMessage" :width="90">
            <RadioGroup class="flex gap-5" v-bind="field" :default-value="field.value">
              <div class="inline-flex items-center space-x-2 w-20">
                <RadioGroupItem id="option-one" value="1" />
                <Label for="option-one">公众号</Label>
              </div>
              <div class="inline-flex items-center space-x-2 w-20">
                <RadioGroupItem id="option-two" value="2" />
                <Label for="option-two">服务号</Label>
              </div>
            </RadioGroup>
          </FormItem>
        </Field>

        <Field v-slot="{ field, errorMessage }" name="verify">
          <FormItem label="认证" required :error="errorMessage" :width="90">
            <RadioGroup class="flex gap-5" v-bind="field" :default-value="field.value">
              <div class="inline-flex items-center space-x-2 w-20">
                <RadioGroupItem id="service-type-option-one" value="0" />
                <Label for="service-type-option-one">无</Label>
              </div>
              <div class="inline-flex items-center space-x-2 w-20">
                <RadioGroupItem id="service-type-option-two" value="1" />
                <Label for="service-type-option-two">个人</Label>
              </div>
              <div class="inline-flex items-center space-x-2 w-20">
                <RadioGroupItem id="service-type-option-three" value="2" />
                <Label for="service-type-option-three">企业</Label>
              </div>
            </RadioGroup>
          </FormItem>
        </Field>

        <FormItem>
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

        <FormItem>
          <Button type="submit">
            确认
          </Button>
        </FormItem>
      </Form>
    </DialogContent>
  </Dialog>
</template>
