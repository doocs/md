import type { Renderer, RendererObject, Tokens } from 'marked'
import { marked } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'
import mermaid from 'mermaid'
import { toMerged } from 'es-toolkit'

import type { PropertiesHyphen } from 'csstype'
import type { ExtendedProperties, IOpts, ThemeStyles } from '@/types'

marked.use(
  markedKatex({
    throwOnError: false,
    output: `html`,
    nonStandard: true,
  }),
)

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

export function initRenderer(opts: IOpts) {
  const footnotes: [number, string, string][] = []
  let footnoteIndex: number = 0
  let styleMapping: ThemeStyles = buildTheme(opts)
  let codeIndex: number = 0
  let listIndex: number = 0
  let isOrdered: boolean = false

  function styledContent(styleLabel: string, content: string, tagName?: string): string {
    const tag = tagName ?? styleLabel
    return `<${tag} ${getStyles(styleMapping, styleLabel)}>${content}</${tag}>`
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
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens)
      const tag = `h${depth}`
      return styledContent(tag, text)
    },

    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens)
      const isFigureImage = text.includes(`<figure`) && text.includes(`<img`)
      const isEmpty = text.trim() === ``
      if (isFigureImage || isEmpty) {
        return text
      }

      return styledContent(`p`, text)
    },

    blockquote({ tokens }) {
      let text = this.parser.parse(tokens)
      text = text.replace(/<p.*?>/g, `<p ${getStyles(styleMapping, `blockquote_p`)}>`)
      return styledContent(`blockquote`, text)
    },

    code({ text, lang = `` }) {
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

      return `<pre class="hljs code__pre" ${getStyles(styleMapping, `code_pre`)}><code class="language-${lang}" ${getStyles(styleMapping, `code`)}>${highlighted}</code></pre>`
    },

    codespan({ text }: Tokens.Codespan) {
      return styledContent(`codespan`, text, `code`)
    },

    listitem(token) {
      const prefix = isOrdered ? `${listIndex + 1}. ` : `• `
      // TODO 预备支持 list
      // if (token.checked != null) {
      //   prefix = `<input checked="${token.checked}" disabled type="checkbox"> `
      // }
      // TODO 写的太烂，需要重构
      return `<li ${getStyles(styleMapping, `listitem`)}>${prefix}${token.tokens.map(t => (this[t.type as keyof Renderer] as <T>(token: T) => string)(t)).join(``)}</li>`
    },

    // TODO
    list({ ordered, items }) {
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

    image({ href, title, text }) {
      const createSubText = (s: string | null) =>
        s ? `<figcaption ${getStyles(styleMapping, `figcaption`)}>${s}</figcaption>` : ``
      const transform
    = {
      'alt': () => text,
      'title': () => title,
      'alt-title': () => text || title,
      'title-alt': () => title || text,
    }[opts.legend] || (() => ``)

      const subText = createSubText(transform())
      const figureStyles = getStyles(styleMapping, `figure`)
      const imgStyles = getStyles(styleMapping, `image`)
      return `<figure ${figureStyles}><img ${imgStyles} src="${href}" title="${title}" alt="${text}"/>${subText}</figure>`
    },

    link({ href, title, text }) {
      if (href.startsWith(`https://mp.weixin.qq.com`)) {
        return `<a href="${href}" title="${title || text}" ${getStyles(styleMapping, `wx_link`)}>${text}</a>`
      }
      if (href === text) {
        return text
      }
      if (opts.status) {
        const ref = addFootnote(title || text, href)
        return `<span ${getStyles(styleMapping, `link`)}>${text}<sup>[${ref}]</sup></span>`
      }
      return styledContent(`link`, text, `span`)
    },

    strong({ text }) {
      return styledContent(`strong`, text)
    },

    em({ text }) {
      return `<span style="font-style: italic;">${text}</span>`
    },

    table({ header, rows }) {
      const headerRow = header
        .map(cell => styledContent(`td`, cell.text))
        .join(``)
      const body = rows
        .map((row) => {
          const rowContent = row
            .map(cell => styledContent(`td`, cell.text))
            .join(``)
          return styledContent(`tr`, rowContent)
        })
        .join(``)
      return `
        <section style="padding:0 8px;">
          <table class="preview-table">
            <thead ${getStyles(styleMapping, `thead`)}>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `
    },

    tablecell({ text }) {
      return styledContent(`td`, text)
    },

    hr() {
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
