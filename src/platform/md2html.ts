import DOMPurify from 'isomorphic-dompurify'

export function modifyHtmlContent(outputTemp: string): string {
  outputTemp = DOMPurify.sanitize(outputTemp, {
    ADD_TAGS: [`mp-common-profile`],
  })

  // 阅读时间及字数统计
  // outputTemp = renderer.buildReadingTime(readingTimeResult) + outputTemp

  // 去除第一行的 margin-top
  outputTemp = outputTemp.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
  // 引用脚注
  // outputTemp += renderer.buildFootnotes()
  // // 附加的一些 style
  // outputTemp += renderer.buildAddition()

  // if (isMacCodeBlock.value) {
  if (true) {
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
  
        h2 strong {
          color: inherit !important;
        }
      </style>
    `
  return outputTemp
  // return renderer.createContainer(outputTemp)
}
