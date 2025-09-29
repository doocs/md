<script setup lang='ts'>
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, lineNumbers } from '@codemirror/view'
import { basicSetup } from '@md/shared'
import { removeLeft } from '@/utils'

const code = useLocalStorage(`formCustomConfig`, removeLeft(`
  const { file, util, okCb, errCb } = CUSTOM_ARG
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

const editor = ref<EditorView | null>(null)

// 检测当前主题
const isDark = computed(() => {
  if (typeof window !== `undefined`) {
    return document.documentElement.classList.contains(`dark`)
  }
  return false
})

onMounted(() => {
  const extensions = [
    basicSetup,
    javascript(),
    lineNumbers(),
    ...(isDark.value ? [oneDark] : []),
    EditorView.theme({
      '.cm-editor': {
        fontSize: `14px`,
        fontFamily: `Consolas, Monaco, "Courier New", monospace`,
      },
      '.cm-lineNumbers': {
        fontSize: `12px`,
        color: isDark.value ? `#7d8590` : `#656d76`,
        backgroundColor: isDark.value ? `#161b22` : `#f6f8fa`,
        paddingLeft: `8px`,
        minWidth: `40px`,
      },
      '.cm-gutters': {
        backgroundColor: isDark.value ? `#161b22` : `#f6f8fa`,
        borderRight: `1px solid ${isDark.value ? `#30363d` : `#e1e4e8`}`,
      },
      '.cm-gutterElement': {
        display: `inline-flex`,
        justifyContent: `center`,
        alignItems: `center`,
      },
      '.cm-gutterElement>span': {
        display: `inline-flex`,
        justifyContent: `center`,
        alignItems: `center`,
      },
      '.cm-activeLineGutter': {
        backgroundColor: isDark.value ? `#1c2128` : `#e3f2fd`,
        color: isDark.value ? `#58a6ff` : `#1976d2`,
      },
    }),
  ]

  const editorView = new EditorView({
    parent: formCustomTextarea.value!,
    extensions,
    doc: code.value,
  })

  editor.value = editorView
})

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

function formCustomSave() {
  const str = editor.value!.state.doc.toString()
  localStorage.setItem(`formCustomConfig`, str)
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
