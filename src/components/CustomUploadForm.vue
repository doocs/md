<script setup lang='ts'>
import { useStore } from '@/stores'
import { removeLeft } from '@/utils'
import CodeMirror from 'codemirror'

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

const formCustomTextarea = useTemplateRef<HTMLTextAreaElement>(`formCustomTextarea`)

const editor = ref< CodeMirror.EditorFromTextArea | null>(null)

onMounted(() => {
  editor.value = markRaw(CodeMirror.fromTextArea(formCustomTextarea.value!, {
    mode: `javascript`,
    theme: store.isDark ? `darcula` : `xq-light`,
    lineNumbers: true,
  }))

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
  <div class="space-y-4">
    <div class="h-60 border">
      <textarea
        ref="formCustomTextarea"
        placeholder="Your custom code here."
      />
    </div>
    <Button
      variant="link"
      class="p-0"
      href="https://github.com/doocs/md#自定义上传逻辑"
      target="_blank"
    >
      参数详情
    </Button>
    <Button class="block" @click="formCustomSave">
      保存配置
    </Button>
  </div>
</template>
