import { describe, expect, it } from 'vitest'
import {
  buildMarkdownTable,
  createTableData,
  findAllMarkdownTables,
  findMarkdownTableAt,
  isTableDelimiterLine,
  parseMarkdownTable,
  relocateMarkdownTable,
  splitTableRow,
  tableColumnCount,
} from './table'

describe(`splitTableRow`, () => {
  it(`splits a piped row into trimmed cells`, () => {
    expect(splitTableRow(`| a | b | c |`)).toEqual([`a`, `b`, `c`])
  })

  it(`handles rows without outer pipes`, () => {
    expect(splitTableRow(`a | b`)).toEqual([`a`, `b`])
  })

  it(`keeps escaped pipes inside cells`, () => {
    expect(splitTableRow(`| a \\| b | c |`)).toEqual([`a | b`, `c`])
  })
})

describe(`isTableDelimiterLine`, () => {
  it(`accepts plain and aligned delimiters`, () => {
    expect(isTableDelimiterLine(`| --- | :--- | :---: | ---: |`)).toBe(true)
  })

  it(`rejects regular rows`, () => {
    expect(isTableDelimiterLine(`| a | b |`)).toBe(false)
  })

  it(`rejects lines without hyphens`, () => {
    expect(isTableDelimiterLine(`| ::: | :: |`)).toBe(false)
  })

  it(`rejects a pipe-less line (setext heading, not a table)`, () => {
    expect(isTableDelimiterLine(`---`)).toBe(false)
    expect(isTableDelimiterLine(`:---:`)).toBe(false)
  })
})

describe(`parseMarkdownTable`, () => {
  it(`parses header, alignments and body rows`, () => {
    const parsed = parseMarkdownTable([
      `| 名称 | 价格 | 库存 |`,
      `| :--- | :---: | ---: |`,
      `| 苹果 | 5 | 10 |`,
      `| 香蕉 | 3 | 0 |`,
    ].join(`\n`))

    expect(parsed).toEqual({
      header: [`名称`, `价格`, `库存`],
      aligns: [`left`, `center`, `right`],
      rows: [
        [`苹果`, `5`, `10`],
        [`香蕉`, `3`, `0`],
      ],
    })
  })

  it(`returns null when the second line is not a delimiter`, () => {
    expect(parseMarkdownTable(`| a | b |\n| 1 | 2 |`)).toBeNull()
  })

  it(`returns null for a single line`, () => {
    expect(parseMarkdownTable(`| a | b |`)).toBeNull()
  })

  it(`returns null when header and delimiter cell counts differ (marked parity)`, () => {
    expect(parseMarkdownTable(`| a | b |\n| --- | --- | --- |\n| 1 | 2 |`)).toBeNull()
    expect(parseMarkdownTable(`| a | b | c |\n| --- | --- |\n| 1 | 2 | 3 |`)).toBeNull()
  })

  it(`keeps escaped pipes when counting header cells (marked parity)`, () => {
    const parsed = parseMarkdownTable(`| a \\| x | b |\n| --- | --- |\n| 1 | 2 |`)
    expect(parsed?.header).toEqual([`a | x`, `b`])
  })

  it(`parses pipe-less body lines as single-cell rows`, () => {
    const parsed = parseMarkdownTable(`| a | b |\n| --- | --- |\nplain text\n| 1 | 2 |`)
    expect(parsed?.rows).toEqual([[`plain text`], [`1`, `2`]])
  })

  it(`defaults missing alignment to null`, () => {
    const parsed = parseMarkdownTable(`| a |\n| --- |\n| 1 |`)
    expect(parsed?.aligns).toEqual([null])
  })
})

describe(`buildMarkdownTable`, () => {
  it(`builds a normalized table block`, () => {
    const output = buildMarkdownTable({
      header: [`a`, `b`],
      aligns: [`center`, null],
      rows: [[`1`, `2`], [`3`, `4`]],
    })
    expect(output).toBe([
      `| a | b |`,
      `| :---: | --- |`,
      `| 1 | 2 |`,
      `| 3 | 4 |`,
    ].join(`\n`))
  })

  it(`pads ragged rows to the widest column count`, () => {
    const output = buildMarkdownTable({
      header: [`a`, `b`, `c`],
      aligns: [null],
      rows: [[`1`]],
    })
    expect(output).toBe([
      `| a | b | c |`,
      `| --- | --- | --- |`,
      `| 1 |   |   |`,
    ].join(`\n`))
  })

  it(`escapes pipes and newlines in cells`, () => {
    const output = buildMarkdownTable({
      header: [`a | b`],
      aligns: [null],
      rows: [[`line1\nline2`]],
    })
    expect(output).toBe([
      `| a \\| b |`,
      `| --- |`,
      `| line1<br>line2 |`,
    ].join(`\n`))
  })

  it(`round-trips with parseMarkdownTable`, () => {
    const source = buildMarkdownTable({
      header: [`h1`, `h2`],
      aligns: [`left`, `right`],
      rows: [[`x`, `y`], [`p | q`, `z`]],
    })
    expect(parseMarkdownTable(source)).toEqual({
      header: [`h1`, `h2`],
      aligns: [`left`, `right`],
      rows: [[`x`, `y`], [`p | q`, `z`]],
    })
  })
})

describe(`findAllMarkdownTables`, () => {
  it(`finds multiple tables in document order with correct offsets`, () => {
    const doc = [
      `# title`,
      ``,
      `| a |`,
      `| --- |`,
      `| 1 |`,
      ``,
      `text`,
      ``,
      `| b | c |`,
      `| --- | --- |`,
      `| 2 | 3 |`,
    ].join(`\n`)
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(2)
    expect(ranges[0].from).toBe(doc.indexOf(`| a |`))
    expect(ranges[0].text).toBe([`| a |`, `| --- |`, `| 1 |`].join(`\n`))
    expect(ranges[1].from).toBe(doc.indexOf(`| b | c |`))
    expect(ranges[1].text).toBe([`| b | c |`, `| --- | --- |`, `| 2 | 3 |`].join(`\n`))
  })

  it(`treats adjacent table-looking lines as a single table (marked parity)`, () => {
    const doc = `| a |\n| --- |\n| 1 |\n| b |\n| --- |\n| 2 |`
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(1)
    expect(ranges[0].text).toBe(doc)
  })

  it(`includes pipe-less continuation lines in the table span`, () => {
    const doc = `| a | b |\n| --- | --- |\nplain text\n| 1 | 2 |`
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(1)
    expect(ranges[0].text).toBe(doc)
  })

  it(`stops the span at block starts (marked parity)`, () => {
    const doc = `| a |\n| --- |\n# heading\n| b |\n| --- |`
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(2)
    expect(ranges[0].text).toBe(`| a |\n| --- |`)
    expect(ranges[1].text).toBe(`| b |\n| --- |`)
  })

  it(`stops the span at hr and blank lines`, () => {
    const doc = `| a |\n| --- |\n| 1 |\n\n---\ntext`
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(1)
    expect(ranges[0].text).toBe(`| a |\n| --- |\n| 1 |`)
  })

  it(`ignores tables inside fenced code blocks`, () => {
    const doc = '```\n| a |\n| --- |\n```\n\n| b |\n| --- |'
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(1)
    expect(ranges[0].text).toBe(`| b |\n| --- |`)
  })

  it(`ignores blockquote tables (\`>\` prefixes cannot round-trip)`, () => {
    const doc = `> | a |\n> | --- |\n\n| b |\n| --- |`
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(1)
    expect(ranges[0].text).toBe(`| b |\n| --- |`)
  })

  it(`ignores 4-space indented (code block) tables`, () => {
    const doc = `    | a |\n    | --- |`
    expect(findAllMarkdownTables(doc)).toHaveLength(0)
  })

  it(`accepts tables indented by up to 3 spaces`, () => {
    const doc = `  | a |\n  | --- |\n  | 1 |`
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(1)
    expect(ranges[0].text).toBe(doc)
  })

  it(`skips candidates whose header and delimiter cell counts differ`, () => {
    const doc = `| a | b |\n| --- | --- | --- |\n| 1 | 2 |\n\n| c |\n| --- |`
    const ranges = findAllMarkdownTables(doc)
    expect(ranges).toHaveLength(1)
    expect(ranges[0].text).toBe(`| c |\n| --- |`)
  })
})

describe(`findMarkdownTableAt`, () => {
  const doc = [
    `# 标题`,
    ``,
    `| 名称 | 价格 |`,
    `| --- | ---: |`,
    `| 苹果 | 5 |`,
    ``,
    `正文段落`,
  ].join(`\n`)

  it(`finds the table when the cursor is on the header row`, () => {
    const from = doc.indexOf(`| 名称`)
    const range = findMarkdownTableAt(doc, from + 3)
    expect(range?.from).toBe(from)
    expect(range?.text).toBe([
      `| 名称 | 价格 |`,
      `| --- | ---: |`,
      `| 苹果 | 5 |`,
    ].join(`\n`))
  })

  it(`finds the table when the cursor is on a body row`, () => {
    const pos = doc.indexOf(`| 苹果`)
    expect(findMarkdownTableAt(doc, pos)?.from).toBe(doc.indexOf(`| 名称`))
  })

  it(`returns null outside a table`, () => {
    expect(findMarkdownTableAt(doc, doc.indexOf(`正文`))).toBeNull()
    expect(findMarkdownTableAt(doc, 0)).toBeNull()
  })

  it(`returns null when the block has no delimiter row`, () => {
    const noDelimiter = `| a | b |\n| 1 | 2 |`
    expect(findMarkdownTableAt(noDelimiter, 2)).toBeNull()
  })

  it(`finds the table when the cursor is on a pipe-less continuation line`, () => {
    const tableDoc = `| a | b |\n| --- | --- |\nplain text\n| 1 | 2 |`
    expect(findMarkdownTableAt(tableDoc, tableDoc.indexOf(`plain`))).not.toBeNull()
  })

  it(`returns null inside fenced code and blockquotes`, () => {
    const fenced = '```\n| a |\n| --- |\n```'
    expect(findMarkdownTableAt(fenced, fenced.indexOf(`| a |`))).toBeNull()
    const quoted = `> | a |\n> | --- |`
    expect(findMarkdownTableAt(quoted, quoted.indexOf(`| a |`))).toBeNull()
  })

  it(`returns null when header and delimiter cell counts differ`, () => {
    const mismatched = `| a | b |\n| --- | --- | --- |\n| 1 | 2 |`
    expect(findMarkdownTableAt(mismatched, 2)).toBeNull()
  })
})

describe(`relocateMarkdownTable`, () => {
  const tableText = `| a | b |\n| --- | --- |\n| 1 | 2 |`
  const doc = `前言\n\n${tableText}\n\n后记`
  const stored = findAllMarkdownTables(doc)[0]

  it(`returns the stored range unchanged when the document did not change`, () => {
    expect(relocateMarkdownTable(doc, stored)).toEqual(stored)
  })

  it(`finds the table at its shifted position after content was inserted above`, () => {
    const shifted = `新插入的一行\n${doc}`
    const range = relocateMarkdownTable(shifted, stored)
    expect(range?.from).toBe(stored.from + `新插入的一行\n`.length)
    expect(range?.text).toBe(tableText)
  })

  it(`returns null when the table itself was edited meanwhile`, () => {
    const edited = doc.replace(`| 1 | 2 |`, `| 1 | 3 |`)
    expect(relocateMarkdownTable(edited, stored)).toBeNull()
  })

  it(`returns null when the table was removed`, () => {
    expect(relocateMarkdownTable(`前言\n\n后记`, stored)).toBeNull()
  })

  it(`prefers the match nearest the original offset for identical tables`, () => {
    // Two identical tables; the stored range is the SECOND one.
    const dup = `${tableText}\n\n${tableText}`
    const second = findAllMarkdownTables(dup)[1]
    // Shifting both by the same prefix keeps both texts intact, so relocation
    // must disambiguate by distance to the original offset.
    const prefix = `前缀\n\n`
    const shifted = prefix + dup
    const range = relocateMarkdownTable(shifted, second)
    expect(range?.from).toBe(second.from + prefix.length)
  })
})

describe(`createTableData`, () => {
  it(`creates an empty table skeleton`, () => {
    expect(createTableData(2, 3)).toEqual({
      header: [``, ``, ``],
      aligns: [null, null, null],
      rows: [[``, ``, ``], [``, ``, ``]],
    })
    expect(tableColumnCount(createTableData(2, 3))).toBe(3)
  })
})
