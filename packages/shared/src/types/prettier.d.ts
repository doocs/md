/**
 * 类型声明：prettier v2.8.8 缺少 TypeScript 声明
 * 为 prettier/standalone 和各 parser 子路径提供模块声明
 */

declare module 'prettier/standalone' {
  import type { Plugin } from 'prettier'

  interface Options {
    parser: string
    plugins: Plugin[]
    printWidth?: number
    tabWidth?: number
    useTabs?: boolean
    semi?: boolean
    singleQuote?: boolean
    quoteProps?: 'as-needed' | 'consistent' | 'preserve'
    trailingComma?: 'es5' | 'all' | 'none'
    bracketSpacing?: boolean
    bracketSameLine?: boolean
    arrowParens?: 'avoid' | 'always'
    proseWrap?: 'always' | 'never' | 'preserve'
    htmlWhitespaceSensitivity?: 'css' | 'strict' | 'ignore'
    endOfLine?: 'lf' | 'crlf' | 'cr' | 'auto'
    [key: string]: any
  }

  export function format(source: string, options: Options): Promise<string>
}

declare module 'prettier/parser-babel' {
  import type { Plugin } from 'prettier'

  const plugin: Plugin
  export default plugin
}

declare module 'prettier/parser-markdown' {
  import type { Plugin } from 'prettier'

  const plugin: Plugin
  export default plugin
}

declare module 'prettier/parser-postcss' {
  import type { Plugin } from 'prettier'

  const plugin: Plugin
  export default plugin
}
