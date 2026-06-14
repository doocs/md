/// <reference path="../types/prettier.d.ts" />

type FormatDocType = `markdown` | `css` | `javascript`

type PrettierModule = typeof import('prettier/standalone')
type ParserBabelModule = typeof import('prettier/parser-babel')
type ParserMarkdownModule = typeof import('prettier/parser-markdown')
type ParserPostcssModule = typeof import('prettier/parser-postcss')

let prettierModule: PrettierModule | null = null
let parserBabelModule: ParserBabelModule | null = null
let parserMarkdownModule: ParserMarkdownModule | null = null
let parserPostcssModule: ParserPostcssModule | null = null

async function loadPrettier(type: FormatDocType) {
  const loads: Promise<unknown>[] = [
    prettierModule ? Promise.resolve() : import(`prettier/standalone`).then(m => prettierModule = m),
  ]

  if (type === `css`) {
    loads.push(parserPostcssModule ? Promise.resolve() : import(`prettier/parser-postcss`).then(m => parserPostcssModule = m))
  }
  else if (type === `javascript`) {
    loads.push(parserBabelModule ? Promise.resolve() : import(`prettier/parser-babel`).then(m => parserBabelModule = m))
  }
  else {
    loads.push(
      parserMarkdownModule ? Promise.resolve() : import(`prettier/parser-markdown`).then(m => parserMarkdownModule = m),
      parserBabelModule ? Promise.resolve() : import(`prettier/parser-babel`).then(m => parserBabelModule = m),
    )
  }

  await Promise.all(loads)

  return {
    prettier: prettierModule!,
    parserBabel: parserBabelModule!,
    parserMarkdown: parserMarkdownModule!,
    parserPostcss: parserPostcssModule!,
  }
}

function resolveParserPlugin(module: ParserBabelModule | ParserMarkdownModule | ParserPostcssModule) {
  return (module as { default?: unknown }).default ?? module
}

/**
 * 格式化文档内容
 * @param content - 要格式化的内容
 * @param type - 内容类型，决定使用的解析器，默认为 'markdown'
 * @returns 格式化后的内容
 */
export async function formatDoc(content: string, type: FormatDocType = `markdown`): Promise<string> {
  const { prettier, parserBabel, parserMarkdown, parserPostcss } = await loadPrettier(type)
  const parser = type === `css` ? `css` : type === `javascript` ? `babel` : `markdown`
  const plugins = type === `css`
    ? [resolveParserPlugin(parserPostcss)]
    : type === `javascript`
      ? [resolveParserPlugin(parserBabel)]
      : [resolveParserPlugin(parserMarkdown), resolveParserPlugin(parserBabel)]

  return await prettier.format(content, {
    parser,
    plugins,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    quoteProps: `as-needed`,
    trailingComma: `es5`,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: `avoid`,
    proseWrap: `preserve`,
    htmlWhitespaceSensitivity: `css`,
    endOfLine: `lf`,
  })
}
