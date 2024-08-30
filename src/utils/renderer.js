import { Renderer, marked } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'
import mermaid from 'mermaid'

marked.use(
  markedKatex({
    throwOnError: false,
    output: `html`,
    nonStandard: true,
  }),
)

class WxRenderer extends Renderer {
  constructor(opts) {
    super()
    this.opts = opts
    this.footnotes = []
    this.footnoteIndex = 0
    this.styleMapping = this.buildTheme(opts.theme)
  }

  reset = () => {
    this.footnotes = []
    this.footnoteIndex = 0
  }

  merge = (base, extend) => ({ ...base, ...extend })

  buildTheme = (themeTpl) => {
    const base = this.merge(themeTpl.base, {
      'font-family': this.opts.fonts,
      'font-size': this.opts.size,
    })

    const mapping = {
      ...Object.fromEntries(
        Object.entries(themeTpl.inline).map(([ele, style]) => [
          ele,
          this.merge(base, style),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(themeTpl.block).map(([ele, style]) => [
          ele,
          this.merge(base, style),
        ]),
      ),
    }

    return mapping
  }

  getStyles = (tokenName, addition = ``) => {
    const dict = this.styleMapping[tokenName]
    if (!dict) {
      return ``
    }
    const styles = Object.entries(dict)
      .map(([key, value]) => `${key}:${value}`)
      .join(`;`)
    return `style="${styles}${addition}"`
  }

  styledContent = (styleLabel, content, label = styleLabel) => {
    return `<${label} ${this.getStyles(styleLabel)}>${content}</${label}>`
  }

  addFootnote = (title, link) => {
    this.footnotes.push([++this.footnoteIndex, title, link])
    return this.footnoteIndex
  }

  buildFootnotes = () => {
    if (!this.footnotes.length) {
      return ``
    }

    const footnoteArray = this.footnotes
      .map(([index, title, link]) =>
        link === title
          ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
          : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`,
      )
      .join(`\n`)

    return this.styledContent(`h4`, `引用链接`) + this.styledContent(`footnotes`, footnoteArray, `p`)
  }

  buildAddition = () => `
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

  setOptions = (newOpts) => {
    this.opts = this.merge(this.opts, newOpts)
    this.styleMapping = this.buildTheme(this.opts.theme)
  }

  heading({ tokens, depth }) {
    const text = this.parser.parseInline(tokens)
    const tag = `h${depth}`
    return this.styledContent(tag, text)
  }

  paragraph({ tokens }) {
    const text = this.parser.parseInline(tokens)
    const isFigureImage = text.includes(`<figure`) && text.includes(`<img`)
    const isEmpty = text.trim() === ``
    if (isFigureImage || isEmpty) {
      return text
    }
    return this.styledContent(`p`, text)
  }

  blockquote({ tokens }) {
    let text = this.parser.parse(tokens)
    text = text.replace(/<p.*?>/g, `<p ${this.getStyles(`blockquote_p`)}>`)
    return this.styledContent(`blockquote`, text)
  }

  codeIndex = 0
  code({ text, lang = `` }) {
    if (lang.startsWith(`mermaid`)) {
      clearTimeout(this.codeIndex)
      this.codeIndex = setTimeout(() => {
        mermaid.run()
      }, 0)
      return `<pre class="mermaid">${text}</pre>`
    }
    const langText = lang.split(` `)[0]
    const language = hljs.getLanguage(langText) ? langText : `plaintext`
    let highlighted = hljs.highlight(text, { language }).value
    highlighted = highlighted
      .replace(/\r\n/g, `<br/>`)
      .replace(/\n/g, `<br/>`)
      .replace(/(>[^<]+)|(^[^<]+)/g, str => str.replace(/\s/g, `&nbsp;`))

    return `<pre class="hljs code__pre" ${this.getStyles(
      `code_pre`,
    )}><code class="language-${lang}" ${this.getStyles(
      `code`,
    )}>${highlighted}</code></pre>`
  }

  codespan({ text }) {
    return this.styledContent(`codespan`, text, `code`)
  }

  listitem(tokens, prefix) {
    return `<li ${this.getStyles(`listitem`)}>${prefix}${this.parser.parseInline(tokens)}</li>`
  }

  list({ ordered, items }) {
    const listItems = []
    for (let i = 0; i < items.length; i++) {
      const { tokens } = items[i]
      const prefix = ordered ? `${i + 1}. ` : `• `
      for (const token of tokens) {
        if (token.type === `list`) {
          listItems.push(this.list(token))
        }
        else if (token.type !== `space`) {
          listItems.push(this.listitem([token], prefix))
        }
      }
    }
    const label = ordered ? `ol` : `ul`
    return this.styledContent(label, listItems.join(``))
  }

  image({ href, title, text }) {
    const createSubText = s =>
      s ? `<figcaption ${this.getStyles(`figcaption`)}>${s}</figcaption>` : ``
    const transform
      = {
        'alt': () => text,
        'title': () => title,
        'alt-title': () => text || title,
        'title-alt': () => title || text,
      }[this.opts.legend] || (() => ``)

    const subText = createSubText(transform())
    const figureStyles = this.getStyles(`figure`)
    const imgStyles = this.getStyles(`image`)
    return `<figure ${figureStyles}><img ${imgStyles} src="${href}" title="${title}" alt="${text}"/>${subText}</figure>`
  }

  link({ href, title, text }) {
    if (href.startsWith(`https://mp.weixin.qq.com`)) {
      return `<a href="${href}" title="${title || text}" ${this.getStyles(
        `wx_link`,
      )}>${text}</a>`
    }
    if (href === text) {
      return text
    }
    if (this.opts.status) {
      const ref = this.addFootnote(title || text, href)
      return `<span ${this.getStyles(
        `link`,
      )}>${text}<sup>[${ref}]</sup></span>`
    }
    return this.styledContent(`link`, text, `span`)
  }

  strong({ text }) {
    return this.styledContent(`strong`, text)
  }

  em({ text }) {
    return `<span style="font-style: italic;">${text}</span>`
  }

  table({ header, rows }) {
    const headerRow = header.map(cell => this.styledContent(`td`, cell.text)).join(``)
    const body = rows.map((row) => {
      const rowContent = row.map(cell => this.styledContent(`td`, cell.text)).join(``)
      return this.styledContent(`tr`, rowContent)
    }).join(``)
    return `
    <section style="padding:0 8px;">
      <table class="preview-table">
        <thead ${this.getStyles(`thead`)}>${headerRow}</thead>
        <tbody>${body}</tbody>
      </table>
    </section>`
  }

  tablecell({ text }) {
    return this.styledContent(`td`, text)
  }

  hr(_) {
    return this.styledContent(`hr`, ``)
  }
}

export default WxRenderer
