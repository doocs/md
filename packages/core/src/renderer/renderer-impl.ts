import type { IOpts, RendererAPI } from '@md/shared/types'
import type { FrontMatterData } from '@md/shared/types/front-matter'
import type { ReadTimeResults } from '@md/shared/utils/readingTime'
import type { RendererObject, Tokens } from 'marked'
import readingTime from '@md/shared/utils/readingTime'
import frontMatter from 'front-matter'
import hljs from 'highlight.js/lib/core'
import { Marked } from 'marked'
import {
  getBuiltInRegistry,
  markedAlert,
  markedComponent,
  markedFootnotes,
  markedInfographic,
  markedMarkup,
  markedMermaid,
  markedPlantUML,
  markedRuby,
  markedSlider,
  markedToc,
  MDKatex,
} from '../extensions'
import { escapeHtml } from '../utils/basicHelpers'
import { COMMON_LANGUAGES, highlightAndFormatCode } from '../utils/languages'

Object.entries(COMMON_LANGUAGES).forEach(([name, lang]) => {
  hljs.registerLanguage(name, lang)
})

export { hljs }

const DOUBLE_QUOTE_REGEX = /"/g
const UNDERSCORE_REGEX = /_/g
const HEADING_TAG_REGEX = /^h\d$/
const PARAGRAPH_WRAPPER_REGEX = /^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/
const MP_WEIXIN_LINK_REGEX = /^https?:\/\/mp\.weixin\.qq\.com/
/** Locale-neutral English fallbacks; Web injects localized strings via IOpts. */
const DEFAULT_COUNT_SUMMARY = `{words} words, about {minutes} min read`
const DEFAULT_FOOTNOTE_TITLE = `References`

const ADDITION_STYLE = `
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

function buildFootnoteArray(footnotes: [number, string, string][]): string {
  return footnotes
    .map(([index, title, link]) =>
      link === title
        ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
        : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`,
    )
    .join(`\n`)
}

function extractFileName(href: string): string {
  try {
    const urlPath = href.split('?')[0].split('#')[0]
    const fileName = urlPath.split('/').pop() || ''
    const nameWithoutExt = fileName.replace(/\.[^.]*$/, '')
    return nameWithoutExt
  }
  catch {
    return ''
  }
}

function transform(legend: string, text: string | null, title: string | null, href: string = ''): string {
  const options = legend.split(`-`)
  for (const option of options) {
    if (option === `alt` && text) {
      return text
    }
    if (option === `title` && title) {
      return title
    }
    if (option === `filename` && href) {
      const fileName = extractFileName(href)
      if (fileName) {
        return escapeHtml(fileName)
      }
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

/**
 * Render diff-{lang} code blocks: + lines green (added), - lines red (deleted),
 * other lines highlighted normally.
 */
function renderDiffCode(text: string, baseLang: string): string {
  const isLangRegistered = hljs.getLanguage(baseLang)
  const lang = isLangRegistered ? baseLang : `plaintext`

  const lines = text.split(`\n`)
  const prefixes = lines.map(line => line[0])
  // Strip +/- prefixes and highlight once to avoid per-line hljs calls
  const strippedLines = lines.map((line, i) => {
    const p = prefixes[i]
    return (p === `+` || p === `-`) ? line.slice(1) : line
  })
  const highlightedLines = isLangRegistered
    ? hljs.highlight(strippedLines.join(`\n`), { language: lang }).value.split(`\n`)
    : strippedLines.map(escapeHtml)

  const rendered = lines
    .map((_, i) => {
      const prefix = prefixes[i]
      const highlighted = highlightedLines[i] ?? ``
      let bg: string
      let sign: string

      if (prefix === `+`) {
        bg = `background:rgba(80,200,80,.18);`
        sign = `<span style="color:#52c41a;user-select:none;">+</span>`
      }
      else if (prefix === `-`) {
        bg = `background:rgba(255,80,80,.18);`
        sign = `<span style="color:#ff4d4f;user-select:none;">-</span>`
      }
      else {
        bg = ``
        sign = `<span style="user-select:none;"> </span>`
      }

      return `<span style="display:block;${bg}">${sign}${highlighted}</span>`
    })
    .join(``)

  const span = `<span class="mac-sign" style="padding: 10px 14px 0;">${macCodeSvg}</span>`
  // Same -webkit-box wrapper as normal code blocks (see highlightAndFormatCode)
  return `<pre class="hljs code__pre">${span}<code class="language-diff-${baseLang}"><span class="code-block__inner" style="display:block">${rendered}</span></code></pre>`
}

interface ParseResult {
  yamlData: FrontMatterData
  markdownContent: string
  readingTime: ReadTimeResults
}

function parseFrontMatterAndContent(markdownText: string): ParseResult {
  try {
    const parsed = frontMatter(markdownText)
    const yamlData = parsed.attributes as FrontMatterData
    const markdownContent = parsed.body

    const readingTimeResult = readingTime(markdownContent)

    return {
      yamlData,
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
  const listOrderedStack: boolean[] = []
  const listCounters: number[] = []
  const markdownParser = new Marked()

  markdownParser.setOptions({
    breaks: true,
  })

  function getOpts(): IOpts {
    return opts
  }

  function styledContent(styleLabel: string, content: string, tagName?: string, style?: string): string {
    const tag = tagName ?? styleLabel
    const className = `${styleLabel.replace(UNDERSCORE_REGEX, `-`)}`
    const headingAttr = HEADING_TAG_REGEX.test(tag) ? ` data-heading="true"` : ``
    const styleAttr = style ? ` style="${style}"` : ``
    return `<${tag} class="${className}"${headingAttr}${styleAttr}>${content}</${tag}>`
  }

  function addFootnote(title: string, link: string): number {
    const existingFootnote = footnotes.find(([, , existingLink]) => existingLink === link)
    if (existingFootnote) {
      return existingFootnote[0]
    }

    footnotes.push([++footnoteIndex, title, link])
    return footnoteIndex
  }

  function reset(newOpts: Partial<IOpts>): void {
    footnotes.length = 0
    footnoteIndex = 0
    listOrderedStack.length = 0
    listCounters.length = 0
    setOptions(newOpts)
  }

  function setOptions(newOpts: Partial<IOpts>): void {
    opts = { ...opts, ...newOpts }
  }

  function formatCountSummary(words: number, minutes: number): string {
    const template = opts.countMessages?.summary || DEFAULT_COUNT_SUMMARY
    return template
      .split(`{words}`)
      .join(String(words))
      .split(`{minutes}`)
      .join(String(minutes))
  }

  function buildReadingTime(readingTime: ReadTimeResults): string {
    if (!opts.countStatus) {
      return ``
    }
    if (!readingTime.words) {
      return ``
    }
    const minutes = Math.ceil(readingTime.minutes)
    return `
      <blockquote class="md-blockquote">
        <p class="md-blockquote-p">${formatCountSummary(readingTime.words, minutes)}</p>
      </blockquote>
    `
  }

  const buildFootnotes = () => {
    if (!footnotes.length) {
      return ``
    }

    const footnoteTitle = opts.renderMessages?.footnoteTitle || DEFAULT_FOOTNOTE_TITLE
    return (
      styledContent(`h4`, footnoteTitle)
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
      const isKatexOnly = /^<section class="katex-block"[\s\S]*<\/section>\s*$/.test(text.trim())
      if (isFigureImage || isEmpty || isKatexOnly) {
        return text
      }
      return styledContent(`p`, text)
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens)
      // Theme CSS targets blockquote p via `blockquote p`
      return styledContent(`blockquote`, text)
    },

    code({ text, lang = `` }: Tokens.Code): string {
      const langText = lang.split(` `)[0]

      if (langText.startsWith(`diff-`)) {
        return renderDiffCode(text, langText.slice(5))
      }

      const isLanguageRegistered = hljs.getLanguage(langText)
      const language = isLanguageRegistered ? langText : `plaintext`

      const highlighted = highlightAndFormatCode(text, language, hljs, !!opts.isShowLineNumber)

      const span = `<span class="mac-sign" style="padding: 10px 14px 0;">${macCodeSvg}</span>`
      // Defer highlighting until grammar loads from CDN
      let pendingAttr = ``
      if (!isLanguageRegistered && langText !== `plaintext`) {
        const escapedText = text.replace(DOUBLE_QUOTE_REGEX, `&quot;`)
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

    listitem(token: Tokens.ListItem) {
      const ordered = listOrderedStack[listOrderedStack.length - 1]
      const idx = listCounters[listCounters.length - 1]!

      listCounters[listCounters.length - 1] = idx + 1

      const prefix = ordered
        ? `${idx}. `
        : `• `

      let content: string
      try {
        content = this.parser.parseInline(token.tokens)
      }
      catch {
        content = this.parser
          .parse(token.tokens)
          .replace(PARAGRAPH_WRAPPER_REGEX, `$1`)
      }

      return styledContent(
        `listitem`,
        `${prefix}${content}`,
        `li`,
      )
    },

    image({ href, title, text }: Tokens.Image): string {
      let widthAttr = ``
      let heightAttr = ``
      let altText = text

      const sizeMatch = text.match(/\|(\d+)(?:x(\d+))?$/)
      if (sizeMatch) {
        altText = text.replace(/\|(\d+)(?:x(\d+))?$/, ``)
        widthAttr = sizeMatch[1] ? ` width="${sizeMatch[1]}"` : ``
        heightAttr = sizeMatch[2] ? ` height="${sizeMatch[2]}"` : ``
      }

      const newText = opts.legend ? transform(opts.legend, altText, title, href) : ``
      const subText = newText ? styledContent(`figcaption`, newText) : ``
      const titleAttr = title ? ` title="${title}"` : ``
      return `<figure><img src="${href}"${titleAttr}${widthAttr}${heightAttr} alt="${altText}"/>${subText}</figure>`
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const parsedText = this.parser.parseInline(tokens)
      if (MP_WEIXIN_LINK_REGEX.test(href)) {
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
          return styledContent(`th`, text, undefined, `text-align: ${cell.align || `left`}`)
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
        <section style="max-width: 100%; overflow: auto; -webkit-overflow-scrolling: touch">
          <table class="preview-table">
            <thead>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens)
      return styledContent(`td`, text, undefined, `text-align: ${token.align || `left`}`)
    },

    hr(token: Tokens.Hr): string {
      const raw = token.raw.trim()
      let variant = `dash`
      if (raw.includes(`*`)) {
        variant = `star`
      }
      else if (raw.includes(`_`)) {
        variant = `underscore`
      }
      return `<hr class="hr hr-${variant}">`
    },
  }

  markdownParser.use({ renderer })
  // Registry getter via closure avoids global state
  markdownParser.use(markedComponent(
    () => opts.components ?? getBuiltInRegistry(),
    () => opts.renderMessages,
  ))
  markdownParser.use(markedMarkup())
  markdownParser.use(markedToc())
  markdownParser.use(markedSlider())
  markdownParser.use(markedAlert({}))
  markdownParser.use(MDKatex({
    nonStandard: true,
    getKatexLoadingMessage: () => opts.renderMessages?.katexLoading,
  }, true))
  markdownParser.use(markedFootnotes())
  markdownParser.use(markedMermaid(() => ({
    themeMode: opts.themeMode,
    diagramMessages: opts.diagramMessages,
  })))
  markdownParser.use(markedPlantUML({
    inlineSvg: true, // Inline SVG for WeChat (no external images)
    getDiagramMessages: () => opts.diagramMessages,
    getThemeMode: () => opts.themeMode,
  }))
  markdownParser.use(markedInfographic(() => ({
    themeMode: opts.themeMode,
    diagramMessages: opts.diagramMessages,
  })))
  markdownParser.use(markedRuby())

  return {
    buildAddition: () => ADDITION_STYLE,
    buildFootnotes,
    setOptions,
    reset,
    parseFrontMatterAndContent,
    renderMarkdownToHtml(markdown: string) {
      return markdownParser.parse(markdown) as string
    },
    buildReadingTime,
    createContainer(content: string) {
      return styledContent(`container`, content, `section`)
    },
    getOpts,
  }
}
