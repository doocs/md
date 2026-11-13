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

  it(`ignores commented headings while preserving navigation positions`, () => {
    const doc = mockDoc([
      `# Article`,
      `## Section`,
      `<!--`,
      `## Hidden draft`,
      `-->`,
      `## Section`,
    ])
    const headings = extractMarkdownHeadings(doc)
    expect(headings).toEqual([
      { title: `Article`, level: 1, line: 1 },
      { title: `Section`, level: 2, line: 2 },
      { title: `Section`, level: 2, line: 6 },
    ])
    expect(computeHeadingBreadcrumbs(headings, 4)).toEqual(headings.slice(0, 2))
    expect(computeHeadingBreadcrumbs(headings, 6)).toEqual([headings[0], headings[2]])
  })

  it.each([`\`\`\``, `~~~`])(`keeps comments and %s code fences independent`, (fence) => {
    const doc = mockDoc([
      `# Before`,
      `<!--`,
      `## Hidden draft`,
      fence,
      `-->`,
      `## After comment`,
      fence,
      `<!--`,
      `## Code example`,
      fence,
      `## After code`,
    ])
    expect(extractMarkdownHeadings(doc)).toEqual([
      { title: `Before`, level: 1, line: 1 },
      { title: `After comment`, level: 2, line: 6 },
      { title: `After code`, level: 2, line: 11 },
    ])
  })

  it(`handles single-line and unclosed block comments`, () => {
    const doc = mockDoc([
      `# Before`,
      `<!-- draft -->`,
      `## After`,
      `   <!--`,
      `## Hidden draft`,
    ])
    expect(extractMarkdownHeadings(doc)).toEqual([
      { title: `Before`, level: 1, line: 1 },
      { title: `After`, level: 2, line: 3 },
    ])
  })

  it.each([`Text \`<!--\``, `Text <!--`, `    <!--`, `\t<!--`])(`does not start a block comment at %s`, (text) => {
    const doc = mockDoc([text, ``, `## After`])
    expect(extractMarkdownHeadings(doc)).toEqual([
      { title: `After`, level: 2, line: 3 },
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
