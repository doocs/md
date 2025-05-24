<script setup lang="ts">
import { useDisplayStore, useStore } from '@/stores'
import { ref, toRaw } from 'vue'

/** 编辑器实例和全局弹窗状态 */
const store = useStore()
const displayStore = useDisplayStore()
const { toggleShowInsertMpCardDialog } = displayStore

/** 表单字段 */
const mpName = ref(``)
const mpDesc = ref(``)
const mpLogo = ref(``)
const mpId = ref(``)

/** 重置 */
function resetVal() {
  mpName.value = ``
  mpDesc.value = ``
  mpLogo.value = ``
  mpId.value = ``
}

/** 组装 HTML 片段 */
function buildMpHtml() {
  if (!mpName.value.trim() || !mpId.value.trim())
    return ``
  const logo = mpLogo.value.trim() || `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png`
  const attrs = [
    `data-pluginname="mpprofile"`,
    `data-nickname="${mpName.value.trim()}"`,
    `data-id="${mpId.value.trim()}"`,
    `data-headimg="${logo}"`,
    mpDesc.value.trim() ? `data-signature="${mpDesc.value.trim()}"` : ``,
    `data-service_type="1"`,
    `data-verify_status="1"`,
  ].filter(Boolean).join(` `)

  return `<section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf="">
  <mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe" ${attrs}></mp-common-profile>
  <br class="ProseMirror-trailingBreak">
</section>`
}

/** 插入到编辑器 */
function insertMp() {
  const html = buildMpHtml()
  if (!html)
    return
  toRaw(store.editor!).replaceSelection(`\n${html}\n`, `end`)
  resetVal()
  toggleShowInsertMpCardDialog(false)
}

/** Dialog v-model 回调 */
function onUpdate(open: boolean) {
  if (!open)
    toggleShowInsertMpCardDialog(false)
}
</script>

<template>
  <Dialog :open="displayStore.isShowInsertMpCardDialog" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>插入公众号卡片</DialogTitle>
      </DialogHeader>

      <div class="space-y-2">
        <Input v-model="mpName" placeholder="公众号名称 *" />
        <Input v-model="mpId" placeholder="公众号 ID (例如 MzIxNjA5ODQ0OQ==) *" />

        <Input v-model="mpLogo" placeholder="头像 URL (可选)" />
        <Textarea v-model="mpDesc" placeholder="公众号描述 (可选)" rows="3" />
      </div>

      <DialogFooter class="mt-4">
        <Button variant="outline" @click="toggleShowInsertMpCardDialog(false)">
          取 消
        </Button>
        <Button :disabled="!mpName || !mpId" @click="insertMp">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style lang="less" scoped>
</style>
