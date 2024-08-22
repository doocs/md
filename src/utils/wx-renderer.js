import { Renderer, marked } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'

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
    const base = this.merge(themeTpl.BASE, {
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
    if (!dict)
      return ``
    const styles = Object.entries(dict)
      .map(([key, value]) => `${key}:${value}`)
      .join(`;`)
    return `style="${styles}${addition}"`
  }

  addFootnote = (title, link) => {
    this.footnotes.push([++this.footnoteIndex, title, link])
    return this.footnoteIndex
  }

  buildFootnotes = () => {
    if (!this.footnotes.length)
      return ``
    const footnoteArray = this.footnotes
      .map(([index, title, link]) =>
        link === title
          ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i>${title}</i><br/>`
          : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i>${link}</i><br/>`,
      )
      .join(`\n`)
    return `<h4 ${this.getStyles(`h4`)}>引用链接</h4><p ${this.getStyles(
      `footnotes`,
    )}>${footnoteArray}</p>`
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

  heading = (text, level) => {
    const tag = `h${level}`
    return `<${tag} ${this.getStyles(tag)}>${text}</${tag}>`
  }

  paragraph = (text) => {
    const isFigureImage = text.includes(`<figure`) && text.includes(`<img`)
    const isEmpty = text.trim() === ``
    return isFigureImage ? text : isEmpty ? `` : `<p ${this.getStyles(`p`)}>${text}</p>`
  }

  blockquote = (text) => {
    text = text.replace(/<p.*?>/g, `<p ${this.getStyles(`blockquote_p`)}>`)
    return `<blockquote ${this.getStyles(`blockquote`)}>${text}</blockquote>`
  }

  code = (text, lang = ``) => {
    if (lang.startsWith(`mermaid`)) {
      setTimeout(() => {
        window.mermaid?.run()
      }, 0)
      return `<center><pre class="mermaid">${text}</pre></center>`
    }
    const langText = lang.split(` `)[0]
    const language = hljs.getLanguage(langText) ? langText : `plaintext`
    text = hljs.highlight(text, { language }).value
    text = text
      .replace(/\r\n/g, `<br/>`)
      .replace(/\n/g, `<br/>`)
      .replace(/(>[^<]+)|(^[^<]+)/g, (str) => {
        return str.replace(/\s/g, `&nbsp;`)
      })

    return `<pre class="hljs code__pre" ${this.getStyles(
      `code_pre`,
    )}><code class="language-${lang}" ${this.getStyles(
      `code`,
    )}>${text}</code></pre>`
  }

  codespan = text => `<code ${this.getStyles(`codespan`)}>${text}</code>`

  listitem = text => `<li ${this.getStyles(`listitem`)}><span><%s/></span>${text}</li>`

  list = (text, ordered) => {
    text = text.replace(/<\/*p.*?>/g, ``).replace(/<\/*p>/g, ``)

    const segments = text.split(`<%s/>`)

    if (!ordered) {
      return `<ul ${this.getStyles(`ul`)}>${segments.join(`• `)}</ul>`
    }

    const orderedText = segments.map((segment, i) => (i > 0 ? `${i}. ` : ``) + segment).join(``)
    return `<ol ${this.getStyles(`ol`)}>${orderedText}</ol>`
  }

  image = (href, title, text) => {
    const createSubText = s => s ? `<figcaption ${this.getStyles(`figcaption`)}>${s}</figcaption>` : ``
    const transform = {
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

  link = (href, title, text) => {
    if (href.startsWith(`https://mp.weixin.qq.com`)) {
      return `<a href="${href}" title="${title || text}" ${this.getStyles(
        `wx_link`,
      )}>${text}</a>`
    }
    if (href === text)
      return text
    if (this.opts.status) {
      const ref = this.addFootnote(title || text, href)
      return `<span ${this.getStyles(
        `link`,
      )}>${text}<sup>[${ref}]</sup></span>`
    }
    return `<span ${this.getStyles(`link`)}>${text}</span>`
  }

  strong = text => `<strong ${this.getStyles(`strong`)}>${text}</strong>`

  em = text => `<span style="font-style: italic;">${text}</span>`

  table = (header, body) => `
    <section style="padding:0 8px;">
      <table class="preview-table">
        <thead ${this.getStyles(`thead`)}>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </section>`

  tablecell = text => `<td ${this.getStyles(`td`)}>${text}</td>`

  hr = () => `<hr ${this.getStyles(`hr`)}/>`
}

export default WxRenderer
