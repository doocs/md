import type { Renderer, RendererObject, Tokens } from 'marked'
import { marked } from 'marked'
import hljs from 'highlight.js'
import mermaid from 'mermaid'
import { toMerged } from 'es-toolkit'

import type { PropertiesHyphen } from 'csstype'
import { MDKatex } from './MDKatex'
import type { ExtendedProperties, IOpts, ThemeStyles } from '@/types'

marked.use(MDKatex({ nonStandard: true }))

function buildTheme({ theme, fonts, size }: IOpts): ThemeStyles {
  const base = toMerged(theme.base, {
    'font-family': fonts,
    'font-size': size,
  })

  const mergeStyles = (styles: Record<string, PropertiesHyphen>): Record<string, ExtendedProperties> =>
    Object.fromEntries(
      Object.entries(styles).map(([ele, style]) => [ele, toMerged(base, style)]),
    )
  return {
    ...mergeStyles(theme.inline),
    ...mergeStyles(theme.block),
  } as ThemeStyles
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

function getStyles(styleMapping: ThemeStyles, tokenName: string, addition: string = ``): string {
  const dict = styleMapping[tokenName as keyof ThemeStyles]
  if (!dict) {
    return ``
  }
  const styles = Object.entries(dict)
    .map(([key, value]) => `${key}:${value}`)
    .join(`;`)
  return `style="${styles}${addition}"`
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

export function initRenderer(opts: IOpts) {
  const footnotes: [number, string, string][] = []
  let footnoteIndex: number = 0
  let styleMapping: ThemeStyles = buildTheme(opts)
  let codeIndex: number = 0
  let listIndex: number = 0
  let isOrdered: boolean = false

  function styles(tag: string, addition: string = ``): string {
    return getStyles(styleMapping, tag, addition)
  }

  function styledContent(styleLabel: string, content: string, tagName?: string): string {
    if (!content) {
      return ``
    }
    const tag = tagName ?? styleLabel
    return `<${tag} ${styles(styleLabel)}>${content}</${tag}>`
  }

  function addFootnote(title: string, link: string): number {
    footnotes.push([++footnoteIndex, title, link])
    return footnoteIndex
  }

  function reset(newOpts: IOpts): void {
    footnotes.length = 0
    footnoteIndex = 0
    setOptions(newOpts)
  }

  function setOptions(newOpts: IOpts): void {
    opts = { ...opts, ...newOpts }
    styleMapping = buildTheme(opts)
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
      let text = this.parser.parse(tokens)
      text = text.replace(/<p .*?>/g, `<p ${styles(`blockquote_p`)}>`)
      return styledContent(`blockquote`, text)
    },

    code({ text, lang = `` }: Tokens.Code): string {
      if (lang.startsWith(`mermaid`)) {
        clearTimeout(codeIndex)
        codeIndex = setTimeout(() => {
          mermaid.run()
        }, 0) as any as number
        return `<pre class="mermaid">${text}</pre>`
      }
      const langText = lang.split(` `)[0]
      const language = hljs.getLanguage(langText) ? langText : `plaintext`
      let highlighted = hljs.highlight(text, { language }).value
      highlighted = highlighted
        .replace(/\r\n/g, `<br/>`)
        .replace(/\n/g, `<br/>`)
        .replace(/(>[^<]+)|(^[^<]+)/g, str => str.replace(/\s/g, `&nbsp;`))

      return `<pre class="hljs code__pre" ${styles(`code_pre`)}><span class="mac-sign" style="padding: 10px 14px 0;" hidden><svg xmlns="http://www.w3.org/2000/svg" version="1.1"  x="0px" y="0px" width="45px" height="13px" viewbox="0 0 450 130"><ellipse cx="65" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)"/><ellipse cx="225" cy="65" rx="50" ry="52"  stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)"/><ellipse cx="385" cy="65" rx="50" ry="52"  stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)"/></svg></span><code class="language-${lang}" ${styles(`code`)}>${highlighted}</code></pre>`
    },

    codespan({ text }: Tokens.Codespan): string {
      return styledContent(`codespan`, text, `code`)
    },

    listitem(item: Tokens.ListItem): string {
      const prefix = isOrdered ? `${listIndex + 1}. ` : `• `
      const content = item.tokens.map(t => (this[t.type as keyof Renderer] as <T>(token: T) => string)(t)).join(``)
      return styledContent(`listitem`, `${prefix}${content}`, `li`)
    },

    list({ ordered, items }: Tokens.List): string {
      const listItems = []
      for (let i = 0; i < items.length; i++) {
        isOrdered = ordered
        listIndex = i
        const item = items[i]
        listItems.push(this.listitem(item))
      }
      const label = ordered ? `ol` : `ul`
      return styledContent(label, listItems.join(``))
    },

    image({ href, title, text }: Tokens.Image): string {
      const subText = styledContent(`figcaption`, transform(opts.legend, text, title))
      const figureStyles = styles(`figure`)
      const imgStyles = styles(`image`)
      return `<figure ${figureStyles}><img ${imgStyles} src="${href}" title="${title}" alt="${text}"/>${subText}</figure>`
    },

    link({ href, title, text }: Tokens.Link): string {
      if (href.startsWith(`https://mp.weixin.qq.com`)) {
        return `<a href="${href}" title="${title || text}" ${styles(`wx_link`)}>${text}</a>`
      }
      if (href === text) {
        return text
      }
      if (opts.status) {
        const ref = addFootnote(title || text, href)
        return `<span ${styles(`link`)}>${text}<sup>[${ref}]</sup></span>`
      }
      return styledContent(`link`, text, `span`)
    },

    strong({ tokens }: Tokens.Strong): string {
      return styledContent(`strong`, this.parser.parseInline(tokens))
    },

    em({ tokens }: Tokens.Em): string {
      return styledContent(`em`, this.parser.parseInline(tokens), `span`)
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header
        .map(cell => this.tablecell(cell))
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
        <section style="padding:0 8px; max-width: 100%; overflow: auto">
          <table class="preview-table">
            <thead ${styles(`thead`)}>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens)
      return styledContent(`td`, text)
    },

    hr(): string {
      return styledContent(`hr`, ``)
    },
  }

  marked.use({ renderer })

  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
  }
}
