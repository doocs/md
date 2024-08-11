import { markRaw, onMounted, ref } from 'vue'
import { createPinia, defineStore } from 'pinia'
import { marked } from 'marked'
import CodeMirror from 'codemirror/lib/codemirror'
import { useDark, useStorage, useToggle } from '@vueuse/core'

import config from '@/config'
import WxRenderer from '@/assets/scripts/renderers/wx-renderer'
import DEFAULT_CONTENT from '@/assets/example/markdown.md?raw'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt?raw'
import { css2json, customCssWithTemplate, downloadMD, exportHTML, formatCss, formatDoc, setColor, setColorWithCustomTemplate, setFontSize } from '@/assets/scripts/util'

const defaultKeyMap = CodeMirror.keyMap.default
const modPrefix
  = defaultKeyMap === CodeMirror.keyMap.macDefault ? `Cmd` : `Ctrl`

export const useStore = defineStore(`store`, () => {
  // 是否开启深色模式
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  // 是否开启 Mac 代码块
  const isMacCodeBlock = useStorage(`isMacCodeBlock`, true)
  const toggleMacCodeBlock = useToggle(isMacCodeBlock)

  // 是否在左侧编辑
  const isEditOnLeft = useStorage(`isEditOnLeft`, true)
  const toggleEditOnLeft = useToggle(isEditOnLeft)

  // 是否开启微信外链接底部引用
  const isCiteStatus = useStorage(`isCiteStatus`, false)
  const toggleCiteStatus = useToggle(isCiteStatus)

  const output = ref(``)

  // 文本字体
  const fontFamily = useStorage(`fonts`, config.builtinFonts[0].value)
  // 文本大小
  const fontSize = useStorage(`size`, config.sizeOption[2].value)
  // 文本颜色
  const fontColor = useStorage(`color`, config.colorOption[0].value)
  // 代码块主题
  const codeBlockTheme = useStorage(`codeBlockTheme`, config.codeThemeOption[2].value)
  // 图注格式
  const legend = useStorage(`legend`, config.legendOption[3].value)

  const wxRenderer = new WxRenderer({
    theme: setColor(fontColor.value),
    fonts: fontFamily.value,
    size: fontSize.value,
  })

  // 编辑区域内容
  const editorContent = useStorage(`__editor_content`, formatDoc(DEFAULT_CONTENT))

  const editor = ref(null)
  // 格式化文档
  const formatContent = () => {
    const doc = formatDoc(editor.value.getValue())
    editorContent.value = doc
    editor.value.setValue(doc)
  }

  // 初始化编辑器
  const initEditorEntity = () => {
    const editorDom = document.querySelector(`#editor`)

    if (!editorDom.value) {
      editorDom.value
        = editorContent.value
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

  // 切换 highlight.js 代码主题
  const codeThemeChange = () => {
    const cssUrl = codeBlockTheme.value
    const el = document.querySelector(`#hljs`)
    if (el) {
      el.setAttribute(`href`, cssUrl)
    }
    else {
      const link = document.createElement(`link`)
      link.setAttribute(`type`, `text/css`)
      link.setAttribute(`rel`, `stylesheet`)
      link.setAttribute(`href`, cssUrl)
      link.setAttribute(`id`, `hljs`)
      document.head.appendChild(link)
    }
  }

  // 更新编辑器
  const editorRefresh = () => {
    codeThemeChange()

    const renderer = wxRenderer.getRenderer(isCiteStatus.value)
    marked.setOptions({ renderer })
    let outputTemp = marked.parse(editor.value.getValue(0))

    // 去除第一行的 margin-top
    outputTemp = outputTemp.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
    if (isCiteStatus.value) {
      // 引用脚注
      outputTemp += wxRenderer.buildFootnotes()
      // 附加的一些 style
      outputTemp += wxRenderer.buildAddition()
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

  const cssEditor = ref(null)
  // 自定义 CSS 内容
  const cssContent = useStorage(`__css_content`, DEFAULT_CSS_CONTENT)
  // 更新 CSS
  const updateCss = () => {
    const json = css2json(cssEditor.value.getValue())
    let theme = setFontSize(fontSize.value.replace(`px`, ``))

    theme = customCssWithTemplate(json, fontColor.value, theme)
    wxRenderer.setOptions({
      theme,
    })
    editorRefresh()
  }

  // 初始化 CSS 编辑器
  onMounted(() => {
    const cssEditorDom = document.querySelector(`#cssEditor`)
    cssEditorDom.value = cssContent.value

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
            const doc = formatCss(editor.getValue())
            cssContent.value = doc
            editor.setValue(doc)
          },
        },
      }),
    )

    // 自动提示
    cssEditor.value.on(`keyup`, (cm, e) => {
      if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 189) {
        cm.showHint(e)
      }
    })

    // 实时保存
    cssEditor.value.on(`update`, () => {
      updateCss()
      cssContent.value = cssEditor.value.getValue()
    })
  })

  // 重置样式
  const resetStyle = () => {
    isCiteStatus.value = false
    isMacCodeBlock.value = true

    fontFamily.value = config.builtinFonts[0].value
    fontSize.value = config.sizeOption[2].value
    fontColor.value = config.colorOption[0].value
    codeBlockTheme.value = config.codeThemeOption[2].value
    legend.value = config.legendOption[3].value

    cssEditor.value.setValue(DEFAULT_CSS_CONTENT)

    updateCss()
    editorRefresh()
  }

  // 为函数添加刷新编辑器的功能
  const withAfterRefresh = fn => (...rest) => {
    fn(...rest)
    editorRefresh()
  }

  const getTheme = (size, color) => {
    const theme = setFontSize(size.replace(`px`, ``))
    return setColorWithCustomTemplate(theme, color)
  }

  const fontChanged = withAfterRefresh((fonts) => {
    wxRenderer.setOptions({
      fonts,
    })

    fontFamily.value = fonts
  })

  const sizeChanged = withAfterRefresh((size) => {
    const theme = getTheme(size, fontColor.value)
    wxRenderer.setOptions({
      size,
      theme,
    })

    fontSize.value = size
  })

  const colorChanged = withAfterRefresh((newColor) => {
    const theme = getTheme(fontSize.value, newColor)
    wxRenderer.setOptions({
      theme,
    })

    fontColor.value = newColor
  })

  const codeBlockThemeChanged = withAfterRefresh((newTheme) => {
    codeBlockTheme.value = newTheme
  })

  const legendChanged = withAfterRefresh((newVal) => {
    legend.value = newVal
  })

  const macCodeBlockChanged = withAfterRefresh(() => {
    toggleMacCodeBlock()
  })

  const citeStatusChanged = withAfterRefresh(() => {
    toggleCiteStatus()
  })

  // 导出编辑器内容为 HTML，并且下载到本地
  const exportEditorContent = () => {
    exportHTML()
    document.querySelector(`#output`).innerHTML = output.value
  }

  // 导出编辑器内容到本地
  const downloadEditorContent = () => {
    downloadMD(editor.value.getValue())
  }

  return {
    isDark,
    toggleDark,

    isEditOnLeft,
    toggleEditOnLeft,

    isMacCodeBlock,
    isCiteStatus,
    citeStatusChanged,

    output,
    editor,
    cssEditor,
    fontFamily,
    fontSize,
    fontColor,
    codeBlockTheme,
    legend,

    initEditorEntity,
    editorRefresh,

    updateCss,
    resetStyle,

    fontChanged,
    sizeChanged,
    colorChanged,
    codeBlockThemeChanged,
    legendChanged,
    macCodeBlockChanged,

    formatContent,
    exportEditorContent,
    downloadEditorContent,
  }
})

export default createPinia()
