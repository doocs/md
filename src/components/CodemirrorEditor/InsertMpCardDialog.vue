<script setup lang="ts">
import { addPrefix } from '@/utils'
import { toTypedSchema } from '@vee-validate/yup'
import { Info } from 'lucide-vue-next'
import { Field, Form } from 'vee-validate'
import * as yup from 'yup'

/** 编辑器实例和全局弹窗状态 */
const store = useStore()
const displayStore = useDisplayStore()
const { toggleShowInsertMpCardDialog } = displayStore

interface Config {
  id: string
  name: string
  logo: string
  desc: string
}

/** 表单字段 */
const config = useStorage<Config>(addPrefix(`mp-profile`), {
  id: ``,
  name: ``,
  logo: ``,
  desc: ``,
})

/**
 * @deprecated 更换为对象形式，后续版本可移除该兼容写法
 */
const mpId = useStorage(`mpId`, ``)
/**
 * @deprecated 更换为对象形式，后续版本可移除该兼容写法
 */
const mpName = useStorage(`mpName`, ``)
/**
 * @deprecated 更换为对象形式，后续版本可移除该兼容写法
 */
const mpLogo = useStorage(`mpLogo`, ``)
/**
 * @deprecated 更换为对象形式，后续版本可移除该兼容写法
 */
const mpDesc = useStorage(`mpDesc`, ``)

onMounted(() => {
  config.value.id = mpId.value || config.value.id
  config.value.name = mpName.value || config.value.name
  config.value.logo = mpLogo.value || config.value.logo
  config.value.desc = mpDesc.value || config.value.desc

  mpId.value = ``
  mpName.value = ``
  mpLogo.value = ``
  mpDesc.value = ``
})

const schema = toTypedSchema(yup.object({
  id: yup.string().required(`公众号 ID 不能为空`),
  name: yup.string().required(`公众号名称 不能为空`),
  logo: yup.string().optional().url(`公众号 Logo 必须是一个有效的 URL`),
  desc: yup.string().optional(),
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
    `data-service_type="1"`,
    `data-verify_status="1"`,
  ].filter(Boolean).join(` `)

  return `<section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf="">
  <mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe" ${attrs}></mp-common-profile>
  <br class="ProseMirror-trailingBreak">
</section>`
}

function submit(formValues: any) {
  config.value = formValues as Config
  const html = buildMpHtml(formValues as Config)
  toRaw(store.editor!).replaceSelection(`\n${html}\n`, `end`)
  toast.success(`公众号名片插入成功`)
  toggleShowInsertMpCardDialog(false)
}
</script>

<template>
  <Dialog v-model:open="displayStore.isShowInsertMpCardDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>插入公众号名片</DialogTitle>
      </DialogHeader>

      <Alert>
        <Info class="h-4 w-4" />
        <AlertTitle>提示</AlertTitle>
        <AlertDescription>
          此功能用于插入微信公众号名片，数据会缓存至本地，可长期使用。
        </AlertDescription>
      </Alert>

      <Form :validation-schema="schema" :initial-values="config" @submit="submit">
        <Field v-slot="{ field, errorMessage }" name="id">
          <FormItem label="公众号 ID" required :error="errorMessage">
            <Input
              v-bind="field"
              v-model.trim="field.value"
              placeholder="例：MzIxNjA5ODQ0OQ=="
            />
          </FormItem>
        </Field>

        <Field v-slot="{ field, errorMessage }" name="name">
          <FormItem label="公众号名称" required :error="errorMessage">
            <Input
              v-bind="field"
              v-model.trim="field.value"
              placeholder="例：Doocs"
            />
          </FormItem>
        </Field>

        <Field v-slot="{ field, errorMessage }" name="logo">
          <FormItem label="公众号 Logo" :error="errorMessage">
            <Input
              v-bind="field"
              v-model.trim="field.value"
              placeholder="例：https://doocs.com/mp-logo.png"
            />
          </FormItem>
        </Field>

        <Field v-slot="{ field, errorMessage }" name="desc">
          <FormItem label="公众号描述" :error="errorMessage">
            <Textarea
              v-bind="field"
              v-model.trim="field.value"
              rows="3"
              placeholder="例：GitHub 开源组织 @Doocs 旗下唯一公众号，专注分享技术领域相关知识及行业最新资讯。"
            />
          </FormItem>
        </Field>

        <FormItem>
          <Button type="submit">
            确认
          </Button>
        </FormItem>
      </Form>
    </DialogContent>
  </Dialog>
</template>
