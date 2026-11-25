/**
 * md-wechat: a DeepSeek Harness bundle that turns doocs/md's WeChat renderer
 * into agent tools.
 *
 * The bundle is generated from `apps/dsh` by `scripts/pack.mjs` and installs as
 * a self-contained package: `index.js` carries the whole rendering pipeline,
 * `theme/` carries the upstream stylesheets, and `client.js` draws the sidebar
 * entry plus its panel. Nothing here imports another workspace package at
 * runtime, so upstream refactors only need a rebuild.
 */

import type { RenderArticleInput } from './render'
import type { WebServerLike } from './server'
import { Buffer } from 'node:buffer'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  blockSpacingOptions,
  codeBlockThemeOptions,
  colorOptions,
  defaultRenderOptions,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  lineHeightOptions,
} from './presets'
import { listThemes, renderArticle } from './render'
import { createEditorHandler, createRouteHandler, EDITOR_PREFIX, ROUTE_PREFIX } from './server'

export const name = `md-wechat`

/** The tools service is a hard dependency: without it the bundle has nothing to do. */
export const inject = [`tools`]

interface ToolDefinitionShape {
  name: string
  description: string
  parameters: Record<string, unknown>
  output: {
    schema: Record<string, unknown>
    render: (args: unknown, value: unknown) => Array<{ type: 'text', text: string }>
  }
  execute: (args: unknown) => Promise<unknown>
}

interface PluginContext {
  tools: { register: (definition: ToolDefinitionShape) => () => void }
  get: (name: string) => unknown
  effect: (callback: () => () => void, label?: string) => () => void
  inject: (names: string[], callback: (ctx: PluginContext) => void) => () => void
}

/** md_wechat_render 的入参：渲染器输入 + 只属于工具的输出路径 */
type RenderToolArguments = Partial<RenderArticleInput> & { output?: string }

const RENDER_DESCRIPTION
  = `Render Markdown into WeChat Official Account ("公众号") ready HTML with the doocs/md engine. `
    + `Supports standard Markdown plus KaTeX math, Mermaid/PlantUML diagrams, footnotes, callout alerts `
    + `([!NOTE], ::: theorem), ruby annotations, [toc], emoji shortcodes and infographic blocks. `
    + `Pass \`output\` to write the article to a file and get its path back; omit it to return the HTML inline for short snippets.`

const OPTIONS_DESCRIPTION
  = `List the themes, accent colours, fonts, sizes, spacing, legend formats and code-block themes `
    + `accepted by md_wechat_render. Themes are discovered from the installed bundle, so the list follows upstream.`

function resolveOutputPath(output: string): string {
  const resolved = path.isAbsolute(output) ? output : path.resolve(process.cwd(), output)
  return path.extname(resolved) ? resolved : `${resolved}.html`
}

function byteLength(text: string): number {
  return Buffer.byteLength(text, `utf-8`)
}

const renderTool: ToolDefinitionShape = {
  name: `md_wechat_render`,
  description: RENDER_DESCRIPTION,
  parameters: {
    type: `object`,
    additionalProperties: false,
    required: [`markdown`],
    properties: {
      markdown: {
        type: `string`,
        description: `The Markdown source to render.`,
      },
      output: {
        type: `string`,
        description: `Path of the HTML file to write, absolute or relative to the Harness process working directory. Omit to return the HTML inline instead.`,
      },
      theme: {
        type: `string`,
        description: `Theme name, for example default, grace or simple. Omit for "default".`,
      },
      primaryColor: {
        type: `string`,
        description: `Accent colour as a hex value such as #0F4C81, applied to headings, links and alerts.`,
      },
      fontFamily: {
        type: `string`,
        description: `CSS font-family stack for body text; omit for the system sans-serif stack.`,
      },
      fontSize: {
        type: `string`,
        description: `Base font size such as 16px. Omit for 16px.`,
      },
      lineHeight: {
        type: `string`,
        description: `Unitless body line height such as 1.75. Omit for 1.75.`,
      },
      blockSpacing: {
        type: `string`,
        description: `Unitless multiplier for the theme's vertical block margins, for example 1.15. Omit for 1.`,
      },
      linkColor: {
        type: `string`,
        description: `Link colour; defaults to #576b95.`,
      },
      legend: {
        type: `string`,
        description: `Image caption format: title-alt, alt-title, title, alt, filename or none. Omit for alt.`,
      },
      isMacCodeBlock: {
        type: `boolean`,
        description: `Render code blocks with a macOS-style title bar. Default false.`,
      },
      isShowLineNumber: {
        type: `boolean`,
        description: `Show line numbers in code blocks. Default false.`,
      },
      citeStatus: {
        type: `boolean`,
        description: `Render links as bottom citations instead of inline links. Default false.`,
      },
      countStatus: {
        type: `boolean`,
        description: `Prepend a reading-time estimate. Default false.`,
      },
      themeMode: {
        type: `string`,
        description: `Colour mode for diagrams: light or dark. Default light.`,
      },
      isUseIndent: {
        type: `boolean`,
        description: `Indent paragraph first lines. Default false.`,
      },
      isUseJustify: {
        type: `boolean`,
        description: `Justify paragraph text. Default false.`,
      },
      codeBlockTheme: {
        type: `string`,
        description: `highlight.js preset stylesheet URL from md_wechat_options. Omit to skip highlight colours, which keeps rendering offline.`,
      },
      customCSS: {
        type: `string`,
        description: `Extra CSS appended after the theme styles, at the highest priority.`,
      },
    },
  },
  output: {
    schema: {
      type: `object`,
      additionalProperties: false,
      required: [`bytes`],
      properties: {
        path: { type: `string`, description: `Absolute path of the written HTML file.` },
        html: { type: `string`, description: `The rendered HTML when no output path was given.` },
        bytes: { type: `integer` },
        words: { type: `number` },
        minutes: { type: `number` },
        theme: { type: `string` },
        warnings: { type: `array`, items: { type: `string` } },
      },
    },
    render: (_args, value) => {
      const result = value as {
        path?: string
        html?: string
        bytes: number
        words?: number
        minutes?: number
        theme?: string
        warnings?: string[]
      }
      if (result.html !== undefined && result.path === undefined) {
        return [{ type: `text`, text: result.html }]
      }
      const details = [
        result.words === undefined ? `` : `${result.words} words`,
        result.minutes === undefined ? `` : (result.minutes < 1 ? `<1 min read` : `~${Math.round(result.minutes)} min read`),
        `${result.bytes} bytes`,
        result.theme ? `theme ${result.theme}` : ``,
      ].filter(Boolean).join(`, `)
      const warnings = result.warnings?.length ? `\nWarnings: ${result.warnings.join(`; `)}` : ``
      return [{
        type: `text`,
        text: `Rendered WeChat article → ${result.path} (${details}).${warnings}`,
      }]
    },
  },
  async execute(rawArgs) {
    // The model supplies JSON that the schema above already validated; narrowing
    // it to the renderer's own input type keeps this file free of field-by-field casts.
    const args = (rawArgs ?? {}) as RenderToolArguments
    const markdown = typeof args.markdown === `string` ? args.markdown : ``
    if (markdown.trim().length === 0)
      throw new Error(`md_wechat_render requires a non-empty \`markdown\` string`)

    const result = await renderArticle({
      ...args,
      markdown,
      themeMode: args.themeMode === `dark` ? `dark` : `light`,
    })

    const common = {
      bytes: byteLength(result.html),
      words: result.readingTime.words,
      minutes: result.readingTime.minutes,
      theme: args.theme ?? defaultRenderOptions.theme,
      warnings: result.warnings,
    }

    if (!args.output)
      return { ...common, html: result.html }

    const target = resolveOutputPath(args.output)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, result.html, `utf-8`)
    return { ...common, path: target }
  },
}

const optionsTool: ToolDefinitionShape = {
  name: `md_wechat_options`,
  description: OPTIONS_DESCRIPTION,
  parameters: {
    type: `object`,
    additionalProperties: false,
    properties: {},
  },
  output: {
    schema: {
      type: `object`,
      additionalProperties: false,
      required: [`text`],
      properties: { text: { type: `string` } },
    },
    render: (_args, value) => [{ type: `text`, text: (value as { text: string }).text }],
  },
  async execute() {
    const text = JSON.stringify({
      themes: listThemes(),
      colors: colorOptions,
      fonts: fontFamilyOptions,
      fontSizes: fontSizeOptions,
      lineHeights: lineHeightOptions,
      blockSpacings: blockSpacingOptions,
      legends: legendOptions,
      codeBlockThemes: codeBlockThemeOptions,
    }, null, 2)
    return { text }
  },
}

/**
 * 浏览器半片（侧边栏入口 + 面板）通过这两个接口取预设与渲染结果。
 * 没有 webServer（例如 headless profile）时跳过，Host 工具照常可用。
 * @param ctx 插件上下文
 * @returns {void}
 */
function registerWebRoutes(ctx: PluginContext): void {
  // 用 inject 而不是 ctx.get：webServer 可能在本插件挂载之后才就绪，get 只反映当下状态，
  // 拿不到就永久跳过注册；inject 会等依赖可用再执行回调。headless profile 里照常只有工具。
  ctx.inject([`webServer`], (webCtx) => {
    const webServer = webCtx.get(`webServer`) as WebServerLike | undefined

    if (!webServer)
      return

    const editorHandler = createEditorHandler()
    const apiHandler = createRouteHandler(webCtx)

    // 只注册一个前缀：`/md-wechat/editor` 也以 `/md-wechat` 开头，分开注册时
    // 短前缀会把编辑器请求抢走，所以这里在同一个处理器里按路径分发。
    const handler = (req: Parameters<typeof apiHandler>[0], res: Parameters<typeof apiHandler>[1]) => {
      const pathname = new URL(req.url ?? `/`, `http://127.0.0.1`).pathname

      if (pathname === EDITOR_PREFIX || pathname.startsWith(`${EDITOR_PREFIX}/`))
        return editorHandler(req, res)

      return apiHandler(req, res)
    }

    webCtx.effect(
      () => webServer.register({ kind: `prefix`, path: ROUTE_PREFIX, handler }),
      `md-wechat: ${ROUTE_PREFIX} routes (api + ${EDITOR_PREFIX})`,
    )
  })
}

/** Register the md-wechat tools (and the UI routes) on the calling context. */
export function apply(ctx: PluginContext): void {
  ctx.tools.register(renderTool)
  ctx.tools.register(optionsTool)
  registerWebRoutes(ctx)
}
