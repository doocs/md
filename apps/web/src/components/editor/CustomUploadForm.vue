<script setup lang='ts'>
import { Compartment } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { javascriptSetup, theme } from '@md/shared'
import { useUIStore } from '@/stores/ui'
import { removeLeft } from '@/utils'
import { store } from '@/utils/storage'

const code = store.reactive(`formCustomConfig`, removeLeft(`
  const { file, util, okCb, errCb } = CUSTOM_ARG
  param = new FormData()
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

const uiStore = useUIStore()
const { isDark } = storeToRefs(uiStore)

const editor = ref<EditorView | null>(null)

const themeCompartment = new Compartment()

onMounted(() => {
  const editorView = new EditorView({
    parent: formCustomTextarea.value!,
    extensions: [javascriptSetup(), themeCompartment.of(theme(isDark.value))],
    doc: code.value,
  })

  editor.value = editorView
})

watch(isDark, (dark) => {
  editor.value?.dispatch({
    effects: themeCompartment.reconfigure(theme(dark)),
  })
})

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

function formCustomSave() {
  const str = editor.value!.state.doc.toString()
  code.value = str
  toast.success(`保存成功`)
}
</script>

<template>
  <div class="space-y-4 min-w-0">
    <div class="h-60 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col overflow-y-auto">
      <div
        ref="formCustomTextarea"
        class="flex-1 custom-codemirror"
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
@media (max-width: 768px) {
  :deep(.CodeMirror) {
    font-size: 12px;
  }
}
</style>
