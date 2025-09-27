<script setup lang='ts'>
import type { V5CompatibleEditor } from '@/utils/editor'
import { useStore } from '@/stores'
import { removeLeft } from '@/utils'
import { createCodeMirrorV6 } from '@/utils/codemirror-v6'

const store = useStore()

const code = useLocalStorage(`formCustomConfig`, removeLeft(`
  const {file, util, okCb, errCb} = CUSTOM_ARG
  const param = new FormData()
  param.append('file', file)
  util.axios.post('${window.location.origin}/upload', param, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => {
    okCb(res.url)
  }).catch(err => {
    errCb(err)
  })
`).trim())

const formCustomTextarea = useTemplateRef<HTMLDivElement>(`formCustomTextarea`)

const editor = ref<V5CompatibleEditor | null>(null)

onMounted(() => {
  const extraKeys = {}

  const editorView = createCodeMirrorV6(
    formCustomTextarea.value!,
    code.value,
    store.isDark,
    extraKeys,
    (value: string) => {
      code.value = value
    },
  )

  editor.value = markRaw(editorView.compatibleEditor)

  // 嵌套使用 nextTick 才能确保生效，具体原因未知
  nextTick(() => {
    nextTick(() => {
      editor.value?.setValue(code.value)
    })
  })
})

function formCustomSave() {
  const str = editor.value!.getValue()
  localStorage.setItem(`formCustomConfig`, str)
  toast.success(`保存成功`)
}
</script>

<template>
  <div class="space-y-4 min-w-0">
    <div class="h-60 border flex flex-col">
      <div
        ref="formCustomTextarea"
        class="flex-1"
      />
    </div>
    <Button
      variant="link"
      class="p-0"
      as="a"
      href="https://github.com/doocs/md/blob/main/docs/custom-upload.md"
      target="_blank"
    >
      参数详情？
    </Button>
    <Button class="block" @click="formCustomSave">
      保存配置
    </Button>
  </div>
</template>

<style scoped>
/* 覆盖全局的 overflow-x: hidden 设置 */
:deep(.CodeMirror-scroll) {
  overflow-x: auto !important;
  overflow-y: auto !important;
}

@media (max-width: 768px) {
  :deep(.CodeMirror) {
    font-size: 12px;
  }
}
</style>
