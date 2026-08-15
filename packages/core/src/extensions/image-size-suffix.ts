import type { MarkedExtension } from 'marked'

// Matches `![alt](href){N%}` and rewrites it to `![alt {N%}](href)` so the
// existing image renderer's sizeMatch regex can pick up the trailing width.
// Empty alt becomes `{N%}` alone; the sizeMatch regex anchors to end-of-alt
// so the renderer strips it cleanly back to an empty alt attribute.
//
// Why preprocess instead of emitting an image token from a custom tokenizer:
// marked v18's image renderer reads `text` from the emitted token directly,
// and synthesizing a Tokens.Image with `tokens: []` causes marked's image
// pipeline to re-tokenize the alt and produce an empty alt string in the
// final <img>. Rewriting the markdown source is simpler and avoids that
// interaction.
const TRAILING_SIZE_SUFFIX_RE = /!\[([^\]]*)\]\(([^)]+)\)\{(\d+)%\}/g

/**
 * Pre-processes the markdown so that `![alt](href){N%}` is rewritten to
 * `![alt {N%}](href)` — moving the trailing width suffix into the alt text
 * where the core image renderer can apply it via its existing `sizeMatch`
 * regex.
 *
 * Why this exists: marked's image tokenizer stops at `)`. Anything after
 * the closing paren (such as our `{20%}` width suffix emitted by the emoji
 * panel) becomes a stray text token rendered next to the image as literal
 * `{20%}` text.
 *
 * Runs as a marked `preprocess` hook so the rewrite happens before lexing
 * and the rewritten source is invisible to subsequent extensions.
 */
export function markedImageSizeSuffix(): MarkedExtension {
  return {
    hooks: {
      preprocess(markdown: string): string {
        return markdown.replace(TRAILING_SIZE_SUFFIX_RE, (_, alt: string, href: string, percent: string) => {
          const newAlt = alt ? `${alt} {${percent}%}` : `{${percent}%}`
          return `![${newAlt}](${href})`
        })
      },
    },
  }
}
