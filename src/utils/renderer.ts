import type { Renderer, Tokens } from 'marked'
import { marked } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'
import mermaid from 'mermaid'
import { toMerged } from 'es-toolkit'

import type { Theme } from '@/types'

marked.use(
  markedKatex({
    throwOnError: false,
    output: `html`,
    nonStandard: true,
  }),
)

interface IOpts {
  theme: Theme
  fonts: string
  size: string
  legend: string
  status: boolean
}

type ReturnType<T> = T extends (...arg: any) => infer R ? R : never

export function initRenderer(opts: IOpts) {
  const buildTheme = (themeTpl: Theme) => {
    const base = toMerged(themeTpl.base, {
      'font-family': opts.fonts,
      'font-size': opts.size,
    })

    const mergeStyles = (styles: Record<string, any>) =>
      Object.fromEntries(
        Object.entries(styles).map(([ele, style]) => [
          ele,
          toMerged(base, style),
        ]),
      )

    return {
      ...mergeStyles(themeTpl.inline),
      ...mergeStyles(themeTpl.block),
    }
  }

  const footnotes: [number, string, string][] = []
  let footnoteIndex: number = 0

  function styledContent(styleLabel: string, content: string, label = styleLabel) {
    return `<${label} ${getStyles(styleLabel)}>${content}</${label}>`
  }

  function addFootnote(title: string, link: string) {
    footnotes.push([++footnoteIndex, title, link])
    return footnoteIndex
  }

  function reset() {
    footnotes.length = 0
    footnoteIndex = 0
  }

  let styleMapping: ReturnType<typeof buildTheme>

  function setOptions(newOpts: IOpts) {
    opts = toMerged(opts, newOpts)
    styleMapping = buildTheme(opts.theme)
  }

  function getStyles(tokenName: string, addition = ``) {
    const dict = styleMapping[tokenName]
    if (!dict) {
      return ``
    }
    const styles = Object.entries(dict)
      .map(([key, value]) => `${key}:${value}`)
      .join(`;`)
    return `style="${styles}${addition}"`
  }

  const buildFootnotes = () => {
    if (!footnotes.length) {
      return ``
    }

    const footnoteArray = footnotes
      .map(([index, title, link]) =>
        link === title
          ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
          : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`,
      )
      .join(`\n`)

    return (
      styledContent(`h4`, `引用链接`)
      + styledContent(`footnotes`, footnoteArray, `p`)
    )
  }

  const buildAddition = () => `
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

  // 用于 Mermaid 渲染
  let codeIndex = 0

  // 用于列表渲染
  let listIndex = 0
  let isOrdered = false

  marked.use({
    renderer: {
      heading({ depth, text }) {
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

      blockquote({ text }) {
        text = text.replace(/<p.*?>/g, `<p ${getStyles(`blockquote_p`)}>`)
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

        return `<pre class="hljs code__pre" ${getStyles(
          `code_pre`,
        )}><code class="language-${lang}" ${getStyles(
          `code`,
        )}>${highlighted}</code></pre>`
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
        return `<li ${getStyles(`listitem`)}>${prefix}${token.tokens.map(t => (this[t.type as keyof Renderer] as <T>(token: T) => string)(t)).join(``)}</li>`
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
          s ? `<figcaption ${getStyles(`figcaption`)}>${s}</figcaption>` : ``
        const transform
      = {
        'alt': () => text,
        'title': () => title,
        'alt-title': () => text || title,
        'title-alt': () => title || text,
      }[opts.legend] || (() => ``)

        const subText = createSubText(transform())
        const figureStyles = getStyles(`figure`)
        const imgStyles = getStyles(`image`)
        return `<figure ${figureStyles}><img ${imgStyles} src="${href}" title="${title}" alt="${text}"/>${subText}</figure>`
      },

      link({ href, title, text }) {
        if (href.startsWith(`https://mp.weixin.qq.com`)) {
          return `<a href="${href}" title="${title || text}" ${getStyles(
            `wx_link`,
          )}>${text}</a>`
        }
        if (href === text) {
          return text
        }
        if (opts.status) {
          const ref = addFootnote(title || text, href)
          return `<span ${getStyles(
            `link`,
          )}>${text}<sup>[${ref}]</sup></span>`
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
              <thead ${getStyles(`thead`)}>${headerRow}</thead>
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
    },
  })

  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
  }
}
