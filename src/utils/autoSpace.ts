import type { Link } from 'mdast'
import type { Parent } from 'unist'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'

import { unified } from 'unified'
import { visit } from 'unist-util-visit'

export async function addSpacingToMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(() => (tree) => {
      visit(tree as any, `text`, (node: any, _i: number | null | undefined, parent?: Parent) => {
        if (!parent)
          return

        if (parent.type === `code` || parent.type === `inlineCode`)
          return

        if (parent.type === `link`) {
          const link = parent as unknown as Link
          const first = link.children?.[0] as any
          if (first?.type === `text` && first.value === link.url)
            return
        }

        node.value = insertSpace(String(node.value))
      })
    })
    .use(remarkStringify, { fences: true, bullet: `-` })
    .process(markdown)

  return String(result)
}

function insertSpace(text: string): string {
  return text
    .replace(/([\u4E00-\u9FA5])([A-Za-z0-9@#&\u0080-\u00FF`])/g, `$1 $2`)
    .replace(/([\w~!$%^&*+\-=|\\;:'",.<>/?@#\u0080-\u00FF`])([\u4E00-\u9FA5])/g, `$1 $2`)
    .replace(/\s{2,}/g, ` `)
}
