/**
 * Synthetic article fixtures for render benchmarks.
 *
 * Shapes mirror what long WeChat articles actually contain: many headings and
 * paragraphs, a handful of fenced code blocks, inline/block math, tables and
 * image figures. Content is deterministic so runs are comparable.
 */

interface ArticleShape {
  sections: number
  paragraphsPerSection: number
  codeBlocks: number
  inlineMathPerSection: number
  blockMath: number
  tables: number
  images: number
}

const CJK_SENTENCES = [
  `微信公众号的排版一直是内容创作里最消耗时间的环节之一。`,
  `编辑器需要在保证渲染准确的同时，尽可能减少用户等待。`,
  `当文章长度超过两万字时，任何一次全量重排都会被明显感知。`,
  `因此增量渲染与缓存策略比单纯优化解析器更为关键。`,
  `我们希望输入延迟稳定在一帧以内，而不是随文档长度线性增长。`,
]

const CODE_SAMPLE = `export function createRenderer(options: RenderOptions) {
  const cache = new Map<string, string>()

  return function render(source: string): string {
    const key = hash(source)
    const cached = cache.get(key)
    if (cached !== undefined) {
      return cached
    }

    const html = parse(source, options)
    cache.set(key, html)
    return html
  }
}`

function paragraph(seed: number): string {
  const a = CJK_SENTENCES[seed % CJK_SENTENCES.length]
  const b = CJK_SENTENCES[(seed + 2) % CJK_SENTENCES.length]
  return `${a}${b}这里补充一些**加粗**、*斜体*与\`inline code\` 的混合内容，并包含一个 [外部链接](https://example.com/article/${seed})。`
}

function table(seed: number): string {
  return [
    `| 配置项 | 默认值 | 说明 |`,
    `| --- | --- | --- |`,
    `| debounce | 300ms | 停止输入后的延迟 |`,
    `| maxWait | 800ms | 连续输入下的强制刷新 |`,
    `| cacheSize | ${50 + seed} | 缓存条目上限 |`,
  ].join(`\n`)
}

export function buildArticle(shape: ArticleShape): string {
  const parts: string[] = [`# 大文档渲染性能基准`, ``]
  let codeLeft = shape.codeBlocks
  let mathLeft = shape.blockMath
  let tableLeft = shape.tables
  let imageLeft = shape.images

  for (let s = 0; s < shape.sections; s++) {
    parts.push(`## 第 ${s + 1} 节 渲染管线剖析`, ``)

    for (let p = 0; p < shape.paragraphsPerSection; p++) {
      const seed = s * shape.paragraphsPerSection + p
      let text = paragraph(seed)

      for (let m = 0; m < shape.inlineMathPerSection; m++) {
        text += ` 其中复杂度为 $O(n \\log n)$，常数项约为 $c_{${m}}$。`
      }

      parts.push(text, ``)
    }

    if (codeLeft > 0) {
      parts.push(`\`\`\`typescript`, CODE_SAMPLE, `\`\`\``, ``)
      codeLeft--
    }

    if (mathLeft > 0) {
      parts.push(`$$`, `\\sum_{i=1}^{n} \\frac{x_i}{\\sqrt{n}} = \\mu + \\sigma \\cdot Z_{${s}}`, `$$`, ``)
      mathLeft--
    }

    if (tableLeft > 0) {
      parts.push(table(s), ``)
      tableLeft--
    }

    if (imageLeft > 0) {
      parts.push(`![渲染管线示意图|600x360](https://example.com/img/${s}.png "图 ${s + 1}")`, ``)
      imageLeft--
    }

    parts.push(
      `> [!NOTE]`,
      `> 该小节的结论依赖于上面的基准数据。`,
      ``,
      `- 列表项 A：解析`,
      `- 列表项 B：高亮`,
      `- 列表项 C：净化`,
      ``,
    )
  }

  return parts.join(`\n`)
}

/** ~50k chars, code and math mixed in — the "long article" case. */
export const LARGE_ARTICLE = buildArticle({
  sections: 40,
  paragraphsPerSection: 5,
  codeBlocks: 15,
  inlineMathPerSection: 1,
  blockMath: 8,
  tables: 6,
  images: 10,
})

/** Math-dominant article: worst case for per-render MathJax typesetting. */
export const MATH_HEAVY_ARTICLE = buildArticle({
  sections: 20,
  paragraphsPerSection: 6,
  codeBlocks: 0,
  inlineMathPerSection: 3,
  blockMath: 20,
  tables: 0,
  images: 0,
})

/** Code-dominant article: worst case for highlight.js + post-formatting. */
export const CODE_HEAVY_ARTICLE = buildArticle({
  sections: 24,
  paragraphsPerSection: 2,
  codeBlocks: 24,
  inlineMathPerSection: 0,
  blockMath: 0,
  tables: 4,
  images: 0,
})
