# @md/core

核心渲染引擎，用于将 Markdown 文本渲染为 HTML 内容。

## 使用

```ts
import { initRenderer, renderMarkdown } from '@md/core'

// 初始化 renderer
const renderer = initRenderer({
  // options IOpts
})

// 渲染 Markdown
const { html, readingTime } = renderMarkdown(raw, renderer)
```

`IOpts` 参数说明：

```ts
export interface Theme {
  base: ExtendedProperties
  block: Record<Block, ExtendedProperties>
  inline: Record<Inline, ExtendedProperties>
}

export interface IOpts {
  theme: Theme
  fonts: string
  size: string
  isUseIndent: boolean
  isUseJustify: boolean
  legend?: string
  citeStatus?: boolean
  countStatus?: boolean
  isMacCodeBlock?: boolean
  isShowLineNumber?: boolean
}
```
