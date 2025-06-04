import DOMPurify from 'dompurify'

export function modifyHtmlContent(outputTemp: string, renderer: any): string {
  const {
    markdownContent,
    readingTime: readingTimeResult,
  } = renderer.parseFrontMatterAndContent(outputTemp)
  let _outputTemp = DOMPurify.sanitize(markdownContent, {
    ADD_TAGS: [`mp-common-profile`],
  })

  // 阅读时间及字数统计
  _outputTemp = renderer.buildReadingTime(readingTimeResult) + _outputTemp

  // 去除第一行的 margin-top
  _outputTemp = _outputTemp.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
  // 引用脚注
  _outputTemp += renderer.buildFootnotes()
  // // 附加的一些 style
  _outputTemp += renderer.buildAddition()

  if (renderer.getOpts().isMacCodeBlock) {
    _outputTemp += `
        <style>
          .hljs.code__pre > .mac-sign {
            display: flex;
          }
        </style>
      `
  }

  _outputTemp += `
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
  
        h2 strong {
          color: inherit !important;
        }
      </style>
    `
  return renderer.createContainer(_outputTemp)
}
