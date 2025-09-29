<script setup lang='ts'>
import type { editor as MonacoEditor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { useStore } from '@/stores'
import { removeLeft } from '@/utils'

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

const editorRef = useTemplateRef<HTMLDivElement>(`editorRef`)

const editor = ref<MonacoEditor.IStandaloneCodeEditor | null>(null)

onMounted(() => {
  editor.value = monaco.editor.create(editorRef.value!, {
    value: code.value,
    language: `javascript`,
    theme: store.isDark ? `vs-dark` : `vs`,
    lineNumbers: `on`,
    automaticLayout: true,
    fontSize: 12,
    lineHeight: 18,
  })
})

function updateEditorStyle(fontSize: number, lineHeight: number) {
  if (editor.value) {
    editor.value.updateOptions({
      fontSize,
      lineHeight,
    })
  }
}

onMounted(() => {
  const updateStyle = () => {
    if (window.innerWidth >= 768) {
      updateEditorStyle(14, 24)
    }
    else {
      updateEditorStyle(12, 20)
    }
  }

  window.addEventListener(`resize`, updateStyle)
  updateStyle()

  onUnmounted(() => {
    window.removeEventListener(`resize`, updateStyle)
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
    <div class="h-60 border flex flex-col rounded-md">
      <div
        ref="editorRef"
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
</style>
