import type { MarkedExtension, Tokens } from 'marked'

/**
 * A marked extension to support footnotes syntax.
 *
 * Syntax:
 *   This is a footnote reference[^1] and another[^note].
 *
 *   [^1]: This is the first footnote.
 *   [^note]: This is a named footnote with longer text.
 *
 * Features:
 *   - Supports numbered and named footnote references
 *   - Auto-numbered footnote list at the end
 *   - Click to jump between reference and definition
 *   - WeChat-compatible styling
 */

interface MapContent {
  index: number
  text: string
}

// Use a WeakMap to store footnote data per render context
const fnMapContext = new WeakMap<object, Map<string, MapContent>>()

function getFnMap(renderContext: object): Map<string, MapContent> {
  if (!fnMapContext.has(renderContext)) {
    fnMapContext.set(renderContext, new Map())
  }
  return fnMapContext.get(renderContext)!
}

export function markedFootnotes(): MarkedExtension {
  return {
    extensions: [
      {
        name: `footnoteDef`,
        level: `block`,
        start(src: string) {
          // Clear map at the start of each document render
          return src.match(/^\[\^/)?.index
        },
        tokenizer(src: string) {
          // Match footnote definition: [^id]: content
          // Supports both [^1]: and [^note]: formats
          const match = src.match(/^\[\^([^\]]+)\]:\s*(.*)/)
          if (match) {
            const [raw, fnId, text] = match
            // Get or create fnMap for this render
            const fnMap = getFnMap(this)
            const index = fnMap.size + 1
            fnMap.set(fnId, { index, text: text.trim() })
            return {
              type: `footnoteDef`,
              raw,
              fnId,
              index,
              text: text.trim(),
            }
          }
          return undefined
        },
        renderer(token: Tokens.Generic) {
          const { index, text, fnId } = token
          const fnMap = getFnMap(this)
          const isWechat = true // WeChat-optimized output

          // WeChat-compatible styling with inline styles
          const fnInner = isWechat
            ? `<code style="font-size:90%;opacity:.6;">${index}.</code> <span style="word-break:break-all;">${text}</span> <a id="fnDef-${fnId}" href="#fnRef-${fnId}" style="color:var(--md-primary-color);text-decoration:none;">↩</a><br/>`
            : `<code>${index}.</code> <span>${text}</span> <a id="fnDef-${fnId}" href="#fnRef-${fnId}" style="color:var(--md-primary-color);">↩</a><br/>`

          if (index === 1) {
            return `<p style="font-size:80%;margin:0.5em 8px;word-break:break-all;">${fnInner}`
          }
          if (index === fnMap.size) {
            return `${fnInner}</p>`
          }
          return fnInner
        },
      },
      {
        name: `footnoteRef`,
        level: `inline`,
        start(src: string) {
          return src.match(/\[\^/)?.index
        },
        tokenizer(src: string) {
          const match = src.match(/^\[\^([^\]]+)\]/)
          if (match) {
            const [raw, fnId] = match
            const fnMap = getFnMap(this)
            if (fnMap.has(fnId)) {
              return {
                type: `footnoteRef`,
                raw,
                fnId,
              }
            }
          }
          return undefined
        },
        renderer(token: Tokens.Generic) {
          const { fnId } = token
          const fnMap = getFnMap(this)
          const content = fnMap.get(fnId)
          if (!content) {
            return `[${fnId}]` // Fallback for missing definition
          }
          const { index } = content
          return `<sup style="color:var(--md-primary-color);"><a href="#fnDef-${fnId}" id="fnRef-${fnId}" style="color:var(--md-primary-color);text-decoration:none;">[${index}]</a></sup>`
        },
      },
    ],
  }
}
