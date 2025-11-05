import type { IOpts, RendererAPI } from '@md/shared/types'
import type { RendererObject, Tokens } from 'marked'
import type { ReadTimeResults } from 'reading-time'
import frontMatter from 'front-matter'
import hljs from 'highlight.js/lib/core'
import { marked } from 'marked'
import readingTime from 'reading-time'
import { markedAlert, markedFootnotes, markedMarkup, markedPlantUML, markedRuby, markedSlider, markedToc, MDKatex } from '../extensions'
import { COMMON_LANGUAGES, highlightAndFormatCode } from '../utils/languages'

Object.entries(COMMON_LANGUAGES).forEach(([name, lang]) => {
  hljs.registerLanguage(name, lang)
})

export { hljs }

marked.setOptions({
  breaks: true,
})
marked.use(markedSlider())

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, `&amp;`) // 转义 &
    .replace(/</g, `&lt;`) // 转义 <
    .replace(/>/g, `&gt;`) // 转义 >
    .replace(/"/g, `&quot;`) // 转义 "
    .replace(/'/g, `&#39;`) // 转义 '
    .replace(/`/g, `&#96;`) // 转义 `
}

function buildAddition(): string {
  return `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
    </style>
  `
}

function buildFootnoteArray(footnotes: [number, string, string][]): string {
  return footnotes
    .map(([index, title, link]) =>
      link === title
        ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
        : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`,
    )
    .join(`\n`)
}

function transform(legend: string, text: string | null, title: string | null): string {
  const options = legend.split(`-`)
  for (const option of options) {
    if (option === `alt` && text) {
      return text
    }
    if (option === `title` && title) {
      return title
    }
  }
  return ``
}

const macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim()

interface ParseResult {
  yamlData: Record<string, any>
  markdownContent: string
  readingTime: ReadTimeResults
}

function parseFrontMatterAndContent(markdownText: string): ParseResult {
  try {
    const parsed = frontMatter(markdownText)
    const yamlData = parsed.attributes
    const markdownContent = parsed.body

    const readingTimeResult = readingTime(markdownContent)

    return {
      yamlData: yamlData as Record<string, any>,
      markdownContent,
      readingTime: readingTimeResult,
    }
  }
  catch (error) {
    console.error(`Error parsing front-matter:`, error)
    return {
      yamlData: {},
      markdownContent: markdownText,
      readingTime: readingTime(markdownText),
    }
  }
}

export function initRenderer(opts: IOpts = {}): RendererAPI {
  const footnotes: [number, string, string][] = []
  let footnoteIndex: number = 0
  let codeIndex: number = 0
  const listOrderedStack: boolean[] = []
  const listCounters: number[] = []

  function getOpts(): IOpts {
    return opts
  }

  /**
   * 生成带 CSS 类的内容（新主题系统）
   * @param styleLabel CSS 类名标识
   * @param content 内容
   * @param tagName HTML 标签名（可选）
   */
  function styledContent(styleLabel: string, content: string, tagName?: string): string {
    const tag = tagName ?? styleLabel
    const className = `md-${styleLabel.replace(/_/g, `-`)}`
    const headingAttr = /^h\d$/.test(tag) ? ` data-heading="true"` : ``
    return `<${tag} class="${className}"${headingAttr}>${content}</${tag}>`
  }

  function addFootnote(title: string, link: string): number {
    // 检查是否已经存在相同的链接
    const existingFootnote = footnotes.find(([, , existingLink]) => existingLink === link)
    if (existingFootnote) {
      return existingFootnote[0] // 返回已存在的脚注索引
    }

    // 如果不存在，创建新的脚注
    footnotes.push([++footnoteIndex, title, link])
    return footnoteIndex
  }

  function reset(newOpts: Partial<IOpts>): void {
    footnotes.length = 0
    footnoteIndex = 0
    setOptions(newOpts)
  }

  function setOptions(newOpts: Partial<IOpts>): void {
    opts = { ...opts, ...newOpts }
    // 新主题系统：扩展不再需要 styles 参数
    marked.use(markedAlert())
    marked.use(MDKatex({ nonStandard: true }, true))
    marked.use(markedMarkup())
  }

  function buildReadingTime(readingTime: ReadTimeResults): string {
    if (!opts.countStatus) {
      return ``
    }
    if (!readingTime.words) {
      return ``
    }
    return `
      <blockquote class="md-blockquote">
        <p class="md-blockquote-p">字数 ${readingTime?.words}，阅读大约需 ${Math.ceil(readingTime?.minutes)} 分钟</p>
      </blockquote>
    `
  }

  const buildFootnotes = () => {
    if (!footnotes.length) {
      return ``
    }

    return (
      styledContent(`h4`, `引用链接`)
      + styledContent(`footnotes`, buildFootnoteArray(footnotes), `p`)
    )
  }

  const renderer: RendererObject = {
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens)
      const tag = `h${depth}`
      return styledContent(tag, text)
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens)
      const isFigureImage = text.includes(`<figure`) && text.includes(`<img`)
      const isEmpty = text.trim() === ``
      if (isFigureImage || isEmpty) {
        return text
      }
      return styledContent(`p`, text)
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens)
      // 新主题系统：blockquote 内的 p 标签由 CSS 选择器 `blockquote p` 控制
      return styledContent(`blockquote`, text)
    },

    code({ text, lang = `` }: Tokens.Code): string {
      if (lang.startsWith(`mermaid`)) {
        clearTimeout(codeIndex)
        codeIndex = setTimeout(async () => {
          // 优先使用全局 CDN 的 mermaid
          if (typeof window !== `undefined` && (window as any).mermaid) {
            const mermaid = (window as any).mermaid
            await mermaid.run()
          }
          else {
            // 回退到动态导入（开发环境）
            const mermaid = await import(`mermaid`)
            await mermaid.default.run()
          }
        }, 0) as any as number
        return `<pre class="mermaid">${text}</pre>`
      }
      const langText = lang.split(` `)[0]
      const isLanguageRegistered = hljs.getLanguage(langText)
      const language = isLanguageRegistered ? langText : `plaintext`

      const highlighted = highlightAndFormatCode(text, language, hljs, !!opts.isShowLineNumber)

      const span = `<span class="mac-sign" style="padding: 10px 14px 0;">${macCodeSvg}</span>`
      // 如果语言未注册，添加 data-language-pending 属性和原始代码文本用于后续动态加载
      let pendingAttr = ``
      if (!isLanguageRegistered && langText !== `plaintext`) {
        const escapedText = text.replace(/"/g, `&quot;`)
        pendingAttr = ` data-language-pending="${langText}" data-raw-code="${escapedText}" data-show-line-number="${opts.isShowLineNumber}"`
      }
      const code = `<code class="language-${lang}"${pendingAttr}>${highlighted}</code>`

      return `<pre class="hljs code__pre">${span}${code}</pre>`
    },

    codespan({ text }: Tokens.Codespan): string {
      const escapedText = escapeHtml(text)
      return styledContent(`codespan`, escapedText, `code`)
    },

    list({ ordered, items, start = 1 }: Tokens.List) {
      listOrderedStack.push(ordered)
      listCounters.push(Number(start))

      const html = items
        .map(item => this.listitem(item))
        .join(``)

      listOrderedStack.pop()
      listCounters.pop()

      return styledContent(
        ordered ? `ol` : `ul`,
        html,
      )
    },

    // 2. listitem：从栈顶取 ordered + counter，计算 prefix 并自增
    listitem(token: Tokens.ListItem) {
      const ordered = listOrderedStack[listOrderedStack.length - 1]
      const idx = listCounters[listCounters.length - 1]!

      // 准备下一个
      listCounters[listCounters.length - 1] = idx + 1

      const prefix = ordered
        ? `${idx}. `
        : `• `

      // 渲染内容：优先 inline，fallback 去掉 <p> 包裹
      let content: string
      try {
        content = this.parser.parseInline(token.tokens)
      }
      catch {
        content = this.parser
          .parse(token.tokens)
          .replace(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/, `$1`)
      }

      return styledContent(
        `listitem`,
        `${prefix}${content}`,
        `li`,
      )
    },

    image({ href, title, text }: Tokens.Image): string {
      const subText = styledContent(`figcaption`, transform(opts.legend!, text, title))
      return `<figure><img src="${href}" title="${title}" alt="${text}"/>${subText}</figure>`
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const parsedText = this.parser.parseInline(tokens)
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
        return `<a href="${href}" title="${title || text}">${parsedText}</a>`
      }
      if (href === text) {
        return parsedText
      }
      if (opts.citeStatus) {
        const ref = addFootnote(title || text, href)
        return `<a href="${href}" title="${title || text}">${parsedText}<sup>[${ref}]</sup></a>`
      }
      return `<a href="${href}" title="${title || text}">${parsedText}</a>`
    },

    strong({ tokens }: Tokens.Strong): string {
      return styledContent(`strong`, this.parser.parseInline(tokens))
    },

    em({ tokens }: Tokens.Em): string {
      return styledContent(`em`, this.parser.parseInline(tokens))
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header
        .map((cell) => {
          const text = this.parser.parseInline(cell.tokens)
          return styledContent(`th`, text)
        })
        .join(``)
      const body = rows
        .map((row) => {
          const rowContent = row
            .map(cell => this.tablecell(cell))
            .join(``)
          return styledContent(`tr`, rowContent)
        })
        .join(``)
      return `
        <section style="max-width: 100%; overflow: auto">
          <table class="preview-table">
            <thead>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens)
      return styledContent(`td`, text)
    },

    hr(_: Tokens.Hr): string {
      return styledContent(`hr`, ``)
    },
  }

  marked.use({ renderer })
  // 新主题系统：扩展不再需要 styles 参数
  marked.use(markedMarkup())
  marked.use(markedToc())
  marked.use(markedSlider())
  marked.use(markedAlert({}))
  marked.use(MDKatex({ nonStandard: true }, true))
  marked.use(markedFootnotes())
  marked.use(markedPlantUML({
    inlineSvg: true, // 启用SVG内嵌，适用于微信公众号
  }))
  marked.use(markedRuby())

  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
    parseFrontMatterAndContent,
    buildReadingTime,
    createContainer(content: string) {
      return styledContent(`container`, content, `section`)
    },
    getOpts,
  }
}
