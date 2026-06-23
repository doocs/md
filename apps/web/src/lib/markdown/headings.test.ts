import { describe, expect, it } from 'vitest'
import { computeHeadingBreadcrumbs, extractMarkdownHeadings } from './headings'

function mockDoc(lines: string[]) {
  return {
    lines: lines.length,
    line: (n: number) => ({ text: lines[n - 1] ?? `` }),
  }
}

describe(`extractMarkdownHeadings`, () => {
  it(`extracts ATX headings`, () => {
    const doc = mockDoc([
      `# Title`,
      `## Section`,
      `plain text`,
    ])
    expect(extractMarkdownHeadings(doc)).toEqual([
      { title: `Title`, level: 1, line: 1 },
      { title: `Section`, level: 2, line: 2 },
    ])
  })

  it(`ignores headings inside fenced code blocks`, () => {
    const doc = mockDoc([
      `# Real`,
      `\`\`\``,
      `# Not a heading`,
      `\`\`\``,
      `## After code`,
    ])
    expect(extractMarkdownHeadings(doc)).toEqual([
      { title: `Real`, level: 1, line: 1 },
      { title: `After code`, level: 2, line: 5 },
    ])
  })

  it(`ignores headings inside front matter`, () => {
    const doc = mockDoc([
      `---`,
      `title: "# Fake"`,
      `---`,
      `# Body`,
    ])
    expect(extractMarkdownHeadings(doc)).toEqual([
      { title: `Body`, level: 1, line: 4 },
    ])
  })
})

describe(`computeHeadingBreadcrumbs`, () => {
  const headings = [
    { title: `A`, level: 1, line: 1 },
    { title: `B`, level: 2, line: 5 },
    { title: `C`, level: 2, line: 10 },
    { title: `D`, level: 3, line: 15 },
  ]

  it(`builds nested breadcrumb stack`, () => {
    expect(computeHeadingBreadcrumbs(headings, 12)).toEqual([
      { title: `A`, level: 1, line: 1 },
      { title: `C`, level: 2, line: 10 },
    ])
  })

  it(`includes deeper heading when cursor is on it`, () => {
    expect(computeHeadingBreadcrumbs(headings, 16)).toEqual([
      { title: `A`, level: 1, line: 1 },
      { title: `C`, level: 2, line: 10 },
      { title: `D`, level: 3, line: 15 },
    ])
  })
})
