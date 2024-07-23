import { defineStore } from 'pinia'
import { marked } from 'marked'
import CodeMirror from 'codemirror/lib/codemirror'

import config from '../assets/scripts/config'
import WxRenderer from '../assets/scripts/renderers/wx-renderer'
import DEFAULT_CONTENT from '@/assets/example/markdown.md'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt'
import {
  formatDoc,
  formatCss,
  setFontSize,
  setColorWithCustomTemplate,
} from '@/assets/scripts/util'

const defaultKeyMap = CodeMirror.keyMap[`default`]
const modPrefix =
  defaultKeyMap === CodeMirror.keyMap[`macDefault`] ? `Cmd` : `Ctrl`

export const useStore = defineStore(`store`, {
  state: () => ({
    wxRenderer: null,
    output: ``,
    html: ``,
    editor: null,
    cssEditor: null,
    currentFont: ``,
    currentSize: ``,
    currentColor: ``,
    citeStatus: false,
    nightMode: false,
    codeTheme: config.codeThemeOption[2].value,
    legend: config.legendOption[3].value,
    isMacCodeBlock: true,
    isEditOnLeft: true,
  }),
  actions: {
    setEditorValue(data) {
      this.editor.setValue(data)
    },
    setCssEditorValue(data) {
      this.cssEditor.setValue(data)
    },
    setWxRendererOptions(data) {
      this.wxRenderer.setOptions(data)
    },
    setCiteStatus(data) {
      this.citeStatus = data
      localStorage.setItem(`citeStatus`, data)
    },
    setCurrentFont(data) {
      this.currentFont = data
      localStorage.setItem(`fonts`, data)
    },
    setCurrentSize(data) {
      this.currentSize = data
      localStorage.setItem(`size`, data)
    },
    setCurrentColor(data) {
      this.currentColor = data
      localStorage.setItem(`color`, data)
    },
    setCurrentCodeTheme(data) {
      this.codeTheme = data
      localStorage.setItem(`codeTheme`, data)
    },
    setCurrentLegend(data) {
      this.legend = data
      localStorage.setItem(`legend`, data)
    },
    setIsMacCodeBlock(data) {
      this.isMacCodeBlock = data
      localStorage.setItem(`isMacCodeBlock`, data)
    },
    setIsEditOnLeft(data) {
      this.isEditOnLeft = data
      localStorage.setItem(`isEditOnLeft`, data)
    },
    themeChanged() {
      this.nightMode = !this.nightMode
      localStorage.setItem(`nightMode`, this.nightMode)
    },
    initEditorState() {
      this.currentFont =
        localStorage.getItem(`fonts`) || config.builtinFonts[0].value
      this.currentColor =
        localStorage.getItem(`color`) || config.colorOption[0].value
      this.currentSize =
        localStorage.getItem(`size`) || config.sizeOption[2].value
      this.codeTheme =
        localStorage.getItem(`codeTheme`) || config.codeThemeOption[2].value
      this.legend =
        localStorage.getItem(`legend`) || config.legendOption[3].value
      this.citeStatus = localStorage.getItem(`citeStatus`) === `true`
      this.nightMode = localStorage.getItem(`nightMode`) === `true`
      this.isMacCodeBlock = !(
        localStorage.getItem(`isMacCodeBlock`) === `false`
      )
      this.isEditOnLeft = !(localStorage.getItem(`isEditOnLeft`) === `false`)

      const theme = setFontSize(this.currentSize.replace(`px`, ``))
      this.wxRenderer = new WxRenderer({
        theme: setColorWithCustomTemplate(theme, this.currentColor),
        fonts: this.currentFont,
        size: this.currentSize,
      })
    },
    initEditorEntity() {
      const editorDom = document.getElementById(`editor`)

      if (!editorDom.value) {
        editorDom.value =
          localStorage.getItem(`__editor_content`) || formatDoc(DEFAULT_CONTENT)
      }
      this.editor = CodeMirror.fromTextArea(editorDom, {
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
    },
    initCssEditorEntity() {
      const cssEditorDom = document.getElementById(`cssEditor`)

      if (!cssEditorDom.value) {
        cssEditorDom.value =
          localStorage.getItem(`__css_content`) || DEFAULT_CSS_CONTENT
      }
      this.cssEditor = CodeMirror.fromTextArea(cssEditorDom, {
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
          [`${modPrefix}-S`]: function save(editor) {},
        },
      })
    },
    editorRefresh() {
      const renderer = this.wxRenderer.getRenderer(this.citeStatus)
      marked.setOptions({ renderer })
      let output = marked.parse(this.editor.getValue(0))

      // 去除第一行的 margin-top
      output = output.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
      if (this.citeStatus) {
        // 引用脚注
        output += this.wxRenderer.buildFootnotes()
        // 附加的一些 style
        output += this.wxRenderer.buildAddition()
      }

      if (this.isMacCodeBlock) {
        output += `
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
      this.output = output
    },
  },
})
