import { markRaw, ref } from 'vue'
import { createPinia, defineStore } from 'pinia'
import { marked } from 'marked'
import CodeMirror from 'codemirror/lib/codemirror'

import config from '../assets/scripts/config'
import WxRenderer from '../assets/scripts/renderers/wx-renderer'
import DEFAULT_CONTENT from '@/assets/example/markdown.md?raw'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt?raw'
import { formatCss, formatDoc, setColor } from '@/assets/scripts/util'

const defaultKeyMap = CodeMirror.keyMap.default
const modPrefix
  = defaultKeyMap === CodeMirror.keyMap.macDefault ? `Cmd` : `Ctrl`

export const useStore = defineStore(`store`, () => {
  const wxRenderer = ref(null)
  const output = ref(``)
  const html = ref(``)
  const editor = ref(null)
  const cssEditor = ref(null)
  const currentFont = ref(``)
  const currentSize = ref(``)
  const currentColor = ref(``)
  const citeStatus = ref(false)
  const nightMode = ref(false)
  const codeTheme = ref(config.codeThemeOption[2].value)
  const legend = ref(config.legendOption[3].value)
  const isMacCodeBlock = ref(true)
  const isEditOnLeft = ref(true)

  const setEditorValue = (data) => {
    editor.value.setValue(data)
  }
  const setCssEditorValue = (data) => {
    cssEditor.value.setValue(data)
  }
  const setWxRendererOptions = (data) => {
    wxRenderer.value.setOptions(data)
  }
  const setCiteStatus = (data) => {
    citeStatus.value = data
    localStorage.setItem(`citeStatus`, data)
  }
  const setCurrentFont = (data) => {
    currentFont.value = data
    localStorage.setItem(`fonts`, data)
  }
  const setCurrentSize = (data) => {
    currentSize.value = data
    localStorage.setItem(`size`, data)
  }
  const setCurrentColor = (data) => {
    currentColor.value = data
    localStorage.setItem(`color`, data)
  }
  const setCurrentCodeTheme = (data) => {
    codeTheme.value = data
    localStorage.setItem(`codeTheme`, data)
  }
  const setCurrentLegend = (data) => {
    legend.value = data
    localStorage.setItem(`legend`, data)
  }
  const setIsMacCodeBlock = (data) => {
    isMacCodeBlock.value = data
    localStorage.setItem(`isMacCodeBlock`, data)
  }
  const setIsEditOnLeft = (data) => {
    isEditOnLeft.value = data
    localStorage.setItem(`isEditOnLeft`, data)
  }
  const themeChanged = () => {
    nightMode.value = !nightMode.value
    localStorage.setItem(`nightMode`, nightMode.value)
  }
  const initEditorState = () => {
    currentFont.value
      = localStorage.getItem(`fonts`) || config.builtinFonts[0].value
    currentColor.value
      = localStorage.getItem(`color`) || config.colorOption[0].value
    currentSize.value
      = localStorage.getItem(`size`) || config.sizeOption[2].value
    codeTheme.value
      = localStorage.getItem(`codeTheme`) || config.codeThemeOption[2].value
    legend.value
      = localStorage.getItem(`legend`) || config.legendOption[3].value
    citeStatus.value = localStorage.getItem(`citeStatus`) === `true`
    nightMode.value = localStorage.getItem(`nightMode`) === `true`
    isMacCodeBlock.value = !(
      localStorage.getItem(`isMacCodeBlock`) === `false`
    )
    isEditOnLeft.value = !(localStorage.getItem(`isEditOnLeft`) === `false`)
    wxRenderer.value = new WxRenderer({
      theme: setColor(currentColor.value),
      fonts: currentFont.value,
      size: currentSize.value,
    })
  }
  const initEditorEntity = () => {
    const editorDom = document.getElementById(`editor`)

    if (!editorDom.value) {
      editorDom.value
        = localStorage.getItem(`__editor_content`) || formatDoc(DEFAULT_CONTENT)
    }
    editor.value = CodeMirror.fromTextArea(editorDom, {
      mode: `text/x-markdown`,
      theme: `xq-light`,
      lineNumbers: false,
      lineWrapping: true,
      styleActiveLine: true,
      autoCloseBrackets: true,
      extraKeys: {
        [`${modPrefix}-F`]: function autoFormat(editor) {
          const doc = formatDoc(editor.getValue(0))
          localStorage.setItem(`__editor_content`, doc)
          editor.setValue(doc)
        },
        [`${modPrefix}-B`]: function bold(editor) {
          const selected = editor.getSelection()
          editor.replaceSelection(`**${selected}**`)
        },
        [`${modPrefix}-D`]: function del(editor) {
          const selected = editor.getSelection()
          editor.replaceSelection(`~~${selected}~~`)
        },
        [`${modPrefix}-I`]: function italic(editor) {
          const selected = editor.getSelection()
          editor.replaceSelection(`*${selected}*`)
        },
        [`${modPrefix}-K`]: function italic(editor) {
          const selected = editor.getSelection()
          editor.replaceSelection(`[${selected}]()`)
        },
        [`${modPrefix}-L`]: function code(editor) {
          const selected = editor.getSelection()
          editor.replaceSelection(`\`${selected}\``)
        },
      },
    })
  }
  const initCssEditorEntity = () => {
    const cssEditorDom = document.getElementById(`cssEditor`)

    if (!cssEditorDom.value) {
      cssEditorDom.value
        = localStorage.getItem(`__css_content`) || DEFAULT_CSS_CONTENT
    }
    cssEditor.value = markRaw(
      CodeMirror.fromTextArea(cssEditorDom, {
        mode: `css`,
        theme: `style-mirror`,
        lineNumbers: false,
        lineWrapping: true,
        matchBrackets: true,
        autofocus: true,
        extraKeys: {
          [`${modPrefix}-F`]: function autoFormat(editor) {
            const doc = formatCss(editor.getValue(0))
            localStorage.setItem(`__css_content`, doc)
            editor.setValue(doc)
          },
          [`${modPrefix}-S`]: function save(_editor) {},
        },
      }),
    )
  }
  const editorRefresh = () => {
    const renderer = wxRenderer.value.getRenderer(citeStatus.value)
    marked.setOptions({ renderer })
    let outputTemp = marked.parse(editor.value.getValue(0))

    // 去除第一行的 margin-top
    outputTemp = outputTemp.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
    if (citeStatus.value) {
      // 引用脚注
      outputTemp += wxRenderer.value.buildFootnotes()
      // 附加的一些 style
      outputTemp += wxRenderer.value.buildAddition()
    }

    if (isMacCodeBlock.value) {
      outputTemp += `
          <style>
            .hljs.code__pre::before {
              position: initial;
              padding: initial;
              content: '';
              display: block;
              height: 25px;
              background-color: transparent;
              background-image: url("https://doocs.oss-cn-shenzhen.aliyuncs.com/img/123.svg");
              background-position: 14px 10px!important;
              background-repeat: no-repeat;
              background-size: 40px!important;
            }

            .hljs.code__pre {
              padding: 0!important;
            }

            .hljs.code__pre code {
              display: -webkit-box;
              padding: 0.5em 1em 1em;
              overflow-x: auto;
              text-indent: 0;
            }
          </style>
        `
    }
    output.value = outputTemp
  }

  return {
    wxRenderer,
    output,
    html,
    editor,
    cssEditor,
    currentFont,
    currentSize,
    currentColor,
    citeStatus,
    nightMode,
    codeTheme,
    legend,
    isMacCodeBlock,
    isEditOnLeft,
    setEditorValue,
    setCssEditorValue,
    setWxRendererOptions,
    setCiteStatus,
    setCurrentFont,
    setCurrentSize,
    setCurrentColor,
    setCurrentCodeTheme,
    setCurrentLegend,
    setIsMacCodeBlock,
    setIsEditOnLeft,
    themeChanged,
    initEditorState,
    initEditorEntity,
    initCssEditorEntity,
    editorRefresh,
  }
})

export default createPinia()
