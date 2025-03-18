import type { ReadTimeResults } from 'reading-time'
import DEFAULT_CONTENT from '@/assets/example/markdown.md?raw'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt?raw'
import {
  altKey,
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  shiftKey,
  themeMap,
  themeOptions,
} from '@/config'
import {
  addPrefix,
  css2json,
  customCssWithTemplate,
  customizeTheme,
  downloadMD,
  exportHTML,
  formatDoc,
} from '@/utils'

import { initRenderer } from '@/utils/renderer'
import CodeMirror from 'codemirror'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

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

  // 是否统计字数和阅读时间
  const isCountStatus = useStorage(`isCountStatus`, false)
  const toggleCountStatus = useToggle(isCountStatus)

  // 是否开启段落首行缩进
  const isUseIndent = useStorage(addPrefix(`use_indent`), false)
  const toggleUseIndent = useToggle(isUseIndent)

  const output = ref(``)

  // 文本字体
  const theme = useStorage<keyof typeof themeMap>(
    addPrefix(`theme`),
    themeOptions[0].value,
  )
  // 文本字体
  const fontFamily = useStorage(`fonts`, fontFamilyOptions[0].value)
  // 文本大小
  const fontSize = useStorage(`size`, fontSizeOptions[2].value)
  // 主色
  const primaryColor = useStorage(`color`, colorOptions[0].value)
  // 代码块主题
  const codeBlockTheme = useStorage(
    `codeBlockTheme`,
    codeBlockThemeOptions[23].value,
  )
  // 图注格式
  const legend = useStorage(`legend`, legendOptions[3].value)

  const fontSizeNumber = computed(() =>
    Number(fontSize.value.replace(`px`, ``)),
  )

  // 内容编辑器编辑器
  const editor = ref<CodeMirror.EditorFromTextArea | null>(null)
  // 编辑区域内容
  // 预备弃用
  const editorContent = useStorage(`__editor_content`, DEFAULT_CONTENT)

  const isOpenRightSlider = useStorage(
    addPrefix(`is_open_right_slider`),
    false,
  )

  const isOpenPostSlider = useStorage(addPrefix(`is_open_post_slider`), false)
  // 内容列表
  const posts = useStorage(addPrefix(`posts`), [
    {
      title: `内容1`,
      content: DEFAULT_CONTENT,
    },
  ])
  // 当前内容
  const currentPostIndex = useStorage(addPrefix(`current_post_index`), 0)

  const addPost = (title: string) => {
    currentPostIndex.value
      = posts.value.push({
        title,
        content: `# ${title}`,
      }) - 1
  }

  const renamePost = (index: number, title: string) => {
    posts.value[index].title = title
  }

  const delPost = (index: number) => {
    posts.value.splice(index, 1)
    currentPostIndex.value = Math.min(index, posts.value.length - 1)
  }

  watch(currentPostIndex, () => {
    toRaw(editor.value!).setValue(posts.value[currentPostIndex.value].content)
  })

  onMounted(() => {
    // 迁移阶段，兼容之前的方案
    if (editorContent.value !== DEFAULT_CONTENT) {
      posts.value[currentPostIndex.value].content = editorContent.value
      editorContent.value = DEFAULT_CONTENT
    }
  })

  // 格式化文档
  const formatContent = () => {
    formatDoc(editor.value!.getValue()).then((doc) => {
      posts.value[currentPostIndex.value].content = doc
      toRaw(editor.value!).setValue(doc)
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

  // 自义定 CSS 编辑器
  const cssEditor = ref<CodeMirror.EditorFromTextArea | null>(null)
  const setCssEditorValue = (content: string) => {
    cssEditor.value!.setValue(content)
  }
  // 自定义 CSS 内容
  const cssContent = useStorage(`__css_content`, DEFAULT_CSS_CONTENT)
  const cssContentConfig = useStorage(addPrefix(`css_content_config`), {
    active: `方案1`,
    tabs: [
      {
        title: `方案1`,
        name: `方案1`,
        // 兼容之前的方案
        content: cssContent.value || DEFAULT_CSS_CONTENT,
      },
    ],
  })
  onMounted(() => {
    // 清空过往历史记录
    cssContent.value = ``
  })
  const getCurrentTab = () =>
    cssContentConfig.value.tabs.find((tab) => {
      return tab.name === cssContentConfig.value.active
    })!
  const tabChanged = (name: string) => {
    cssContentConfig.value.active = name
    const content = cssContentConfig.value.tabs.find((tab) => {
      return tab.name === name
    })!.content
    setCssEditorValue(content)
  }

  // 重命名 css 方案
  const renameTab = (name: string) => {
    const tab = getCurrentTab()!
    tab.title = name
    tab.name = name
    cssContentConfig.value.active = name
  }

  const addCssContentTab = (name: string) => {
    cssContentConfig.value.tabs.push({
      name,
      title: name,
      content: DEFAULT_CSS_CONTENT,
    })
    cssContentConfig.value.active = name
    setCssEditorValue(DEFAULT_CSS_CONTENT)
  }
  const validatorTabName = (val: string) => {
    return cssContentConfig.value.tabs.every(({ name }) => name !== val)
  }

  const renderer = initRenderer({
    theme: customCssWithTemplate(
      css2json(getCurrentTab().content),
      primaryColor.value,
      customizeTheme(themeMap[theme.value], {
        fontSize: fontSizeNumber.value,
        color: primaryColor.value,
      }),
    ),
    fonts: fontFamily.value,
    size: fontSize.value,
    isUseIndent: isUseIndent.value,
  })

  const readingTime = ref<ReadTimeResults | null>(null)

  // 更新编辑器
  const editorRefresh = () => {
    codeThemeChange()
    renderer.reset({
      citeStatus: isCiteStatus.value,
      legend: legend.value,
      isUseIndent: isUseIndent.value,
      countStatus: isCountStatus.value,
    })

    const {
      markdownContent,
      readingTime: readingTimeResult,
    } = renderer.parseFrontMatterAndContent(editor.value!.getValue())
    readingTime.value = readingTimeResult
    let outputTemp = marked.parse(markdownContent) as string
    outputTemp = DOMPurify.sanitize(outputTemp)

    // 阅读时间及字数统计
    outputTemp = renderer.buildReadingTime(readingTimeResult) + outputTemp

    // 去除第一行的 margin-top
    outputTemp = outputTemp.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
    // 引用脚注
    outputTemp += renderer.buildFootnotes()
    // 附加的一些 style
    outputTemp += renderer.buildAddition()

    if (isMacCodeBlock.value) {
      outputTemp += `
        <style>
          .hljs.code__pre > .mac-sign {
            display: flex;
          }
        </style>
      `
    }

    outputTemp += `
      <style>
        .code__pre {
          padding: 0 !important;
        }

        .hljs.code__pre code {
          display: -webkit-box;
          padding: 0.5em 1em 1em;
          overflow-x: auto;
          text-indent: 0;
        }
      </style>
    `

    output.value = renderer.createContainer(outputTemp)
  }

  // 更新 CSS
  const updateCss = () => {
    const json = css2json(cssEditor.value!.getValue())
    const newTheme = customCssWithTemplate(
      json,
      primaryColor.value,
      customizeTheme(themeMap[theme.value], {
        fontSize: fontSizeNumber.value,
        color: primaryColor.value,
      }),
    )
    renderer.setOptions({
      theme: newTheme,
    })

    editorRefresh()
  }
  // 初始化 CSS 编辑器
  onMounted(() => {
    const cssEditorDom = document.querySelector<HTMLTextAreaElement>(
      `#cssEditor`,
    )!
    cssEditorDom.value = getCurrentTab().content
    const theme = isDark.value ? `darcula` : `xq-light`
    cssEditor.value = markRaw(
      CodeMirror.fromTextArea(cssEditorDom, {
        mode: `css`,
        theme,
        lineNumbers: false,
        lineWrapping: true,
        styleActiveLine: true,
        matchBrackets: true,
        autofocus: true,
        extraKeys: {
          [`${shiftKey}-${altKey}-F`]: function autoFormat(
            editor: CodeMirror.Editor,
          ) {
            formatDoc(editor.getValue(), `css`).then((doc) => {
              getCurrentTab().content = doc
              editor.setValue(doc)
            })
          },
        },
      } as never),
    )

    // 自动提示
    cssEditor.value.on(`keyup`, (cm, e) => {
      if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 189) {
        (cm as any).showHint(e)
      }
    })

    // 实时保存
    cssEditor.value.on(`update`, () => {
      updateCss()
      getCurrentTab().content = cssEditor.value!.getValue()
    })
  })

  watch(isDark, () => {
    const theme = isDark.value ? `darcula` : `xq-light`
    toRaw(cssEditor.value)?.setOption?.(`theme`, theme)
  })

  // 重置样式
  const resetStyle = () => {
    isCiteStatus.value = false
    isMacCodeBlock.value = true
    isCountStatus.value = false

    theme.value = themeOptions[0].value
    fontFamily.value = fontFamilyOptions[0].value
    fontFamily.value = fontFamilyOptions[0].value
    fontSize.value = fontSizeOptions[2].value
    primaryColor.value = colorOptions[0].value
    codeBlockTheme.value = codeBlockThemeOptions[23].value
    legend.value = legendOptions[3].value

    cssContentConfig.value = {
      active: `方案 1`,
      tabs: [
        {
          title: `方案 1`,
          name: `方案 1`,
          // 兼容之前的方案
          content: cssContent.value || DEFAULT_CSS_CONTENT,
        },
      ],
    }

    cssEditor.value!.setValue(DEFAULT_CSS_CONTENT)

    updateCss()
    editorRefresh()

    toast.success(`样式重置成功~`)
  }

  // 为函数添加刷新编辑器的功能
  const withAfterRefresh = (fn: (...rest: any[]) => void) => (
    ...rest: any[]
  ) => {
    fn(...rest)
    editorRefresh()
  }

  const getTheme = (size: string, color: string) => {
    const newTheme = themeMap[theme.value]
    const fontSize = Number(size.replace(`px`, ``))
    return customCssWithTemplate(
      css2json(getCurrentTab().content),
      color,
      customizeTheme(newTheme, { fontSize, color }),
    )
  }

  const themeChanged = withAfterRefresh((newTheme: keyof typeof themeMap) => {
    renderer.setOptions({
      theme: customCssWithTemplate(
        css2json(getCurrentTab().content),
        primaryColor.value,
        customizeTheme(themeMap[newTheme], { fontSize: fontSizeNumber.value }),
      ),
    })
    theme.value = newTheme
  })

  const fontChanged = withAfterRefresh((fonts) => {
    renderer.setOptions({
      fonts,
    })

    fontFamily.value = fonts
  })

  const sizeChanged = withAfterRefresh((size) => {
    const theme = getTheme(size, primaryColor.value)
    renderer.setOptions({
      size,
      theme,
    })

    fontSize.value = size
  })

  const colorChanged = withAfterRefresh((newColor) => {
    const theme = getTheme(fontSize.value, newColor)
    renderer.setOptions({
      theme,
    })

    primaryColor.value = newColor
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

  const countStatusChanged = withAfterRefresh(() => {
    toggleCountStatus()
  })

  const useIndentChanged = withAfterRefresh(() => {
    toggleUseIndent()
  })

  // 导出编辑器内容为 HTML，并且下载到本地
  const exportEditorContent2HTML = () => {
    exportHTML(primaryColor.value)
    document.querySelector(`#output`)!.innerHTML = output.value
  }

  // 导出编辑器内容到本地
  const exportEditorContent2MD = () => {
    downloadMD(editor.value!.getValue())
  }

  // 导入默认文档
  const importDefaultContent = () => {
    editor.value!.setValue(DEFAULT_CONTENT)
    toast.success(`文档已重置为默认文档`)
  }

  const copyToClipboard = async () => {
    try {
      const selectedText = editor.value!.getSelection()
      if (selectedText) {
        await navigator.clipboard.writeText(selectedText)
      }
    }
    catch (error) {
      console.log(`复制失败`, error)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      editor.value!.replaceSelection(text)
    }
    catch (error) {
      console.log(`粘贴失败`, error)
    }
  }

  // 导入 Markdown 文档
  const importMarkdownContent = () => {
    const body = document.body
    const input = document.createElement(`input`)
    input.type = `file`
    input.name = `filename`
    input.accept = `.md`
    input.onchange = () => {
      const file = input.files![0]
      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = (event) => {
        editor.value!.setValue(event.target!.result as string)
        toast.success(`文档导入成功`)
      }
    }

    body.appendChild(input)
    input.click()
    body.removeChild(input)
  }

  const isOpenConfirmDialog = ref(false)

  // 重置样式
  const resetStyleConfirm = () => {
    isOpenConfirmDialog.value = true
  }

  return {
    isDark,
    toggleDark,

    isEditOnLeft,
    toggleEditOnLeft,

    isMacCodeBlock,
    isCiteStatus,
    citeStatusChanged,
    isUseIndent,
    useIndentChanged,

    isCountStatus,
    countStatusChanged,

    output,
    editor,
    cssEditor,
    theme,
    fontFamily,
    fontSize,
    primaryColor,
    codeBlockTheme,
    legend,
    readingTime,

    editorRefresh,

    themeChanged,
    fontChanged,
    sizeChanged,
    colorChanged,
    codeBlockThemeChanged,
    legendChanged,
    macCodeBlockChanged,

    formatContent,
    exportEditorContent2HTML,
    exportEditorContent2MD,

    importMarkdownContent,
    importDefaultContent,

    copyToClipboard,
    pasteFromClipboard,

    isOpenConfirmDialog,
    resetStyleConfirm,
    resetStyle,

    cssContentConfig,
    addCssContentTab,
    validatorTabName,
    setCssEditorValue,
    tabChanged,
    renameTab,
    posts,
    currentPostIndex,
    addPost,
    renamePost,
    delPost,
    isOpenPostSlider,
    isOpenRightSlider,
  }
})

export const useDisplayStore = defineStore(`display`, () => {
  // 是否展示 CSS 编辑器
  const isShowCssEditor = ref(false)
  const toggleShowCssEditor = useToggle(isShowCssEditor)

  // 是否展示插入表格对话框
  const isShowInsertFormDialog = ref(false)
  const toggleShowInsertFormDialog = useToggle(isShowInsertFormDialog)

  // 是否展示上传图片对话框
  const isShowUploadImgDialog = ref(false)
  const toggleShowUploadImgDialog = useToggle(isShowUploadImgDialog)

  return {
    isShowCssEditor,
    toggleShowCssEditor,
    isShowInsertFormDialog,
    toggleShowInsertFormDialog,
    isShowUploadImgDialog,
    toggleShowUploadImgDialog,
  }
})
